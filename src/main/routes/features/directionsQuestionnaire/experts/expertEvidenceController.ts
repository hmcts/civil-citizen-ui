import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DQ_DEFENDANT_EXPERT_EVIDENCE_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
  DQ_SENT_EXPERT_REPORTS_URL,
} from 'routes/urls';
import {
  getGenericOption,
  getGenericOptionFormDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const expertEvidenceController = Router();
const expertEvidenceViewPath = 'features/directionsQuestionnaire/experts/expert-evidence';
const dqPropertyName = 'expertEvidence';
const dqParentName = 'experts';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertEvidenceController');

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(expertEvidenceViewPath, {form, pageTitle: 'PAGES.DEFENDANT_EXPERT_EVIDENCE.PAGE_TITLE'});
}

expertEvidenceController.get(DQ_DEFENDANT_EXPERT_EVIDENCE_URL, (async (req, res, next: NextFunction) => {
  try {
    const defendantExpertEvidence = await getGenericOption(generateRedisKey(<AppRequest>req), dqPropertyName, dqParentName);
    renderView(new GenericForm(defendantExpertEvidence), res);
  } catch (error) {
    logger.error(`Error when GET : expert evidence - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

expertEvidenceController.post(DQ_DEFENDANT_EXPERT_EVIDENCE_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const defendantExpertEvidence = new GenericForm(getGenericOptionFormDirectionQuestionnaire(req.body.option, dqPropertyName));
    defendantExpertEvidence.validateSync();

    if (defendantExpertEvidence.hasErrors()) {
      logger.info('Defendant Expert Evidence has error found');
      renderView(defendantExpertEvidence, res);
    } else {
      logger.info('Defendant Expert Evidence has no error found');
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), defendantExpertEvidence.model, dqPropertyName, dqParentName);
      (defendantExpertEvidence.model.option === YesNo.YES) ?
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_SENT_EXPERT_REPORTS_URL)) :
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL));
    }
  } catch (error) {
    logger.error(`Error when POST : expert evidence - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default expertEvidenceController;
