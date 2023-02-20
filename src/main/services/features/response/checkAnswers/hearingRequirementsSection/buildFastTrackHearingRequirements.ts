import {Claim} from 'models/claim';
import {SummarySection} from 'models/summaryList/summarySections';
import {YesNo, YesNoUpperCase} from 'form/models/yesNo';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL, DQ_DEFENDANT_EXPERT_EVIDENCE_URL, DQ_EXPERT_DETAILS_URL,
  DQ_REQUEST_EXTRA_4WEEKS_URL, DQ_SENT_EXPERT_REPORTS_URL, DQ_SHARE_AN_EXPERT_URL,
  DQ_TRIED_TO_SETTLE_CLAIM_URL,
} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {affirmation, getEmptyStringIfUndefined} from 'common/utils/checkYourAnswer/getEmptyStringIfUndefined';
import {getLng} from "common/utils/languageToggleUtils";

export const triedToSettleQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = claim.directionQuestionnaire?.hearing?.triedToSettle?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_TRIED_TO_SETTLE_CLAIM_URL),
    changeLabel(lng),
  );
};

export const requestExtra4WeeksQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = claim.directionQuestionnaire?.hearing?.requestExtra4weeks?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_REQUEST_EXTRA_4WEEKS_URL),
    changeLabel(lng),
  );
};

export const considerClaimantDocQuestion = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const option = claim?.directionQuestionnaire?.hearing?.considerClaimantDocuments?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL),
    changeLabel(lng),
  );
};

export const considerClaimantDocResponse = (claim: Claim, claimId: string, lng: string): SummaryRow => {
  const details = claim?.directionQuestionnaire?.hearing?.considerClaimantDocuments?.details;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS', {lng}),
    getEmptyStringIfUndefined(details),
  );
};

export const getExpert = (claim: Claim, claimId: string, lang: string): SummaryRow[]=>{
  const expertHref = constructResponseUrlWithIdParams(claimId, DQ_EXPERT_DETAILS_URL );
  const expertDetails = claim.directionQuestionnaire?.experts?.expertDetailsList?.items;
  const expertDetailsSummaryRows: Array<SummaryRow> = [];

  if (claim.directionQuestionnaire?.experts.expertEvidence?.option !== YesNo.YES) {
    return expertDetailsSummaryRows;
  }
  expertDetails?.map((expert, index)=>{
    expertDetailsSummaryRows.push(summaryRow(`${t('PAGES.EXPERT_DETAILS.SECTION_TITLE', {lng: getLng(lang)})} ${index + 1}`, '', expertHref, changeLabel(lang)));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.FIRST_NAME_OPTIONAL', lang), expert.firstName));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.LAST_NAME_OPTIONAL', lang), expert.lastName));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.EMAIL_ADDRESS_OPTIONAL', lang), expert.emailAddress));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.PHONE_OPTIONAL', lang), expert.phoneNumber?.toString()));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.FIELD_OF_EXPERTISE', lang), expert.fieldOfExpertise));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.TELL_US_WHY_NEED_EXPERT', lang), expert.whyNeedExpert));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.COST_OPTIONAL', lang), expert.estimatedCost?.toString()));
  });

  return expertDetailsSummaryRows;
}

export const getUseExpertEvidence = (claim:Claim, claimId: string, lng:string): SummaryRow =>{
  let shouldConsiderExpertEvidence = affirmation(claim.directionQuestionnaire?.experts?.expertEvidence?.option, lng);

  return summaryRow(
    t('PAGES.DEFENDANT_EXPERT_EVIDENCE.TITLE', {lng}),
    shouldConsiderExpertEvidence.get(),
    constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_EVIDENCE_URL),
    changeLabel(lng),
  );
}

export const getSentReportToOtherParties = (claim:Claim, claimId: string, lng:string): SummaryRow =>{
  const shouldConsiderSentExpertReports = affirmation(claim.directionQuestionnaire?.experts?.sentExpertReports?.option, lng);

  return summaryRow(
    t('PAGES.SENT_EXPERT_REPORTS.TITLE', {lng}),
    shouldConsiderSentExpertReports.get(),
    constructResponseUrlWithIdParams(claimId, DQ_SENT_EXPERT_REPORTS_URL),
    changeLabel(lng),
  );
}

export const getShareExpertWithClaimant = (claim:Claim, claimId: string, lng:string): SummaryRow =>{
  const shouldConsiderSharedExpert = affirmation(claim.directionQuestionnaire?.experts?.sharedExpert?.option, lng);

  return summaryRow(
    t('PAGES.SHARED_EXPERT.TITLE', {lng}),
    shouldConsiderSharedExpert.get(),
    constructResponseUrlWithIdParams(claimId, DQ_SHARE_AN_EXPERT_URL),
    changeLabel(lng),
  );
}

export const buildFastTrackHearingRequirements = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lng: string) => {

  if (claim.directionQuestionnaire?.hearing?.triedToSettle?.option)
    hearingRequirementsSection.summaryList.rows.push(triedToSettleQuestion(claim, claimId, lng));

  if (claim.directionQuestionnaire?.hearing?.requestExtra4weeks?.option)
    hearingRequirementsSection.summaryList.rows.push(requestExtra4WeeksQuestion(claim, claimId, lng));

  if (claim.directionQuestionnaire?.hearing?.considerClaimantDocuments?.option)
    hearingRequirementsSection.summaryList.rows.push(considerClaimantDocQuestion(claim, claimId, lng));

  if (claim.directionQuestionnaire?.hearing?.considerClaimantDocuments?.option == YesNo.YES)
    hearingRequirementsSection.summaryList.rows.push(considerClaimantDocResponse(claim, claimId, lng));

  hearingRequirementsSection.summaryList.rows.push(getUseExpertEvidence(claim, claimId, lng));
  hearingRequirementsSection.summaryList.rows.push(getSentReportToOtherParties(claim, claimId, lng));
  hearingRequirementsSection.summaryList.rows.push(getShareExpertWithClaimant(claim, claimId, lng));
  hearingRequirementsSection.summaryList.rows.push(...getExpert(claim, claimId, getLng(lng)));

};
