import {MEDIATION_UPLOAD_DOCUMENTS, MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {NextFunction, Request, Response, RequestHandler, Router} from 'express';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  addAnother,
  getUploadDocuments,
  getUploadDocumentsForm, removeItem,
  saveUploadDocument,
} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';

import {getYourStatementContent} from 'services/features/mediation/uploadDocuments/yourStatementService';
import {
  TypeOfDocumentYourNameSection,
  UploadDocumentsForm
} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {CaseDocument} from 'models/document/caseDocument';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  getDocumentsForDocumentsReferred,
} from 'services/features/mediation/uploadDocuments/documentsForDocumentsReferredService';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {TypeOfDocumentSection} from "models/caseProgression/uploadDocumentsUserForm";

const uploadDocumentViewPath = 'features/mediation/uploadDocuments/upload-documents';
const mediationUploadDocumentsController = Router();
const TYPE_OF_DOCUMENTS_PROPERTY_NAME = 'typeOfDocuments';
//const MEDIATION_UPLOAD_DOCUMENT_PAGE = 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.';

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
  const [category, index] = submitAction.split(/[[\]]/).filter((word: string) => word !== '');
  const target = `${category}[${index}][fileUpload]`;
  const inputFile = (req.files as Express.Multer.File[]).filter(file =>
    file.fieldname === target,
  );
  if (inputFile[0]){
    const fileUpload = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile(inputFile[0] as Express.Multer.File);
    form.model[category as keyof UploadDocumentsForm][+index].fileUpload = fileUpload;
    form.model[category as keyof UploadDocumentsForm][+index].caseDocument = undefined;

    form.validateSync();
    const errorFieldNamePrefix = `${category}[${category}][${index}][fileUpload]`;
    if (!form?.errorFor(`${errorFieldNamePrefix}[size]`, `${category}` )
        && !form?.errorFor(`${errorFieldNamePrefix}[mimetype]`, `${category}`)
        && !form?.errorFor(`${errorFieldNamePrefix}`)) {

      const document: CaseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, fileUpload);
      form.model[category as keyof UploadDocumentsForm][+index].caseDocument = document;
    }
  }
}

function renderView(form: GenericForm<UploadDocumentsForm>,uploadDocuments:UploadDocuments,res: Response, claimId: string, claim: Claim) {

  const currentUrl = constructResponseUrlWithIdParams(claimId, MEDIATION_UPLOAD_DOCUMENTS);
  if(!form ){
    const typeOfDocuments =  uploadDocuments.typeOfDocuments.find((item) => item.type === TypeOfMediationDocuments.YOUR_STATEMENT)?.uploadDocuments || [];
    const documentsForDocumentsReferred = uploadDocuments.typeOfDocuments.find((item) => item.type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT)?.uploadDocuments || [];
    form = new GenericForm(new UploadDocumentsForm(typeOfDocuments as TypeOfDocumentYourNameSection[], documentsForDocumentsReferred as TypeOfDocumentSection[]));
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
    paragraph: 'PAGES.MEDIATION.START_PAGE.EACH_DOCUMENT_MUST',
    sectionTitle: 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.SECTION_TITLE',
    partyInformation: partyInformation(claim)});
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
    } else if (action?.includes('[uploadButton]')) {
      await uploadSingleFile(req, res, claimId, action, form);
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
