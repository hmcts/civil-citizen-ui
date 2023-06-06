// import * as express from "express";
// import { RoutablePath } from 'shared/router/routablePath'
// import { buildURL } from 'utils/callbackBuilder'
// import * as config from "config";
import config = require("config");
import axios from "axios";
import { PartyType } from "common/models/partyType";
// import { BaseParameters, InvokingParameters } from './models/pcqParameters'
// import { TokenGenerator } from './tokenGenerator'

const pcqBaseUrl: string = config.get("services.pcq.url");
const SERVICE_ID = "civil-citizen-ui";

export const isPcqHealthy = async (): Promise<boolean> => {
  try {
    const response = await axios.get(pcqBaseUrl + "/health");
    if (response.data.status === "UP") {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const isPcqElegible = async (
  pcqID: string,
  type: PartyType
): Promise<boolean> => {
  const isHealthy = await isPcqHealthy();
  const isIndividualOrSoleTrader =
    type === PartyType.INDIVIDUAL || type === PartyType.SOLE_TRADER;
  if (isHealthy && !pcqID && isIndividualOrSoleTrader) {
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
  lang: string
): string => {
  const pcqParameters: PcqParameters = {
    pcqId: pcqId,
    serviceId: SERVICE_ID,
    actor: actor,
    ccdCaseId: ccdCaseId,
    partyId: partyId,
    returnUrl: returnUri,
    language: lang,
    token: "test", // token: TokenGenerator.gen(baseParameters)
  };

  const qs = Object.entries(pcqParameters)
    .map(([key, value]) => key + "=" + value)
    .join("&");
    
  return `${pcqBaseUrl}/service-endpoint?${qs}`;
};
// (
//   req: express.Request,
//   claimtype: string,
//   pcqID: string,
//   partyEmailId: string,
//   ccdCaseId: number,
//   receiver: RoutablePath,
//   externalId: string
// ): string {
//   if (receiver === undefined) {
//     throw new Error("Request is undefined");
//   }
//   let ccdId = "";
//   if (ccdCaseId) {
//     ccdId = ccdCaseId.toString();
//   }
//   const returnUri = buildURL(req, receiver.uri)
//     .split("https://")[1]
//     .replace(":externalId", externalId);
//   return this.getServiceEndpoint(
//     ccdId,
//     partyEmailId,
//     pcqID,
//     returnUri,
//     serviceId,
//     claimtype
//   );
// }

export interface GetServiceEndpointParameters {
  actor: string;
  ccdCaseId?: string;
  partyId: string;
  returnUrl: string;
  language?: string;
}

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
