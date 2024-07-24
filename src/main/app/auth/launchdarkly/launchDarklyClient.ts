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

async function getUser(epoch: string): Promise<LDUser> {
  const launchDarklyEnv = config.get<string>('services.launchDarkly.env');
  let user: LDUser = {'name': 'civil-service', 'key': 'civil-service'};

  if (launchDarklyEnv) {
    user = {
      'name': 'civil-service', 'key': 'civil-service',
      'custom': {
        environment: launchDarklyEnv,
        timestamp: epoch || new Date().getMilliseconds(),
      },
    };

  }
  return user;
}

export async function getFlagValue(
  key: string, epoch?: string,
): Promise<LDFlagValue> {
  if (!ldClient) await getClient();
  if (ldClient)
    return await ldClient.variation(key, await getUser(epoch), false);
}

export async function isCaseProgressionV1Enable(): Promise<boolean> {
  return true;
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

export async function isGaForLipsEnabled(): Promise<boolean> {
  return await getFlagValue('GaForLips') as boolean;
}

export async function isMintiEnabled(): Promise<boolean> {
  return await getFlagValue('minti') as boolean;
}

export async function isJudgmentOnlineLive(): Promise<boolean> {
  return await getFlagValue('isJudgmentOnlineLive') as boolean;
}

export async function  isDashboardEnabledForCase(date: Date): Promise<boolean> {
  const { DateTime } = require('luxon');
  const systemTimeZone = DateTime.local().zoneName;
  const epoch = DateTime.fromISO(date, { zone: systemTimeZone }).toSeconds();
  return await getFlagValue('is-dashboard-enabled-for-case', epoch) as boolean;
}

export async function isCarmEnabledForCase(date: Date): Promise<boolean> {
  const { DateTime } = require('luxon');
  const systemTimeZone = DateTime.local().zoneName;
  const epoch = DateTime.fromISO(date, { zone: systemTimeZone }).toSeconds();
  const carmFlag = await getFlagValue('carm') as boolean;
  const carmApplicable = await getFlagValue('cam-enabled-for-case', epoch) as boolean;
  return carmFlag && carmApplicable;
}

export async function  isMintiEnabledForCase(date: Date): Promise<boolean> {
  const { DateTime } = require('luxon');
  const systemTimeZone = DateTime.local().zoneName;
  const epoch = DateTime.fromISO(date, { zone: systemTimeZone }).toSeconds();
  const mintiFlag = await getFlagValue('minti') as boolean;
  const mintiApplicable = await getFlagValue('multi-or-intermediate-track', epoch) as boolean;
  return mintiFlag && mintiApplicable;
}
