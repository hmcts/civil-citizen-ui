import * as express from 'express';
import helmet from 'helmet';
import {HelmetOptions} from 'helmet';

const googleAnalyticsDomain = '*.google-analytics.com';
const self = "'self'";

/**
 * Module that enables helmet in the application
 */
export class Helmet {
  constructor(public config: HelmetOptions) {}

  public enableFor(app: express.Express): void {
    if (!this.config.referrerPolicy) {
      throw new Error('Referrer policy configuration is required');
    }

    // include default helmet functions
    app.use(helmet(this.config));

    this.setContentSecurityPolicy(app);
  }

  private setContentSecurityPolicy(app: express.Express): void {
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          connectSrc: [self],
          defaultSrc: ["'none'"],
          fontSrc: [self, 'data:'],
          imgSrc: [self, googleAnalyticsDomain],
          objectSrc: [self],
          scriptSrc: [self, googleAnalyticsDomain, "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='"],
          styleSrc: [self],
        },
      }),
    );
  }

}
