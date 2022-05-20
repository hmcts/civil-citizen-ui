import { Task } from '../../../models/taskList/task';
import { Claim } from '../../../models/claim';
import { TaskStatus } from '../../../models/taskList/TaskStatus';
// import { constructResponseUrlWithIdParams } from '../../../../common/utils/urlFormatter';
import {CITIZEN_PAYMENT_OPTION_URL} from '../../../../routes/urls';

const decideHowYouPayTask =  {
  description: 'Decide how you\'ll pay',
  url: CITIZEN_PAYMENT_OPTION_URL,
  status: TaskStatus.INCOMPLETE,
};

export const getDecideHowYouPayTask = (caseData: Claim, claimId: string): Task => {
  console.log('how you pay', caseData);
  // const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_PAYMENT_OPTION_URL);
  return { ...decideHowYouPayTask };
};
