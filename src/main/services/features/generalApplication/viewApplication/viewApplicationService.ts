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
import {t} from 'i18next';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {DocumentType} from 'common/models/document/documentType';
import {
  CASE_DOCUMENT_VIEW_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL
} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {constructDocumentUrlWithIdParamsAndDocumentId} from 'common/utils/urlFormatter';
import {Request} from 'express';

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
  const documentUrl = getMakeWithNoticeDocumentUrl(applicationResponse);

  rows.push(
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(new Date(applicationResponse.created_date), lng)),
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE', {lng})),
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), `<a href="${documentUrl}">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT', {lng})}</a>`),
  );
  return rows;
};

const getMakeWithNoticeDocumentUrl = (applicationResponse: ApplicationResponse) : string => {
  const requestForInformationDocument = applicationResponse?.case_data?.requestForInformationDocument;
  const applicationId = applicationResponse.id;
  if(requestForInformationDocument) {
    const makeWithNoticeDoc = requestForInformationDocument.find(doc => doc?.value?.documentType === DocumentType.SEND_APP_TO_OTHER_PARTY);
    const documentId = documentIdExtractor(makeWithNoticeDoc?.value?.documentLink?.document_binary_url);
    return constructDocumentUrlWithIdParamsAndDocumentId(applicationId, documentId, GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL);
  }
  return undefined;
};

export const getJudgeApproveEdit = (applicationResponse: ApplicationResponse, lng: string): SummaryRow[] => {
  const rows: SummaryRow[] = [];
  const judgeApproveEditDocument = getJudgeApproveEditDocument(applicationResponse);
  if (judgeApproveEditDocument) {
    const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(judgeApproveEditDocument?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPROVE_EDIT_DOCUMENT', {lng})}</a>`;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(new Date(judgeApproveEditDocument.value.createdDatetime), lng)),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_APPROVE_EDIT', {lng})),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), documentUrl)
    );
  }
  return rows;
};

const getJudgeApproveEditDocument = (applicationResponse: ApplicationResponse) => {
  const generalOrderDocument = applicationResponse?.case_data?.generalOrderDocument;
  if(generalOrderDocument) {
    return generalOrderDocument.find(doc => doc?.value?.documentType === DocumentType.GENERAL_ORDER);
  }
  return undefined;
};

export const getJudgeDismiss = (applicationResponse: ApplicationResponse, lng: string): SummaryRow[] => {
  const rows: SummaryRow[] = [];
  const judgeDismissDocument = getJudgeDismissDocument(applicationResponse);
  if (judgeDismissDocument) {
    const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(judgeDismissDocument?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DISMISSED_DOCUMENT', {lng})}</a>`;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(new Date(judgeDismissDocument.value.createdDatetime), lng)),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DISMISSED', {lng})),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), documentUrl)
    );
  }
  return rows;
};

const getJudgeDismissDocument = (applicationResponse: ApplicationResponse) => {
  const dismissalOrderDocument = applicationResponse?.case_data?.dismissalOrderDocument;
  if(dismissalOrderDocument) {
    return dismissalOrderDocument.find(doc => doc?.value?.documentType === DocumentType.DISMISSAL_ORDER);
  }
  return undefined;
};

export const getReturnDashboardUrl = async (claimId: string, req: Request) : Promise<string> => {
  const claim = await getClaimById(claimId, req);
  return claim.isClaimant()
    ? DASHBOARD_CLAIMANT_URL.replace(':id', claimId)
    : DEFENDANT_SUMMARY_URL.replace(':id', claimId);
};
