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
import {generateRedisKeyForFile} from 'modules/draft-store/draftStoreService';
// import {queryParamNumber} from 'common/utils/requestUtils';
// import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';

const createQueryController = Router();
const viewPath = 'features/queryManagement/createQuery';
const fileSize = Infinity;
const upload = multer({
  limits: {
    fileSize: fileSize,
  },
});

async function renderView(form: GenericForm<CreateQuery>, claim: string, claimId: string, res: Response, formattedSummary: SummarySection, req: AppRequest): Promise<void> {
  const cancelUrl = CANCEL_URL;
  const currentUrl = QUERY_MANAGEMENT_CREATE_QUERY + '?index=0';
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
  heading: 'Enter message details',
  caption: 'Send a message',
  pageTitle: 'Enter message details',
};

createQueryController.get(QUERY_MANAGEMENT_CREATE_QUERY, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = 'req.params.id;';
  const claim = 'await getClaimById(claimId, req);';
  const createQuery = new CreateQuery();
  const redisKey = await generateRedisKeyForFile(req);
  let form = new GenericForm(createQuery);
  const formattedSummary = summarySection(
    {
      title: '',
      summaryRows: [],
    });
  if (req?.session?.fileUpload) {
    const parsedData = JSON.parse(req?.session?.fileUpload);
    form = new GenericForm(createQuery, parsedData);
    req.session.fileUpload = undefined;
  }
  if (req.query?.id) {
    const index = req.query.id;
    await removeSelectedDocument(redisKey, Number(index)-1);
  }
  await getSummaryList(formattedSummary, redisKey, claimId);
  //delete from redis here also after saving the formatted summary to form
  await renderView(form, claim, claimId, res, formattedSummary, req);
}));

createQueryController.post(QUERY_MANAGEMENT_CREATE_QUERY, upload.single('query-file-upload'),(async (req:AppRequest, res: Response, next: NextFunction) => {
  const claimId = 'req.params.id;';
  const claim = 'await getClaimById(claimId, req);';
  // const index = queryParamNumber(req, 'index');
  // const currentUrl = constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY), index);
  const currentUrl = QUERY_MANAGEMENT_CREATE_QUERY + '?index=0';

  const formattedSummary = summarySection(
    {
      title: '',
      summaryRows: [],
    });

  if (req.body.action === 'uploadButton') {
    await uploadSelectedFile(req, formattedSummary, claimId);
    return res.redirect(`${currentUrl}`);
  }
  const createQuery = new CreateQuery();
  const form = new GenericForm(createQuery);
  form.validateSync();
  if (form.hasErrors()) {
    return await renderView(form, claim, claimId, res, formattedSummary, req);
  } else {
    res.redirect('/');
  }
}));

export default createQueryController;
