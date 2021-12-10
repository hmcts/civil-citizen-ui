import { register } from 'tsconfig-paths';

import tsConfig = require('../../tsconfig.json');

register({
  baseUrl: process.env.TS_BASE_URL || tsConfig.compilerOptions.baseUrl,
  paths: tsConfig.compilerOptions.paths,
});
