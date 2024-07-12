import {AppRequest} from 'common/models/AppRequest';
import * as express from 'express';
import {HelmetOptions,default as helmet} from 'helmet';
import config from 'config';

const googleAnalyticsDomain = '*.google-analytics.com';
const self = "'self'";
const loginUrl: string = config.get('services.idam.authorizationURL');
const govPayUrl: string = config.get('services.govPay.url');
const ocmcBaseUrl: string = config.get('services.cmc.url');
const dynatraceDomain = '*.dynatrace.com';

const scriptSrcElem = [
  self,
  '*.google-analytics.com',
  '*.googletagmanager.com',
  dynatraceDomain,
  "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='",
  (req: AppRequest) => `'nonce-${req.cookies.nonceValue}'`,
];

const styleSrc = [
  self,
  '*.googletagmanager.com',
  'fonts.googleapis.com',
  '*.google-analytics.com',
  '*.analytics.google.com',
];

const imgSrc = [
  self,
  '*.google-analytics.com',
  '*.analytics.google.com',
  'vcc-eu4.8x8.com',
  'vcc-eu4b.8x8.com',
  'ssl.gstatic.com',
  '*.gstatic.com',
  'stats.g.doubleclick.net',
  'data:',
];

const mediaSrc = [
  self,
  'vcc-eu4.8x8.com',
  'vcc-eu4b.8x8.com',
  'ssl.gstatic.com',
  'www.gstatic.com',
  'stats.g.doubleclick.net',
  '*.google-analytics.com',
  '*.analytics.google.com',
];

const connectSrc = [
  self,
  '*.gov.uk',
  '*.google-analytics.com',
  '*.analytics.google.com',
];

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
          connectSrc: connectSrc,
          mediaSrc: mediaSrc,
          defaultSrc: ["'none'"],
          fontSrc: [self, 'data:', 'fonts.gstatic.com'],
          imgSrc: imgSrc,
          objectSrc: [self],
          scriptSrc: [
            self,
            googleAnalyticsDomain,
            dynatraceDomain,
            "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
            (req: AppRequest) => `'nonce-${req.cookies.nonceValue}'`,
          ],
          scriptSrcElem: scriptSrcElem,
          styleSrc: styleSrc,
          manifestSrc: [self],
          formAction: [self, loginUrl, ocmcBaseUrl, govPayUrl],
        },
      }),
    );
  }
}
