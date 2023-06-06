import {
  generatePcqtUrl,
  isPcqElegible,
  isPcqHealthy,
} from "client/pcq/pcqClient";
import { Claim } from "common/models/claim";
import { PartyType } from "common/models/partyType";
import { constructResponseUrlWithIdParams } from "common/utils/urlFormatter";
import { NextFunction, Request, Response } from "express";
import { getCaseDataFromStore } from "modules/draft-store/draftStoreService";
import { RESPONSE_CHECK_ANSWERS_URL } from "routes/urls";
// import {constructResponseUrlWithIdParams} from "common/utils/urlFormatter";
// import {RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
// const { v4: uuidv4 } = require('uuid');

export const isFirstTimeInPCQ = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // let redirectUri = null;
  const caseData: Claim = await getCaseDataFromStore(req.params.id);
  // const pcqId = draft.document.defendantDetails.partyDetails.pcqId;
  // const type = draft.document.defendantDetails.partyDetails.type;

  const pcqId: string = null; //TODO: generate PCQ ID
  const type: PartyType = caseData.respondent1.type;
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const claimId = req.params.id;

  const isHealthy = await isPcqHealthy();
  const isElegible = await isPcqElegible(pcqId, type);

  console.log("isHealthy", isHealthy);
  console.log("isElegible", isElegible);

  if (isHealthy && isElegible) {
    // TODO:
    // generate token
    // save it on CCD?

    const pcqUrl = generatePcqtUrl(
      "pcqId",
      "actor", //RESPONDENT, DEFENDANT??????
      "ccdCaseId",
      caseData.respondent1.emailAddress.emailAddress,
      constructResponseUrlWithIdParams(claimId, RESPONSE_CHECK_ANSWERS_URL),
      lang
    );
    console.log("pcqUrl", pcqUrl);
  } else {
    next();
  }
};
