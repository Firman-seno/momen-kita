/* ============================================================
   MomenKita — localStorage keys shared between the client data
   layer (invitations/orders) and the server sync module.
   Centralizing them here prevents circular imports.
   ============================================================ */

export const INVITATIONS_STORAGE_KEY = 'momenkita.invitations.v1';
export const ORDERS_STORAGE_KEY = 'momenkita.orders.v1';
