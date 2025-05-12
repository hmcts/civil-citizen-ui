import {NextFunction, Response, Router} from 'express';
import {BACK_URL, QM_CYA, QM_FOLLOW_UP_MESSAGE} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';
import {
  getCancelUrl, getQueryManagement, getSummaryList, removeSelectedDocument, saveQueryManagement, uploadSelectedFile,
} from 'services/features/queryManagement/queryManagementService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import multer from 'multer';

const viewPath = 'features/queryManagement/sendFollowUpQuery';
const sendFollowUpQueryController = Router();
const upload = multer({
  limits: {
    fileSize: Infinity,
  },
});
let parentId: string;

async function renderView(form: GenericForm<SendFollowUpQuery>, claimId: string, res: Response, formattedSummary: SummarySection, req: AppRequest, index?: number): Promise<void> {
  const cancelUrl = getCancelUrl(req.params.id);
  const currentUrl = constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_MESSAGE);
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
    const claimId = req.params.id;
    parentId = req.params.queryId;
    const queryManagement = await getQueryManagement(claimId, req);
    const sendFollowQuery = queryManagement?.sendFollowUpQuery || new SendFollowUpQuery();
    const currentUrl = QM_FOLLOW_UP_MESSAGE.replace(':id', claimId).replace(':queryId', parentId);
    let form = new GenericForm(sendFollowQuery);
    const formattedSummary = summarySection(
      {
        title: '',
        summaryRows: [],
      });
    if (req.session?.fileUpload) {
      const parsedData = JSON.parse(req?.session?.fileUpload);
      form = new GenericForm(sendFollowQuery, parsedData);
      req.session.fileUpload = undefined;
    }

    if (req.query?.id) {
      const index = req.query.id;
      await removeSelectedDocument(req, Number(index) - 1, true);
      return res.redirect(currentUrl);
    }

    await getSummaryList(formattedSummary, req,  true);
    await renderView(form, claimId, res, formattedSummary, req);
  } catch (error) {
    next(error);
  }
}));

sendFollowUpQueryController.post(QM_FOLLOW_UP_MESSAGE, upload.single('query-file-upload'), (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const queryManagement = await getQueryManagement(claimId, req);
    const currentUrl = QM_FOLLOW_UP_MESSAGE.replace(':id', claimId).replace(':queryId', parentId);
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

    if (req.body.action === 'uploadButton') {
      await uploadSelectedFile(req, sendFollowUpQuery, true);
      return res.redirect(`${currentUrl}`);
    }

    form.validateSync();
    if (form.hasErrors()) {
      await getSummaryList(formattedSummary, req, true);
      return await renderView(form, claimId, res, formattedSummary, req);
    } else {
      sendFollowUpQuery.parentId = parentId;
      await saveQueryManagement(claimId, sendFollowUpQuery, 'sendFollowUpQuery', req);
      req.session.isFollowUpQuery = true;
      return res.redirect(constructResponseUrlWithIdParams(claimId, QM_CYA));
    }
  } catch (error) {
    next(error);
  }
}));

export default sendFollowUpQueryController;
