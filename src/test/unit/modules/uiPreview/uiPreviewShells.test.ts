import {JSDOM} from 'jsdom';
import {renderPresentation} from '../../../utils/renderPresentationPages';

const original = {...process.env};
afterEach(() => {process.env = {...original};});
describe('preview telemetry exclusion preserves real production shells', () => {
  it.each(['claim-details-tpl.njk', 'claim-details-tpl-dashboard.njk', 'features/public/contact-cnbc.njk', 'features/public/contact-mediation.njk'])(
    'gates script and noscript external telemetry in %s', view => {
      const locals = {user: {id: 'synthetic-user'}, nonceValue: 'nonce-value', nonceDataLayer: 'nonce-data', nonceWebChat: 'nonce-chat', webChatEnabled: true, webChatConfig: {buttonContainerId: 'chat', uuid: 'test', tenant: 'test', channel: 'test', channelUuid: 'test'}};
      process.env.NODE_ENV = 'production'; process.env.UI_PREVIEW_ENABLED = 'true';
      const production = renderPresentation(view, locals);
      process.env.NODE_ENV = 'e2eTest'; process.env.UI_PREVIEW_ENABLED = 'true';
      const preview = renderPresentation(view, locals);
      expect(production).toContain('googletagmanager.com/gtm.js'); expect(production).toContain('googletagmanager.com/ns.html');
      expect(production).toContain('dt-user-id'); expect(production).toContain('nonce-value');
      expect(preview).not.toMatch(/googletagmanager|js-cdn\.dynatrace|dt-user-id|vcc-eu4\.8x8/);
      if (view.includes('contact-')) expect(production).toContain('vcc-eu4.8x8');
      const dom = new JSDOM(preview);
      try {
        const main = dom.window.document.querySelector('script[src^="/main"][src$=".js"]');
        expect(main).not.toBeNull(); expect(production).toContain(`src="${main!.getAttribute('src')}"`);
      } finally {dom.window.close();}
      // False/missing flags preserve exact production markup despite e2e auth.
      process.env.UI_PREVIEW_ENABLED = 'false';
      expect(renderPresentation(view, locals)).toBe(production);
    });
});
