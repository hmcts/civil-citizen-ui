import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { Application } from 'express';
import { get, set } from 'lodash';

export class PropertiesVolume {

  enableFor(server: Application): void {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);

      this.setSecret('secrets.civil.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
      this.setSecret('secrets.civil.draft-store-access-key', 'services.draftStore.redis.key');
      this.setSecret('secrets.civil.ordnance-survey-api-key', 'services.postcodeLookup.ordnanceSurveyApiKey');
      this.setSecret('secrets.civil.citizen-ui-idam-secret', 'services.idam.clientSecret');
      this.setSecret('secrets.cmc.citizen-draft-store-primary', 'services.draftStore.legacy.s2s.primarySecret');
      this.setSecret('secrets.cmc.citizen-draft-store-secondary', 'services.draftStore.legacy.s2s.secondarySecret');
    }
  }

  private setSecret(fromPath: string, toPath: string): void {
    if (config.has(fromPath)) {
      set(config, toPath, get(config, fromPath));
    }
  }

}
