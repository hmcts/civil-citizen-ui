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
import {ApplicationResponse, JudicialDecisionOptions} from 'models/generalApplication/applicationResponse';
import {AppRequest} from 'models/AppRequest';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {t} from 'i18next';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {CcdDocument} from 'models/ccdGeneralApplication/ccdGeneralApplicationAddlDocument';
import {CASE_DOCUMENT_VIEW_URL, GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {constructDocumentUrlWithIdParamsAndDocumentId} from 'common/utils/urlFormatter';
import {DocumentType} from 'models/document/documentType';
import {
  CcdGeneralApplicationDirectionsOrderDocument,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationDirectionsOrderDocument';

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

  rows.push(
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(new Date(applicationResponse.created_date), lng)),
  );
  if(applicationResponse.case_data.judicialDecision.decision === JudicialDecisionOptions.MAKE_AN_ORDER) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE', {lng})),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), formatDocumentLinkHtml(applicationResponse, DocumentType.SEND_APP_TO_OTHER_PARTY, t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT', {lng}))),
    );
  } else if(applicationResponse.case_data.judicialDecision.decision === JudicialDecisionOptions.REQUEST_MORE_INFO) {
    const documentName = getRequestForInfoDocument(applicationResponse, DocumentType.REQUEST_MORE_INFORMATION).value.documentName;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_MORE_INFO', {lng})),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), formatDocumentLinkHtml(applicationResponse, DocumentType.REQUEST_MORE_INFORMATION, documentName)),
    );
  }
  if (documentUrl && (applicationResponse.case_data.generalAppPBADetails.additionalPaymentDetails)) {
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.ADDITIONAL_FEE_PAID', {lng})),
    );
  }
  return rows;
};

const getRequestForInfoDocument = (applicationResponse: ApplicationResponse, documentType: DocumentType) => {
  const requestForInformationDocument = applicationResponse?.case_data?.requestForInformationDocument;
  if(requestForInformationDocument) {
    return requestForInformationDocument.find(doc => doc?.value?.documentType === documentType);
  }
  return undefined;
};

const getRequestForInfoDocumentUrl = (applicationResponse: ApplicationResponse, documentType: DocumentType) : string => {
  const applicationId = applicationResponse.id;
  const document = getRequestForInfoDocument(applicationResponse, documentType);
  const documentId = documentIdExtractor(document?.value?.documentLink?.document_binary_url);
  return constructDocumentUrlWithIdParamsAndDocumentId(applicationId, documentId, GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL);
};

const formatDocumentLinkHtml = (applicationResponse: ApplicationResponse, documentType: DocumentType, documentName: string) : string => {
  return `<a href="${getRequestForInfoDocumentUrl(applicationResponse, documentType)}">${documentName}</a>`;
};

export const getCourtDocuments = (applicationResponse : ApplicationResponse, lang: string) => {
  const courtDocumentsArray: DocumentInformation[] = [];
  courtDocumentsArray.push(...getHearingNotice(applicationResponse, lang));
  courtDocumentsArray.push(...getHearingOrder(applicationResponse, lang));
  return new DocumentsViewComponent('CourtDocument', courtDocumentsArray);
};

export const getApplicantDocuments = (applicationResponse : ApplicationResponse, lang: string) => {
  const applicantDocumentsArray: DocumentInformation[] = [];
  applicantDocumentsArray.push(...getAddlnDocuments(applicationResponse, lang, 'Applicant'));
  return new DocumentsViewComponent('ApplicantDocuments', applicantDocumentsArray);
};

export const getRespondentDocuments = (applicationResponse : ApplicationResponse, lang: string) => {
  const respondentDocumentsArray: DocumentInformation[] = [];
  respondentDocumentsArray.push(...getAddlnDocuments(applicationResponse, lang, 'Respondent One'));
  return new DocumentsViewComponent('RespondentDocuments', respondentDocumentsArray);
};

const getAddlnDocuments = (applicationResponse: ApplicationResponse, lang: string, createdBy: string) => {
  const gaAddlDocuments = applicationResponse?.case_data?.gaAddlDoc;
  let addlnDocInfoArray : DocumentInformation[] = [];
  if(gaAddlDocuments) {
    addlnDocInfoArray = gaAddlDocuments.filter(gaAddlDocument => gaAddlDocument.value.createdBy === createdBy)
      .sort((item1,item2) => {
        return new Date(item2?.value?.createdDatetime).getTime() - new Date(item1?.value?.createdDatetime).getTime();
      }).map(gaAddlDoc => {
        return setUpDocumentLinkObject(gaAddlDoc?.value?.documentLink, gaAddlDoc?.value?.createdDatetime, applicationResponse?.id, lang,  gaAddlDoc?.value?.documentName);
      });
  }
  return addlnDocInfoArray;
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

const getHearingNotice = (applicationResponse: ApplicationResponse, lang: string) => {
  const hearingNoticeDocs = applicationResponse?.case_data?.hearingNoticeDocument;
  let hearingOrderDocInfoArray : DocumentInformation[] = [];
  if(hearingNoticeDocs) {
    hearingOrderDocInfoArray = hearingNoticeDocs.sort((item1,item2) => {
      return new Date(item2?.value?.createdDatetime).getTime() - new Date(item1?.value?.createdDatetime).getTime();
    }).map(hearingNotice => {
      return setUpDocumentLinkObject(hearingNotice?.value?.documentLink, hearingNotice?.value?.createdDatetime, applicationResponse?.id, lang, 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE');
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


export const getJudgesDirectionsOrder = (applicationResponse: ApplicationResponse, lng: string): SummaryRow[] => {
  const rows: SummaryRow[] = [];
  let documentUrl = '';
  const directionOrderDocument = getDirectionOrderDocument(applicationResponse);
  documentUrl += `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(directionOrderDocument?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.JUDGE_HAS_MADE_ORDER_DOCUMENT', {lng})}</a>`;

  rows.push(
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(directionOrderDocument.value.createdDatetime, lng)),
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.JUDGE_HAS_MADE_ORDER', {lng})),
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), documentUrl));
  return rows;
};

const getDirectionOrderDocument = (applicationResponse: ApplicationResponse) : CcdGeneralApplicationDirectionsOrderDocument => {
  const requestForInformationDocument = applicationResponse?.case_data?.directionOrderDocument;
  if(requestForInformationDocument) {
    return requestForInformationDocument.find(doc => doc?.value?.documentType === DocumentType.DIRECTION_ORDER);
  }
  return undefined;
};
