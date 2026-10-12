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

// APM asked for the id in a cookie as well as on the session, so Dynatrace can
// capture it as a request attribute for business events. Session scoped, so it
// does not outlive the browser session, and written here rather than server side
// so it is only ever set after the citizen has accepted APM cookies.
const DT_USER_ID_COOKIE = 'dt-user-id';

const cookieAttributes = (): string =>
  `path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;

const setDynatraceUserIdCookie = (userId: string): void => {
  document.cookie = `${DT_USER_ID_COOKIE}=${encodeURIComponent(userId)}; ${cookieAttributes()}`;
};

const clearDynatraceUserIdCookie = (): void => {
  document.cookie = `${DT_USER_ID_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${cookieAttributes()}`;
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
      if (typeof dtrum.identifyUser === 'function') {
        dtrum.identifyUser(userId);
      }
      setDynatraceUserIdCookie(userId);
    }
  } else {
    clearDynatraceUserIdCookie();
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
        DT_USER_ID_COOKIE,
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
  // Optional on purpose: not every deployed agent version exposes identifyUser, and
  // this handler runs on UserPreferencesLoaded. An unguarded call against an older
  // agent would throw there and take out cookie handling for the whole page.
  identifyUser?(userId: string): void;
}

interface Preferences {
  analytics: string;
  apm: string;
}
