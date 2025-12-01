import {Task} from 'models/taskList/task';
import {Claim} from 'models/claim';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  MEDIATION_CONTACT_PERSON_CONFIRMATION_URL,
  MEDIATION_PHONE_CONFIRMATION_URL,
} from 'routes/urls';
import {getLng} from 'common/utils/languageToggleUtils';
import {t} from 'i18next';
import {MediationCarm} from 'models/mediation/mediationCarm';

export const getAvailabilityForMediationTask = (caseData: Claim, claimId: string, lang: string, claimantResponse: boolean): Task => {
  const availabilityMediationStatus = hasAvailabilityMediationFinished(caseData, claimantResponse);
  const url = (claimantResponse && caseData.isClaimantBusiness()) || (!claimantResponse && caseData.isBusiness()) ? constructResponseUrlWithIdParams(claimId, MEDIATION_CONTACT_PERSON_CONFIRMATION_URL) :
    constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL);
  return {
    description: t('COMMON.AVAILABILITY_FOR_MEDIATION', {lng: getLng(lang)}),
    url: url,
    status: availabilityMediationStatus ? TaskStatus.COMPLETE : TaskStatus.INCOMPLETE,
  };
};

const hasAvailabilityMediationFinished = (caseData: Claim, claimantResponse: boolean): boolean => {
  const mediationCarm = claimantResponse
    ? caseData.claimantResponse?.mediationCarm
    : caseData.mediationCarm;

  if (hasMissingMediationDetails(mediationCarm)) {
    delete mediationCarm?.hasAvailabilityMediationFinished;
  }

  const finishedFlag = mediationCarm?.hasAvailabilityMediationFinished;
  return finishedFlag === undefined ? false : finishedFlag;
};

const hasMissingMediationDetails = (mediationCarm?: MediationCarm): boolean => {
  const isPhoneIncorrectWithoutAlternative =
    mediationCarm?.isMediationPhoneCorrect?.option.toUpperCase() === 'NO' &&
    !mediationCarm?.alternativeMediationTelephone;

  const isEmailIncorrectWithoutAlternative =
    mediationCarm?.isMediationEmailCorrect?.option.toUpperCase() === 'NO' &&
    !mediationCarm?.alternativeMediationEmail;

  const hasUnavailabilityWithoutDates =
    mediationCarm?.hasUnavailabilityNextThreeMonths?.option.toUpperCase() === 'YES' &&
    !mediationCarm?.unavailableDatesForMediation;

  return isPhoneIncorrectWithoutAlternative
    || isEmailIncorrectWithoutAlternative
    || hasUnavailabilityWithoutDates;
};
