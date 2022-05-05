import * as express from 'express';
import {CITIZEN_CONTACT_THEM_URL, CLAIM_DETAILS_URL, FINANCIAL_DETAILS_URL} from '../../urls';
import {Claim} from '../../../common/models/claim';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import * as winston from 'winston';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {getAddress} from '../../../modules/contactThem/contactThemService';
import {CorrespondenceAddress} from '../../../common/models/correspondenceAddress';

const citizenContactThemViewPath = 'features/dashboard/contact-them';
const contactThemController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
let logger: winston.Logger = Logger.getLogger('contactThemController');


export function setClaimantDetailsControllerLogger(winstonLogger: winston.Logger) {
  logger = winstonLogger;
}

function renderView(res: express.Response, claim: Claim, address: CorrespondenceAddress, claimantDetailsUrl: string, claimDetailsUrl: string, financialDetailsUrl: string): void {
  res.render(citizenContactThemViewPath, {
    claim: claim,
    claimantDetailsUrl: claimantDetailsUrl,
    claimDetailsUrl: claimDetailsUrl,
    backUrl: financialDetailsUrl,
    address: address,
  });
}


contactThemController
  .get(
    CITIZEN_CONTACT_THEM_URL, async (req: express.Request, res: express.Response) => {
      try {
        const claim: Claim = await getCaseDataFromStore(req.params.id);
        const correspondentAddress = getAddress(claim);
        const claimantDetailsUrl = constructResponseUrlWithIdParams(req.params.id, CITIZEN_CONTACT_THEM_URL);
        const claimDetailsUrl = constructResponseUrlWithIdParams(req.params.id, CLAIM_DETAILS_URL);
        const financialDetailsUrl = constructResponseUrlWithIdParams(req.params.id, FINANCIAL_DETAILS_URL);
        renderView(res, claim, correspondentAddress, claimantDetailsUrl, claimDetailsUrl, financialDetailsUrl);
      } catch (error) {
        logger.error(error);
        res.status(500).send({error: error.message});
      }
    });


export default contactThemController;
