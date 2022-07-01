import * as express from 'express';
import {
  getLatestUpdateContent,
  getDocumentsContent,
} from '../../../../main/services/features/dashboard/claimSummaryService';
import {Claim} from '../../../common/models/claim';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';
import {DEFENDANT_SUMMARY_URL} from '../../urls';
import {AppRequest} from '../../../common/models/AppRequest';
import config from 'config';

const claimSummaryViewPath = 'features/dashboard/claim-summary';
const claimSummaryController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimSummaryController');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
claimSummaryController.get([DEFENDANT_SUMMARY_URL], async (req, res) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const token: string = await civilServiceClient.getSubmitDefendantResponseEventToken(req.params.id, <AppRequest>req);
    console.log(token);
    const claim: Claim =  await civilServiceClient.retrieveClaimDetails(req.params.id, <AppRequest>req);
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
