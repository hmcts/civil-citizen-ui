import {
  addApplicationStatus,
  addApplicationTypesAndDescriptionRows,
  addApplicationTypesRows,
  addDocumentUploadRow,
  addHearingArrangementsRows,
  addHearingContactDetailsRows,
  addHearingSupportRows,
  addInformOtherPartiesRow,
  addOrderJudgeRows,
  addOtherPartiesAgreedRow,
  addRequestingReasonRows,
  addUnavailableDatesRows,
} from './addViewApplicationRows';
import {summaryRow, SummaryRow} from 'models/summaryList/summaryList';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {AppRequest} from 'models/AppRequest';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import { t } from 'i18next';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';

const buildApplicationSections = (application: ApplicationResponse, lang: string ): SummaryRow[] => {
  return [
    ...addApplicationStatus(application, lang),
    ...addApplicationTypesRows(application, lang),
    ...addOtherPartiesAgreedRow(application, lang),
    ...addInformOtherPartiesRow(application, lang),
    ...addOrderJudgeRows(application, lang),
    ...addRequestingReasonRows(application, lang),
    ...addDocumentUploadRow(application, lang),
    ...addHearingArrangementsRows(application, lang),
    ...addHearingContactDetailsRows(application, lang),
    ...addUnavailableDatesRows(application, lang),
    ...addHearingSupportRows(application, lang),
  ];
};

const buildViewApplicationToRespondentSections = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  return [
    ...addApplicationTypesAndDescriptionRows(application, lang),
    ...addOtherPartiesAgreedRow(application, lang),
    ...addInformOtherPartiesRow(application, lang),
    ...addOrderJudgeRows(application, lang),
    ...addRequestingReasonRows(application, lang),
    ...addDocumentUploadRow(application, lang),
    ...addHearingArrangementsRows(application, lang),
    ...addHearingContactDetailsRows(application, lang),
    ...addUnavailableDatesRows(application, lang),
    ...addHearingSupportRows(application, lang),
  ];
};

export const getApplicationSections = async (req: AppRequest, applicationId: string, lang?: string): Promise<SummaryRow[]> => {
  const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
  const claim = await getClaimById(req.params.id, req, true);
  return toggleViewApplicationBuilderBasedOnUserAndApplicant(claim, applicationResponse) ? buildApplicationSections(applicationResponse, lang)
    : buildViewApplicationToRespondentSections(applicationResponse, lang);
};

const toggleViewApplicationBuilderBasedOnUserAndApplicant = (claim: Claim, application: ApplicationResponse) : boolean => {
  return ((claim.isClaimant() && application.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.YES)
    || (!claim.isClaimant() && application.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.NO));
};

export const getJudgeResponseSummary = (applicationResponse: ApplicationResponse, lng: string): SummaryRow[] => {
  const rows: SummaryRow[] = [];
  const documentUrl = 'test';
  rows.push(
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(new Date(applicationResponse.created_date), lng)),
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE', {lng})),
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), `<a href="${documentUrl}">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT', {lng})}</a>`),
  );
  return rows;
};

export const getJudgesDirectionsOrder = (applicationResponse: ApplicationResponse, lng: string): SummaryRow[] => {
  const rows: SummaryRow[] = [];
  let documentUrl = '';

  applicationResponse.case_data.directionOrderDocument.forEach(uploadGAFile => {
    documentUrl += `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(uploadGAFile?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.JUDGE_HAS_MADE_ORDER_DOCUMENT', {lng})}</a><br>`;
  });

  if (applicationResponse.case_data?.judicialDecisionMakeOrder?.directionsResponseByDate != undefined) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(new Date(applicationResponse.case_data.judicialDecisionMakeOrder.directionsResponseByDate), lng)),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.JUDGE_HAS_MADE_ORDER', {lng})),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), documentUrl),
    );
  }
  return rows;
};
