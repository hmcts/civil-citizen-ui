import { isPcqEnable } from 'app/auth/launchdarkly/launchDarklyClient';
import {  isPcqElegible, isPcqHealthy } from 'client/pcq/pcqClient';
import {NextFunction, Request, Response} from 'express';
// import {constructResponseUrlWithIdParams} from "common/utils/urlFormatter";
// import {RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
const { v4: uuidv4 } = require('uuid');

export const isFirstTimeInPCQ = async (req: Request, res: Response, next: NextFunction) => {
  let redirectUri = null;
  
  const pcqId = draft.document.defendantDetails.partyDetails.pcqId;
  const type = draft.document.defendantDetails.partyDetails.type;

  if (await isPcqEnable() && await isPcqHealthy()) {
    if (await isPcqElegible(pcqId, type)) {
      // redirectUri = PcqClient.generateRedirectUrl(req, 'DEFENDANT', pcqID, user.email, claim.ccdCaseId, Paths.checkAndSendPage, draft.document.externalId);
      // if (pcqId === undefined) {
      //   let pcqID = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
      //   pcqId = pcqID;
      //   new DraftService().save(draft, user.bearerToken);
      // }
    } else {
      next();
    }
  } else {
    next();
  }
};
