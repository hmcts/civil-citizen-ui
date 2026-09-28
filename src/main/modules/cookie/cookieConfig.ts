import cookieManager from '@hmcts/cookie-manager';

const pushCookiePreferencesEvent = (preferences: Preferences) => {
  const dataLayer = window.dataLayer || [];
  dataLayer.push({'event': 'Cookie Preferences', 'cookiePreferences': preferences});
};

// The IDAM user id is rendered into a meta tag by the base templates. It is the
// correlation key for claim creation business events, where there is no case id
// until the claim is submitted. Read from the DOM rather than an inline script so
// no CSP nonce is involved.
const getDynatraceUserId = (): string | undefined => {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="dt-user-id"]');
  return meta?.content || undefined;
};

const updateDynatracePreference = (preferences: Preferences) => {
  const dtrum = window.dtrum;

  if (dtrum === undefined) {
    return;
  }

  if (preferences.apm === 'on') {
    dtrum.enable();
    dtrum.enableSessionReplay();

    // Must follow enable(): identifyUser is ignored while the agent is disabled.
    const userId = getDynatraceUserId();
    if (userId) {
      dtrum.identifyUser(userId);
    }
  } else {
    dtrum.disableSessionReplay();
    dtrum.disable();
  }
};

cookieManager.on('UserPreferencesLoaded', (preferences: Preferences) => {
  pushCookiePreferencesEvent(preferences);
  updateDynatracePreference(preferences);
});

cookieManager.on('UserPreferencesSaved', (preferences: Preferences) => {
  pushCookiePreferencesEvent(preferences);
  updateDynatracePreference(preferences);
});

const config = {
  userPreferences: {
    cookieName: 'money-claims-cookie-preferences',
  },
  cookieManifest: [
    {
      categoryName: 'essential',
      optional: false,
      cookies: [
        'citizen-ui-session',
        'citizen-ui-session.sig',
        'eligibility',
        'firstContact',
        'caseReference',
        'lang',
        'newDeadlineDate',
      ],
    },
    {
      categoryName: 'analytics',
      cookies: [
        '_ga',
        '_gid',
        '_gat_UA-',
        '_gat',
      ],
    },
    {
      categoryName: 'apm',
      cookies: [
        'dtCookie',
        'dtLatC',
        'dtPC',
        'dtSa',
        'rxVisitor',
        'rxvt',
      ],
    },
  ],
};

cookieManager.init(config);

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    dtrum: DtrumApi;
  }
}

interface DtrumApi {
  enable(): void;
  enableSessionReplay(): void;
  disable(): void;
  disableSessionReplay(): void;
  identifyUser(userId: string): void;
}

interface Preferences {
  analytics: string;
  apm: string;
}
