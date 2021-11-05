#!/usr/bin/env node
const { Logger } = require('@hmcts/nodejs-logging');
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import { app } from './app';

const logger = Logger.getLogger('server');

// TODO: set the right port for your application
const port: number = parseInt(process.env.PORT, 10) || 3100;

const spawnSync = require('child_process').execSync;

function buildSslOptions(): object {
  const sslDirectory = path.join(__dirname, 'localhost-ssl');

  spawnSync('mkdir ' + sslDirectory);

  const keyFile = path.join(sslDirectory, 'localhost.key');
  const certFile = path.join(sslDirectory, 'localhost.crt');

  const command = 'openssl req -nodes -x509 -newkey rsa:4096 -keyout ' + keyFile + ' -out ' + certFile + ' -sha256 -days 365 -subj "/C=GB/ST=A/L=B/O=C/OU=D/CN=E"';

  spawnSync(command);

  const sslOptions = {
    cert: fs.readFileSync(certFile, 'utf8'),
    key: fs.readFileSync(keyFile, 'utf8'),
  };

  spawnSync('rm -rf ' + sslDirectory);

  return sslOptions;
}

if (app.locals.ENV === 'development') {
  logger.info('Building SSL options..');
  const sslOptions = buildSslOptions();
  logger.info('Building SSL options complete');
  const server = https.createServer(sslOptions, app);
  server.listen(port, () => {
    logger.info(`Application started: https://localhost:${port}`);
  });
} else {
  app.listen(port, () => {
    logger.info(`Application started: http://localhost:${port}`);
  });
}
