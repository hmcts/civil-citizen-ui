import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
} from '../../urls';
import {
  getStatementOfTruth,
} from 'services/features/response/checkAnswers/checkAnswersService';
import {GenericForm} from 'form/models/genericForm';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {Claim} from 'models/claim';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {generateSummaryLists, checkYourAnswersList} from 'services/features/claimantResponse/checkAnswersService';

const checkAnswersViewPath = 'features/response/check-answers';
const claimantResponseCheckAnswersController = Router();

function renderView(req: Request, res: Response, form: GenericForm<StatementOfTruthForm> | GenericForm<QualifiedStatementOfTruth>, claim: Claim) {
  const summarySections = generateSummaryLists(claim, checkYourAnswersList, req.params.id);
  res.render(checkAnswersViewPath, {
    form,
    summarySections,
  });
}

claimantResponseCheckAnswersController.get(CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
  // AllResponseTasksCompletedGuard.apply(RESPONSE_INCOMPLETE_SUBMISSION_URL),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      const form = new GenericForm(getStatementOfTruth(claim));
      renderView(req, res, form, claim);
    } catch (error) {
      next(error);
    }
  });

export default claimantResponseCheckAnswersController;