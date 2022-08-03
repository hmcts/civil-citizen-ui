import * as express from 'express';
import config from 'config';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {
  AGREED_TO_MORE_TIME_URL,
  CLAIM_TASK_LIST_URL,
  NEW_RESPONSE_DEADLINE_URL,
} from '../../../urls';
import {AppRequest} from '../../../../common/models/AppRequest';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {formatDateToFullDate} from '../../../../common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {ResponseDeadlineService} from '../../../../services/features/response/responseDeadlineService';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {AgreedResponseDeadline} from '../../../../common/form/models/agreedResponseDeadline';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const newResponseDeadlineController = express.Router();
const newResponseDeadlineViewPath = 'features/response/responseDeadline/new-response-deadline';
const responseDeadlineService = new ResponseDeadlineService();

newResponseDeadlineController.get(NEW_RESPONSE_DEADLINE_URL, async function (req: AppRequest, res, next: express.NextFunction) {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const agreedResponseDeadline = claim.responseDeadline.agreedResponseDeadline ? claim.responseDeadline.agreedResponseDeadline : req.cookies.newDeadlineDate.date;
    if (!agreedResponseDeadline) {
      throw new Error('No extended response deadline found');
    }
    const calculatedExtendedDeadline = await civilServiceClient.calculateExtendedResponseDeadline(agreedResponseDeadline, req);

    res.render(newResponseDeadlineViewPath, {
      claimantName: claim.getClaimantName(),
      responseDeadline: formatDateToFullDate(calculatedExtendedDeadline),
      backUrl: constructResponseUrlWithIdParams(req.params.id, AGREED_TO_MORE_TIME_URL),
    });
  } catch (error) {
    next(error);
  }
});

newResponseDeadlineController.post(NEW_RESPONSE_DEADLINE_URL, async function (req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const newDeadlineDate = req.cookies.newDeadlineDate;
    const form: GenericForm<AgreedResponseDeadline> = new GenericForm<AgreedResponseDeadline>(newDeadlineDate);
    await form.validate();
    if (!form.hasErrors()) {
      await responseDeadlineService.saveAgreedResponseDeadline(req.params.id, newDeadlineDate.date);
    }
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
  } catch (error) {
    next(error);
  }
});

export default newResponseDeadlineController;
