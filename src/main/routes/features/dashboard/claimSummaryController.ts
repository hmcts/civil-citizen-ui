import { Claim } from 'common/models/claim';
import * as express from 'express';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CLAIMANT_SUMMARY_URL} from '../../urls';
// import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
// import {Claim} from '../../../common/models/claim';
// import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
// import {CounterpartyType} from '../../../common/models/counterpartyType';

const claimSummaryViewPath = 'features/dashboard/test';
const claimSummaryController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimSummaryController');

claimSummaryController.get(CLAIMANT_SUMMARY_URL, async (req, res) => {
  try {
    const claim: Claim = await getCaseDataFromStore((req.params.id));
    res.render(claimSummaryViewPath, {claim, claimId: req.params.id});
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});

export default claimSummaryController;
