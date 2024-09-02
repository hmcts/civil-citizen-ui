import {Claim} from 'models/claim';
import {SummarySection} from 'models/summaryList/summarySections';
import {YesNo, YesNoUpperCase} from 'form/models/yesNo';
import {SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  ASSIGN_FRC_BAND_URL,
  DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL,
  DQ_DEFENDANT_EXPERT_EVIDENCE_URL,
  DQ_DISCLOSURE_OF_DOCUMENTS_URL,
  DQ_MULTITRACK_AGREEMENT_REACHED_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
  DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL,
  DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL,
  DQ_REQUEST_EXTRA_4WEEKS_URL,
  DQ_SENT_EXPERT_REPORTS_URL,
  DQ_SHARE_AN_EXPERT_URL,
  DQ_TRIED_TO_SETTLE_CLAIM_URL,
  FRC_BAND_AGREED_URL,
  REASON_FOR_FRC_BAND_URL,
  SUBJECT_TO_FRC_URL, WHY_NOT_SUBJECT_TO_FRC_URL,
} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {
  getFormattedAnswerForYesNoNotReceived,
  getEmptyStringIfUndefined,
} from 'common/utils/checkYourAnswer/formatAnswer';
import {
  buildExpertsDetailsRows,
} from 'services/features/common/hearingExportsReportBuilderSection';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {isIntermediateTrack, isMultiTrack} from 'form/models/claimType';
import {TypeOfDisclosureDocument} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';
import {
  HasAnAgreementBeenReachedOptions,
} from 'models/directionsQuestionnaire/mintiMultitrack/hasAnAgreementBeenReachedOptions';

export const triedToSettleQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const option = directionQuestionnaire?.hearing?.triedToSettle?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE', {lng}),
    t(`COMMON.VARIATION_2.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_TRIED_TO_SETTLE_CLAIM_URL),
    changeLabel(lng),
  );
};

export const requestExtra4WeeksQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const option = directionQuestionnaire?.hearing?.requestExtra4weeks?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_REQUEST_EXTRA_4WEEKS_URL),
    changeLabel(lng),
  );
};

export const subjectToFrcQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const option = directionQuestionnaire?.fixedRecoverableCosts?.subjectToFrc?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.SUBECT_TO_FRC', {lng}),
    t(`COMMON.VARIATION.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, SUBJECT_TO_FRC_URL),
    changeLabel(lng),
  );
};

export const bandAgreedQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const option = directionQuestionnaire?.fixedRecoverableCosts?.frcBandAgreed?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.FRC_BAND_AGREED', {lng}),
    t(`COMMON.VARIATION.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, FRC_BAND_AGREED_URL),
    changeLabel(lng),
  );
};

export const whichBandQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const option = directionQuestionnaire?.fixedRecoverableCosts?.complexityBand;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.FRC_BAND_CHOSEN', {lng}),
    t(`PAGES.CHECK_YOUR_ANSWER.FRC_BANDS.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, ASSIGN_FRC_BAND_URL),
    changeLabel(lng),
  );
};

export const reasonForBandQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const reasons = directionQuestionnaire?.fixedRecoverableCosts?.reasonsForBandSelection;
  if (reasons) {
    return summaryRow(
      t('PAGES.CHECK_YOUR_ANSWER.REASON_FOR_FRC_BAND', {lng}),
      reasons,
      constructResponseUrlWithIdParams(claimId, REASON_FOR_FRC_BAND_URL),
      changeLabel(lng),
    );
  }
};

export const whyNotFrcQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const reasons = directionQuestionnaire?.fixedRecoverableCosts?.reasonsForNotSubjectToFrc;
  if (reasons) {
    return summaryRow(
      t('PAGES.CHECK_YOUR_ANSWER.REASON_FOR_NO_FRC_BAND', {lng}),
      reasons,
      constructResponseUrlWithIdParams(claimId, WHY_NOT_SUBJECT_TO_FRC_URL),
      changeLabel(lng),
    );
  }
};

export const disclosureOfDocumentsQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const documentsTypeChosen = directionQuestionnaire?.hearing?.disclosureOfDocuments?.documentsTypeChosen;
  let value;
  if (documentsTypeChosen) {
    if (documentsTypeChosen.length === 2) {
      value = 'BOTH';
    } else if (documentsTypeChosen.length == 1) {
      value = documentsTypeChosen[0];
    }
  } else {
    value = 'NO';
  }
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DISCLOSURE_OF_DOCUMENTS.QUESTION', {lng}),
    t(`PAGES.CHECK_YOUR_ANSWER.DISCLOSURE_OF_DOCUMENTS.${value}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_DISCLOSURE_OF_DOCUMENTS_URL),
    changeLabel(lng),
  );
};

export const electronicDocsAgreementReachedQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const option = directionQuestionnaire?.hearing?.hasAnAgreementBeenReached;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.ELEC_AGREEMENT_REACHED.QUESTION', {lng}),
    t(`PAGES.CHECK_YOUR_ANSWER.ELEC_AGREEMENT_REACHED.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_AGREEMENT_REACHED_URL),
    changeLabel(lng),
  );
};

