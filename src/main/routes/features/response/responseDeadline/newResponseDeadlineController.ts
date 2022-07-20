import * as express from 'express';
import config from 'config';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {NEW_RESPONSE_DEADLINE_URL} from '../../../urls';
import {AppRequest} from '../../../../common/models/AppRequest';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {formatDateToFullDate} from '../../../../common/utils/dateUtils';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const newResponseDeadlineController = express.Router();
const newResponseDeadlineViewPath = 'features/response/responseDeadline/new-response-deadline';

newResponseDeadlineController.get(NEW_RESPONSE_DEADLINE_URL, async function(req: AppRequest, res, next: express.NextFunction) {
  try{
    const claim = await getCaseDataFromStore(req.params.id);
    const calculatedExtendedDeadline = await civilServiceClient.calculateExtendedResponseDeadline(claim.responseDeadline?.agreedResponseDeadline, req);
    console.log(calculatedExtendedDeadline);
    if(calculatedExtendedDeadline === undefined){
      throw new Error('No extended response deadline found');
    }

    res.render(newResponseDeadlineViewPath, {claimantName: claim.getClaimantName(), responseDeadline: formatDateToFullDate(calculatedExtendedDeadline)});
  }catch (error) {
    next(error);
  }
});

export default newResponseDeadlineController;
