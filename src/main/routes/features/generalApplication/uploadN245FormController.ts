import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_UPLOAD_N245_FORM_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {FileOnlySection, UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {Claim} from 'models/claim';
import multer from 'multer'
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { TypeOfDocumentSectionMapper } from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import { UploadN245Form } from 'common/models/generalApplication/uploadN245form';
import { summarySection } from 'common/models/summaryList/summarySections';
import { summaryRow } from 'common/models/summaryList/summaryList';
// import {getUploadDocumentsForm} from 'services/features/caseProgression/caseProgressionService';

const uploadN245FormController = Router();
const viewPath = 'features/generalApplication/upload-n245-form';
const cancelUrl = 'test'; // TODO: add url
const backLinkUrl = 'test'; // TODO: add url
//const gaN245Form = 'gaN245Form';
//const fileUpload = 'fileUpload';

const fileSize = Infinity;

// const storage = multer().memoryStorage({
//   limits: {
//     fileSize: fileSize,
//   },
// });

const upload = multer({
  limits: {
    fileSize: fileSize,
  },
});
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);
uploadN245FormController.get(GA_UPLOAD_N245_FORM_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const contentList = getUploadFormContent(lng);

    const form = new GenericForm(claim.generalApplication?.uploadN245Form);
    const currentUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL);
    res.render(viewPath, {
      currentUrl,
      form,
      claim,
      claimId,
      cancelUrl,
      backLinkUrl,
      contentList,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadN245FormController.post(GA_UPLOAD_N245_FORM_URL, upload.single('selectedFile'), (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req)
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const currentUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL);
    const uploadedN245Form = new UploadN245Form();
    if (req.body.action === 'uploadButton') {
      const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
      uploadedN245Form.fileUpload = fileUpload;
      uploadedN245Form.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, fileUpload);
      const form = new GenericForm(uploadedN245Form);
      const contentList = getUploadFormContent(lng);
      const formattedSummary = summarySection(
        {
          title: '',
          summaryRows: [
            summaryRow(uploadedN245Form.caseDocument.documentName, '', constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL), 'Remove document'),
          ],
        });
      console.log(formattedSummary)

      return res.render(viewPath, {
        currentUrl,
        formattedSummary,
        form,
        claim,
        claimId,
        cancelUrl,
        backLinkUrl,
        contentList,
      });
    }
    // const redisKey = generateRedisKey(<AppRequest>req);
    // console.log(req.body);
    // // console.log(req.body.gaN245Form);
    // const gaN245FormFile = getUploadDocumentsForm(req);
    // const gaN245FormFile = bindRequestToFileOnlySectionObj(req);
    // const gaN245FormFile = getFormSection<FileOnlySection>(req.body.gaN245Form, bindRequestToFileOnlySectionObj);
    //  console.log('gaN245FormFile ', gaN245FormFile);
    // const contentList = getUploadFormContent(lng);

    //  const form = new GenericForm(gaN245FormFile);
    //  await form.validate();
    // if (form.hasErrors()) {
    //   res.render(viewPath, {
    //     currentUrl,
    //     form,
    //     claim,
    //     claimId,
    //     cancelUrl,
    //     backLinkUrl,
    //     contentList,
    //   });
    // } 
    else {
      // await saveRequestingReason(redisKey, requestingReason);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const getUploadFormContent = (lng: string, section: FileOnlySection = null, index = 0, form: GenericForm<UploadDocumentsUserForm> = null) => {
  // const errorFieldNamePrefix = `${gaN245Form}[${gaN245Form}][${index}]`;
  return new UploadDocumentsSectionBuilder()
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.UPLOAD_HERE')
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.OFFER_OF_PAYMENT')
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.INCOME_AND_EXPENSE')
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.WAYS_TO_COMPLETE')
    .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
            <li>${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.FILL_ONLINE', {lng})}</li>
            <li>${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.PRINT_THE_FORM', {lng})}</li>
          </ul>`)
    .addParagraph('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.SAVE_THE_FORM')
    .addRawHtml(`<ul class="govuk-list govuk-list--bullet">
            <li>${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.NAME_THE_FORM', {lng})}</li>
            <li>${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.FILE_SIZE', {lng})}</li>
            <li>${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.FILE_FORMAT', {lng})}</li>
          </ul>`)
    //.addUploadArray('PAGES.UPLOAD_DOCUMENTS.UPLOAD', '', gaN245Form, fileUpload, index,section?.fileUpload?.fieldname, form?.errorFor(`${errorFieldNamePrefix}[${fileUpload}]`, gaN245Form), section?.caseDocument)
    .build();
};

export default uploadN245FormController;
