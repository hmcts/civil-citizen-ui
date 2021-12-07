import * as express from 'express';

import { AbstractPaymentDatePage } from 'shared/components/payment-intention/payment-date';
import { AbstractModelAccessor } from 'shared/components/model-accessor';
import { PaymentIntention } from 'shared/components/payment-intention/model/paymentIntention';

import { ResponseDraft } from 'response/draft/responseDraft';

import { Paths, partialAdmissionPath } from 'response/paths';

class ModelAccessor extends AbstractModelAccessor<ResponseDraft, PaymentIntention> {
  get(draft: ResponseDraft): PaymentIntention {
    return draft.partialAdmission.paymentIntention;
  }

  set(draft: ResponseDraft, model: PaymentIntention): void {
    draft.partialAdmission.paymentIntention = model;
  }
}

class PaymentDatePage extends AbstractPaymentDatePage<ResponseDraft> {
  getHeading(): string {
    return 'What date will you pay on?';
  }

  createModelAccessor(): AbstractModelAccessor<ResponseDraft, PaymentIntention> {
    return new ModelAccessor();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildPostSubmissionUri(req: express.Request, res: express.Response): string {
    const { externalId } = req.params;
    return Paths.taskListPage.evaluateUri({ externalId });
  }
}

/* tslint:disable:no-default-export */
export default new PaymentDatePage()
  .buildRouter(partialAdmissionPath);
