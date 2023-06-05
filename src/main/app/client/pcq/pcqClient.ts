import * as express from "express";
// import { RoutablePath } from 'shared/router/routablePath'
// import { buildURL } from 'utils/callbackBuilder'
import * as config from "config";
import axios from "axios";
import { PartyType } from "common/models/partyType";
// import { BaseParameters, InvokingParameters } from './models/pcqParameters'
// import { TokenGenerator } from './tokenGenerator'

const pcqBaseUrl: string = `${config.get<string>("pcq.url")}`;
const serviceId = "civil-citizen-ui";

export const isPcqHealthy = async () => {
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

export const isPcqElegible = async (pcqID: string, type: PartyType) => {
  try {
    const response = await axios.get(pcqBaseUrl + "/health");
    if (
      response.data.status === "UP" &&
      !pcqID &&
      (type === PartyType.INDIVIDUAL || type === PartyType.SOLE_TRADER)
    ) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

// export class PcqClient {
//   static async isEligibleRedirect(
//     pcqID: string,
//     partyType: string
//   ): Promise<boolean> {
//     try {
//       const response = request.get(pcqBaseUrl + "/health", { json: true });
//       if (
//         response["status"] === "UP" &&
//         pcqID === undefined &&
//         partyType === "individual"
//       ) {
//         return true;
//       }
//       return false;
//     } catch (err) {
//       return false;
//     }
//   }

//   static generateRedirectUrl(
//     req: express.Request,
//     claimtype: string,
//     pcqID: string,
//     partyEmailId: string,
//     ccdCaseId: number,
//     receiver: RoutablePath,
//     externalId: string
//   ): string {
//     if (receiver === undefined) {
//       throw new Error("Request is undefined");
//     }
//     let ccdId = "";
//     if (ccdCaseId) {
//       ccdId = ccdCaseId.toString();
//     }
//     const returnUri = buildURL(req, receiver.uri)
//       .split("https://")[1]
//       .replace(":externalId", externalId);
//     return this.getServiceEndpoint(
//       ccdId,
//       partyEmailId,
//       pcqID,
//       returnUri,
//       serviceId,
//       claimtype
//     );
//   }

//   static getServiceEndpoint(
//     ccdCaseId: string,
//     partyId: string,
//     pcqId: string,
//     returnUri: string,
//     actorCmc: string,
//     claimtype: string
//   ): string {
//     const baseParameters: BaseParameters = {
//       pcqId: pcqId,
//       serviceId: actorCmc,
//       actor: claimtype,
//       ccdCaseId: ccdCaseId,
//       partyId: partyId,
//       returnUrl: returnUri,
//       language: "en",
//     };

//     const invokingParameters: InvokingParameters = {
//       ...baseParameters,
//       token: TokenGenerator.gen(baseParameters),
//     };

//     const qs = Object.keys(invokingParameters)
//       .map((key) => key + "=" + invokingParameters[key])
//       .join("&");

//     return `${pcqBaseUrl}/service-endpoint?${qs}`;
//   }
// }

export interface GetServiceEndpointParameters {
  actor: string;
  ccdCaseId?: string;
  partyId: string;
  returnUrl: string;
  language?: string;
}

export interface BaseParameters {
  serviceId: string;
  actor: string;
  pcqId: string;
  ccdCaseId?: string;
  partyId: string;
  returnUrl: string;
  language?: string;
}

export interface InvokingParameters extends BaseParameters {
  token: string;
}
