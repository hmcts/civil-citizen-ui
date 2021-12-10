import express from 'express';
import config from 'config';

export class JwtExtractor {

  static extract(req: express.Request): string {
    return req.cookies[config.get<string>('session.cookieName')];
  }

}
