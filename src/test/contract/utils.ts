import { resolve } from 'path';

export const PACT_LOG_PATH = resolve(process.cwd(), 'src/test/contract/log', 'pact.log');
export const PACT_DIRECTORY_PATH = resolve(process.cwd(), 'src/test/contract/pacts');
