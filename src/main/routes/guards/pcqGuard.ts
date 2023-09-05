import {
  generatePcqUrl,
  isPcqElegible,
  isPcqHealthy,
} from 'client/pcq/pcqClient';
import {isPcqShutterOn} from '../../app/auth/launchdarkly/launchDarklyClient';
import {generatePcqId} from 'client/pcq/generatePcqId';
import {Claim} from 'common/models/claim';
import {PartyType} from 'common/models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {NextFunction, Request, Response} from 'express';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {savePcqIdClaim} from 'client/pcq/savePcqIdClaim';

const ACTOR = 'respondent';

export const isFirstTimeInPCQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('isFirstTimeInPCQ');
    
    console.time('CHECK_ANSWERS isFirstTimeInPCQ getCaseDataFromStore');
    const caseData: Claim = await getCaseDataFromStore(req.params.id);
    console.timeEnd('CHECK_ANSWERS isFirstTimeInPCQ getCaseDataFromStore');

    console.time('CHECK_ANSWERS isFirstTimeInPCQ isPcqShutterOn');
    const pcqShutterOn = await isPcqShutterOn();
    console.timeEnd('CHECK_ANSWERS isFirstTimeInPCQ isPcqShutterOn');
    
    if (pcqShutterOn || caseData.pcqId) {
      return next();
    }

    const type: PartyType = caseData.respondent1.type;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const defendantEmail = caseData.respondent1.emailAddress?.emailAddress;

    console.time('CHECK_ANSWERS isFirstTimeInPCQ isPcqHealthy');
    const isHealthy = await isPcqHealthy();
    console.timeEnd('CHECK_ANSWERS isFirstTimeInPCQ isPcqHealthy');

    console.time('CHECK_ANSWERS isFirstTimeInPCQ isPcqElegible');
    const isElegible = isPcqElegible(type);
    console.timeEnd('CHECK_ANSWERS isFirstTimeInPCQ isPcqElegible');

    if (isHealthy && isElegible) {
      console.time('CHECK_ANSWERS isFirstTimeInPCQ generatePcqId');
      const pcqId = generatePcqId();
      console.timeEnd('CHECK_ANSWERS isFirstTimeInPCQ generatePcqId');

      console.time('CHECK_ANSWERS isFirstTimeInPCQ savePcqIdClaim');
      await savePcqIdClaim(pcqId, claimId);
      console.timeEnd('CHECK_ANSWERS isFirstTimeInPCQ savePcqIdClaim');
      
      const pcqUrl = generatePcqUrl(
        pcqId,
        ACTOR,
        claimId,
        defendantEmail,
        getRedirectionUrl(req.headers.host, claimId),
        lang,
      );

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
};
