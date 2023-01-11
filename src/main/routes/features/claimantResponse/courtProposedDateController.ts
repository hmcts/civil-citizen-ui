import {NextFunction, Request, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'common/form/models/genericForm';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  CourtProposedDate,
  CourtProposedDateOptions,
} from 'common/form/models/claimantResponse/courtProposedDate';
import {
  CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL,
  CLAIMANT_RESPONSE_REJECTION_REASON_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {
  saveClaimantResponse,
} from 'services/features/claimantResponse/claimantResponseService';
import {
  getPaymentDate,
} from 'common/utils/repaymentUtils';

const courtProposedDateViewPath = 'features/claimantResponse/court-proposed-date';
const courtProposedDateController = Router();
const crPropertyName = 'decision';
const crParentName = 'courtProposedDate';

function renderView(form: GenericForm<CourtProposedDate>, paymentDate: any, res: Response): void {
  res.render(courtProposedDateViewPath, { form, paymentDate });
}

courtProposedDateController.get(CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getCaseDataFromStore(claimId);
    const paymentDate = formatDateToFullDate(new Date(getPaymentDate(claim)), getLng(lang));

    renderView(new GenericForm(new CourtProposedDate(claim.claimantResponse?.courtProposedDate?.decision)), paymentDate, res);
  } catch (error) {
    next(error);
  }
});

courtProposedDateController.post(CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL, async (req: Request, res: Response, next) => {
  try {
    const claimId = req.params.id;
    const courtProposedDate = new GenericForm(new CourtProposedDate(req.body.decision));
    courtProposedDate.validateSync();
    if (courtProposedDate.hasErrors()) {
      renderView(courtProposedDate, {}, res);
    } else {
      await saveClaimantResponse(claimId, courtProposedDate.model.decision, crPropertyName, crParentName);
      if (courtProposedDate.model.decision === CourtProposedDateOptions.JUDGE_REPAYMENT_DATE) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REJECTION_REASON_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default courtProposedDateController;
