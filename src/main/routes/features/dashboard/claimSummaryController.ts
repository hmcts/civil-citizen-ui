import * as express from 'express';
import {Claim} from '../../../common/models/claim';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {CLAIMANT_SUMMARY_URL} from '../../urls';
import {getClaimantName, getDefendantName} from '../../../common/utils/getNameByType';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimSummaryController');

claimSummaryController.get(CLAIMANT_SUMMARY_URL, async (req, res) => {
  try {
    const claim: Claim = await getCaseDataFromStore((req.params.id));
    const claimantName = getClaimantName(claim);
    const defendantName = getDefendantName(claim);
    res.render(claimSummaryViewPath, { claim, claimId: req.params.id, claimantName, defendantName });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});

export default claimSummaryController;
