import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { Application } from 'express';
import { get, set } from 'lodash';
import logger from '@pact-foundation/pact-node/src/logger';

export class PropertiesVolume {

  enableFor(server: Application): void {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);
      PropertiesVolume.setSecret('secrets.civil-cui.appinsights-instrumentation-key', 'appInsights.instrumentationKey');
      set(config, 'services.draftStore.redis.key', 'NM2YeBAvm4zbwyusxdLUGsLMknqqcOxdjAzCaKikhFM');
      PropertiesVolume.setSecret('secrets.civil-cui.ordnance-survey-api-key', 'services.postcodeLookup.ordnanceSurveyApiKey');
      PropertiesVolume.setSecret('secrets.civil-cui.citizen-ui-idam-secret', 'services.idam.clientSecret');
      PropertiesVolume.setSecret('secrets.civil-cui.citizen-draft-store-primary', 'services.draftStore.legacy.s2s.primarySecret');
      PropertiesVolume.setSecret('secrets.civil-cui.citizen-draft-store-secondary', 'services.draftStore.legacy.s2s.secondarySecret');
      PropertiesVolume.setSecret('secrets.civil-cui.cmc-s2s-secret', 'services.serviceAuthProvider.cmcS2sSecret');
      PropertiesVolume.setSecret('secrets.civil-cui.civil-citizen-ui-token-key', 'services.pcq.tokenKey');
      PropertiesVolume.setSecret('secrets.civil-cui.LAUNCH_DARKLY_SDK_KEY', 'services.launchDarkly.sdk');

    }
  }

  private static setSecret(fromPath: string, toPath: string): void {
    if (config.has(fromPath)) {
      const configValue = get(config, fromPath);
      logger.info(`Setting ${toPath} from ${fromPath} value: ${configValue}`);
      set(config, toPath, configValue);
    }
  }
}
