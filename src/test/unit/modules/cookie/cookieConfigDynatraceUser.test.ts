/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom, matching the
 * pattern in reindex-add-another-actions.test.ts (jsdom 28 incompatibility).
 */
// Aliased to avoid colliding with the top-level JSDOM declaration in other test files.
const {JSDOM: JsDom} = require('jsdom');

interface Preferences {
  analytics: string;
  apm: string;
}
type Handler = (preferences: Preferences) => void;

const handlers: Record<string, Handler> = {};

jest.mock('@hmcts/cookie-manager', () => ({
  on: (event: string, callback: Handler) => {
    handlers[event] = callback;
  },
  init: jest.fn(),
}));

describe('cookieConfig Dynatrace user identification', () => {
  const USER_ID = '1ab2c3d4-5e6f-7081-92a3-b4c5d6e7f809';

  let doc: Document;

  let dtrum: {
    enable: jest.Mock;
    enableSessionReplay: jest.Mock;
    disable: jest.Mock;
    disableSessionReplay: jest.Mock;
    identifyUser?: jest.Mock;
  };

  const load = (headHtml: string, withDtrum = true, withIdentifyUser = true) => {
    const dom = new JsDom(`<!DOCTYPE html><html><head>${headHtml}</head><body></body></html>`, {url: 'https://preview.example.test/claim/task-list'});
    dtrum = {
      enable: jest.fn(),
      enableSessionReplay: jest.fn(),
      disable: jest.fn(),
      disableSessionReplay: jest.fn(),
      ...(withIdentifyUser ? {identifyUser: jest.fn()} : {}),
    };
    Object.keys(handlers).forEach(key => delete handlers[key]);
    doc = dom.window.document;
    (global as unknown as Record<string, unknown>).document = dom.window.document;
    (global as unknown as Record<string, unknown>).location = dom.window.location;
    (global as unknown as Record<string, unknown>).window = {
      dataLayer: [],
      ...(withDtrum ? {dtrum} : {}),
    };
    jest.resetModules();
    require('modules/cookie/cookieConfig');
  };

  const metaTag = (id: string) => `<meta name="dt-user-id" content="${id}">`;

  it('identifies the user to Dynatrace when APM consent is given', () => {
    load(metaTag(USER_ID));

    handlers['UserPreferencesSaved']({analytics: 'off', apm: 'on'});

    expect(dtrum.enable).toHaveBeenCalled();
    expect(dtrum.identifyUser).toHaveBeenCalledWith(USER_ID);
  });

  it('identifies the user only after enabling the agent', () => {
    load(metaTag(USER_ID));

    handlers['UserPreferencesSaved']({analytics: 'off', apm: 'on'});

    const enableOrder = dtrum.enable.mock.invocationCallOrder[0];
    const identifyUser = dtrum.identifyUser as jest.Mock;
    const identifyOrder = identifyUser.mock.invocationCallOrder[0];
    expect(identifyOrder).toBeGreaterThan(enableOrder);
  });

  it('does not identify the user when APM consent is refused', () => {
    load(metaTag(USER_ID));

    handlers['UserPreferencesSaved']({analytics: 'on', apm: 'off'});

    expect(dtrum.disable).toHaveBeenCalled();
    expect(dtrum.identifyUser).not.toHaveBeenCalled();
  });

  it('enables the agent without identifying when no user is signed in', () => {
    load('');

    handlers['UserPreferencesSaved']({analytics: 'off', apm: 'on'});

    expect(dtrum.enable).toHaveBeenCalled();
    expect(dtrum.identifyUser).not.toHaveBeenCalled();
  });

  it('does not identify the user when the meta tag is present but empty', () => {
    load(metaTag(''));

    handlers['UserPreferencesSaved']({analytics: 'off', apm: 'on'});

    expect(dtrum.identifyUser).not.toHaveBeenCalled();
  });

  it('does not throw when the agent does not expose identifyUser', () => {
    load(metaTag(USER_ID), true, false);

    expect(() => handlers['UserPreferencesSaved']({analytics: 'off', apm: 'on'})).not.toThrow();
    expect(dtrum.enable).toHaveBeenCalled();
    expect(dtrum.enableSessionReplay).toHaveBeenCalled();
  });

  const cookieValue = (): string | undefined => {
    const match = doc.cookie.match(/(?:^|;\s*)dt-user-id=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  };

  it('writes the user id to the dt-user-id cookie when APM consent is given', () => {
    load(metaTag(USER_ID));

    handlers['UserPreferencesSaved']({analytics: 'off', apm: 'on'});

    expect(cookieValue()).toBe(USER_ID);
  });

  it('does not write the cookie when APM consent is refused', () => {
    load(metaTag(USER_ID));

    handlers['UserPreferencesSaved']({analytics: 'on', apm: 'off'});

    expect(cookieValue()).toBeUndefined();
  });

  it('clears an existing cookie when consent is withdrawn', () => {
    load(metaTag(USER_ID));
    handlers['UserPreferencesSaved']({analytics: 'off', apm: 'on'});
    expect(cookieValue()).toBe(USER_ID);

    handlers['UserPreferencesSaved']({analytics: 'off', apm: 'off'});

    expect(cookieValue()).toBeUndefined();
  });

  it('does not write the cookie when no user is signed in', () => {
    load('');

    handlers['UserPreferencesSaved']({analytics: 'off', apm: 'on'});

    expect(cookieValue()).toBeUndefined();
  });

  it('still writes the cookie when the agent lacks identifyUser', () => {
    load(metaTag(USER_ID), true, false);

    handlers['UserPreferencesSaved']({analytics: 'off', apm: 'on'});

    expect(cookieValue()).toBe(USER_ID);
  });

  it('does nothing when the Dynatrace agent has not loaded', () => {
    load(metaTag(USER_ID), false);

    expect(() => handlers['UserPreferencesSaved']({analytics: 'off', apm: 'on'})).not.toThrow();
  });
});
