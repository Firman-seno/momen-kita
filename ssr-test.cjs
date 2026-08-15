import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TEMPLATES } from './src/data/templates';
import { TemplateDemoView } from './src/components/TemplateDemoView';

const pick = (cat: string) =>
  TEMPLATES.filter((t) => t.category === cat).slice(0, 3);

const targets = [
  ...pick('wedding'),
  ...pick('birthday'),
  ...pick('sunatan'),
  ...pick('aqiqah'),
  ...pick('education'),
  ...pick('business'),
  ...pick('doa-haul'),
  ...pick('anniversary'),
  ...pick('family'),
];

let failed = 0;
for (const t of targets) {
  try {
    const html = renderToStaticMarkup(
      React.createElement(TemplateDemoView, {
        template: t,
        onOrder: () => {},
        onBackToCatalog: () => {},
        disableMusic: true,
      })
    );
    if (!html.includes('CoverView') && html.length < 100) {
      console.log(`WARN short render: ${t.name}`);
    }
    const fam = 'ok';
    console.log(`PASS [${t.category}] #${t.templateNumber} ${t.name} (${fam}) ${html.length}b`);
  } catch (e) {
    failed++;
    console.error(`FAIL [${t.category}] #${t.templateNumber} ${t.name}:`, (e as Error).message);
  }
}

if (failed > 0) {
  console.error(`${failed} template(s) failed to render`);
  process.exit(1);
}
console.log(`All ${targets.length} templates rendered without errors`);
