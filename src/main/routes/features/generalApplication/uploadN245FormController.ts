import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_UPLOAD_N245_FORM_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import { UploadDocumentsSectionBuilder } from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {Claim} from 'models/claim';
import multer from 'multer'
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { TypeOfDocumentSectionMapper } from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import { UploadGAFiles } from 'common/models/generalApplication/uploadN245form';
import { saveN245Form } from 'services/features/generalApplication/generalApplicationService';
import { formN245Url } from 'common/utils/externalURLs';


const uploadN245FormController = Router();
const viewPath = 'features/generalApplication/upload-n245-form';
const cancelUrl = 'test'; // TODO: add url
const backLinkUrl = 'test'; // TODO: add url

const fileSize = Infinity;


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
    const claimId =
      req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const contentList = getUploadFormContent(lng);
    const redisKey = generateRedisKey(<AppRequest>req);
    const uploadedN245Details = claim.generalApplication?.uploadN245Form || new UploadGAFiles();
    let documentName = uploadedN245Details.caseDocument?.documentName
    const form = new GenericForm(uploadedN245Details);
    if (req.query?.action === 'REMOVE_DOC') {
      saveN245Form(redisKey, claim, undefined)
      documentName = undefined;
    }
    const currentUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL);
    res.render(viewPath, {
      currentUrl,
      form,
      documentName,
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
    const currentUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_N245_FORM_URL);
    const redisKey = generateRedisKey(<AppRequest>req)
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const contentList = getUploadFormContent(lng);
    let form: GenericForm<UploadGAFiles>
    if (req.body.action === 'uploadButton') {
      const uploadedN245Details = new UploadGAFiles();
      const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
      uploadedN245Details.fileUpload = fileUpload;
      form = new GenericForm(uploadedN245Details);
      form.validateSync();
      if (!form.hasFieldError('fileUpload')) {
        uploadedN245Details.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, fileUpload);
        saveN245Form(redisKey, claim, uploadedN245Details)
      }

      const documentName = uploadedN245Details.caseDocument?.documentName
      return res.render(viewPath, {
        currentUrl,
        documentName,
        form,
        claimId,
        cancelUrl,
        backLinkUrl,
        contentList,
      });
    }

    const uploadedN245Details = claim.generalApplication?.uploadN245Form || new UploadGAFiles();
    form = new GenericForm(uploadedN245Details);
    form.validateSync();
    if (form.hasFieldError('fileUpload')) {
    // const documentName = uploadedN245Details.caseDocument?.documentName
      return res.render(viewPath, {
        currentUrl,
        //documentName,
        form,
        claim,
        claimId,
        cancelUrl,
        backLinkUrl,
        contentList,
      });
    }
    else {
      // await saveRequestingReason(redisKey, requestingReason);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

const getUploadFormContent = (lng: string) => {
  let uploadItHere = t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.UPLOAD_HERE', { lng })
  const linkForN245Form = `<a href="${formN245Url}" target="_blank">${t('PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.COMPLETE_N245_FORM', { lng })}</a>` 
  return new UploadDocumentsSectionBuilder()
    .addRawHtml(`<p class="govuk-body ">${uploadItHere.replace('LINK_FOR_N245_FORM', linkForN245Form)}</p>`)
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
    .build();
};

export default uploadN245FormController;
