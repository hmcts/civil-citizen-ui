import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskStatus} from 'common/models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Task} from 'models/taskList/task';
import {DETERMINATION_WITHOUT_HEARING_URL} from 'routes/urls';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';

export function getGiveUsDetailsClaimantHearingTask(claim: Claim, claimId: string, lang: string): Task {
  const claimantDQ = Object.assign(new DirectionQuestionnaire(), claim.claimantResponse?.directionQuestionnaire);
  const claimantHearingTaskCompleted = getSmallClaimsDQCompleted(claimantDQ);
  return {
    description: t('TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS', {lng: lang}),
    url: constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL),
    status: claimantHearingTaskCompleted ? TaskStatus.COMPLETE : TaskStatus.INCOMPLETE,
  };
}

export function getSmallClaimsDQCompleted(dq: DirectionQuestionnaire) {
  if (!dq.hearing?.determinationWithoutHearing) {
    return false;
  } else if (dq.isExpertRequired && !dq.isWithExpertJourneyCompleted) {
    return false;
  } else if (!dq.defendantYourselfEvidence) {
    return false;
  } else if (!dq.witnesses?.otherWitnesses) {
    return false;
  } else if (!dq.isUnavailabilityDatesCompleted) {
    return false;
  } else if (!dq.hearing?.phoneOrVideoHearing) {
    return false;
  } else if (!dq.vulnerabilityQuestions?.vulnerability) {
    return false;
  } else if (!dq.hearing?.supportRequiredList) {
    return false;
  } else if (!dq.hearing?.specificCourtLocation) {
    return false;
  } else if (!dq.welshLanguageRequirements?.language) {
    return false;
  }
  return true;
}
