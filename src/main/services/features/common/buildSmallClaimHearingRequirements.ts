import {YesNo, YesNoUpperCase} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {SummarySection} from 'models/summaryList/summarySections';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DETERMINATION_WITHOUT_HEARING_URL} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {getEmptyStringIfUndefined} from 'common/utils/checkYourAnswer/formatAnswer';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {buildExpertReportSection} from 'services/features/common/hearingExportsReportBuilderSection';

export const determinationWithoutHearingQuestion = (claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire) => {
  const determinationWithoutHearingQuestion = t('PAGES.DETERMINATION_WITHOUT_HEARING.CLAIM_DETERMINATION_WITHOUT_HEARING', {lng})
    + t('PAGES.DETERMINATION_WITHOUT_HEARING.IE', {lng});
  const determinationWithoutHearingOption = directionQuestionnaire.getDecisionDeterminationWithoutHearing() === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    determinationWithoutHearingQuestion,
    t(`COMMON.VARIATION_2.${determinationWithoutHearingOption}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL),
    changeLabel(lng),
  );
};

export const determinationWithoutHearingReason = (claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire) => {
  const reason = directionQuestionnaire.getReasonForHearing();

  return summaryRow(
    t('PAGES.DETERMINATION_WITHOUT_HEARING.TELL_US_WHY', {lng}),
    getEmptyStringIfUndefined(reason),
    constructResponseUrlWithIdParams(claimId, DETERMINATION_WITHOUT_HEARING_URL),
    changeLabel(lng),
  );
};

export const buildSmallClaimHearingRequirements = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire) => {
  hearingRequirementsSection.summaryList.rows.push(determinationWithoutHearingQuestion(claimId, lng,directionQuestionnaire));
  if (directionQuestionnaire.getDecisionDeterminationWithoutHearing() === YesNo.NO) {
    hearingRequirementsSection.summaryList.rows.push(determinationWithoutHearingReason(claimId, lng,directionQuestionnaire));
  }
  hearingRequirementsSection.summaryList.rows.push(... buildExpertReportSection(claim, claimId, lng,directionQuestionnaire));
};
