/** Preview is never enabled by a request or by a production flag alone. */
export const isUiPreviewEnabled = (environment: NodeJS.ProcessEnv = process.env): boolean =>
  environment.NODE_ENV === 'e2eTest' && environment.UI_PREVIEW_ENABLED === 'true';

export const uiPreviewHost = (environment: NodeJS.ProcessEnv = process.env): string => {
  if (!isUiPreviewEnabled(environment)) {
    throw new Error('UI preview is disabled');
  }
  if (environment.UI_PREVIEW_CONTAINER === 'true') {
    return '0.0.0.0'; // Only the isolated Compose network; published ports are loopback-only.
  }
  return '127.0.0.1';
};
