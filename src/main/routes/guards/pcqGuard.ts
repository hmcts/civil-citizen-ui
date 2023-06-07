import {
  generatePcqtUrl,
  isPcqElegible,
  isPcqHealthy,
} from 'client/pcq/pcqClient';
import { isPcqShutterOn } from 'app/auth/launchdarkly/launchDarklyClient';
import { generatePcqId } from 'client/pcq/generatePcqId';
import { Claim } from 'common/models/claim';
import { PartyType } from 'common/models/partyType';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { NextFunction, Request, Response } from 'express';
import { getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { RESPONSE_CHECK_ANSWERS_URL } from 'routes/urls';
import { savePcqIdClaim } from 'client/pcq/savePcqIdClaim';

export const isFirstTimeInPCQ = async (req: Request, res: Response, next: NextFunction) => {
  const caseData: Claim = await getCaseDataFromStore(req.params.id);
  const pcqShutterOn = await isPcqShutterOn();
  console.log('isPcqShutterOn', pcqShutterOn);
  
  if (caseData.pcqId || !pcqShutterOn) {
    next();
  }

  const type: PartyType = caseData.respondent1.type;
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const claimId = req.params.id;
  const defendantEmail = caseData.respondent1.emailAddress.emailAddress;

  const isHealthy = await isPcqHealthy();
  const isElegible = isPcqElegible(type);
  
  console.log('isHealthy', isHealthy);
  console.log('isElegible', isElegible);
  
  if (isHealthy && isElegible) {
    // TODO:
    // generate token
    const pcqId = generatePcqId();
    savePcqIdClaim(pcqId, claimId);
    console.log('pcqId', pcqId);

    const pcqUrl = generatePcqtUrl(
      pcqId,
      'actor', // RESPONDENT, DEFENDANT??????
      claimId, // 'ccdCaseId',
      defendantEmail,
      constructResponseUrlWithIdParams(claimId, RESPONSE_CHECK_ANSWERS_URL), // missing localhost:3001.... https://case/1645882162449409/response/check-and-send
      lang,
    );

    console.log('pcqUrl', pcqUrl);

    res.redirect(pcqUrl);
  } else {
    next();
  }
};
