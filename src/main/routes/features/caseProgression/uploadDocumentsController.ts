import {NextFunction, Request, Response, RequestHandler, Router} from 'express';
import {CP_CHECK_ANSWERS_URL, CP_EVIDENCE_UPLOAD_CANCEL, CP_UPLOAD_DOCUMENTS_URL} from '../../urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {
  getDisclosureContent,
} from 'services/features/caseProgression/disclosureService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {
  getUploadDocumentsForm,
} from 'services/features/caseProgression/caseProgressionService';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {getTrialContent} from 'services/features/caseProgression/trialService';
import {getExpertContent} from 'services/features/caseProgression/expertService';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseDocument} from 'models/document/caseDocument';
import {AppRequest} from 'models/AppRequest';
import config from 'config';

const uploadDocumentsViewPath = 'features/caseProgression/upload-documents';
const uploadDocumentsController = Router();

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

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

async function uploadSingleFile(req: Request, res: Response, claimId: string, submitAction: string, form: GenericForm<UploadDocumentsUserForm>) {
  const [category, index] = submitAction.split(/[[\]]/).filter((word: string) => word !== '');
  const inputFile = req.file as Express.Multer.File;
  if (inputFile){
    const fileUpload = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile(inputFile);
    form.model[category as keyof UploadDocumentsUserForm][+index].fileUpload = fileUpload;
    form.model[category as keyof UploadDocumentsUserForm][+index].caseDocument = undefined;

    form.validateSync();
    const errorFieldNamePrefix = `${category}[${category}][${index}][fileUpload]`;
    if (!form?.errorFor(`${errorFieldNamePrefix}[size]`, `${category}` )
      && !form?.errorFor(`${errorFieldNamePrefix}[mimetype]`, `${category}`)
      && !form?.errorFor(`${errorFieldNamePrefix}`)) {

      const document: CaseDocument = await civilServiceClientForDocRetrieve.uploadDocument(<AppRequest>req, fileUpload);
      form.model[category as keyof UploadDocumentsUserForm][+index].caseDocument = document;
    }
  }
  await renderView(res, claimId, form);
}

async function renderView(res: Response, claimId: string, form: GenericForm<UploadDocumentsUserForm> = null) {
  const claim: Claim = await getCaseDataFromStore(claimId);
  const cancelUrl = constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_CANCEL);
  const isSmallClaims = claim.isSmallClaimsTrackDQ;
  const currentUrl = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);

  if (claim && !claim.isEmpty()) {
    const disclosureContent = getDisclosureContent(claim, form);
    const witnessContent = getWitnessContent(claim, form);
    const expertContent = getExpertContent(claim, form);
    const trialContent = getTrialContent(claim, form, isSmallClaims);
    res.render(uploadDocumentsViewPath, {
      form,
      claim,
      claimId,
      disclosureContent,
      witnessContent,
      expertContent,
      trialContent,
      cancelUrl,
      isSmallClaims,
      currentUrl,
    });
  }
}

uploadDocumentsController.get(CP_UPLOAD_DOCUMENTS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await renderView(res, claimId, null);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadDocumentsController.post(CP_UPLOAD_DOCUMENTS_URL, upload.single('file'), (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const uploadDocumentsForm = getUploadDocumentsForm(req);
    const form = new GenericForm(uploadDocumentsForm);
    const submitAction: string = req.body.buttonPressed;
    form.validateSync();
    if (submitAction?.includes('[uploadButton]')) {
      await uploadSingleFile(req, res, claimId, submitAction, form);
    } else {
      if (form.hasErrors()) {
        await renderView(res, claimId, form);
      } else {
        console.log('Evidence upload form validated');
        //todo: go to next page and save to redis
        res.redirect(constructResponseUrlWithIdParams(claimId, CP_CHECK_ANSWERS_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadDocumentsController;
