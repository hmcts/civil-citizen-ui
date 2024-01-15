import config from 'config';
import {LDClient, init, LDFlagValue} from 'launchdarkly-node-server-sdk';
const launchDarklyTestSdk = config.get<string>('launchDarkly.sdk');

const user = {
  'name': 'civil-service',
  'key': 'civil-service',
};

let ldClient: LDClient;

async function getClient(): Promise<LDClient> {
  console.log('******************Launchdarkly initializing token below****************');
  console.log(launchDarklyTestSdk);
  const client = init(launchDarklyTestSdk);
  await client.waitForInitialization();
  console.log('***********initialized the launch darkly instance***************');
  console.debug(client);
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

export async function isServiceShuttered(): Promise<boolean> {
  return await getFlagValue('shutter-cui-service') as boolean;
}

export async function isPcqShutterOn(): Promise<boolean> {
  return await getFlagValue('shutter-pcq') as boolean;
}

export async function isCUIReleaseTwoEnabled(): Promise<boolean> {
  return await getFlagValue('cuiReleaseTwoEnabled') as boolean;
}

export async function isCARMEnabled(): Promise<boolean> {
  return await getFlagValue('carm') as boolean;
}
