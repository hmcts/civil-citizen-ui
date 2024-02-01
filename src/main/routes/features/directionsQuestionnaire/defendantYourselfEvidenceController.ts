import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DQ_DEFENDANT_WITNESSES_URL, DQ_GIVE_EVIDENCE_YOURSELF_URL, DQ_CONFIRM_YOUR_DETAILS_URL} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {
  getGenericOption,
  getGenericOptionForm,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {YesNo} from 'form/models/yesNo';

const defendantYourselfEvidenceController = Router();
const defendantYourselfEvidenceViewPath = 'features/directionsQuestionnaire/defendant-yourself-evidence';
const dqPropertyName = 'defendantYourselfEvidence';

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(defendantYourselfEvidenceViewPath, {form});
}

defendantYourselfEvidenceController.get(DQ_GIVE_EVIDENCE_YOURSELF_URL, (async (req, res, next: NextFunction) => {
  try {
    const defendantYourselfEvidence = await getGenericOption(generateRedisKey(<AppRequest>req), dqPropertyName);
    renderView(new GenericForm(defendantYourselfEvidence), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

defendantYourselfEvidenceController.post(DQ_GIVE_EVIDENCE_YOURSELF_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const partyType: PartyType = claim.respondent1?.type;
    const claimId = req.params.id;

    const defendantYourselfEvidence = new GenericForm(getGenericOptionForm(req.body.option, dqPropertyName));
    defendantYourselfEvidence.validateSync();

    const saveDQAndRedirect = async (redirectUrl: string) => {
      await saveDirectionQuestionnaire(redisKey, defendantYourselfEvidence.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
    };

    if (defendantYourselfEvidence.hasErrors()) {
      renderView(defendantYourselfEvidence, res);
    } else if (defendantYourselfEvidence.model.option === YesNo.YES) {
      const redirectUrl = partyType === PartyType.INDIVIDUAL ? DQ_DEFENDANT_WITNESSES_URL : DQ_CONFIRM_YOUR_DETAILS_URL;
      await saveDQAndRedirect(redirectUrl);
    } else {
      await saveDQAndRedirect(DQ_DEFENDANT_WITNESSES_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default defendantYourselfEvidenceController;
