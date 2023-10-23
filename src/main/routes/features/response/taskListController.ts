import {Router} from 'express';
import {
  CLAIM_DETAILS_URL,
  CASE_DOCUMENT_DOWNLOAD_URL,
  RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {getDescription, getTaskLists, getTitle} from 'services/features/common/taskListService';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {setResponseDeadline} from 'services/features/common/responseDeadlineAgreedService';
import {DocumentUri, DocumentType} from 'common/models/document/documentType';

const taskListViewPath = 'features/response/task-list';
const taskListController = Router();

taskListController.get(RESPONSE_TASK_LIST_URL, async (req: AppRequest, res, next) => {
  try {
    const currentClaimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const caseData: Claim = await getClaimById(currentClaimId, req, true);
    await setResponseDeadline(caseData, req);
    const taskLists = getTaskLists(caseData, currentClaimId, lang);

    req.session.claimId = currentClaimId;

    const title = getTitle(taskLists, lang);
    const description = getDescription(taskLists, lang);
    const claimDetailsUrl = constructResponseUrlWithIdParams(currentClaimId, CLAIM_DETAILS_URL);
    const responseDetailsUrl = caseData.getDocumentDetails(DocumentType.DEFENDANT_DEFENCE) ? CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', currentClaimId).replace(':documentType', DocumentUri.DEFENDANT_DEFENCE) : undefined;
    const responseDeadline = caseData.formattedResponseDeadline(lang);
    res.render(taskListViewPath, {taskLists, title, description, claim: caseData, claimDetailsUrl, responseDetailsUrl, responseDeadline});
  } catch (error) {
    next(error);
  }
});

export default taskListController;

