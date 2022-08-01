import * as express from 'express';
import config from 'config';
import {getLatestUpdateContent} from '../../../services/features/dashboard/claimSummary/latestUpdateService';
import {getDocumentsContent} from '../../../services/features/dashboard/claimSummaryService';
import {AppRequest} from '../../../common/models/AppRequest';
import {DEFENDANT_SUMMARY_URL} from '../../urls';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimSummaryController');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimSummaryController.get([DEFENDANT_SUMMARY_URL], async (req, res) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (!claim.isEmpty()) {
      const latestUpdateContent = getLatestUpdateContent(claimId, claim, lang);
      const documentsContent = getDocumentsContent(claim, claimId, lang);
      res.render(claimSummaryViewPath, {claim, claimId, latestUpdateContent, documentsContent});
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default claimSummaryController;
