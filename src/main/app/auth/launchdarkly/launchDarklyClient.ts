import config from 'config';
import {init, LDClient, LDFlagValue, LDUser} from 'launchdarkly-node-server-sdk';
import {TestData} from 'launchdarkly-node-server-sdk/integrations';

let ldClient: LDClient;
let testData: TestData;

const CUI_CASE_PROGRESSION = 'cui-case-progression';
const CASEWORKER_EVENTS = 'cui-case-events-enabled';
const SHUTTER_CUI_SERVICE = 'shutter-cui-service';
const SHUTTER_PCQ = 'shutter-pcq';
const CUI_RELEASE_TWO_ENABLED = 'cuiReleaseTwoEnabled';
const GA_FOR_LIPS = 'GaForLips';
const MINTI = 'minti';
const IS_JUDGMENT_ONLINE_LIVE = 'isJudgmentOnlineLive';
const IS_DASHBOARD_ENABLED_FOR_CASE = 'is-dashboard-enabled-for-case';
const CARM_ENABLED_FOR_CASE = 'cam-enabled-for-case';
const MULTI_OR_INTERMEDIATE_TRACK = 'multi-or-intermediate-track';
const IS_COSC_ENABLED = 'isCoSCEnabled';
const EA_COURT_FOR_GA_LIPS = 'ea-courts-whitelisted-for-ga-lips';

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
      await testData.update(testData.flag(GA_FOR_LIPS).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(MINTI).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(IS_JUDGMENT_ONLINE_LIVE).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(IS_DASHBOARD_ENABLED_FOR_CASE).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(CARM_ENABLED_FOR_CASE).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(MULTI_OR_INTERMEDIATE_TRACK).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(GA_FOR_LIPS).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(EA_COURT_FOR_GA_LIPS).booleanFlag().variationForAll(false));
      await testData.update(testData.flag(IS_COSC_ENABLED).booleanFlag().variationForAll(false));
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

async function getUserLocation(location: string): Promise<LDUser> {
  const launchDarklyEnv = config.get<string>('services.launchDarkly.env');
  let user: LDUser = {'name': 'civil-service', 'key': 'civil-service'};

  if (launchDarklyEnv) {
    user = {
      'name': 'civil-service', 'key': 'civil-service',
      'custom': {
        environment: launchDarklyEnv,
        location: location,
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

export async function getEaFlagValueForGaLips(
  key: string, location?: string,
): Promise<LDFlagValue> {
  if (!ldClient) await getClient();
  if (ldClient)
    return await ldClient.variation(key, await getUserLocation(location), false);
}

export async function isGaForLipsEnabledAndLocationWhiteListed(location: string): Promise<boolean> {

  const gaLipsFlag = await getFlagValue(GA_FOR_LIPS) as boolean;
  const eaFlagForGaLips =  await getEaFlagValueForGaLips(EA_COURT_FOR_GA_LIPS, location) as boolean;
  return gaLipsFlag && eaFlagForGaLips;
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
  return await getFlagValue(CUI_RELEASE_TWO_ENABLED) as boolean;
}

export async function isGaForLipsEnabled(): Promise<boolean> {
  return await getFlagValue(GA_FOR_LIPS) as boolean;
}

export async function isMintiEnabled(): Promise<boolean> {
  return true;
}

export async function isCoSCEnabled(): Promise<boolean> {
  return await getFlagValue(IS_COSC_ENABLED) as boolean;
}

export async function isJudgmentOnlineLive(): Promise<boolean> {
  return await getFlagValue(IS_JUDGMENT_ONLINE_LIVE) as boolean;
}

export async function isDashboardEnabledForCase(date: Date): Promise<boolean> {
  const { DateTime } = require('luxon');
  const systemTimeZone = DateTime.local().zoneName;
  const epoch = DateTime.fromISO(date, { zone: systemTimeZone }).toSeconds();
  const cuiR2Flag = await getFlagValue(CUI_RELEASE_TWO_ENABLED) as boolean;
  const dashboardEnabledForR2Cases =  await getFlagValue(IS_DASHBOARD_ENABLED_FOR_CASE, epoch) as boolean;
  return cuiR2Flag && dashboardEnabledForR2Cases;
}

export async function isCarmEnabledForCase(date: Date): Promise<boolean> {
  const { DateTime } = require('luxon');
  const systemTimeZone = DateTime.local().zoneName;
  const epoch = DateTime.fromISO(date, { zone: systemTimeZone }).toSeconds();
  return await getFlagValue(CARM_ENABLED_FOR_CASE, epoch) as boolean;
}

export async function isMintiEnabledForCase(date: Date): Promise<boolean> {
  return true;
}

export async function isCaseWorkerEventsEnabled(): Promise<boolean> {
  return await getFlagValue(CASEWORKER_EVENTS) as boolean;
}
