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
import {CLAIM_CHECK_ANSWERS_URL} from 'routes/urls';
import {savePcqIdClaim} from 'client/pcq/savePcqIdClaim';
import {AppRequest} from 'models/AppRequest';

const ACTOR = 'respondent';

export const isFirstTimeInPCQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (<AppRequest>req).session?.user?.id;
    const caseData: Claim = await getCaseDataFromStore(userId);
    const pcqShutterOn = await isPcqShutterOn();

    if (pcqShutterOn || caseData.pcqId) {
      return next();
    }
    const type: PartyType = caseData.applicant1.type;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const defendantEmail = caseData.respondent1.emailAddress?.emailAddress;

    const isHealthy = await isPcqHealthy();
    const isEligible = isPcqElegible(type);
    if (isHealthy && isEligible) {
      const pcqId = generatePcqId();
      await savePcqIdClaim(pcqId, claimId);

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
  const path = constructResponseUrlWithIdParams(claimId, CLAIM_CHECK_ANSWERS_URL);
  return `${host}${path}`;
};
