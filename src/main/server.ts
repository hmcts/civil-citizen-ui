#!/usr/bin/env node
import {readFileSync} from 'fs';
import {createServer} from 'https';
import * as path from 'path';
import {installPiiLoggingRedaction} from './common/logging/piiRedaction';

installPiiLoggingRedaction();
// Load the application after installing redaction so its module-level loggers are wrapped.
const {app} = require('./app');

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('server');

const port: number = parseInt(process.env.PORT) || 3001;

// Global error handlers for runtime type errors
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    timestamp: new Date().toISOString(),
  });
});

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
