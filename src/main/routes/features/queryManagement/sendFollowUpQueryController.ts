import {NextFunction, Response, Router} from 'express';
import {BACK_URL, QM_FOLLOW_UP_CYA, QM_FOLLOW_UP_MESSAGE} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';
import {
  deleteQueryManagement,
  getCancelUrl, getQueryManagement, getSummaryList, removeSelectedDocument, saveQueryManagement, uploadSelectedFile,
} from 'services/features/queryManagement/queryManagementService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import { createMulterErrorMiddlewareForSingleField, getFileUploadErrorsForSource, FILE_UPLOAD_SOURCE } from 'common/utils/fileUploadUtils';
import {getRouteParam} from 'common/utils/routeParamUtils';
import { handleMulterError } from 'services/features/generalApplication/uploadEvidenceDocumentService';

const viewPath = 'features/queryManagement/sendFollowUpQuery';
const sendFollowUpQueryController = Router();
const multerMiddleware = createMulterErrorMiddlewareForSingleField('selectedFile', 'sendFollowUpQueryController');

async function renderView(form: GenericForm<SendFollowUpQuery>, claimId: string, res: Response, formattedSummary: SummarySection, req: AppRequest, index?: number): Promise<void> {
  const queryId = getRouteParam(req, 'queryId');
  const cancelUrl = getCancelUrl(claimId);
  const currentUrl = constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_MESSAGE).replace(':queryId', queryId);
  const backLinkUrl = BACK_URL;
  res.render(viewPath, {
    form,
    formattedSummary,
    cancelUrl,
    backLinkUrl,
    pageHeaders,
    currentUrl,
  });
}

const pageHeaders = {
  heading: 'PAGES.QM.HEADINGS.HEADING',
  caption: 'PAGES.QM.HEADINGS.FOLLOW_UP_CAPTION',
  pageTitle: 'PAGES.QM.HEADINGS.PAGE_TITLE',
};

sendFollowUpQueryController.get(QM_FOLLOW_UP_MESSAGE, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const linkFrom = req.query.linkFrom;
    if (linkFrom === 'start') {
      const redisKey = generateRedisKey(req);
      await deleteQueryManagement(redisKey, req);
    }
    const queryManagement = await getQueryManagement(claimId, req);
    const sendFollowQuery = queryManagement?.sendFollowUpQuery || new SendFollowUpQuery();
    let form = new GenericForm(sendFollowQuery);
    const formattedSummary = summarySection(
      {
        title: '',
        summaryRows: [],
      });
    const fileUploadErrors = getFileUploadErrorsForSource(req, FILE_UPLOAD_SOURCE.QM_SEND_FOLLOW_UP);
    if (fileUploadErrors?.length) {
      form = new GenericForm(sendFollowQuery, fileUploadErrors);
    }

    await getSummaryList(formattedSummary, req,  true);
    await renderView(form, claimId, res, formattedSummary, req);
  } catch (error) {
    next(error);
  }
}));

sendFollowUpQueryController.post(QM_FOLLOW_UP_MESSAGE, multerMiddleware, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const queryId = getRouteParam(req, 'queryId');
    const action = req.body.action;
    const queryManagement = await getQueryManagement(claimId, req);
    const currentUrl = QM_FOLLOW_UP_MESSAGE.replace(':id', claimId).replace(':queryId', queryId);
    const existingQuery = queryManagement?.sendFollowUpQuery;
    const sendFollowUpQuery = new SendFollowUpQuery(req.body['messageDetails']);
    if (existingQuery) {
      sendFollowUpQuery.uploadedFiles = existingQuery.uploadedFiles;
    }
    const form = new GenericForm(sendFollowUpQuery);

    const formattedSummary = summarySection(
      {
        title: '',
        summaryRows: [],
      });

    if (handleMulterError(req, FILE_UPLOAD_SOURCE.QM_SEND_FOLLOW_UP)) {
      return req.session.save(() => {
        res.redirect(`${currentUrl}`);
      });
    }

    if (action === 'uploadButton') {
      await uploadSelectedFile(req, sendFollowUpQuery, true);

      const fileUploadErrors = getFileUploadErrorsForSource(req, FILE_UPLOAD_SOURCE.QM_SEND_FOLLOW_UP);
      if (fileUploadErrors?.length) {
        const formWithErrors = new GenericForm(sendFollowUpQuery, fileUploadErrors);
        await getSummaryList(formattedSummary, req, true);
        return await renderView(formWithErrors, claimId, res, formattedSummary, req);
      }

      return res.redirect(`${currentUrl}`);
    }

    if (action?.includes('[deleteFile]')) {
      const index = action.split(/[[\]]/).find((word: string) => word !== '')[0];
      await removeSelectedDocument(req,  Number(index) - 1, sendFollowUpQuery, true);
      return res.redirect(`${currentUrl}`);
    }

    form.validateSync();

    if (form.hasErrors()) {
      await getSummaryList(formattedSummary, req, true);
      return await renderView(form, claimId, res, formattedSummary, req);
    }

    sendFollowUpQuery.parentId = queryId;
    await saveQueryManagement(claimId, sendFollowUpQuery, 'sendFollowUpQuery', req);
    return res.redirect(constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_CYA).replace(':queryId', queryId));
  } catch (error) {
    next(error);
  }
}));

export default sendFollowUpQueryController;
