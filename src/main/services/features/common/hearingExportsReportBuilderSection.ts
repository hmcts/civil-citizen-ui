import {Claim} from 'models/claim';
import {summaryRow, SummaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {
  DQ_EXPERT_CAN_STILL_EXAMINE_URL,
  DQ_EXPERT_DETAILS_URL,
  DQ_EXPERT_REPORT_DETAILS_URL,
  PERMISSION_FOR_EXPERT_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  ReportDetail,
} from 'models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';

const buildExpertReportSection = (claim: Claim, claimId: string, lang: string, directionQuestionnaire: DirectionQuestionnaire): SummaryRow[] => {
  const hrefReportDetails = constructResponseUrlWithIdParams(claimId, DQ_EXPERT_REPORT_DETAILS_URL);
  const hasExportReportRow = buildHasExportReportSectionOption(claim, claimId, lang, hrefReportDetails);
  const exportReportSectionRows = [hasExportReportRow];
  if (claim.hasExpertReportDetails()) {
    exportReportSectionRows.push(...buildExportReportsRows(claim, claimId, lang, hrefReportDetails, directionQuestionnaire));
  } else {
    exportReportSectionRows.push(...whatIsThereToExamineRows(claim, claimId, lang, directionQuestionnaire));
  }
  return exportReportSectionRows;
};

const buildHasExportReportSectionOption = (claim: Claim, claimId: string, lang: string, hrefReportDetails: string): SummaryRow => {
  const value = claim?.hasExpertReportDetails() ?
    t('COMMON.VARIATION_2.YES', {lng: lang}) : t('COMMON.VARIATION_2.NO', {lng: lang});
  return summaryRow(t('PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE', {lng: lang}),
    value, hrefReportDetails, changeLabel(lang));
};

const buildExportReportsRows = (claim: Claim, claimId: string, lang: string, hrefReportDetails: string, directionQuestionnaire: DirectionQuestionnaire): SummaryRow[] => {
  const rows = directionQuestionnaire?.experts?.expertReportDetails?.reportDetails;
  return rows.map((row, index) => {
    const reportNumber = index + 1;
    return summaryRow(`${t('PAGES.EXPERT_REPORT_DETAILS.REPORT_TEXT', {lng: lang})} ${reportNumber}`,
      buildExpertsReportDetailsValue(row, lang), hrefReportDetails, changeLabel(lang));
  });
};
const buildExpertsReportDetailsValue = (reportDetails: ReportDetail, lang: string): string => {
  return `${t('PAGES.EXPERT_REPORT_DETAILS.EXPERT_NAME', lang)} : ${reportDetails.expertName} <br>
  ${t('PAGES.EXPERT_REPORT_DETAILS.DATE_OF_REPORT', getLng(lang))} : ${formatDateToFullDate(reportDetails.reportDate, lang)}`;
};

const whatIsThereToExamineRows = (claim: Claim, claimId: string, lang: string, directionQuestionnaire: DirectionQuestionnaire): SummaryRow[] => {
  const valueForExpertPermission = claim?.hasPermissionForExperts() ? t('COMMON.VARIATION.YES', {lng: lang}) : t('COMMON.VARIATION.NO', {lng: lang});
  const valueForDefendantExpertEvidence = claim?.hasEvidenceExpertCanStillExamine() ? t('COMMON.VARIATION.YES', {lng: lang}) : t('COMMON.VARIATION.NO', {lng: lang});
  const examineRows = [summaryRow(t('PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE', {lng: lang}),
    valueForExpertPermission, constructResponseUrlWithIdParams(claimId, PERMISSION_FOR_EXPERT_URL), changeLabel(lang)), summaryRow(t('PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE', {lng: lang}), valueForDefendantExpertEvidence, constructResponseUrlWithIdParams(claimId, DQ_EXPERT_CAN_STILL_EXAMINE_URL), changeLabel(lang))];
  if (claim.hasEvidenceExpertCanStillExamine()) {
    examineRows.push(summaryRow(t('PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.EXAMINE', {lng: lang}),
      directionQuestionnaire?.experts?.expertCanStillExamine?.details, constructResponseUrlWithIdParams(claimId, DQ_EXPERT_CAN_STILL_EXAMINE_URL),
      changeLabel(lang)));
    examineRows.push(...buildExpertsDetailsRows(claim, claimId, lang, directionQuestionnaire));
  }
  return examineRows;
};

const buildExpertsDetailsRows = (claim: Claim, claimId: string, lang: string, directionQuestionnaire: DirectionQuestionnaire): SummaryRow[] => {
  const hrefExpertDetails = constructResponseUrlWithIdParams(claimId, DQ_EXPERT_DETAILS_URL);
  const hrefLabel = changeLabel(lang);
  const rows = directionQuestionnaire?.experts?.expertDetailsList?.items;
  const expertDetailsSummaryRows: SummaryRow[] = [];
  rows?.forEach((expert, index) => {
    const row = index + 1;
    expertDetailsSummaryRows.push(summaryRow(`${t('PAGES.EXPERT_DETAILS.SECTION_TITLE', {lng: lang})} ${row}`));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.FIRST_NAME_OPTIONAL', {lng: lang}), expert.firstName, hrefExpertDetails, hrefLabel));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.LAST_NAME_OPTIONAL', {lng: lang}), expert.lastName, hrefExpertDetails, hrefLabel));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.EMAIL_ADDRESS_OPTIONAL', {lng: lang}), expert.emailAddress, hrefExpertDetails, hrefLabel));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.PHONE_OPTIONAL', {lng: lang}), expert.phoneNumber?.toString(), hrefExpertDetails, hrefLabel));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.FIELD_OF_EXPERTISE', {lng: lang}), expert.fieldOfExpertise, hrefExpertDetails, hrefLabel));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.TELL_US_WHY_NEED_EXPERT', {lng: lang}), expert.whyNeedExpert, hrefExpertDetails, hrefLabel));
    expertDetailsSummaryRows.push(summaryRow(t('PAGES.EXPERT_DETAILS.COST_OPTIONAL', {lng: lang}), expert.estimatedCost?.toString(), hrefExpertDetails, hrefLabel));
  });
  return expertDetailsSummaryRows;
};

export {
  buildExpertReportSection,
  buildExpertsDetailsRows,
};
