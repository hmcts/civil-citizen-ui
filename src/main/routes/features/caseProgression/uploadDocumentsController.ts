import {NextFunction, Request, Response, RequestHandler, Router} from 'express';
import {CP_EVIDENCE_UPLOAD_CANCEL, CP_UPLOAD_DOCUMENTS_URL, CP_UPLOAD_FILE} from '../../urls';
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
import {TypeOfDocumentSectionMapper} from "services/features/caseProgression/TypeOfDocumentSectionMapper";
import {CaseDocument} from "models/document/caseDocument";
import {Document} from "models/document/document";
import {
  DocumentType,
  EvidenceUploadDisclosure,
  EvidenceUploadTrial,
  EvidenceUploadWitness
} from "models/document/documentType";
const multer = require('multer');

const uploadDocumentsViewPath = 'features/caseProgression/upload-documents';
const uploadDocumentsController = Router();
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

async function renderView(res: Response, claimId: string, form: GenericForm<UploadDocumentsUserForm> = null) {
  const claim: Claim = await getCaseDataFromStore(claimId);
  const cancelUrl = constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_CANCEL);

  if (claim && !claim.isEmpty()) {
    const disclosureContent = getDisclosureContent(claim, form);
    const witnessContent = getWitnessContent(claimId, claim);
    const expertContent: string = undefined; //TODO = getExpertContent(claim, claimId);
    const trialContent = getTrialContent(claim, form);
    res.render(uploadDocumentsViewPath, {
      form,
      claim,
      claimId,
      disclosureContent,
      witnessContent,
      expertContent,
      trialContent,
      cancelUrl,
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

uploadDocumentsController.post(CP_UPLOAD_DOCUMENTS_URL, upload.any(), (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const uploadDocumentsForm = getUploadDocumentsForm(req);
    const form = new GenericForm(uploadDocumentsForm);
    form.validateSync();
    if (form.hasErrors()) {
      //await renderView(res, claimId, form);
      res.status(400).json({ errors: form.getNestedErrors().filter((item) => {
        return !(item.target instanceof Array);
      }),
      });

    } else {
      //todo: save to redis
      //todo: next page (cancel page or continue page)
      await renderView(res, claimId, form);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadDocumentsController.post(CP_UPLOAD_FILE, upload.any(), (async (req, res, next) => {
  try {
    //const claimId = req.params.id;
    const uploadDocumentsForm = TypeOfDocumentSectionMapper.mapToSingleFile(req);
    const form = new GenericForm(uploadDocumentsForm);
    form.validateSync();
    if (form.hasErrors()) {
      //await renderView(res, claimId, form);
      res.status(400).json({ errors: form.errors,
      });

    } else {
      //todo: save to redis
      //todo: next page (cancel page or continue page)
      //await renderView(res, claimId, form);
      const document = {
        createdBy: 'test',
        documentLink: { document_url: 'test',
          document_filename: 'test',
          document_binary_url: 'test'},
        documentName: 'test',
        documentType: EvidenceUploadWitness,
        documentSize: '123',
        createdDatetime: Date.now(),
      };
      res.status(400).json({ document: document,
      });
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadDocumentsController;
