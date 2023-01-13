
import config from 'config';
import {LDClient, init, LDFlagValue} from 'launchdarkly-node-server-sdk';

const launchDarklyTestSdk = config.get<string>('launchDarkly.test.sdk');

const user = {
  'name': 'civil-service',
  'key': 'civil-service',
};

let ldClient: LDClient;

async function getClient(): Promise<LDClient> {
  const client = init(launchDarklyTestSdk);
  await client.waitForInitialization();
  return client;
}

export async function getFlagValue(
  key: string,
): Promise<LDFlagValue> {
  if (!ldClient) ldClient = await getClient();
  return await ldClient.variation(key, user, false);
}

