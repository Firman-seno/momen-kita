import React, { useState, useEffect, useLayoutEffect } from "react";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { HomeHero } from "./components/HomeHero";
import { TemplateCatalog } from "./components/TemplateCatalog";
import { CategoriesPage } from "./components/CategoriesPage";
import { TemplateDemoView } from "./components/TemplateDemoView";
import { WhatsAppOrderModal } from "./components/WhatsAppOrderModal";
import { OrderFlowModal } from "./components/OrderFlowModal";
import { OrderStatusTracker } from "./components/OrderStatusTracker";
import { HowItWorksModal } from "./components/HowItWorksModal";
import { FAQModal } from "./components/FAQModal";
import { MusicCreditsModal } from "./components/MusicCreditsModal";
import { FloatingWhatsAppButton } from "./components/FloatingWhatsAppButton";
import { InvitationView } from "./components/InvitationView";
import { InvitationEditor } from "./components/InvitationEditor";
import { Dashboard } from "./components/Dashboard";
import { AdminLogin } from "./components/AdminLogin";
import { AccessDenied } from "./components/AccessDenied";
import { TEMPLATES, getTemplateByUid } from "./data/templates";
import { resetSocialMeta } from "./lib/socialMeta";
import { isAdminAuthenticated, logoutAdmin } from "./lib/admin";
import { NavigationTab, Template, CategoryKey } from "./types";

const readCategoryFromUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("category");
  if (cat && ["birthday", "sunatan", "wedding", "aqiqah"].includes(cat)) return cat;
  return "All";
};

