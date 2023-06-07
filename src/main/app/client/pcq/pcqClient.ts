import config = require('config');
import axios from 'axios';
import { PartyType } from 'common/models/partyType';

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

export const generatePcqtUrl = (
  pcqId: string,
  actor: string, //Respondents
  ccdCaseId: string, //ccdCaseId
  partyId: string, //Respondent's Email Address
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
    token: 'test', // TODO: TokenGenerator.gen(baseParameters)
  };

  const qs = Object.entries(pcqParameters)
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
  token: string;
}
