import cookieManager from '@hmcts/cookie-manager';

const pushCookiePreferencesEvent = (preferences: Preferences) => {
  const dataLayer = window.dataLayer || [];
  dataLayer.push({'event': 'Cookie Preferences', 'cookiePreferences': preferences});
};

const updateDynatracePreference = (preferences: Preferences) => {
  const dtrum = window.dtrum;

  if (dtrum === undefined) {
    return;
  }

  if (preferences.apm === 'on') {
    dtrum.enable();
    dtrum.enableSessionReplay();
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
}

interface Preferences {
  analytics: string;
  apm: string;
}
