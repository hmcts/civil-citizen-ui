import {NextFunction, Response, Router} from 'express';
import {
  BACK_URL, CANCEL_URL,
  QUERY_MANAGEMENT_CREATE_QUERY,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {CreateQuery} from 'models/queryManagement/createQuery';
import multer from 'multer';
import {
  getSummaryList,
  removeSelectedDocument,
  uploadSelectedFile,
} from 'services/features/queryManagement/queryManagementService';
import {queryParamNumber} from 'common/utils/requestUtils';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';

const createQueryController = Router();
const viewPath = 'features/queryManagement/createQuery';
const fileSize = Infinity;
const upload = multer({
  limits: {
    fileSize: fileSize,
  },
});

async function renderView(form: GenericForm<CreateQuery>, claimId: string, res: Response, formattedSummary: SummarySection, req: AppRequest, index: number): Promise<void> {
  const cancelUrl = CANCEL_URL;
  const currentUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY), index);
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
  caption: 'PAGES.QM.HEADINGS.CAPTION',
  pageTitle: 'PAGES.QM.HEADINGS.PAGE_TITLE',
};

createQueryController.get(QUERY_MANAGEMENT_CREATE_QUERY, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.id;
  const index  = queryParamNumber(req, 'index');
  let createQuery = new CreateQuery();
  const formattedSummary = summarySection(
    {
      title: '',
      summaryRows: [],
    });
  if (req?.session?.fileUpload) {
    const parsedData = JSON.parse(req?.session?.fileUpload);
    createQuery = parsedData as unknown as CreateQuery;
  }
  if (req.query?.id) {
    const index = req.query.id;
    await removeSelectedDocument(req, Number(index)-1, createQuery);
  }
  const form = new GenericForm(createQuery);
  getSummaryList(formattedSummary, req, claimId);
  await renderView(form, claimId, res, formattedSummary, req, index);
}));

createQueryController.post(QUERY_MANAGEMENT_CREATE_QUERY, upload.single('query-file-upload'),(async (req:AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.id;
  const index = queryParamNumber(req, 'index');
  const currentUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY), index);
  const createQuery = new CreateQuery(req.body['query-subject-field'], req.body['query-message-field'], req.body['is-query-hearing-related'], req.body['query-file-upload']);
  const form = new GenericForm(createQuery);

  const formattedSummary = summarySection(
    {
      title: '',
      summaryRows: [],
    });

  if (req.body.action === 'uploadButton') {
    const fileForm = await uploadSelectedFile(req, formattedSummary, claimId, createQuery);
    if (fileForm.hasErrors()) {
      const errorForm = new GenericForm(createQuery, fileForm.errors);
      return await renderView(errorForm, claimId, res, formattedSummary, req, index);
    }
    return res.redirect(`${currentUrl}`);
  }

  form.validateSync();
  if (form.hasErrors()) {
    return await renderView(form, claimId, res, formattedSummary, req, index);
  } else {
    req.session.fileUpload = undefined;
    //TODO: update to the CYA page in ticket CIV 16722
    res.redirect('/');
  }
}));

export default createQueryController;
