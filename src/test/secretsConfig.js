const config = require('config');
const {get, set} = require('lodash');
const propertiesVolume = require('@hmcts/properties-volume');

const PropertiesVolume = {
  enableFor: (server) => {
    console.log(server?.locals?.ENV);
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);
      PropertiesVolume.setSecret('secrets.civil-citizen-ui.appinsights-instrumentation-key', 'appInsights.instrumentationKey');
      PropertiesVolume.setSecret('secrets.civil-citizen-ui.draft-store-access-key', 'services.draftStore.redis.key');
      PropertiesVolume.setSecret('secrets.civil-citizen-ui.ordnance-survey-api-key', 'services.postcodeLookup.ordnanceSurveyApiKey');
      PropertiesVolume.setSecret('secrets.civil-citizen-ui.citizen-ui-idam-secret', 'services.idam.clientSecret');
      PropertiesVolume.setSecret('secrets.civil-citizen-ui.citizen-draft-store-primary', 'services.draftStore.legacy.s2s.primarySecret');
      PropertiesVolume.setSecret('secrets.civil-citizen-ui.citizen-draft-store-secondary', 'services.draftStore.legacy.s2s.secondarySecret');
      PropertiesVolume.setSecret('secrets.civil-citizen-ui.cmc-s2s-secret', 'services.serviceAuthProvider.cmcS2sSecret');
      PropertiesVolume.setSecret('secrets.civil-citizen-ui.civil-citizen-ui-token-key', 'services.pcq.tokenKey');
    }
  },
  setSecret: (fromPath, toPath) => {
    console.log('from path ' + fromPath);
    if (config.has(fromPath)) {
      console.log('from path ::: ' + get(config, fromPath));
      set(config, toPath, get(config, fromPath));
    }
  },
};

module.exports = PropertiesVolume;
