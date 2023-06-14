import config from "config";
import axios from 'axios';
import {PartyType} from 'common/models/partyType';
import {createToken} from './generatePcqToken';

const pcqBaseUrl: string = config.get('services.pcq.url');
const SERVICE_ID = 'civil-citizen-ui';

export const isPcqHealthy = async (): Promise<boolean> => {
  try {
    const response = await axios.get(pcqBaseUrl + '/health');
    if (response.data.status === 'UP') {
      return true;
    }
    return false;
  } catch (error) {
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
  ccdCaseId: string,
  partyId: string,
  returnUri: string,
  lang: string,
): string => {
  const pcqParameters: PcqParameters = {
    pcqId: pcqId,
    serviceId: SERVICE_ID,
    actor: actor,
    ccdCaseId: ccdCaseId,
    partyId: partyId,
    returnUrl: returnUri,
    language: lang,
  };

  const encryptedPcqParams: EncryptedPcqParams = {
    ...pcqParameters,
    token: createToken(pcqParameters),
  };

  const qs = Object.entries(encryptedPcqParams)
    .map(([key, value]) => key + '=' + value)
    .join('&');
    
  return `${pcqBaseUrl}/service-endpoint?${qs}`;
};

export interface PcqParameters {
  serviceId: string;
  actor: string;
  pcqId: string;
  ccdCaseId?: string;
  partyId: string;
  returnUrl: string;
  language?: string;
}

export interface EncryptedPcqParams extends PcqParameters {
  token: string;
}
