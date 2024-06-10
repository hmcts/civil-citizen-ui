import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DQ_DEFENDANT_EXPERT_EVIDENCE_URL, DQ_DISCLOSURE_OF_DOCUMENTS_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveDirectionQuestionnaire,} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {
  DisclosureOfDocuments,
  TypeOfDisclosureDocument
} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';
import {
  getWhatIsDifferenceDisclosureDocumentsContent,
  getWhatIsDisclosureDetailContent
} from "services/commons/detailContents";
import {convertToArrayOfStrings} from "common/utils/stringUtils";
import {
  DisclosureOfDocumentsForm,
  DisclosureOfDocumentsTypeForm
} from "models/directionsQuestionnaire/hearing/disclosureOfDocumentsForm";
import {Claim} from "models/claim";
import {getDocumentOptionChecked} from "services/features/directionsQuestionnaire/hearing/disclosureOfDocumentsService";

const disclosureOfDocumentsController = Router();
const disclosureOfDocumentsViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/disclosure-of-documents';
const dqPropertyName = 'disclosureOfDocuments';
const dqParentName = 'hearing';
const DISCLOSURE_OF_DOCUMENTS_PAGE = 'PAGES.DISCLOSURE_OF_DOCUMENTS.';

const createDisclosureOfDocumentsForm = (electronicChecked: boolean, nonElectronicChecked: boolean) => {
  const disclosureOfDocumentsForm = new DisclosureOfDocumentsForm(`${DISCLOSURE_OF_DOCUMENTS_PAGE}CHECKBOX_TITLE`);
  disclosureOfDocumentsForm.documentsTypeForm.push(new DisclosureOfDocumentsTypeForm(1,TypeOfDisclosureDocument.ELECTRONIC.toString(),`${DISCLOSURE_OF_DOCUMENTS_PAGE}ELECTRONIC_DOCS_OPTION`, electronicChecked, TypeOfDisclosureDocument.ELECTRONIC));
  disclosureOfDocumentsForm.documentsTypeForm.push(new DisclosureOfDocumentsTypeForm(2,TypeOfDisclosureDocument.NON_ELECTRONIC.toString(),`${DISCLOSURE_OF_DOCUMENTS_PAGE}NON_ELECTRONIC_DOCS_OPTION`, nonElectronicChecked, TypeOfDisclosureDocument.NON_ELECTRONIC));
  return disclosureOfDocumentsForm;
};

const getDisclosureOfDocuments = (claim: Claim): DisclosureOfDocuments => {
  let dq;
  if (claim.isClaimant()) {
    dq = claim.claimantResponse.directionQuestionnaire;
  } else {
    dq = claim.directionQuestionnaire;
  }
  if (dq && dq.hearing && dq.hearing.disclosureOfDocuments) {
    return new DisclosureOfDocuments(dq.hearing.disclosureOfDocuments.documentsTypeChosen);
  } else {
    return new DisclosureOfDocuments([]);
  }
}

function renderView(disclosureOfDocuments: GenericForm<DisclosureOfDocumentsForm>, res: Response): void {
  const form = disclosureOfDocuments;
  const whatIsDisclosureDetailsContent = getWhatIsDisclosureDetailContent();
  const whatIsDifferenceContent = getWhatIsDifferenceDisclosureDocumentsContent();
  res.render(disclosureOfDocumentsViewPath, {form,
    whatIsDisclosureDetailsContent,
    whatIsDifferenceContent,
    pageTitle: `${DISCLOSURE_OF_DOCUMENTS_PAGE}PAGE_TITLE`,
    backLinkUrl: constructResponseUrlWithIdParams('claimId', 'todo')
  });
}

disclosureOfDocumentsController.get(DQ_DISCLOSURE_OF_DOCUMENTS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey)
    const disclosureOfDocuments = getDisclosureOfDocuments(claim);
    let disclosureOfDocumentsForm =
      createDisclosureOfDocumentsForm(false, false);
    let form = new GenericForm(disclosureOfDocumentsForm);
    if (disclosureOfDocuments.documentsTypeChosen.length !== 0) {
      let electronicChecked = getDocumentOptionChecked(disclosureOfDocuments, TypeOfDisclosureDocument.ELECTRONIC);
      let nonElectronicChecked = getDocumentOptionChecked(disclosureOfDocuments, TypeOfDisclosureDocument.NON_ELECTRONIC);
      const disclosureForm = createDisclosureOfDocumentsForm(electronicChecked, nonElectronicChecked);
      form = new GenericForm(disclosureForm);
    }
    renderView(form, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

disclosureOfDocumentsController.post(DQ_DISCLOSURE_OF_DOCUMENTS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const disclosureOfDocumentsForm = createDisclosureOfDocumentsForm(false, false);
    const mapFormToOptions = disclosureOfDocumentsForm.mapFromStringsToDisclosureOfDocumentsForm(convertToArrayOfStrings(req.body.documentsTypeForm))
    const dd = new DisclosureOfDocuments([]);
    const disclosureOfDocuments = dd.mapDisclosureOfDocumentsFormToDisclosureOfDocuments(mapFormToOptions);
    await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), disclosureOfDocuments, dqPropertyName, dqParentName);
    res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_EVIDENCE_URL));

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default disclosureOfDocumentsController;
