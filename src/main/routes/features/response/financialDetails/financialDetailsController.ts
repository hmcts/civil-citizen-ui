import {NextFunction, Request, Response, Router} from 'express';
import {
  CITIZEN_BANK_ACCOUNT_URL,
  CITIZEN_CONTACT_THEM_URL,
  FINANCIAL_DETAILS_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {PartyType} from 'models/partyType';
import {LoggerInstance as winLogger} from 'winston';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {statementOfMeansGuard} from 'routes/guards/statementOfMeansGuard';

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
    FINANCIAL_DETAILS_URL,
    statementOfMeansGuard,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const claim: Claim = await getCaseDataFromStore(req.params.id);
        const claimantDetailsUrl = constructResponseUrlWithIdParams(req.params.id, CITIZEN_CONTACT_THEM_URL);
        renderView(res, claim, claimantDetailsUrl);
      } catch (error) {
        next(error);
      }
    })
  .post(FINANCIAL_DETAILS_URL,
    statementOfMeansGuard,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const claimantDetailsUrl = constructResponseUrlWithIdParams(req.params.id, CITIZEN_CONTACT_THEM_URL);
        const claim: Claim = await getCaseDataFromStore(req.params.id);
        const partyType: PartyType = claim.respondent1?.type;
        if (partyType) {
          if (partyType == PartyType.INDIVIDUAL || partyType == PartyType.SOLE_TRADER) {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_BANK_ACCOUNT_URL));
          } else if (partyType == PartyType.COMPANY || partyType == PartyType.ORGANISATION) {
            claim.taskSharedFinancialDetails = true;
            await saveDraftClaim(req.params.id, claim);
            res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
          }
        } else {
          logger.error('No partyType found.');
          renderView(res, claim, claimantDetailsUrl);
        }
      } catch (error) {
        next(error);
      }
    });

export default financialDetailsController;
