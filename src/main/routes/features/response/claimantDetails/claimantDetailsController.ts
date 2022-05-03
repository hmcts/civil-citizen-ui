import * as express from 'express';
import {CLAIM_DETAILS_URL, CLAIMANT_DETAILS_URL, FINANCIAL_DETAILS_URL} from '../../../urls';
import {Claim} from '../../../../common/models/claim';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import * as winston from 'winston';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {getAddress} from '../../../../modules/claimantDetails/claimantDetailsService';
import {CorrespondenceAddress} from '../../../../common/models/correspondenceAddress';

const claimantDetailsViewPath = 'features/response/claimantDetails/claimant-details';
const claimantDetailsController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
let logger: winston.Logger = Logger.getLogger('claimantDetailsController');


export function setClaimantDetailsControllerLogger(winstonLogger: winston.Logger) {
  logger = winstonLogger;
}

function renderView(res: express.Response, claim: Claim, address: CorrespondenceAddress, claimantDetailsUrl: string, claimDetailsUrl: string, financialDetailsUrl: string): void {
  res.render(claimantDetailsViewPath, {
    claim: claim,
    claimantDetailsUrl: claimantDetailsUrl,
    claimDetailsUrl: claimDetailsUrl,
    backUrl: financialDetailsUrl,
    address: address,
  });
}


claimantDetailsController
  .get(
    CLAIMANT_DETAILS_URL, async (req: express.Request, res: express.Response) => {
      try {
        const claim: Claim = await getCaseDataFromStore(req.params.id);
        const correspondentAddress = getAddress(claim);
        const claimantDetailsUrl = constructResponseUrlWithIdParams(req.params.id, CLAIMANT_DETAILS_URL);
        const claimDetailsUrl = constructResponseUrlWithIdParams(req.params.id, CLAIM_DETAILS_URL);
        const financialDetailsUrl = constructResponseUrlWithIdParams(req.params.id, FINANCIAL_DETAILS_URL);
        renderView(res, claim, correspondentAddress, claimantDetailsUrl, claimDetailsUrl, financialDetailsUrl);
      } catch (error) {
        logger.error(error);
        res.status(500).send({error: error.message});
      }
    });


export default claimantDetailsController;
