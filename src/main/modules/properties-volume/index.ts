import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { Application } from 'express';
import { get, set } from 'lodash';
import { execSync } from 'child_process';

export class PropertiesVolume {

  enableFor(server: Application): void {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);

      this.setSecret('secrets.civil.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
    } else {
      this.setLocalSecret('idam-secret', 'services.idam.clientSecret');
    }
  }

  private setSecret(fromPath: string, toPath: string): void {
    if (config.has(fromPath)) {
      set(config, toPath, get(config, fromPath));
    }
  }
  /**
   * Load a secret from the AAT vault using azure cli
   */
  private setLocalSecret(secret: string, toPath: string): void {
    const result = execSync('az keyvault secret show --vault-name nfdiv-aat -o tsv --query value --name ' + secret);

    set(config, toPath, result.toString().replace('\n', ''));
  }
}
