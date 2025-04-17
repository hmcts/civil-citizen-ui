import {NextFunction, Response, Router} from 'express';
import {BACK_URL, QM_CYA, QM_FOLLOW_UP_MESSAGE} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {GenericForm} from 'form/models/genericForm';
import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {SendFollowUpQuery} from 'models/queryManagement/sendFollowUpQuery';
import {
  getCancelUrl, saveQueryManagement,
} from 'services/features/queryManagement/queryManagementService';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import multer from 'multer';
import {
  getSummaryList,
  removeSelectedDocument,
  uploadSelectedFile
} from 'services/features/queryManagement/sendFollowUpQueryService';

const viewPath = 'features/queryManagement/sendFollowUpQuery';
const sendFollowUpQueryController = Router();
const upload = multer({
  limits: {
    fileSize: Infinity,
  },
});

async function renderView(form: GenericForm<SendFollowUpQuery>, claim: Claim, claimId: string, res: Response, formattedSummary: SummarySection, req: AppRequest, index?: number): Promise<void> {
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
    const claim = await getClaimById(claimId, req, true);
    const sendFollowQuery = claim.queryManagement?.sendFollowUpQuery || new SendFollowUpQuery();
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
      await removeSelectedDocument(req, Number(index) - 1);
    }
    await getSummaryList(formattedSummary, req);
    await renderView(form, claim, claimId, res, formattedSummary, req);
  } catch (error) {
    next(error);
  }
}))

sendFollowUpQueryController.post(QM_FOLLOW_UP_MESSAGE, upload.single('query-file-upload'), (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const currentUrl = constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_MESSAGE);
    const existingQuery = claim.queryManagement?.sendFollowUpQuery;
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
      await uploadSelectedFile(req, sendFollowUpQuery);
      return res.redirect(`${currentUrl}`);
    }

    form.validateSync();
    if (form.hasErrors()) {
      await getSummaryList(formattedSummary, req);
      return await renderView(form, claim, claimId, res, formattedSummary, req);
    } else {
      await saveQueryManagement(claimId, sendFollowUpQuery, 'sendFollowUpQuery', req);
      res.redirect(constructResponseUrlWithIdParams(claimId, QM_CYA));
    }
  } catch (error) {
    next(error);
  }
}))

export default sendFollowUpQueryController
