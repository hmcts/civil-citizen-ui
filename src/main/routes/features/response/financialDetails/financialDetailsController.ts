import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  CITIZEN_BANK_ACCOUNT_URL,
  CITIZEN_CONTACT_THEM_URL,
  FINANCIAL_DETAILS_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {PartyType} from 'models/partyType';
import {LoggerInstance as winLogger} from 'winston';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';

const financialDetailsViewPath = 'features/response/financialDetails/financial-details';
const financialDetailsController = Router();
const {Logger} = require('@hmcts/nodejs-logging');
let logger: winLogger = Logger.getLogger('financialDetailsController');

export function setFinancialDetailsControllerLogger(winstonLogger: winLogger) {
  logger = winstonLogger;
}

function renderView(res: Response, claim: Claim, claimantDetailsUrl: string): void {
  res.render(financialDetailsViewPath, {claim, claimantDetailsUrl});
}

financialDetailsController
  .get(
    FINANCIAL_DETAILS_URL, (async (req: Request, res: Response, next: NextFunction) => {
      try {
        const claim: Claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
        const claimantDetailsUrl = constructResponseUrlWithIdParams(req.params.id, CITIZEN_CONTACT_THEM_URL);
        renderView(res, claim, claimantDetailsUrl);
      } catch (error) {
        next(error);
      }
    }) as RequestHandler)
  .post(FINANCIAL_DETAILS_URL, (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claimantDetailsUrl = constructResponseUrlWithIdParams(req.params.id, CITIZEN_CONTACT_THEM_URL);
      const claim: Claim = await getCaseDataFromStore(redisKey);
      const partyType: PartyType = claim.respondent1?.type;
      if (partyType) {
        if (partyType == PartyType.INDIVIDUAL || partyType == PartyType.SOLE_TRADER) {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_BANK_ACCOUNT_URL));
        } else if (partyType == PartyType.COMPANY || partyType == PartyType.ORGANISATION) {
          claim.taskSharedFinancialDetails = true;
          await saveDraftClaim(redisKey, claim);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
        }
      } else {
        logger.error('No partyType found.');
        renderView(res, claim, claimantDetailsUrl);
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default financialDetailsController;
