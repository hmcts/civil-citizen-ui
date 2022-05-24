import * as express from 'express';
import {
  CITIZEN_BANK_ACCOUNT_URL,
  CITIZEN_CONTACT_THEM_URL,
  CLAIM_TASK_LIST_URL,
  FINANCIAL_DETAILS_URL,
} from '../../../urls';
import {Claim} from '../../../../common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {CounterpartyType} from '../../../../common/models/counterpartyType';
import * as winston from 'winston';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';

const financialDetailsViewPath = 'features/response/financialDetails/financial-details';
const financialDetailsController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
let logger: winston.Logger = Logger.getLogger('financialDetailsController');


export function setFinancialDetailsControllerLogger(winstonLogger: winston.Logger) {
  logger = winstonLogger;
}

function renderView(res: express.Response, claim: Claim, claimantDetailsUrl: string): void {
  res.render(financialDetailsViewPath, {claim: claim, claimantDetailsUrl: claimantDetailsUrl});
}


financialDetailsController
  .get(
    FINANCIAL_DETAILS_URL, async (req: express.Request, res: express.Response) => {
      try {
        const claim: Claim = await getCaseDataFromStore(req.params.id);
        const claimantDetailsUrl = constructResponseUrlWithIdParams(req.params.id, CITIZEN_CONTACT_THEM_URL);
        renderView(res, claim, claimantDetailsUrl);
      } catch (error) {
        logger.error(error);
        res.status(500).send({error: error.message});
      }
    })
  .post(FINANCIAL_DETAILS_URL, async (req: express.Request, res: express.Response) => {
    try {
      const claimantDetailsUrl = constructResponseUrlWithIdParams(req.params.id, CITIZEN_CONTACT_THEM_URL);
      const claim: Claim = await getCaseDataFromStore(req.params.id);
      const counterpartyType: CounterpartyType = claim.respondent1?.type;
      if (counterpartyType) {
        if (counterpartyType == CounterpartyType.INDIVIDUAL || counterpartyType == CounterpartyType.SOLE_TRADER) {
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_BANK_ACCOUNT_URL));
        } else if (counterpartyType == CounterpartyType.COMPANY || counterpartyType == CounterpartyType.ORGANISATION) {
          claim.taskSharedFinancialDetails = true;
          await saveDraftClaim(req.params.id, claim);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
        }
      } else {
        logger.error('No counterpartyType found.');
        renderView(res, claim, claimantDetailsUrl);
      }
    } catch (error) {
      logger.error(error);
      res.status(500).send({error: error.message});
    }
  });

export default financialDetailsController;
