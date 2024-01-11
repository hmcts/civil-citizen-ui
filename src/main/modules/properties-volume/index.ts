import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { Application } from 'express';
import { get, set } from 'lodash';

export class PropertiesVolume {

  enableFor(server: Application): void {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);
      PropertiesVolume.setSecret('secrets.civil-cui.appinsights-instrumentation-key', 'appInsights.instrumentationKey');
      PropertiesVolume.setSecret('secrets.civil-cui.draft-store-access-key', 'services.draftStore.redis.key');
      PropertiesVolume.setSecret('secrets.civil-cui.ordnance-survey-api-key', 'services.postcodeLookup.ordnanceSurveyApiKey');
      PropertiesVolume.setSecret('secrets.civil-cui.citizen-ui-idam-secret', 'services.idam.clientSecret');
      PropertiesVolume.setSecret('secrets.civil-cui.citizen-draft-store-primary', 'services.draftStore.legacy.s2s.primarySecret');
      PropertiesVolume.setSecret('secrets.civil-cui.citizen-draft-store-secondary', 'services.draftStore.legacy.s2s.secondarySecret');
      PropertiesVolume.setSecret('secrets.civil-cui.cmc-s2s-secret', 'services.serviceAuthProvider.cmcS2sSecret');
      PropertiesVolume.setSecret('secrets.civil-cui.civil-citizen-ui-token-key', 'services.pcq.tokenKey');
      PropertiesVolume.setSecret('secrets.civil-cui.launch-darkly-sdk-key', 'launchDarkly.sdk');

    }
  }

  private static setSecret(fromPath: string, toPath: string): void {
    if (config.has(fromPath)) {
      set(config, toPath, get(config, fromPath));
    }
  }
}
