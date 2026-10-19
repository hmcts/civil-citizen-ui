import fs from 'fs';
import path from 'path';
import {JSDOM} from 'jsdom';
import {configuredPresentationEnvironment} from '../../../utils/renderPresentationPages';

// Vendor fixture parity is independent of application integration. Preserve text
// nodes and all attribute values; discard indentation-only whitespace only.
function normalize(html: string) {
  const dom = new JSDOM(html); const body = dom.window.document.body;
  const visit = (node: Node): unknown => {
    if (node.nodeType === 3) {
      const value = node.textContent!;
      if (!value.trim()) return undefined;
      // Remove source indentation around line breaks; retain inline boundary spaces.
      return value.replace(/^[ \t]*\n[ \t]*/, '').replace(/[ \t]*\n[ \t]*$/, '').replace(/\n[ \t]*/g, ' ');
    }
    if (node.nodeType !== 1) return undefined;
    const element = node as Element;
    return [element.tagName, Array.from(element.attributes).map(attr => [attr.name, attr.value]).sort(), Array.from(node.childNodes).map(visit).filter(value => value !== undefined)];
  };
  const result = Array.from(body.childNodes).map(visit).filter(value => value !== undefined); dom.window.close(); return result;
}
for (const component of ['header', 'breadcrumbs', 'table', 'tabs', 'summary-list', 'details', 'inset-text', 'button']) {
  const fixturePath = path.resolve('node_modules/govuk-frontend/dist/govuk/components', component, 'fixtures.json');
  const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8')).fixtures as {name: string; options: unknown; html: string}[];
  if (!fixtures.length) throw new Error(`No installed fixtures for ${component}`);
  const macro = 'govuk' + component.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('');
  describe(`locked GOV.UK ${component} fixture parity`, () => {
    it.each(fixtures.map(fixture => [fixture.name, fixture] as const))('%s', (_name, fixture) => {
      expect(fixture.html.trim().length).toBeGreaterThan(0);
      const html = configuredPresentationEnvironment().renderString(`{% from "govuk/components/${component}/macro.njk" import ${macro} %}{{ ${macro}(options) }}`, {options: fixture.options});
      expect(normalize(html)).toEqual(normalize(fixture.html));
    });
  });
}

// Keep this guard independent of vendor fixtures: an inline space or attribute
// value can carry meaning even when pretty-printing indentation does not.
it('normalisation preserves significant inline whitespace and attribute values', () => {
  expect(normalize('<p>Hello <a href="/one?a=1&amp;b=2">world</a></p>')).not.toEqual(normalize('<p>Hello<a href="/one?a=1&amp;b=2">world</a></p>'));
  expect(normalize('<a title="two  spaces" href="/one">Link</a>')).not.toEqual(normalize('<a title="two spaces" href="/one">Link</a>'));
});
