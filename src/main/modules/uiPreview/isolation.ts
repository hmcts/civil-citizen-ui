import config from 'config';
import {isUiPreviewEnabled} from 'common/utils/uiPreviewConfig';

/** Fail closed if preview was enabled without an isolated service configuration. */
export const assertUiPreviewServices = (): void => {
  if (!isUiPreviewEnabled()) return;
  const serviceKeys = [
    'civilService.url', 'generalApplication.url', 'dmStore.baseUrl',
    'serviceAuthProvider.baseUrl', 'postcodeLookup.ordnanceSurveyApiUrl',
    'draftStore.legacy.url', 'idam.url', 'idam.tokenURL', 'idam.hmctsAccessURL',
    'cmc.url', 'pcq.url', 'govPay.url',
  ];
  const base = config.get<string>('services.civilService.url');
  const url = new URL(base);
  const allowedHosts = process.env.UI_PREVIEW_CONTAINER === 'true' ? ['wiremock'] : ['127.0.0.1'];
  if (url.protocol !== 'http:' || !allowedHosts.includes(url.hostname) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('UI preview requires its isolated local service URL; use the documented launcher');
  }
  for (const key of serviceKeys) {
    if (config.get<string>(`services.${key}`) !== base) throw new Error(`Preview service is not isolated: ${key}`);
  }
};
