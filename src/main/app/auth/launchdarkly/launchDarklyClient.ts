import config from 'config';
import {init, LDClient, LDFlagValue, LDUser} from 'launchdarkly-node-server-sdk';
import {TestData} from 'launchdarkly-node-server-sdk/integrations';
let ldClient: LDClient;
let testData: TestData;

async function getClient(): Promise<void> {
  console.log('process.env.LAUNCH_DARKLY_SDK -->' + process.env.LAUNCH_DARKLY_SDK);
  console.log('services.launchDarkly.sdk -->' + config.get<string>('services.launchDarkly.sdk'));
  const launchDarklyTestSdk =  process.env.LAUNCH_DARKLY_SDK || config.get<string>('services.launchDarkly.sdk');
  if (launchDarklyTestSdk) {
    let client;
    if (process.env.NODE_ENV === 'e2eTest') {
      testData = TestData();
      await testData.update(testData.flag('cui-case-progression').booleanFlag().variationForAll(false));
      await testData.update(testData.flag('shutter-cui-service').booleanFlag().variationForAll(false));
      await testData.update(testData.flag('shutter-pcq').booleanFlag().variationForAll(false));
      await testData.update(testData.flag('cuiReleaseTwoEnabled').booleanFlag().variationForAll(false));
      await testData.update(testData.flag('carm').booleanFlag().variationForAll(false));
      await testData.update(testData.flag('GaForLips').booleanFlag().variationForAll(false));
      await testData.update(testData.flag('minti').booleanFlag().variationForAll(false));
      await testData.update(testData.flag('isJudgmentOnlineLive').booleanFlag().variationForAll(false));
      await testData.update(testData.flag('is-dashboard-enabled-for-case').booleanFlag().variationForAll(false));
      await testData.update(testData.flag('cam-enabled-for-case').booleanFlag().variationForAll(false));
      await testData.update(testData.flag('multi-or-intermediate-track').booleanFlag().variationForAll(false));

      client = init(launchDarklyTestSdk, { updateProcessor: testData });
    } else {
      client = init(launchDarklyTestSdk);
    }
    ldClient = await client.waitForInitialization();
  }
}

export async function updateE2EKey(key: string, variation: boolean): Promise<void>{
  await getFlagValue(key) as boolean;
  await testData.update(testData.flag(key).booleanFlag().variationForAll(variation));
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
