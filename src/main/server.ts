#!/usr/bin/env node
// Must stay the first import. It starts App Insights (and PII log redaction) before express, http,
// https or axios are loaded: SDK 3 collects requests and dependencies through OpenTelemetry, which
// can only instrument those modules as they are required. Anything imported above this line is
// never instrumented, which is how prod lost all request and dependency telemetry on 5 Nov 2026.
import './modules/appinsights/bootstrap';
import {isUiPreviewEnabled, uiPreviewHost} from './common/utils/uiPreviewConfig';
import {readFileSync} from 'fs';
import {createServer} from 'https';
import * as path from 'path';

if (isUiPreviewEnabled()) require('../../bin/ui-preview-network.cjs');
// Loaded after the bootstrap so its module-level loggers are wrapped and its http use is traced.
const {app} = require('./app');

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('server');

const port: number = parseInt(process.env.PORT) || 3001;

// Text, not {message, stack}. PII redaction blanks those fields on a logged Error object.
process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}\n${error.stack ?? ''}`);
});

process.on('unhandledRejection', (reason: unknown) => {
  if (reason instanceof Error) {
    logger.error(`Unhandled Rejection: ${reason.message}\n${reason.stack ?? ''}`);
    return;
  }
  logger.error(`Unhandled Rejection: ${String(reason)}`);
});

// Node's default keepAliveTimeout (5s) is below Traefik's 90s backend idleConnTimeout, so Node
// closes pooled keep-alive sockets Traefik still reuses toward the pod -> RST -> intermittent 502.
// Hold the socket open past Traefik's idle timeouts (90s backend, 180s front) so Traefik is always
// the side that closes first. headersTimeout is intentionally left at the Node default (60s): it
// caps time-to-receive request headers, not idle keep-alive, and the two are decoupled in Node 24.
const keepAliveTimeout = 185000;

function startupFailed(error: Error): never {
  logger.error('Application startup failed', error);
  process.exit(1);
}

async function start(): Promise<void> {
  if (isUiPreviewEnabled()) await app.locals.uiPreviewReady;
  if (app.locals.ENV === 'development') {
    const sslDirectory = path.join(__dirname, 'resources', 'localhost-ssl');
    const sslOptions = {
      cert: readFileSync(path.join(sslDirectory, 'localhost.crt')),
      key: readFileSync(path.join(sslDirectory, 'localhost.key')),
    };
    const server = createServer(sslOptions, app);
    server.keepAliveTimeout = keepAliveTimeout;
    server.once('error', startupFailed);
    server.listen(port, () => {
      server.removeListener('error', startupFailed);
      logger.info(`Application started: https://localhost:${port}`);
    });
  } else {
    const server = isUiPreviewEnabled() ? app.listen(port, uiPreviewHost(), (error?: Error) => {
      if (error) startupFailed(error);
      logger.info(`Local UI preview: http://127.0.0.1:${port}/ui-preview`);
    }) : app.listen(port, (error?: Error) => {
      if (error) startupFailed(error);
      logger.info(`Application started: http://localhost:${port}`);
    });
    server.keepAliveTimeout = keepAliveTimeout;
  }
}
start().catch(startupFailed);