export const electronicDocsIssuesQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  if (directionQuestionnaire?.hearing?.hasAnAgreementBeenReached !== HasAnAgreementBeenReachedOptions.YES) {
    const issues = directionQuestionnaire?.hearing?.disclosureOfElectronicDocumentsIssues;
    return summaryRow(
      t('PAGES.CHECK_YOUR_ANSWER.ELEC_DOCS_ISSUES', {lng}),
      issues,
      constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL),
      changeLabel(lng),
    );
  }
};

export const nonElectronicDocsDisclosureQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const text = directionQuestionnaire?.hearing?.disclosureNonElectronicDocument;
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.NON_ELEC_DOCS_DISCLOSURE', {lng}),
    text,
    constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL),
    changeLabel(lng),
  );
};

export const mintiDocsToConsiderQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const option = directionQuestionnaire?.hearing?.hasDocumentsToBeConsidered?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t(claim.isClaimantIntentionPending() ? 'PAGES.CHECK_YOUR_ANSWER.DEFENDANT_DOCS_TO_CONSIDER' : 'PAGES.CHECK_YOUR_ANSWER.CLAIMANT_DOCS_TO_CONSIDER', {lng}),
    t(`COMMON.VARIATION.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL),
    changeLabel(lng),
  );
};

export const mintiDocsToConsiderDetailsQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const text = directionQuestionnaire?.hearing?.documentsConsideredDetails;

  return summaryRow(
    t(claim.isClaimantIntentionPending() ? 'PAGES.CHECK_YOUR_ANSWER.DEFENDANT_DOCS_TO_CONSIDER_DETAILS' : 'PAGES.CHECK_YOUR_ANSWER.CLAIMANT_DOCS_TO_CONSIDER_DETAILS', {lng}),
    text,
    constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL),
    changeLabel(lng),
  );
};

export const considerClaimantDocQuestion = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const option = directionQuestionnaire?.hearing?.considerClaimantDocuments?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT', {lng}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL),
    changeLabel(lng),
  );
};

export const considerClaimantDocResponse = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const details = directionQuestionnaire?.hearing?.considerClaimantDocuments?.details;

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS', {lng}),
    getEmptyStringIfUndefined(details),
  );
};

export const getUseExpertEvidence = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const shouldConsiderExpertEvidence = getFormattedAnswerForYesNoNotReceived(directionQuestionnaire?.experts?.expertEvidence?.option, lng);

  return summaryRow(
    t('PAGES.DEFENDANT_EXPERT_EVIDENCE.TITLE', {lng}),
    shouldConsiderExpertEvidence,
    constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_EVIDENCE_URL),
    changeLabel(lng),
  );
};

export const getSentReportToOtherParties = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const shouldConsiderSentExpertReports = getFormattedAnswerForYesNoNotReceived(directionQuestionnaire?.experts?.sentExpertReports?.option, lng);

  return summaryRow(
    t('PAGES.SENT_EXPERT_REPORTS.TITLE', {lng}),
    shouldConsiderSentExpertReports,
    constructResponseUrlWithIdParams(claimId, DQ_SENT_EXPERT_REPORTS_URL),
    changeLabel(lng),
  );
};

export const getShareExpertWithClaimant = (claim: Claim, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire): SummaryRow => {
  const option = directionQuestionnaire?.experts?.sharedExpert?.option === YesNo.YES
    ? YesNoUpperCase.YES
    : YesNoUpperCase.NO;

  return summaryRow(
    t('PAGES.SHARED_EXPERT.WITH_CLAIMANT', {lng}),
    directionQuestionnaire?.experts?.sharedExpert?.option ? t(`COMMON.VARIATION_2.${option}`, {lng}) : '',
    constructResponseUrlWithIdParams(claimId, DQ_SHARE_AN_EXPERT_URL),
    changeLabel(lng),
  );
};

export const buildHearingRequirementsForTrack = (claim: Claim, hearingRequirementsSection: SummarySection, claimId: string, lng: string, directionQuestionnaire : DirectionQuestionnaire, mintiApplicable: boolean) => {
  const intTrack = isIntermediateTrack(claim.totalClaimAmount, mintiApplicable);
  const multiTrack = isMultiTrack(claim.totalClaimAmount, mintiApplicable);
  const fastTrack = claim.isFastTrackClaim;

  if (directionQuestionnaire?.hearing?.triedToSettle?.option) {
    hearingRequirementsSection.summaryList.rows.push(triedToSettleQuestion(claim, claimId, lng,directionQuestionnaire));
  }

  if (directionQuestionnaire?.hearing?.requestExtra4weeks?.option) {
    hearingRequirementsSection.summaryList.rows.push(requestExtra4WeeksQuestion(claim, claimId, lng,directionQuestionnaire));
  }

  if (intTrack) {
    // frc section
    hearingRequirementsSection.summaryList.rows.push(subjectToFrcQuestion(claim, claimId, lng,directionQuestionnaire));
    if (directionQuestionnaire?.fixedRecoverableCosts?.subjectToFrc?.option === YesNo.NO
      && directionQuestionnaire?.fixedRecoverableCosts?.reasonsForNotSubjectToFrc) {
      hearingRequirementsSection.summaryList.rows.push(whyNotFrcQuestion(claim, claimId, lng,directionQuestionnaire));
    } else {
      hearingRequirementsSection.summaryList.rows.push(bandAgreedQuestion(claim, claimId, lng,directionQuestionnaire));
      hearingRequirementsSection.summaryList.rows.push(whichBandQuestion(claim, claimId, lng,directionQuestionnaire));
      if (directionQuestionnaire?.fixedRecoverableCosts?.reasonsForBandSelection) {
        hearingRequirementsSection.summaryList.rows.push(reasonForBandQuestion(claim, claimId, lng,directionQuestionnaire));
      }
    }
  }

  if (intTrack || multiTrack) {
    hearingRequirementsSection.summaryList.rows.push(disclosureOfDocumentsQuestion(claim, claimId, lng,directionQuestionnaire));
    if (directionQuestionnaire?.hearing?.disclosureOfDocuments?.documentsTypeChosen?.includes(TypeOfDisclosureDocument.ELECTRONIC)) {
      hearingRequirementsSection.summaryList.rows.push(electronicDocsAgreementReachedQuestion(claim, claimId, lng,directionQuestionnaire));
      hearingRequirementsSection.summaryList.rows.push(electronicDocsIssuesQuestion(claim, claimId, lng,directionQuestionnaire));
    }
    if (directionQuestionnaire?.hearing?.disclosureOfDocuments?.documentsTypeChosen?.includes(TypeOfDisclosureDocument.NON_ELECTRONIC)) {
      hearingRequirementsSection.summaryList.rows.push(nonElectronicDocsDisclosureQuestion(claim, claimId, lng,directionQuestionnaire));
    }
    hearingRequirementsSection.summaryList.rows.push(mintiDocsToConsiderQuestion(claim, claimId, lng,directionQuestionnaire));
    if (directionQuestionnaire?.hearing?.hasDocumentsToBeConsidered?.option === YesNo.YES) {
      hearingRequirementsSection.summaryList.rows.push(mintiDocsToConsiderDetailsQuestion(claim, claimId, lng,directionQuestionnaire));
    }
  }

  if (fastTrack) {
    if (directionQuestionnaire?.hearing?.considerClaimantDocuments?.option) {
      hearingRequirementsSection.summaryList.rows.push(considerClaimantDocQuestion(claim, claimId, lng,directionQuestionnaire));
    }
    if (directionQuestionnaire?.hearing?.considerClaimantDocuments?.option == YesNo.YES) {
      hearingRequirementsSection.summaryList.rows.push(considerClaimantDocResponse(claim, claimId, lng,directionQuestionnaire));
    }
  }

  if (directionQuestionnaire?.experts?.expertEvidence?.option) {
    hearingRequirementsSection.summaryList.rows.push(getUseExpertEvidence(claim, claimId, lng,directionQuestionnaire));
  }

  if (directionQuestionnaire?.experts?.sentExpertReports?.option) {
    hearingRequirementsSection.summaryList.rows.push(getSentReportToOtherParties(claim, claimId, lng,directionQuestionnaire));
  }

  if (directionQuestionnaire?.experts?.sharedExpert?.option) {
    hearingRequirementsSection.summaryList.rows.push(getShareExpertWithClaimant(claim, claimId, lng,directionQuestionnaire));
  }

  if(claim.hasExpertDetails()) {
    hearingRequirementsSection.summaryList.rows.push(... buildExpertsDetailsRows(claim, claimId, lng, directionQuestionnaire));
  }
};
