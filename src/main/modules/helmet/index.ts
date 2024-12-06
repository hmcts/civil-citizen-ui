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
const webChat = ['vcc-eu4.8x8.com', 'vcc-eu4-cf.8x8.com'];

const scriptSrcElem = [
  self,
  googleAnalyticsDomain,
  '*.googletagmanager.com',
  dynatraceDomain,
  "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='",
  ...webChat,
  (req: AppRequest) => `'nonce-${req.cookies.nonceValue}'`,
  (req: AppRequest) => `'nonce-${req.cookies.nonceDataLayer}'`,
];

const styleSrc = [
  self,
  '*.googletagmanager.com',
  'fonts.googleapis.com',
  googleAnalyticsDomain,
  '*.analytics.google.com',
];

const imgSrc = [
  self,
  googleAnalyticsDomain,
  '*.analytics.google.com',
  ...webChat,
  'ssl.gstatic.com',
  '*.gstatic.com',
  '*.g.doubleclick.net',
  '*.googletagmanager.com',
  'data:',
  "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='",
  (req: AppRequest) => `'nonce-${req.cookies.nonceValue}'`,
  (req: AppRequest) => `'nonce-${req.cookies.nonceDataLayer}'`,
];

const mediaSrc = [
  self,
  ...webChat,
  'ssl.gstatic.com',
  'www.gstatic.com',
  '*.g.doubleclick.net',
  googleAnalyticsDomain,
  '*.googletagmanager.com',
  '*.analytics.google.com',
];

const connectSrc = [
  self,
  '*.gov.uk',
  googleAnalyticsDomain,
  '*.analytics.google.com',
  dynatraceDomain,
  'cloud8-cc-geo.8x8.com',
];

const manifestSrc = [
  self,
];

const frameSrc = [...webChat];

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

    const dynatraceUrl = config.get<string>('services.dynatrace.url');
    app.use(dynatraceUrl, function (_req, res, next){
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      );
      next();
    });
    this.setContentSecurityPolicy(app);
  }

  private setContentSecurityPolicy(app: express.Express): void {
    app.use(
      helmet({
        contentSecurityPolicy: {
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
              (req: AppRequest) => `'nonce-${req.cookies.nonceDataLayer}'`,
            ],
            scriptSrcElem: scriptSrcElem,
            styleSrc: styleSrc,
            manifestSrc: manifestSrc,
            formAction: [self, loginUrl, ocmcBaseUrl, govPayUrl],
            frameSrc: frameSrc,
          },
        },
        crossOriginOpenerPolicy: {
          policy: 'same-origin-allow-popups',
        },
      }),
    );
  }
}
