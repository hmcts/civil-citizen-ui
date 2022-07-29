import * as express from 'express';
import config from 'config';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {
  AGREED_TO_MORE_TIME_URL,
  NEW_RESPONSE_DEADLINE_URL,
} from '../../../urls';
import {AppRequest} from '../../../../common/models/AppRequest';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {formatDateToFullDate} from '../../../../common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';


const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const newResponseDeadlineController = express.Router();
const newResponseDeadlineViewPath = 'features/response/responseDeadline/new-response-deadline';

newResponseDeadlineController.get(NEW_RESPONSE_DEADLINE_URL, async function (req: AppRequest, res, next: express.NextFunction) {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    if (!claim.responseDeadline?.agreedResponseDeadline) {
      throw new Error('No extended response deadline found');
    }
    const calculatedExtendedDeadline = await civilServiceClient.calculateExtendedResponseDeadline(claim.responseDeadline?.agreedResponseDeadline, req);

    res.render(newResponseDeadlineViewPath, {
      claimantName: claim.getClaimantName(),
      responseDeadline: formatDateToFullDate(calculatedExtendedDeadline),
      backUrl: constructResponseUrlWithIdParams(req.params.id, AGREED_TO_MORE_TIME_URL),
    });
  } catch (error) {
    next(error);
  }
});

export default newResponseDeadlineController;
