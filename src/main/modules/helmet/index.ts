import * as express from 'express';
import helmet from 'helmet';
import {ReferrerPolicyOptions} from 'helmet/dist/types/middlewares/referrer-policy';

export interface HelmetConfig {
  referrerPolicy: ReferrerPolicyOptions;
}

const googleAnalyticsDomain = '*.google-analytics.com';
const self = "'self'";

/**
 * Module that enables helmet in the application
 */
export class Helmet {
  constructor(public config: HelmetConfig) {}

  public enableFor(app: express.Express): void {
    // include default helmet functions
    app.use(helmet());

    this.setContentSecurityPolicy(app);
    this.setReferrerPolicy(app, this.config.referrerPolicy);
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

  private setReferrerPolicy(app: express.Express, policy: ReferrerPolicyOptions): void {
    if (!policy) {
      throw new Error('Referrer policy configuration is required');
    }

    app.use(helmet.referrerPolicy( policy ));
  }
}
