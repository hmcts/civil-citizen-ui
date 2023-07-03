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
    console.log('PCQ Guard');
    
    const caseData: Claim = await getCaseDataFromStore(req.params.id);
    const pcqShutterOn = await isPcqShutterOn();

    console.log('PCQ caseData.pcqId', caseData.pcqId);
    console.log('PCQ pcqShutterOn', pcqShutterOn);

    if (pcqShutterOn || caseData.pcqId) {
      return next();
    }

    const type: PartyType = caseData.respondent1.type;
    console.log('PCQ type', type);

    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const defendantEmail = caseData.respondent1.emailAddress.emailAddress;

    const isHealthy = await isPcqHealthy();
    console.log('PCQ isHealthy', isHealthy);

    const isElegible = isPcqElegible(type);
    console.log('PCQ isElegible', isElegible);

    if (isHealthy && isElegible) {
      const pcqId = generatePcqId();
      console.log('PCQ pcqId', pcqId);

      await savePcqIdClaim(pcqId, claimId);
      console.log('PCQ savePcqIdClaim...');
      
      const pcqUrl = generatePcqUrl(
        pcqId,
        ACTOR,
        claimId,
        defendantEmail,
        getRedirectionUrl(req.headers.host, claimId),
        lang,
      );
      console.log('PCQ pcqUrl', pcqUrl);

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
