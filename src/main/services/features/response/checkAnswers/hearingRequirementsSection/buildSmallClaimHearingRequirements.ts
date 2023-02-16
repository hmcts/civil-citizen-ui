import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {SummarySection} from 'models/summaryList/summarySections';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DETERMINATION_WITHOUT_HEARING_URL} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';

export const determinationWithoutHearingQuestion = (claim: Claim, claimId: string, lng: string) => {
  const determinationWithoutHearingQuestion = t('PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARING', {lng})
    + t('PAGES.DETERMINATION_WITHOUT_HEARING.IE', {lng});
  const determinationWithoutHearingOption = claim?.directionQuestionnaire?.hearing?.determinationWithoutHearing?.option;

  return summaryRow(
    determinationWithoutHearingQuestion,
    determinationWithoutHearingOption === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL),
    changeLabel(lng),
  );
};

export const determinationWithoutHearingReason = (claim: Claim, claimId: string, lng: string) => {
  const reason = claim?.directionQuestionnaire?.hearing?.determinationWithoutHearing?.reasonForHearing
    ? claim?.directionQuestionnaire?.hearing?.determinationWithoutHearing?.reasonForHearing
    : '';

  return summaryRow(
    t('PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY', {lng}),
    reason,
    constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL),
    changeLabel(lng),
  );
};

export const buildSmallClaimHearingRequirements = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lng: string) => {

  hearingRequirementsSection.summaryList.rows.push(determinationWithoutHearingQuestion(claim, claimId, lng));

  if (claim?.directionQuestionnaire?.hearing?.determinationWithoutHearing?.option === YesNo.NO) {
    hearingRequirementsSection.summaryList.rows.push(determinationWithoutHearingReason(claim, claimId, lng));
  }
};
