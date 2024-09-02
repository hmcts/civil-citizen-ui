#!/usr/bin/env node
import {readFileSync} from 'fs';
import {createServer} from 'https';
import * as path from 'path';
import { app } from './app';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('server');

const port: number = parseInt(process.env.PORT) || 3001;

if (app.locals.ENV === 'development') {
  const sslDirectory = path.join(__dirname, 'resources', 'localhost-ssl');
  const sslOptions = {
    cert: readFileSync(path.join(sslDirectory, 'localhost.crt')),
    key: readFileSync(path.join(sslDirectory, 'localhost.key')),
  };
  const server = createServer(sslOptions, app);
  server.listen(port, () => {
    logger.info(`Application started: https://localhost:${port}`);
  });
} else {
  app.listen(port, () => {
    logger.info(`Application started: http://localhost:${port}`);
  });
}
