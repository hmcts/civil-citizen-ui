import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  AGREED_TO_MORE_TIME_URL,
  APPLICATION_TYPE_URL,
  GA_DEBT_PAYMENT_EVIDENCE_URL, REQUEST_MORE_TIME_URL, RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {debtPaymentOptions} from 'routes/features/generalApplication/certOfSorc/debtPaymentOptions';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from "form/models/genericForm";
import {DebtPaymentEvidence} from "routes/features/generalApplication/certOfSorc/debtPaymentEvidence";
import {ResponseOptions} from "form/models/responseDeadline";

const debtPaymentEvidenceController = Router();
const debtPaymentEvidenceViewPath = 'features/certOfSorc/debt-payment-evidence';

function renderView(form: GenericForm<DebtPaymentEvidence>, res: Response, cancelUrl: string, backLinkUrl: string, nextPageUrl: string): void {
  res.render(debtPaymentEvidenceViewPath,
    {
      form,
      DebtPaymentOptions: debtPaymentOptions,
      pageTitle: 'PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_HAVE_EVIDENCE',
      cancelUrl, backLinkUrl, nextPageUrl
    }
  );
}

debtPaymentEvidenceController.get(GA_DEBT_PAYMENT_EVIDENCE_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, APPLICATION_TYPE_URL);
    const nextPageUrl = 'test';

    renderView(new GenericForm(new DebtPaymentEvidence()), res, cancelUrl, backLinkUrl, nextPageUrl);


  } catch (error) {
    next(error);
  }
}) as RequestHandler);

debtPaymentEvidenceController.post(GA_DEBT_PAYMENT_EVIDENCE_URL,
  (async (req: Request, res: Response, next: NextFunction) => {
    console.log('comes here')
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, APPLICATION_TYPE_URL);
    const nextPageUrl = 'test';
    console.log('comes her2e')
    const form = new GenericForm(new DebtPaymentEvidence(req.body.debtPaymentEvidenceOptions, req.body.provideDetails));

    form.validateSync();
    console.log('comes h3ere')

    console.log(form);

    if (form.hasErrors()) {
      renderView(form, res, cancelUrl, backLinkUrl, nextPageUrl);
    }

    // switch (form.model.evidence) {
    //   case debtPaymentOptions.UPLOAD_EVIDENCE:
    //     nextPageUrl = constructResponseUrlWithIdParams(claimId, AGREED_TO_MORE_TIME_URL);
    //     break;
    //   case 'no':
    //     responseOption = ResponseOptions.NO;
    //     redirectUrl = constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL);
    //     break;
    //   case 'request-refused':
    //     responseOption = ResponseOptions.REQUEST_REFUSED;
    //     redirectUrl = constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL);
    //     break;
    //   case 'yes':
    //     responseOption = ResponseOptions.YES;
    //     redirectUrl = constructResponseUrlWithIdParams(claimId, REQUEST_MORE_TIME_URL);
    //     break;
    //   default:
    //     responseOption = undefined;
    // }
    // res.redirect(constructResponseUrlWithIdParams(caseId, CLAIMANT_DOB_URL));


    console.log('comes h4ere')
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default debtPaymentEvidenceController;
