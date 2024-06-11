import config from 'config';
import {init, LDClient, LDFlagValue, LDUser} from 'launchdarkly-node-server-sdk';

let ldClient: LDClient;

async function getClient(): Promise<void> {
  const launchDarklyTestSdk = config.get<string>('services.launchDarkly.sdk');

  if (launchDarklyTestSdk) {
    const client = init(launchDarklyTestSdk);
    ldClient = await client.waitForInitialization();
  }
}

async function getUser(): Promise<LDUser> {
  const launchDarklyEnv = config.get<string>('services.launchDarkly.env');
  let user: LDUser = {'name': 'civil-service', 'key': 'civil-service'};

  if (launchDarklyEnv) {
    user = {
      'name': 'civil-service', 'key': 'civil-service',
      'custom': {
        environment: launchDarklyEnv,
        timestamp: new Date().getMilliseconds(),
      },
    };

  }
  return user;
}

export async function getFlagValue(
  key: string,
): Promise<LDFlagValue> {
  if (!ldClient) await getClient();
  if (ldClient)
    return await ldClient.variation(key, await getUser(), false);
}

export async function isCaseProgressionV1Enable(): Promise<boolean> {
  return false;
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
export async function isDashboardServiceEnabled(): Promise<boolean> {
  return await getFlagValue('dashboard-service') as boolean;
}
export async function isCARMEnabled(): Promise<boolean> {
  return await getFlagValue('carm') as boolean;
}
export async function isGaForLipsEnabled(): Promise<boolean> {
  return await getFlagValue('GaForLips') as boolean;
}
export async function isJudgmentOnlineLive(): Promise<boolean> {
  return await getFlagValue('isJudgmentOnlineLive') as boolean;
}