export default function App() {
  // 'admin-checking' is the initial guard state — replaced before first paint,
  // so no homepage/admin dashboard ever flashes while auth is resolved.
  const [currentTab, setCurrentTab] = useState<NavigationTab | "admin" | "admin-editor" | "admin-login" | "admin-checking" | "denied">("admin-checking");
  const [catalogCategory, setCatalogCategory] = useState<string>(readCategoryFromUrl());

  // Selected template for demo view (defaulting to #001 Pink Balloons Kids)
  const defaultTemplate = TEMPLATES.find((t) => t.uid === "birthday-057") || TEMPLATES.find((t) => t.uid === "birthday-001") || TEMPLATES[0];
  const [activeDemoTemplate, setActiveDemoTemplate] = useState<Template>(defaultTemplate);

  // Invitation / editor / dashboard route state
  const [invitationSlug, setInvitationSlug] = useState<string | null>(null);
  const [editorTemplateUid, setEditorTemplateUid] = useState<string | null>(null);
  const [editorInvitationId, setEditorInvitationId] = useState<string | null>(null);
  const [editorOrderId, setEditorOrderId] = useState<string | null>(null);

  // Modals state
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waTemplate, setWaTemplate] = useState<Template | null>(null);
  const [orderTemplate, setOrderTemplate] = useState<Template | null>(null);
  const [howItWorksModalOpen, setHowItWorksModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [musicCreditsModalOpen, setMusicCreditsModalOpen] = useState(false);

  // Customer order tracker (status + mandatory rating)
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [trackerInitial, setTrackerInitial] = useState<{ orderId?: string; phone?: string } | undefined>(undefined);

  const openOrderStatus = (initial?: { orderId?: string; phone?: string }) => {
    setTrackerInitial(initial);
    setTrackerOpen(true);
  };

  const goHome = () => {
    setCurrentTab("home");
    window.history.pushState({}, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openInvitation = (slug: string) => {
    setInvitationSlug(slug);
    setCurrentTab("invitation");
    window.history.pushState({}, "", `/i/${slug}`);
    window.scrollTo({ top: 0 });
  };

  // ---- Admin routing ----
  const goAdminLogin = () => {
    setCurrentTab("admin-login");
    window.history.pushState({}, "", "/login");
    window.scrollTo({ top: 0 });
  };

  const goAdminDashboard = () => {
    if (!isAdminAuthenticated()) {
      goAdminLogin();
      return;
    }
    setCurrentTab("admin");
    window.history.pushState({}, "", "/admin/dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAdminEditorNew = (templateUid?: string, orderId?: string) => {
    if (!isAdminAuthenticated()) {
      goAdminLogin();
      return;
    }
    setEditorInvitationId(null);
    setEditorTemplateUid(templateUid || null);
    setEditorOrderId(orderId || null);
    setCurrentTab("admin-editor");
    window.history.pushState({}, "", templateUid ? `/admin/editor/new/${templateUid}` : "/admin/editor/new");
    window.scrollTo({ top: 0 });
  };

  const openAdminEditorEdit = (id: string) => {
    if (!isAdminAuthenticated()) {
      goAdminLogin();
      return;
    }
    setEditorInvitationId(id);
    setEditorTemplateUid(null);
    setEditorOrderId(null);
    setCurrentTab("admin-editor");
    window.history.pushState({}, "", `/admin/editor/${id}`);
    window.scrollTo({ top: 0 });
  };

  const handleLogout = () => {
    logoutAdmin();
    setCurrentTab("admin-login");
    window.history.pushState({}, "", "/login");
    window.scrollTo({ top: 0 });
  };

  // Route URL handler
  const syncRouteWithLocation = () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Customer invitation: /i/{slug}
    const invMatch = path.match(/^\/i\/([A-Za-z0-9_-]+)/);
    if (invMatch) {
      setInvitationSlug(invMatch[1]);
      setCurrentTab("invitation");
      return;
    }

    // Admin login page.
    //   ?force=1 (clicked via "KELOLA UNDANGAN") → ALWAYS show the login form
    //   direct visit with a valid session → straight to the dashboard
    //   otherwise → login form
    if (path === "/login" || path === "/admin/login") {
      const forceLogin = params.get("force") === "1";
      if (!forceLogin && isAdminAuthenticated()) {
        goAdminDashboard();
      } else {
        setCurrentTab("admin-login");
      }
      return;
    }

    // New invitation for a template (admin only): /admin/editor/new/{templateUid}
    const adminNewMatch = path.match(/^\/admin\/editor\/new\/([A-Za-z0-9_-]+)/);
    if (adminNewMatch) {
      if (!isAdminAuthenticated()) {
        goAdminLogin();
        return;
      }
      setEditorTemplateUid(adminNewMatch[1]);
      setEditorInvitationId(null);
      setEditorOrderId(null);
      setCurrentTab("admin-editor");
      return;
    }

    // Edit existing invitation (admin only): /admin/editor/{id}
    const adminEditMatch = path.match(/^\/admin\/editor\/([A-Za-z0-9_-]+)/);
    if (adminEditMatch) {
      if (!isAdminAuthenticated()) {
        goAdminLogin();
        return;
      }
      setEditorInvitationId(adminEditMatch[1]);
      setEditorTemplateUid(null);
      setEditorOrderId(null);
      setCurrentTab("admin-editor");
      return;
    }

    if (path === "/admin/editor" || path === "/admin/editor/") {
      if (!isAdminAuthenticated()) {
        goAdminLogin();
        return;
      }
      setEditorTemplateUid(null);
      setEditorInvitationId(null);
      setEditorOrderId(null);
      setCurrentTab("admin-editor");
      return;
    }

    // Admin dashboard + all admin pages (dashboard/invitations/orders/settings…)
    // — every admin route is protected.
    if (path === "/admin" || path.startsWith("/admin/")) {
      if (isAdminAuthenticated()) {
        setCurrentTab("admin");
      } else {
        goAdminLogin();
      }
      return;
    }

    // Legacy customer-editor routes → now admin-only: admins go to /admin, others see AccessDenied
    if (path.startsWith("/editor") || path.startsWith("/dashboard")) {
      if (isAdminAuthenticated()) {
        setCurrentTab("admin");
      } else {
        setCurrentTab("denied");
      }
      return;
    }

    // New demo format: /demo/{category}/{number}
    const newMatch = path.match(/\/demo\/([a-zA-Z0-9-]+)\/(\d+)/);
    if (newMatch) {
      const found = getTemplateByUid(`${newMatch[1]}-${newMatch[2].padStart(3, "0")}`);
      if (found) {
        setActiveDemoTemplate(found);
        setCurrentTab("demo");
        return;
      }
    }

    // Legacy demo format: /demo/057 → birthday
    const legacyMatch = path.match(/\/demo\/([a-zA-Z0-9]+)/);
    if (legacyMatch) {
      const rawNum = legacyMatch[1].replace("#", "");
      const found = TEMPLATES.find((t) => t.category === "birthday" && t.templateNumber === rawNum.padStart(3, "0"));
      if (found) {
        setActiveDemoTemplate(found);
        setCurrentTab("demo");
        return;
      }
    }

    if (path.includes("/categories")) {
      setCurrentTab("categories");
      return;
    }

    if (path.includes("/templates")) {
      setCatalogCategory(readCategoryFromUrl());
      setCurrentTab("templates");
      return;
    }

    // Default: public homepage (root "/" and any other unknown path)
    setCurrentTab("home");
  };

  // Route URL handler — runs before first paint so opening /admin directly
  // (or via "Kelola Undangan") never flashes the homepage first.
  useLayoutEffect(() => {
    syncRouteWithLocation();

    const handlePopState = () => {
      syncRouteWithLocation();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelectTab = (tab: NavigationTab) => {
    if (tab === "how-it-works") {
      setHowItWorksModalOpen(true);
      return;
    }
    if (tab === "faq") {
      setFaqModalOpen(true);
      return;
    }
    if (tab === "music-credits") {
      setMusicCreditsModalOpen(true);
      return;
    }
    if (tab === "categories") {
      setCurrentTab("categories");
      window.history.pushState({}, "", "/categories");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (tab === "dashboard") {
      goAdminDashboard();
      return;
    }
    setCurrentTab(tab);
    if (tab === "home") {
      window.history.pushState({}, "", "/");
    } else if (tab === "templates") {
      window.history.pushState({}, "", "/templates");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenCategory = (category: CategoryKey | "All") => {
    const cat = category === "All" ? "All" : category;
    setCatalogCategory(cat);
    setCurrentTab("templates");
    const params = new URLSearchParams(window.location.search);
    if (cat === "All") params.delete("category");
    else params.set("category", cat);
    const qs = params.toString();
    window.history.pushState({}, "", qs ? `/templates?${qs}` : "/templates");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenDemo = (template: Template) => {
    setActiveDemoTemplate(template);
    setCurrentTab("demo");
    window.history.pushState({}, "", template.demoUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenWhatsAppModal = (template?: Template | null) => {
    setWaTemplate(template || null);
    setWaModalOpen(true);
  };

  const handleOpenOrder = (template: Template) => {
    setOrderTemplate(template);
  };

  const handleBackToCatalog = () => {
    setCurrentTab("templates");
    const params = new URLSearchParams(window.location.search);
    if (catalogCategory !== "All") params.set("category", catalogCategory);
    else params.delete("category");
    const qs = params.toString();
    window.history.pushState({}, "", qs ? `/templates?${qs}` : "/templates");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset social meta whenever we leave the invitation page
  useEffect(() => {
    if (currentTab !== "invitation") resetSocialMeta();
  }, [currentTab]);

  const isFullscreenPage = currentTab === "invitation" || currentTab === "admin" || currentTab === "admin-editor" || currentTab === "admin-login" || currentTab === "admin-checking" || currentTab === "denied";

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body">
      {/* Top Navbar (hidden on customer invitation & admin pages for a clean fullscreen experience) */}
      {!isFullscreenPage && <Navigation currentTab={currentTab as NavigationTab} onSelectTab={handleSelectTab} onOpenWhatsApp={handleOpenWhatsAppModal} onOpenOrderStatus={() => openOrderStatus()} />}

      {/* Main Views */}
      <main className="flex-grow flex flex-col">
        {currentTab === "home" && (
          <HomeHero
            onExploreTemplates={() => {
              handleOpenCategory("All");
            }}
            onOpenWhatsApp={() => handleOpenWhatsAppModal(activeDemoTemplate)}
            onSelectCategory={(cat) => handleOpenCategory(cat)}
            onSelectTab={handleSelectTab}
          />
        )}

        {currentTab === "categories" && <CategoriesPage onSelectCategory={(cat) => handleOpenCategory(cat)} />}

        {currentTab === "templates" && <TemplateCatalog initialCategory={catalogCategory} onOpenDemo={handleOpenDemo} onOpenWhatsApp={(template) => handleOpenWhatsAppModal(template)} onOrder={handleOpenOrder} />}

        {currentTab === "demo" && <TemplateDemoView template={activeDemoTemplate} onOrder={handleOpenOrder} onBackToCatalog={handleBackToCatalog} />}

        {currentTab === "invitation" && invitationSlug && <InvitationView slug={invitationSlug} onGoHome={goHome} />}

        {currentTab === "admin-login" && <AdminLogin title="Login Admin" onSuccess={() => goAdminDashboard()} onGoHome={goHome} />}

        {currentTab === "admin-checking" && (
          <div className="flex-grow w-full min-h-screen flex items-center justify-center px-4 bg-background">
            <div className="flex flex-col items-center gap-3">
              <span className="w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              <p className="font-body text-xs font-bold uppercase tracking-wider text-on-surface-variant">Memeriksa akses...</p>
            </div>
          </div>
        )}

        {currentTab === "denied" && <AccessDenied onGoHome={goHome} onTryAdmin={goAdminLogin} />}

        {currentTab === "admin" && (
          <Dashboard
            onEditInvitation={(id) => openAdminEditorEdit(id)}
            onPreviewInvitation={(slug) => openInvitation(slug)}
            onNewInvitation={(templateUid, orderId) => openAdminEditorNew(templateUid, orderId)}
            onGoHome={goHome}
            onLogout={handleLogout}
          />
        )}

        {currentTab === "admin-editor" && (
          <InvitationEditor
            templateUid={editorTemplateUid || undefined}
            invitationId={editorInvitationId || undefined}
            orderId={editorOrderId || undefined}
            onBack={goAdminDashboard}
            onOpenInvitation={(slug) => openInvitation(slug)}
          />
        )}
      </main>

      {/* Footer (hidden on customer invitation & admin pages) */}
      {!isFullscreenPage && <Footer onSelectTab={handleSelectTab} onSelectCategory={handleOpenCategory} onOpenWhatsApp={() => handleOpenWhatsAppModal()} onOpenDashboard={goAdminDashboard} onOpenOrderStatus={() => openOrderStatus()} />}

      {/* Floating WhatsApp Button (hidden in demo/invitation so it never covers the music player) */}
      {currentTab !== "demo" && !isFullscreenPage && <FloatingWhatsAppButton />}

      {/* WhatsApp Order Modal */}
      {waModalOpen && <WhatsAppOrderModal template={waTemplate} onClose={() => setWaModalOpen(false)} />}

      {/* Customer Order Flow Modal */}
      {orderTemplate && <OrderFlowModal template={orderTemplate} onClose={() => setOrderTemplate(null)} onTrackOrder={(orderId, phone) => { setOrderTemplate(null); openOrderStatus({ orderId, phone }); }} />}

      {/* Customer Order Status Tracker */}
      {trackerOpen && <OrderStatusTracker initial={trackerInitial} onClose={() => setTrackerOpen(false)} />}

      {/* How It Works Modal */}
      {howItWorksModalOpen && <HowItWorksModal onClose={() => setHowItWorksModalOpen(false)} onExploreTemplates={() => handleOpenCategory("All")} />}

      {/* FAQ Modal */}
      {faqModalOpen && <FAQModal onClose={() => setFaqModalOpen(false)} onOpenWhatsApp={() => handleOpenWhatsAppModal()} />}

      {/* Music Credits Modal */}
      {musicCreditsModalOpen && (
        <MusicCreditsModal
          onClose={() => setMusicCreditsModalOpen(false)}
          onSelectTemplate={(catKey, num) => {
            const found = getTemplateByUid(`${catKey}-${num}`);
            if (found) {
              handleOpenDemo(found);
            }
          }}
        />
      )}
    </div>
  );
}
