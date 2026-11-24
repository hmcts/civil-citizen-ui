import config from 'config';
import axios from 'axios';
import {PartyType} from 'common/models/partyType';
import {createToken} from './generatePcqToken';
import {EncryptedPcqParams, PcqParameters} from 'client/pcq/pcqParameters';

const pcqBaseUrl: string = config.get('services.pcq.url');
const SERVICE_ID = 'civil-citizen-ui';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('pcqClient');
const PCQ_HEALTH_FAULTS = new Set(['500', '503', 'down']);

const pcqHealthFaultUrl = (requestedFault?: string): string | undefined => {
  const faultBase = (process.env.PCQ_FAULT_URL || '').trim().replace(/\/$/, '');
  if (!faultBase || !requestedFault || !PCQ_HEALTH_FAULTS.has(requestedFault)) {
    return undefined;
  }
  return `${faultBase}/pcq-fault/health/${requestedFault}`;
};

export const isPcqHealthy = async (requestedFault?: string): Promise<boolean> => {
  try {
    const response = await axios.get(pcqHealthFaultUrl(requestedFault) || `${pcqBaseUrl}/health`);
    if (response.data.status === 'UP') {
      return true;
    }
    return false;
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

