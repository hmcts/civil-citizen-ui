#!/usr/bin/env node
const { Logger } = require('@hmcts/nodejs-logging');
import { app } from './app';

const logger = Logger.getLogger('server');
const port: number = parseInt(process.env.PORT) || 3001;

app.listen(port, () => {
  logger.info(`Application started: http://localhost:${port}`);
});

