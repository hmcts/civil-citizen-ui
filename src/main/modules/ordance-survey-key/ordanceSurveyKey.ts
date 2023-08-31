import { OSPlacesClient } from '@hmcts/os-places-client';
import config from 'config';

let osPlacesClientInstance: OSPlacesClient | null = null;

export const createOSPlacesClientInstance = () => {
  const apiKey = config.get<string>('services.postcodeLookup.ordnanceSurveyApiKey');
  if (apiKey && !osPlacesClientInstance) {
    osPlacesClientInstance = new OSPlacesClient(apiKey);
  }
};

export const getOSPlacesClientInstance = (): OSPlacesClient => {
  if (!osPlacesClientInstance) {
    createOSPlacesClientInstance();
  }
  return osPlacesClientInstance;
};