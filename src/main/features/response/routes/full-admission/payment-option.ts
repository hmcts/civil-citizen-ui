import * as express from 'express';

import { AbstractPaymentOptionPage } from 'shared/components/payment-intention/payment-option';
import { AbstractModelAccessor } from 'shared/components/model-accessor';
import { PaymentIntention } from 'shared/components/payment-intention/model/paymentIntention';

import { ResponseDraft } from 'response/draft/responseDraft';
import { PaymentOption, PaymentType } from 'shared/components/payment-intention/model/paymentOption';

import { Paths, fullAdmissionPath } from 'response/paths';

class ModelAccessor extends AbstractModelAccessor<ResponseDraft, PaymentIntention> {
  get(draft: ResponseDraft): PaymentIntention {
    return draft.fullAdmission.paymentIntention ? draft.fullAdmission.paymentIntention : new PaymentIntention();
  }

  set(draft: ResponseDraft, model: PaymentIntention): void {
    draft.fullAdmission.paymentIntention = model;
  }
}

class PaymentOptionPage extends AbstractPaymentOptionPage<ResponseDraft> {

  createModelAccessor(): AbstractModelAccessor<ResponseDraft, PaymentIntention> {
    return new ModelAccessor();
  }

  buildPostSubmissionUri(path: string, req: express.Request, res: express.Response): string {
    const model: PaymentOption = req.body.model;

    if (model.isOfType(PaymentType.INSTALMENTS)) {
      return this.buildTaskListUri(req, res);
    }

    return super.buildPostSubmissionUri(path, req, res);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildTaskListUri(req: express.Request, res: express.Response): string {
    const { externalId } = req.params;
    return Paths.taskListPage.evaluateUri({ externalId });
  }
}

/* tslint:disable:no-default-export */
export default new PaymentOptionPage()
  .buildRouter(fullAdmissionPath);
