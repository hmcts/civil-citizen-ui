import config from 'config';
import { LDClient, init, LDFlagValue } from 'launchdarkly-node-server-sdk';

const user = {
  'name': 'civil-service',
  'key': 'civil-service',
};

let ldClient: LDClient;

async function getClient(): Promise<void> {
  const launchDarklyTestSdk = config.get<string>('services.launchDarkly.sdk');

  if (launchDarklyTestSdk) {
    const client = init(launchDarklyTestSdk);
    ldClient = await client.waitForInitialization();
  }
}

export async function getFlagValue(
  key: string,
): Promise<LDFlagValue> {
  if (!ldClient) await getClient();
  if (ldClient)
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
  // return await getFlagValue('cuiReleaseTwoEnabled') as boolean;
  return true as boolean;
}

export async function isCARMEnabled(): Promise<boolean> {
  return await getFlagValue('carm') as boolean;
}
