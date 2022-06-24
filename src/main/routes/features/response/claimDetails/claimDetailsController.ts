import * as express from 'express';
import config from 'config';
import {
  CLAIM_DETAILS_URL,
  CASE_DOCUMENT_DOWNLOAD_URL,
} from '../../../urls';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {Claim} from '../../../../common/models/claim';
import {AppRequest} from 'models/AppRequest';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {getInterestDetails} from '../../../../common/utils/interestUtils';
import {getTotalAmountWithInterestAndFees} from '../../../../modules/claimDetailsService';
import {DocumentUri} from '../../../../common/models/document/documentType';

const claimDetailsController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('claimDetailsController');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

// -- GET Claim Details
claimDetailsController.get(CLAIM_DETAILS_URL, async (req: express.Request, res: express.Response) => {
  try {
    let claim: Claim = await getCaseDataFromStore((req.params.id));
    if (claim.isEmpty()) {
      claim = await civilServiceClient.retrieveClaimDetails(req.params.id, <AppRequest>req);
      if (claim) {
        await saveDraftClaim(req.params.id, claim);
      } else {
        //Temporarily return a mock claim
        claim = new Claim();
        claim.legacyCaseReference = 'testCaseReference';
        claim.totalClaimAmount = 200;
        claim.detailsOfClaim = 'detailsOfClaimTest';
        claim.totalInterest = 15;
        claim.claimFee = {calculatedAmountInPence: '3500'};
      }
    }
    const interestData = getInterestDetails(claim);
    const totalAmount = getTotalAmountWithInterestAndFees(claim);
    const sealedClaimPdfUrl = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', req.params.id).replace(':documentType', DocumentUri.SEALED_CLAIM);
    res.render('features/response/claimDetails/claim-details', {
      claim, totalAmount, interestData, sealedClaimPdfUrl,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default claimDetailsController;
