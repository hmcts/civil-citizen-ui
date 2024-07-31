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
import { DocumentInformation, DocumentLinkInformation, DocumentsViewComponent } from 'common/form/models/documents/DocumentsViewComponent';
import { CASE_DOCUMENT_VIEW_URL } from 'routes/urls';
import { CcdDocument } from 'common/models/ccdGeneralApplication/ccdGeneralApplicationEvidenceDocument';
import { documentIdExtractor } from 'common/utils/stringUtils';

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

export const getCourtDocuments = (applicationResponse : ApplicationResponse, lang: string) => {
  const courtDocumentsArray: DocumentInformation[] = [];
  courtDocumentsArray.push(...getHearingOrder(applicationResponse, lang));
 
  return new DocumentsViewComponent('CourtDocument', courtDocumentsArray);
};

export const getApplicantDocuments = (applicationResponse : ApplicationResponse, lang: string) => {
  const applicantDocumentsArray: DocumentInformation[] = [];
  return new DocumentsViewComponent('ApplicantDocuments', applicantDocumentsArray);
};

export const getRespondentDocuments = (applicationResponse : ApplicationResponse, lang: string) => {
  const respondentDocumentsArray: DocumentInformation[] = [];
 
  return new DocumentsViewComponent('RespondentDocuments', respondentDocumentsArray);
};

const getHearingOrder = (applicationResponse: ApplicationResponse, lang: string) => {
  const hearingOrderDocs = applicationResponse?.case_data?.hearingOrderDocument;
  let hearingOrderDocInfoArray : DocumentInformation[] = [];
  if(hearingOrderDocs) {
    hearingOrderDocInfoArray = hearingOrderDocs.sort((item1,item2) => {
      return new Date(item2?.value?.createdDatetime).getTime() - new Date(item1?.value?.createdDatetime).getTime();
    }).map(hearingOrder => {
      return setUpDocumentLinkObject(hearingOrder?.value?.documentLink, hearingOrder?.value?.createdDatetime, applicationResponse?.id, lang, 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_ORDER');
    });
  }
  return hearingOrderDocInfoArray;
};

const setUpDocumentLinkObject = (document: CcdDocument, documentDate: Date, applicationId: string, lang: string, fileName: string) => {
  return new DocumentInformation(
    fileName,
    formatDateToFullDate(documentDate, lang),
    new DocumentLinkInformation(
      CASE_DOCUMENT_VIEW_URL.replace(':id', applicationId)
        .replace(':documentId',
          documentIdExtractor(document.document_binary_url)),
      document.document_filename));
};