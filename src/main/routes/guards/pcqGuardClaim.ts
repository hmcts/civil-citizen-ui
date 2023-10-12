import {
  generatePcqUrl,
  isPcqElegible,
  isPcqHealthy,
} from 'client/pcq/pcqClient';
import {isPcqShutterOn} from '../../app/auth/launchdarkly/launchDarklyClient';
import {generatePcqId} from 'client/pcq/generatePcqId';
import {Claim} from 'common/models/claim';
import {PartyType} from 'common/models/partyType';
import {NextFunction, Response} from 'express';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CLAIM_CHECK_ANSWERS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {savePcqIdClaim} from 'client/pcq/savePcqIdClaim';
import {getClaimantIdamDetails} from 'services/translation/response/claimantIdamDetails';

const ACTOR = 'applicant';

export const isFirstTimeInPCQ = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = (<AppRequest>req).session?.user?.id;
    const caseData: Claim = await getCaseDataFromStore(userId);
    const pcqShutterOn = await isPcqShutterOn();

    if (pcqShutterOn || caseData.pcqId) {
      return next();
    }
    const type: PartyType = caseData.applicant1.type;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const userDetails =  getClaimantIdamDetails(req.session?.user);
    const claimantEmail = userDetails.email;

    const isHealthy = await isPcqHealthy();
    const isEligible = isPcqElegible(type);

    if (isHealthy && isEligible) {
      const pcqId = generatePcqId();
      await savePcqIdClaim(pcqId, userId);

      const pcqUrl = generatePcqUrl(
        pcqId,
        ACTOR,
        claimantEmail,
        getRedirectionUrl(req.headers.host),
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

const getRedirectionUrl = (host: string): string => {
  const path = CLAIM_CHECK_ANSWERS_URL;
  return `${host}${path}`;
};
