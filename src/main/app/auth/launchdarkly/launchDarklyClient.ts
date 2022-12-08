import * as LaunchDarkly from 'launchdarkly-node-server-sdk';
import config from 'config';
const launchDarklyTestSdk = config.get<string>('launchDarkly.test.sdk');

const user = {
  'name': 'civil-service',
  'key': 'civil-service',
};

let ldClient: LaunchDarkly.LDClient;

async function getClient(): Promise<LaunchDarkly.LDClient> {
  const client = LaunchDarkly.init(launchDarklyTestSdk);
  await client.waitForInitialization();
  return client;
}

export async function getFlagValue(
  key: string,
): Promise<LaunchDarkly.LDFlagValue> {
  if (!ldClient) ldClient = await getClient();
  return await ldClient.variation(key, user, false);
}

