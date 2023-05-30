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

export async function isCaseProgressionV1Enable(): Promise<boolean> {
  return await getFlagValue('cui-case-progression') as boolean;
}

export async function isServiceAvailable(): Promise<any> {
  return await getFlagValue('shutter-cui-service') as any;
}
