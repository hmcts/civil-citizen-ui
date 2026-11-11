import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import type { Application } from 'express';
import { get, set } from 'lodash';

// express is imported for its type only, so requiring this module never loads express itself. The
// App Insights bootstrap pulls it in before express, and OpenTelemetry can only instrument express
// if it is required afterwards: see modules/appinsights/bootstrap.

// The mounted secrets are read once per process. The bootstrap loads them before express starts, so
// the later enableFor() call from app.ts finds them already in config and does nothing.
let loaded = false;

export class PropertiesVolume {

  /**
   * Loads the mounted secrets into config.
   *
   * Takes the environment name rather than the express application so it can run before express is
   * required. App Insights needs its instrumentation key from here, and the chart supplies that key
   * only through the properties volume, never as an environment variable.
   */
  static enable(env: string): void {
    if (loaded || env === 'development') {
      return;
    }
    loaded = true;
    propertiesVolume.addTo(config);
    PropertiesVolume.setSecret('secrets.civil-cui.appinsights-instrumentation-key', 'appInsights.instrumentationKey');
    PropertiesVolume.setSecret('secrets.civil-cui.draft-store-access-key', 'services.draftStore.redis.key');
    PropertiesVolume.setSecret('secrets.civil-cui.ordnance-survey-api-key', 'services.postcodeLookup.ordnanceSurveyApiKey');
    PropertiesVolume.setSecret('secrets.civil-cui.citizen-ui-idam-secret', 'services.idam.clientSecret');
    PropertiesVolume.setSecret('secrets.civil-cui.citizen-draft-store-primary', 'services.draftStore.legacy.s2s.primarySecret');
    PropertiesVolume.setSecret('secrets.civil-cui.citizen-draft-store-secondary', 'services.draftStore.legacy.s2s.secondarySecret');
    PropertiesVolume.setSecret('secrets.civil-cui.cmc-s2s-secret', 'services.serviceAuthProvider.cmcS2sSecret');
    PropertiesVolume.setSecret('secrets.civil-cui.civil-citizen-ui-token-key', 'services.pcq.tokenKey');
    PropertiesVolume.setSecret('secrets.civil-cui.LAUNCH_DARKLY_SDK_KEY', 'services.launchDarkly.sdk');
  }

  enableFor(server: Application): void {
    PropertiesVolume.enable(server.locals.ENV);
  }

  private static setSecret(fromPath: string, toPath: string): void {
    if (config.has(fromPath)) {
      set(config, toPath, get(config, fromPath));
    }
  }
}

/** Test seam: lets a test load the secrets again after asserting the once-per-process behaviour. */
export const _resetPropertiesVolume = (): void => {
  loaded = false;
};
