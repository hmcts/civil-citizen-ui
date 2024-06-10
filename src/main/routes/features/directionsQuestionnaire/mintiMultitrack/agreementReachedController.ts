import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  DQ_MULTITRACK_AGREEMENT_REACHED_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
} from 'routes/urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getHowToAgreeDisclosureOfElectronicDocumentsContent,
} from 'services/commons/detailContents';
import {HasAnAgreementBeenReached} from 'models/directionsQuestionnaire/mintiMultitrack/hasAnAgreementBeenReached';
import {
  HasAnAgreementBeenReachedOptions,
} from 'models/directionsQuestionnaire/mintiMultitrack/hasAnAgreementBeenReachedOptions';

const agreementReachedController = Router();
const disclosureNonElectronicDocumentsViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/agreement-reached';
const HAS_AN_AGREEMENT_BEEN_REACHED_PAGE = 'PAGES.HAS_AN_AGREEMENT_BEEN_REACHED.';

function renderView(disclosureNonElectronicDocument: GenericForm<HasAnAgreementBeenReached>, res: Response): void {
  const form = disclosureNonElectronicDocument;
  const howToAgreeDisclosureOfElectronicDocumentsContent = getHowToAgreeDisclosureOfElectronicDocumentsContent();

  res.render(disclosureNonElectronicDocumentsViewPath, {
    form,
    howToAgreeDisclosureOfElectronicDocumentsContent,
    hasAnAgreementBeenReachedOptions: HasAnAgreementBeenReachedOptions,
    pageTitle: `${HAS_AN_AGREEMENT_BEEN_REACHED_PAGE}PAGE_TITLE`,
    title: `${HAS_AN_AGREEMENT_BEEN_REACHED_PAGE}TITLE`,
    //TODO ADD THE BACK URL
    backLinkUrl: constructResponseUrlWithIdParams('claimId', 'todo'),
  });
}

agreementReachedController.get(DQ_MULTITRACK_AGREEMENT_REACHED_URL, (async (req, res, next: NextFunction) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const hasAnAgreementBeenReachedForm = directionQuestionnaire.hearing?.hasAnAgreementBeenReached ?
      new HasAnAgreementBeenReached(directionQuestionnaire.hearing.hasAnAgreementBeenReached) : new HasAnAgreementBeenReached();
    renderView(new GenericForm(hasAnAgreementBeenReachedForm) , res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

agreementReachedController.post(DQ_MULTITRACK_AGREEMENT_REACHED_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const hasAnAgreementBeenReachedForm = new GenericForm(new HasAnAgreementBeenReached(req.body.hasAnAgreementBeenReached));
    hasAnAgreementBeenReachedForm.validateSync();
    if (hasAnAgreementBeenReachedForm.hasErrors()) {
      renderView(hasAnAgreementBeenReachedForm, res);
    } else {
      await saveDirectionQuestionnaire(
        generateRedisKey(<AppRequest>req),
        hasAnAgreementBeenReachedForm.model.hasAnAgreementBeenReached,
        'hasAnAgreementBeenReached',
        'hearing');
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default agreementReachedController;
