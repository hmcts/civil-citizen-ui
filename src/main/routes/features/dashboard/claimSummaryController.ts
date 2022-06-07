import * as express from 'express';
import {
  getLatestUpdateContent,
  getDocumentsContent,
} from '../../../../main/services/features/dashboard/claimSummaryService';
import {Claim} from '../../../common/models/claim';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {CLAIMANT_SUMMARY_URL} from '../../urls';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimSummaryController');

claimSummaryController.get([CLAIMANT_SUMMARY_URL], async (req, res) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getCaseDataFromStore((req.params.id));
    const claimantName = claim.getClaimantName();
    const defendantName = claim.getDefendantName();
    const latestUpdateContent = getLatestUpdateContent(lang);
    const documentsContent = getDocumentsContent(lang);
    res.render(claimSummaryViewPath, { claim, claimId: req.params.id, claimantName, defendantName, latestUpdateContent, documentsContent });
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});

export default claimSummaryController;
