import {
  generatePcqtUrl,
  isPcqElegible,
  isPcqHealthy,
} from "client/pcq/pcqClient";
import { isPcqShutterOn } from "app/auth/launchdarkly/launchDarklyClient";
import { generatePcqId } from "client/pcq/generatePcqId";
import { Claim } from "common/models/claim";
import { PartyType } from "common/models/partyType";
import { constructResponseUrlWithIdParams } from "common/utils/urlFormatter";
import { NextFunction, Request, Response } from "express";
import { getCaseDataFromStore } from "modules/draft-store/draftStoreService";
import { RESPONSE_CHECK_ANSWERS_URL } from "routes/urls";
import { savePcqIdClaim } from "client/pcq/savePcqIdClaim";

const ACTOR = "DEFENDANT";

export const isFirstTimeInPCQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseData: Claim = await getCaseDataFromStore(req.params.id);
    const pcqShutterOn = await isPcqShutterOn();

    if (pcqShutterOn || caseData.pcqId) {
      return next();
    }

    const type: PartyType = caseData.respondent1.type;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const defendantEmail = caseData.respondent1.emailAddress.emailAddress;

    const isHealthy = await isPcqHealthy();
    const isElegible = isPcqElegible(type);

    if (isHealthy && isElegible) {
      const pcqId = generatePcqId();
      await savePcqIdClaim(pcqId, claimId);
      
      const pcqUrl = generatePcqtUrl(
        pcqId,
        ACTOR,
        claimId,
        defendantEmail,
        getRedirectionUrl(req.headers.host, claimId),
        lang
        );
        
      console.log("pcqId", pcqId);
      console.log("isPcqShutterOn", pcqShutterOn);
      console.log("caseData.pcqId", caseData.pcqId);
      console.log("isHealthy", isHealthy);
      console.log("isElegible", isElegible);
      console.log("getRedirectionUrl",getRedirectionUrl(req.headers.host, claimId));
      console.log("pcqUrl", pcqUrl);

      res.redirect(pcqUrl);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

const getRedirectionUrl = (host: string, claimId: string): string => {
  const path = constructResponseUrlWithIdParams(claimId, RESPONSE_CHECK_ANSWERS_URL);
  return `${host}${path}`;
  // return `https://${host}${path}`;
};
