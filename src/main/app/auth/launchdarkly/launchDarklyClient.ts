import config from 'config';
import {init, LDClient, LDFlagValue, LDUser} from 'launchdarkly-node-server-sdk';
import {TestData} from 'launchdarkly-node-server-sdk/integrations';
let ldClient: LDClient;
let testData: TestData;

const CUI_CASE_PROGRESSION = 'cui-case-progression';
const SHUTTER_CUI_SERVICE = 'shutter-cui-service';
const SHUTTER_PCQ = 'shutter-pcq';
const CUI_RELEASE_TWO_ENABLED = 'cuiReleaseTwoEnabled';
const CARM = 'carm';
const GA_FOR_LIPS = 'GaForLips';
const MINTI = 'minti';
const IS_JUDGMENT_ONLINE_LIVE = 'isJudgmentOnlineLive';
const IS_DASHBOARD_ENABLED_FOR_CASE = 'is-dashboard-enabled-for-case';
const CARM_ENABLED_FOR_CASE = 'cam-enabled-for-case';
const MULTI_OR_INTERMEDIATE_TRACK = 'multi-or-intermediate-track';

async function getClient(): Promise<void> {
  const launchDarklyTestSdk =  process.env.LAUNCH_DARKLY_SDK || config.get<string>('services.launchDarkly.sdk');

  if (launchDarklyTestSdk) {
    let client;
    if (process.env.NODE_ENV === 'e2eTest') {
      testData = TestData();
      await testData.update(testData.flag(CUI_CASE_PROGRESSION).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(SHUTTER_CUI_SERVICE).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(SHUTTER_PCQ).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(CUI_RELEASE_TWO_ENABLED).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(CARM).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(GA_FOR_LIPS).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(MINTI).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(IS_JUDGMENT_ONLINE_LIVE).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(IS_DASHBOARD_ENABLED_FOR_CASE).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(CARM_ENABLED_FOR_CASE).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(MULTI_OR_INTERMEDIATE_TRACK).booleanFlag().variationForAll(false));
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
  return await getFlagValue(CUI_CASE_PROGRESSION) as boolean;
}

export async function isServiceShuttered(): Promise<boolean> {
  return await getFlagValue(SHUTTER_CUI_SERVICE) as boolean;
}

export async function isPcqShutterOn(): Promise<boolean> {
  return await getFlagValue(SHUTTER_PCQ) as boolean;
}

export async function isCUIReleaseTwoEnabled(): Promise<boolean> {
  return true;
}

export async function isCARMEnabled(): Promise<boolean> {
  return await getFlagValue(CARM) as boolean;
}

export async function isGaForLipsEnabled(): Promise<boolean> {
  return await getFlagValue(GA_FOR_LIPS) as boolean;
}

export async function isMintiEnabled(): Promise<boolean> {
  return await getFlagValue(MINTI) as boolean;
}

export async function isJudgmentOnlineLive(): Promise<boolean> {
  return await getFlagValue(IS_JUDGMENT_ONLINE_LIVE) as boolean;
}

export async function  isDashboardEnabledForCase(date: Date): Promise<boolean> {
  return true;
}

export async function isCarmEnabledForCase(date: Date): Promise<boolean> {
  const { DateTime } = require('luxon');
  const systemTimeZone = DateTime.local().zoneName;
  const epoch = DateTime.fromISO(date, { zone: systemTimeZone }).toSeconds();
  const carmFlag = await getFlagValue(CARM) as boolean;
  const carmApplicable = await getFlagValue(CARM_ENABLED_FOR_CASE, epoch) as boolean;
  return carmFlag && carmApplicable;
}

export async function  isMintiEnabledForCase(date: Date): Promise<boolean> {
  const { DateTime } = require('luxon');
  const systemTimeZone = DateTime.local().zoneName;
  const epoch = DateTime.fromISO(date, { zone: systemTimeZone }).toSeconds();
  const mintiFlag = await getFlagValue(MINTI) as boolean;
  const mintiApplicable = await getFlagValue(MULTI_OR_INTERMEDIATE_TRACK, epoch) as boolean;
  return mintiFlag && mintiApplicable;
}
