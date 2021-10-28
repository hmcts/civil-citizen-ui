import * as os from 'os';

import { infoRequestHandler } from '@hmcts/info-provider';
import { Router } from 'express';

export default function(app: Router): void {
  app.get(
    '/info',
    infoRequestHandler({
      extraBuildInfo: {
        host: os.hostname(),
        name: 'expressjs-template',
        uptime: process.uptime(),
      },
      info: {
        // TODO: add downstream info endpoints if your app has any
      },
    }),
  );

}
