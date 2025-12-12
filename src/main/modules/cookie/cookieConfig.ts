import cookieManager from '@hmcts/cookie-manager';

const DYNATRACE_READY_RETRY_DELAY_MS = 250;
const DYNATRACE_READY_MAX_RETRY_ATTEMPTS = 120;

const pushCookiePreferencesEvent = (preferences: Preferences) => {
  const dataLayer = window.dataLayer || [];
  dataLayer.push({'event': 'Cookie Preferences', 'cookiePreferences': preferences});
};

let dynatraceRetryTimeout: number | undefined;
let dynatraceRetryAttempts = 0;
let pendingDynatracePreferences: Preferences | undefined;

const resetDynatraceRetryState = () => {
  if (dynatraceRetryTimeout !== undefined) {
    window.clearTimeout(dynatraceRetryTimeout);
    dynatraceRetryTimeout = undefined;
  }
  dynatraceRetryAttempts = 0;
};

const applyDynatracePreference = (preferences: Preferences, dtrum: DtrumApi) => {
  if (preferences.apm === 'on') {
    dtrum.enable();
    dtrum.enableSessionReplay();
  } else {
    dtrum.disableSessionReplay();
    dtrum.disable();
  }
};

const tryApplyDynatracePreference = (preferences: Preferences): boolean => {
  const dtrum = window.dtrum;

  if (!dtrum) {
    return false;
  }

  applyDynatracePreference(preferences, dtrum);
  resetDynatraceRetryState();
  return true;
};

const tryApplyPendingPreference = (): boolean => {
  if (!pendingDynatracePreferences) {
    return true;
  }

  return tryApplyDynatracePreference(pendingDynatracePreferences);
};

const scheduleDynatracePreferenceUpdate = () => {
  if (dynatraceRetryTimeout !== undefined || dynatraceRetryAttempts >= DYNATRACE_READY_MAX_RETRY_ATTEMPTS) {
    return;
  }

  dynatraceRetryTimeout = window.setTimeout(() => {
    dynatraceRetryTimeout = undefined;

    if (tryApplyPendingPreference()) {
      return;
    }

    dynatraceRetryAttempts++;
    scheduleDynatracePreferenceUpdate();
  }, DYNATRACE_READY_RETRY_DELAY_MS);
};

const ensureDynatracePreferenceUpdateScheduled = () => {
  if (dynatraceRetryTimeout === undefined && dynatraceRetryAttempts >= DYNATRACE_READY_MAX_RETRY_ATTEMPTS) {
    dynatraceRetryAttempts = 0;
  }

  scheduleDynatracePreferenceUpdate();
};

export const updateDynatracePreference = (preferences: Preferences) => {
  pendingDynatracePreferences = preferences;

  if (tryApplyDynatracePreference(preferences)) {
    return;
  }

  ensureDynatracePreferenceUpdateScheduled();
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
