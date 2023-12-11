import cookieManager from '@hmcts/cookie-manager';

cookieManager.on('UserPreferencesLoaded', (preferences: Preferences) => {
  const dataLayer = window.dataLayer || [];
  dataLayer.push({'event': 'Cookie Preferences', 'cookiePreferences': preferences});
});

cookieManager.on('UserPreferencesSaved', (preferences: Preferences) => {
  const dataLayer = window.dataLayer || [];
  const dtrum = window.dtrum;

  dataLayer.push({'event': 'Cookie Preferences', 'cookiePreferences': preferences});

  if (dtrum !== undefined) {
    if (preferences.apm === 'on') {
      dtrum.enable();
      dtrum.enableSessionReplay();
    } else {
      dtrum.disableSessionReplay();
      dtrum.disable();
    }
  }
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
        'lang',
        'newDeadlineDate',
        'SESSION_ID',
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
