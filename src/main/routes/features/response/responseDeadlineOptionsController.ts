import * as express from 'express';
import {
  AGREED_T0_MORE_TIME_URL,
  CLAIM_TASK_LIST_URL,
  REQUEST_MORE_TIME_URL,
  RESPONSE_DEADLINE_OPTIONS_URL,
} from '../../urls';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {GenericForm} from '../../../common/form/models/genericForm';
import {ResponseDeadline, ResponseOptions} from '../../../common/form/models/responseDeadline';
import {Claim} from '../../../common/models/claim';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {ResponseDeadlineService} from '../../../services/features/response/responseDeadlineService';

const responseDeadlineOptionsController = express.Router();
const responseDeadlineOptionsViewPath = 'features/response/response-deadline-options';
const responseDeadlineService = new ResponseDeadlineService();

function renderView(res: express.Response, form: GenericForm<ResponseDeadline>, claim: Claim): void {
  const responseDeadline = Object.assign(form);
  responseDeadline.option = form.model?.option;
  res.render(responseDeadlineOptionsViewPath, {
    form: responseDeadline,
    responseDate: claim.formattedResponseDeadline(),
    claimantName: claim.getClaimantName(),
  });
}

responseDeadlineOptionsController.get(RESPONSE_DEADLINE_OPTIONS_URL,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);
      console.log('get--options-', claim);
      renderView(res, new GenericForm(new ResponseDeadline(claim.responseDeadline?.option)), claim);
    }
    catch (error) {
      next(error);
    }
  });

responseDeadlineOptionsController.post(RESPONSE_DEADLINE_OPTIONS_URL,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      let responseOption;
      let redirectUrl;
      const claimId = req.params.id;
      const claim = await getCaseDataFromStore(claimId);
      switch (req.body['option']) {
        case 'already-agreed':
          responseOption = ResponseOptions.ALREADY_AGREED;
          redirectUrl = constructResponseUrlWithIdParams(claimId, AGREED_T0_MORE_TIME_URL);
          break;
        case 'no':
          responseOption = ResponseOptions.NO;
          redirectUrl = constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL);
          break;
        case 'request-refused':
          responseOption = ResponseOptions.REQUEST_REFUSED;
          redirectUrl = constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL);
          break;
        case 'yes':
          responseOption = ResponseOptions.YES;
          redirectUrl = constructResponseUrlWithIdParams(claimId, REQUEST_MORE_TIME_URL);
          break;
        default:
          responseOption = undefined;
      }
      const form = new GenericForm(new ResponseDeadline(responseOption));
      await form.validate();
      if (form.hasErrors()) {
        renderView(res, form, claim);
      } else {
        await responseDeadlineService.saveDeadlineResponse(claimId, responseOption);
        res.redirect(redirectUrl);
      }
    }
    catch (error) {
      next(error);
    }
  });

export default responseDeadlineOptionsController;
