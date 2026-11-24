import config from 'config';
import axios from 'axios';
import {PartyType} from 'common/models/partyType';
import {createToken} from './generatePcqToken';
import {EncryptedPcqParams, PcqParameters} from 'client/pcq/pcqParameters';

const pcqBaseUrl: string = config.get('services.pcq.url');
const SERVICE_ID = 'civil-citizen-ui';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('pcqClient');

// Temporary, do not merge. Every health check fails with 503 so the preview log can be checked.
const forcedPcqHealthFailure = (): Error => {
  const failure = new Error('Forced PCQ health failure') as Error & {isAxiosError: boolean; response: {status: number}};
  failure.isAxiosError = true;
  failure.response = {status: 503};
  return failure;
};

export const isPcqHealthy = async (): Promise<boolean> => {
  try {
    throw forcedPcqHealthFailure();
  } catch (error: unknown) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    logger.error(`PCQ health check failed${status === undefined ? '' : ` with status ${status}`}`);
    return false;
  }
};

export const isPcqElegible = (type: PartyType): boolean => {
  if (type === PartyType.INDIVIDUAL || type === PartyType.SOLE_TRADER) {
    return true;
  }
  return false;
};

export const generatePcqUrl = (
  pcqId: string,
  actor: string,
  partyId: string,
  returnUri: string,
  lang: string,
  ccdCaseId?: string,
): string => {
  const pcqParameters: PcqParameters = {
    pcqId: pcqId,
    serviceId: SERVICE_ID,
    actor: actor,
    partyId: partyId,
    returnUrl: returnUri,
    language: lang,
  };

  if (ccdCaseId) {
    pcqParameters.ccdCaseId = ccdCaseId;
  }

  const encryptedPcqParams: EncryptedPcqParams = {
    ...pcqParameters,
    token: createToken(pcqParameters),
  };

  const qs = Object.entries(encryptedPcqParams)
    .map(([key, value]) => key + '=' + value)
    .join('&');

  return `${pcqBaseUrl}/service-endpoint?${qs}`;
};

