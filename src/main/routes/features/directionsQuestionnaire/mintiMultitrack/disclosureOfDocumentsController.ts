import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DQ_DISCLOSURE_OF_DOCUMENTS_URL, DQ_MULTITRACK_AGREEMENT_REACHED_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
  DQ_REQUEST_EXTRA_4WEEKS_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveDirectionQuestionnaire} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {
  DisclosureOfDocuments,
  TypeOfDisclosureDocument,
} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';
import {
  getWhatIsDifferenceDisclosureDocumentsContent,
  getWhatIsDisclosureDetailContent,
} from 'services/commons/detailContents';
import {convertToArrayOfStrings} from 'common/utils/stringUtils';
import {Claim} from 'models/claim';

const disclosureOfDocumentsController = Router();
const disclosureOfDocumentsViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/disclosure-of-documents';
const dqPropertyName = 'disclosureOfDocuments';
const dqParentName = 'hearing';
const DISCLOSURE_OF_DOCUMENTS_PAGE = 'PAGES.DISCLOSURE_OF_DOCUMENTS.';

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
};

function renderView(disclosureOfDocuments: DisclosureOfDocuments, claimId: string, res: Response): void {
  const form = disclosureOfDocuments;
  const whatIsDisclosureDetailsContent = getWhatIsDisclosureDetailContent();
  const whatIsDifferenceContent = getWhatIsDifferenceDisclosureDocumentsContent();
  res.render(disclosureOfDocumentsViewPath, {form,
    whatIsDisclosureDetailsContent,
    whatIsDifferenceContent,
    typeOfDisclosureDocument : TypeOfDisclosureDocument,
    pageTitle: `${DISCLOSURE_OF_DOCUMENTS_PAGE}PAGE_TITLE`,
    backLinkUrl: constructResponseUrlWithIdParams(claimId, DQ_REQUEST_EXTRA_4WEEKS_URL),
  });
}

disclosureOfDocumentsController.get(DQ_DISCLOSURE_OF_DOCUMENTS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const disclosureOfDocuments = getDisclosureOfDocuments(claim);
    renderView(disclosureOfDocuments, claimId, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

disclosureOfDocumentsController.post(DQ_DISCLOSURE_OF_DOCUMENTS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const disclosureOfDocuments = new DisclosureOfDocuments(convertToArrayOfStrings(req.body.documentsTypeForm));
    await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), disclosureOfDocuments, dqPropertyName, dqParentName);

    if (!disclosureOfDocuments.documentsTypeChosen){
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL));
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_AGREEMENT_REACHED_URL));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default disclosureOfDocumentsController;
