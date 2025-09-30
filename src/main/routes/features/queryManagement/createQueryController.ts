import {NextFunction, Response, Router} from 'express';
import {
  BACK_URL, QM_CYA,
  QUERY_MANAGEMENT_CREATE_QUERY,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {CreateQuery} from 'models/queryManagement/createQuery';
import multer from 'multer';
import {
  getCancelUrl,
  getSummaryList,
  removeSelectedDocument, saveQueryManagement,
  uploadSelectedFile,
} from 'services/features/queryManagement/queryManagementService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const createQueryController = Router();
const viewPath = 'features/queryManagement/createQuery';
const fileSize = Infinity;
const upload = multer({
  limits: {
    fileSize: fileSize,
  },
});

async function renderView(form: GenericForm<CreateQuery>, claim: Claim, claimId: string, res: Response, formattedSummary: SummarySection, req: AppRequest, index?: number): Promise<void> {
  const cancelUrl = getCancelUrl(req.params.id);
  const currentUrl = constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY);
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
  const claim = await getClaimById(claimId, req, true);
  const createQuery = claim.queryManagement?.createQuery || new CreateQuery();
  let form = new GenericForm(createQuery);
  const formattedSummary = summarySection(
    {
      title: '',
      summaryRows: [],
    });

  if (req.session?.fileUpload) {
    const parsedData = JSON.parse(req?.session?.fileUpload);
    form = new GenericForm(createQuery, parsedData);
    req.session.fileUpload = undefined;
  }

  await getSummaryList(formattedSummary, req);
  await renderView(form, claim, claimId, res, formattedSummary, req);
}));

createQueryController.post([QUERY_MANAGEMENT_CREATE_QUERY], upload.single('selectedFile'),(async (req:AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.id;
  const action = req.body.action;
  const claim = await getClaimById(claimId, req, true);
  const currentUrl = constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY);
  const existingQuery = claim.queryManagement?.createQuery;
  let year;
  let month;
  let day;
  if(req.body['isHearingRelated'] === 'yes'){
    year = req.body['year'] ;
    month = req.body['month'];
    day = req.body['day'];
  }
  const createQuery = new CreateQuery(req.body['messageSubject'], req.body['messageDetails'], req.body['isHearingRelated'], year, month, day);
  if (existingQuery) {
    createQuery.uploadedFiles = existingQuery.uploadedFiles;
  }
  const form = new GenericForm(createQuery);

  const formattedSummary = summarySection(
    {
      title: '',
      summaryRows: [],
    });

  form.validateSync();

  if (form.hasErrors()) {
    await getSummaryList(formattedSummary, req);
    return await renderView(form, claim, claimId, res, formattedSummary, req);
  } else {

    if (action === 'uploadButton') {
      await uploadSelectedFile(req, createQuery);
      return res.redirect(`${currentUrl}`);
    }

    if (action?.includes('[deleteFile]')) {
      const index = action.split(/[[\]]/).find((word: string) => word !== '')[0];
      await removeSelectedDocument(req,  Number(index) - 1, createQuery );
      return res.redirect(`${currentUrl}`);
    }

    await saveQueryManagement(claimId, createQuery, 'createQuery', req);
    res.redirect(constructResponseUrlWithIdParams(claimId, QM_CYA));
  }
}));

export default createQueryController;
