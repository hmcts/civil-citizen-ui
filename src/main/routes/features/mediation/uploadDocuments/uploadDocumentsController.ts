import {
  CANCEL_URL,
  MEDIATION_TYPE_OF_DOCUMENTS,
  MEDIATION_UPLOAD_DOCUMENTS,
  MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  addAnother,
  getUploadDocuments,
  getUploadDocumentsForm,
  removeItem,
  saveUploadDocument,
} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';

import {getYourStatementContent} from 'services/features/mediation/uploadDocuments/yourStatementService';
import {
  MediationTypeOfDocumentSection,
  TypeOfDocumentYourNameSection,
  UploadDocumentsForm,
} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {uploadSingleFileWithValidation} from 'common/utils/fileUploadHelper';
import {
  getDocumentsForDocumentsReferred,
} from 'services/features/mediation/uploadDocuments/documentsForDocumentsReferredService';
import {caseNumberPrettify} from 'common/utils/stringUtils';

const uploadDocumentViewPath = 'features/mediation/uploadDocuments/upload-documents';
const mediationUploadDocumentsController = Router();
const TYPE_OF_DOCUMENTS_PROPERTY_NAME = 'typeOfDocuments';

const multer = require('multer');
const fileSize = Infinity;

const storage = multer.memoryStorage({
  limits: {
    fileSize: fileSize,
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: fileSize,
  },
});

const partyInformation = (claim: Claim) =>  {
  return {
    claimantName: claim.getClaimantFullName(),
    defendantName: claim.getDefendantFullName(),
  };
};

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

async function uploadSingleFile(req: Request, res: Response, claimId: string, submitAction: string, form: GenericForm<UploadDocumentsForm>) {
  await uploadSingleFileWithValidation(
    req,
    submitAction,
    form,
    civilServiceClientForDocRetrieve,
    {
      useDoubleCategoryInErrorPath: false, // Mediation uses ${category}[${index}][fileUpload]
      findFileMethod: 'find', // Mediation uses find()
    },
  );
}

function renderView(form: GenericForm<UploadDocumentsForm>,uploadDocuments:UploadDocuments,res: Response, claimId: string, claim: Claim) {

  const currentUrl = constructResponseUrlWithIdParams(claimId, MEDIATION_UPLOAD_DOCUMENTS);
  if(!form ){
    const typeOfDocuments =  uploadDocuments.typeOfDocuments.find((item) => item.type === TypeOfMediationDocuments.YOUR_STATEMENT)?.uploadDocuments || [];
    const documentsForDocumentsReferred = uploadDocuments.typeOfDocuments.find((item) => item.type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT)?.uploadDocuments || [];
    form = new GenericForm(new UploadDocumentsForm(typeOfDocuments as TypeOfDocumentYourNameSection[], documentsForDocumentsReferred as MediationTypeOfDocumentSection[]));
  }
  const yourStatementContent = getYourStatementContent(uploadDocuments, form);
  const documentsReferredContent = getDocumentsForDocumentsReferred(uploadDocuments, form);
  res.render(uploadDocumentViewPath, {
    form: form,
    currentUrl: currentUrl,
    yourStatementContent: yourStatementContent,
    documentsReferredContent: documentsReferredContent,
    claimId: caseNumberPrettify(claimId),
    pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE',
    subtitle: 'PAGES.UPLOAD_DOCUMENTS.SUBTITLE',
    paragraph: 'PAGES.MEDIATION.START_PAGE.EACH_DOCUMENT_MUST_WITH_SAVE_FILE',
    sectionTitle: 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.SECTION_TITLE',
    partyInformation: partyInformation(claim),
    backLinkUrl: constructResponseUrlWithIdParams(claimId, MEDIATION_TYPE_OF_DOCUMENTS),
    cancelUrl: CANCEL_URL
      .replace(':id', claimId)
      .replace(':propertyName', 'mediationUploadDocuments'),
  });
}

mediationUploadDocumentsController.get(MEDIATION_UPLOAD_DOCUMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const uploadDocuments = getUploadDocuments(claim);
    renderView(undefined, uploadDocuments, res, claimId, claim);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

mediationUploadDocumentsController.post(MEDIATION_UPLOAD_DOCUMENTS,upload.any(), (async (req, res, next) => {// nosonar
  try {
    const claimId = req.params.id;
    const action = req.body.action;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const uploadDocuments = getUploadDocuments(claim);
    const uploadDocumentsForm = getUploadDocumentsForm(req);
    const form = new GenericForm(uploadDocumentsForm);

    if (action === 'add_another-yourStatement') {
      addAnother(uploadDocumentsForm,TypeOfMediationDocuments.YOUR_STATEMENT);
      return renderView(form, uploadDocuments, res, claimId, claim);
    } else if(action === 'add_another-documentsReferred'){
      addAnother(uploadDocumentsForm,TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT);
      return renderView(form, uploadDocuments, res, claimId, claim);
    } else     if (action?.includes('[uploadButton]')) {
      try {
        await uploadSingleFile(req, res, claimId, action, form);
      } catch (error) {
        /* istanbul ignore next */
        // If uploadSingleFile throws an error, catch it and add to form errors instead of redirecting to error page
        const {Logger} = require('@hmcts/nodejs-logging');
        const logger = Logger.getLogger('mediationUploadDocumentsController');
        logger.error(`Error in uploadSingleFile: ${error?.message || error}`, error);
        
        // Ensure form has errors array
        if (!form.errors) {
          form.errors = [];
        }
        
        // Extract category and index from action to create proper error structure
        const [category] = action.split(/[[\]]/).filter((word: string) => word !== '');
        const errorStructure = {
          property: category,
          children: [{
            property: '0',
            children: [{
              property: 'fileUpload',
              constraints: {
                uploadError: 'ERRORS.FILE_UPLOAD_FAILED',
              },
            }],
          }],
        };
        form.errors.push(errorStructure as any);
      }
      return renderView(form, uploadDocuments, res, claimId, claim);
    } else if (action?.includes('[removeButton]')) {
      removeItem(uploadDocumentsForm, action);
      return renderView(form, uploadDocuments, res, claimId, claim);
    }

    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, uploadDocuments, res, claimId, claim);
    } else {
      // set upload documents with new data
      const yourStatement = uploadDocuments.typeOfDocuments.find((item) => item.type === TypeOfMediationDocuments.YOUR_STATEMENT);
      if(yourStatement){
        yourStatement.uploadDocuments = uploadDocumentsForm.documentsForYourStatement;
      }
      const documentsForReferred = uploadDocuments.typeOfDocuments.find((item) => item.type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT);
      if(documentsForReferred){
        documentsForReferred.uploadDocuments = uploadDocumentsForm.documentsForDocumentsReferred;
      }
      await saveUploadDocument(redisKey, uploadDocuments.typeOfDocuments, TYPE_OF_DOCUMENTS_PROPERTY_NAME);
      res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default mediationUploadDocumentsController;
