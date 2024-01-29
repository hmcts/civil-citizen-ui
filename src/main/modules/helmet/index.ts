import {AppRequest} from 'common/models/AppRequest';
import * as express from 'express';
import {HelmetOptions,default as helmet} from 'helmet';
import config from 'config';

const googleAnalyticsDomain = '*.google-analytics.com';
const self = "'self'";
const inline = '\'unsafe-inline\'';
const loginUrl: string = config.get('services.idam.authorizationURL');
const govPayUrl: string = config.get('services.govPay.url');
const ocmcBaseUrl: string = config.get('services.cmc.url');

const scriptSrcElem = [
  self,
  inline,
  '*.google-analytics.com',
  '*.googletagmanager.com',
];

const styleSrc = [
  self,
  inline,
  '*.googletagmanager.com',
  'fonts.googleapis.com',
  '*.google-analytics.com',
  '*.analytics.google.com',
];

const imgSrc = [
  self,
  inline,
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
  inline,
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
  inline,
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
            "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
            (req: AppRequest, _res) => `'nonce-${req.cookies.nonceValue}'`,
          ],
          scriptSrcElem: scriptSrcElem,
          styleSrc: styleSrc,
          formAction: [self, loginUrl, ocmcBaseUrl, govPayUrl],
        },
      }),
    );
  }
}
