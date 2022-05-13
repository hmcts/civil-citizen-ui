import {Task} from '../../../models/taskList/task';
import {Claim} from '../../../models/claim';
import {TaskStatus} from '../../../models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {CITIZEN_DETAILS_URL} from '../../../../routes/urls';

const confirmYourDetailsTask = {
  description: 'Confirm your details',
  url: CITIZEN_DETAILS_URL,
  status: TaskStatus.INCOMPLETE,
};

export const getConfirmYourDetailsTask = (caseData: Claim, claimId: string): Task => {
  let isTaskCompleted = TaskStatus.COMPLETE;
  if (!caseData) {
    isTaskCompleted = TaskStatus.INCOMPLETE;
  }
  if (!caseData?.respondent1?.correspondenceAddress && !caseData?.respondent1?.primaryAddress) {
    isTaskCompleted = TaskStatus.INCOMPLETE;
  }
  if (!caseData?.respondent1?.dateOfBirth) {
    isTaskCompleted = TaskStatus.INCOMPLETE;
  }

  const constructedUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_DETAILS_URL);
  return { ...confirmYourDetailsTask, url: constructedUrl, status: isTaskCompleted };
};

