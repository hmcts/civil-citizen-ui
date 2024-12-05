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
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {RESPONSE_CHECK_ANSWERS_URL} from 'routes/urls';
import {savePcqId} from 'client/pcq/savePcqIdClaim';
import {AppRequest} from 'common/models/AppRequest';

const ACTOR = 'respondent';

export const isFirstTimeInPCQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const caseData: Claim = await getCaseDataFromStore(redisKey);
    const pcqShutterOn = await isPcqShutterOn();

    console.log('PCQShutter : ', pcqShutterOn);
    console.log('pcqId:', caseData.pcqId);
    if (pcqShutterOn || caseData.pcqId) {
      console.log('I am going ahead');
      return next();
    }

    const type: PartyType = caseData.respondent1.type;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const defendantEmail = caseData.respondent1.emailAddress?.emailAddress;

    const isHealthy = await isPcqHealthy();
    const isElegible = isPcqElegible(type);

    if (isHealthy && isElegible) {
      console.log('I am generating new pcq id ');
      const pcqId = generatePcqId();
      await savePcqId(pcqId,req, claimId);

      const pcqUrl = generatePcqUrl(
        pcqId,
        ACTOR,
        defendantEmail,
        getRedirectionUrl(req.headers.host, claimId),
        lang,
        claimId,
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
