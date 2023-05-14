import {NextFunction, RequestHandler, Response, Router} from 'express';
import {TYPES_OF_DOCUMENTS_URL, UPLOAD_YOUR_DOCUMENTS_URL} from '../../urls';
import {AppRequest} from 'common/models/AppRequest';

import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {
  DocumentType,
  TypeOfDocument,
  TypeOfDocumentItem,
  TypeOfDocumentUpload,} from 'models/caseProgression/typeOfDocumentUpload';
const typeOfDocumentsViewPath = 'features/caseProgression/typeOfDocuments';
const typeOfDocumentsController = Router();
const dqPropertyName = 'defendantUploadDocuments';

async function renderView(res: Response, claimId: string, form: GenericForm<TypeOfDocumentUpload>) {
  const claim = await getCaseDataFromStore(claimId);
  const claimantFullName = claim.getClaimantFullName();
  const defendantFullName = claim.getDefendantFullName();
  res.render(typeOfDocumentsViewPath, {form,
    claimId,claimantFullName,defendantFullName,
  });
}

function createDisclosureItem() {
  const disclosureTypeOfDocumentItems: TypeOfDocumentItem[] = [];
  disclosureTypeOfDocumentItems.push(new TypeOfDocumentItem(
    'documentDisclosure',
    'Documents for disclosure',
    'Recorded information that you must show the other parties-for example,contracts,invoices,receipts,emails,text messages,photos,social media messages',
    false));
  disclosureTypeOfDocumentItems.push(new TypeOfDocumentItem(
    'documentDisclosure',
    'Documents for disclosure',
    'Recorded information that you must show the other parties-for example,contracts,invoices,receipts,emails,text messages,photos,social media messages',
    false));

  return new TypeOfDocument(DocumentType.DISCLOSURE, disclosureTypeOfDocumentItems);
}
function createTrialItem() {
  const disclosureTypeOfDocumentItems: TypeOfDocumentItem[] = [];
  disclosureTypeOfDocumentItems.push(new TypeOfDocumentItem(
    'documentDisclosure',
    'Documents for disclosure',
    'Recorded information that you must show the other parties-for example,contracts,invoices,receipts,emails,text messages,photos,social media messages',
    false));
  disclosureTypeOfDocumentItems.push(new TypeOfDocumentItem(
    'documentDisclosure',
    'Documents for disclosure',
    'Recorded information that you must show the other parties-for example,contracts,invoices,receipts,emails,text messages,photos,social media messages',
    false));

  return new TypeOfDocument(DocumentType.TRIAL_DOCUMENTS, disclosureTypeOfDocumentItems);
}

function createTypeOfDocumentUpload() {
  const typeOfDocuments: TypeOfDocument[] = [];
  typeOfDocuments.push(createDisclosureItem());
  typeOfDocuments.push(createTrialItem());

  const typeOfDocumentUpload = new TypeOfDocumentUpload(
    'caseReference',
    'claimantandDefendanteName',
    typeOfDocuments);
  return typeOfDocumentUpload;
}
const typeOfDocumentUpload = createTypeOfDocumentUpload();

typeOfDocumentsController.get(TYPES_OF_DOCUMENTS_URL,
  (async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const form = new GenericForm(typeOfDocumentUpload);
      await renderView(res, claimId,form);
    } catch (error) {
      next(error);
    }
  })as RequestHandler);


typeOfDocumentsController.post(TYPES_OF_DOCUMENTS_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const values = Object.values(req.body);
    //const typeDocumentList= getTypeDocumentForm(req);
    for (const bodyItem of values) {
      typeOfDocumentUpload.typeOfDocument.forEach(typeOfDocument => {
        typeOfDocument.typeOfDocumentItem.find(typeOfDocumentItem => {
          if (typeOfDocumentItem.value === bodyItem){
            typeOfDocumentItem.checked = true;
          }
        });
      });
    }
    const form = new GenericForm(typeOfDocumentUpload);
    form.validateSync();
    if (form.hasErrors()) {
      //await renderView(res, claimId,form);
    } else {
      await saveCaseProgression(claimId, form.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, UPLOAD_YOUR_DOCUMENTS_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default typeOfDocumentsController;
