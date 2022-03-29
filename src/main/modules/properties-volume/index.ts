import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { Application } from 'express';
import { get, set } from 'lodash';

export class PropertiesVolume {

  enableFor(server: Application): void {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);

      this.setSecret('secrets.civil.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
      this.setSecret('secrets.civil.redis-access-key', 'services.draftStore.redis.key');
      this.setSecret('secrets.civil.ordnance-survey-api-key', 'services.postcodeLookup.ordnanceSurveyApiKey');
      console.log('-------------------------setting idam-secret --');
      this.setSecret('secrets.civil.idam-secret', 'services.idam.idam-secret');
    }
  }

  private setSecret(fromPath: string, toPath: string): void {
    console.log('---------------fromPath-------------------' + fromPath);
    if (config.has(fromPath)) {
      console.log('---------------value-------------------' + get(config, fromPath));
      set(config, toPath, get(config, fromPath));
    }
  }

}
