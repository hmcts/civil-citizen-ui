import { defaultClient } from 'applicationinsights';
import { Logger } from '@hmcts/nodejs-logging';

const logger = Logger.getLogger('customEventTracker');

export function trackCustomEvent(eventName: string, trackingProperties: object) {
  try {
    if (defaultClient) {
      defaultClient.trackEvent({
        name: eventName,
        properties: trackingProperties,
      });
    }
  } catch (err) {
    logger.error(err.stack);
  }
}
