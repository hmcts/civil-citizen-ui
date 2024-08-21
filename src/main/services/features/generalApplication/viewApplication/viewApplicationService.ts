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
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {CcdDocument} from 'models/ccdGeneralApplication/ccdGeneralApplicationAddlDocument';
import {
  CASE_DOCUMENT_VIEW_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL,
  GA_PAY_ADDITIONAL_FEE_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL,
} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {constructDocumentUrlWithIdParamsAndDocumentId, constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {DocumentType} from 'models/document/documentType';
import {
  CcdGeneralApplicationDirectionsOrderDocument,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationDirectionsOrderDocument';
import { CourtResponseSummaryList, ResponseButton } from 'common/models/generalApplication/CourtResponseSummary';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import { CcdGAMakeWithNoticeDocument } from 'common/models/ccdGeneralApplication/ccdGAMakeWithNoticeDocument';

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

/**
 * Creates Response from court summary list by sorting on response time.
 */
const buildResponseFromCourtSection = async (req : AppRequest, application: ApplicationResponse, lang: string): Promise<CourtResponseSummaryList[]> => {
  const claim = await getClaimById(req.params.id, req, true);
  const returnDashboardUrl = getReturnDashboardUrl(claim);
  let judgeDirectionWithNotice : CourtResponseSummaryList = undefined;
  
  if(toggleViewApplicationBuilderBasedOnUserAndApplicant(claim,application)) {
    judgeDirectionWithNotice = getJudgeDirectionWithNotice(req, application, lang);
  }

  return [
    judgeDirectionWithNotice,
    ...getHearingNoticeResponses(application, lang),
    ...getHearingOrderResponses(application, lang),
    getJudgesDirectionsOrder(req, application, lang),
    getJudgeApproveEdit(application, lang),
    getJudgeDismiss(returnDashboardUrl, application, lang),
  ].filter(courtResponseSummary =>  courtResponseSummary && courtResponseSummary.rows.length > 0)
    .sort((summaryList1,summaryList2) => {
      return new Date(summaryList2?.responseDateTime).getTime() - new Date(summaryList1?.responseDateTime).getTime();
    });
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

export const getResponseFromCourtSection = async (req: AppRequest, applicationId: string, lang?: string): Promise<CourtResponseSummaryList[]> => {
  const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
  return await buildResponseFromCourtSection(req, applicationResponse, lang);
};

export const getJudgeDirectionWithNotice = (req : AppRequest, applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList => {
  const rows: SummaryRow[] = [];
  const claimId = req.params.id;
  const makeWithNoticeDoc = getMakeWithNoticeDocument(applicationResponse);
  const createdDateTime = makeWithNoticeDoc?.value?.createdDatetime;
  if(makeWithNoticeDoc) {

    const documentId = documentIdExtractor(makeWithNoticeDoc?.value?.documentLink?.document_binary_url);
    const documentUrl = constructDocumentUrlWithIdParamsAndDocumentId(applicationResponse.id, documentId, GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL);
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(createdDateTime, lng)),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DIRECTION_WITH_NOTICE', {lng})),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), `<a href="${documentUrl}" target="_blank" rel="noopener noreferrer">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.COURT_DOCUMENT', {lng})}</a>`),
    );
    if (documentUrl && (applicationResponse.case_data?.generalAppPBADetails?.additionalPaymentDetails)) {
      rows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.STATUS.TITLE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.ADDITIONAL_FEE_PAID', {lng})),
      );
    }
  }
  
  let payAdditionalFeeButton : ResponseButton = null;
  if(applicationResponse.state === ApplicationState.APPLICATION_ADD_PAYMENT) {
    const payAdditionalFeeUrl = constructResponseUrlWithIdAndAppIdParams(claimId, applicationResponse.id, GA_PAY_ADDITIONAL_FEE_URL);
    payAdditionalFeeButton = new ResponseButton(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.PAY_ADDITIONAL_FEE', {lng}), payAdditionalFeeUrl);
  }
  return new CourtResponseSummaryList(rows, createdDateTime, payAdditionalFeeButton);
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

const getMakeWithNoticeDocument = (applicationResponse: ApplicationResponse) : CcdGAMakeWithNoticeDocument => {
  const requestForInformationDocument = applicationResponse?.case_data?.requestForInformationDocument;
  if(requestForInformationDocument) {
    return requestForInformationDocument.find(doc => doc?.value?.documentType === DocumentType.SEND_APP_TO_OTHER_PARTY);
  }
  return undefined;
};

export const getJudgesDirectionsOrder = (req: AppRequest, applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList => {
  const rows: SummaryRow[] = [];
  let documentUrl = '';
  let judgeDirectionOrderButton = undefined;
  const claimId = req.params.id;
  const judgesDirectionsOrderUrl = constructResponseUrlWithIdAndAppIdParams(claimId, applicationResponse.id, GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL);
  const directionOrderDocument = getDirectionOrderDocument(applicationResponse);
  const createdDatetime = directionOrderDocument?.value?.createdDatetime;
  if(directionOrderDocument) {
    documentUrl += `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(directionOrderDocument?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.JUDGE_HAS_MADE_ORDER_DOCUMENT', {lng})}</a>`;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(createdDatetime, lng)),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.JUDGE_HAS_MADE_ORDER', {lng})),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), documentUrl));
    judgeDirectionOrderButton = new ResponseButton(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPOND_TO_REQUEST', {lng}), judgesDirectionsOrderUrl);
  }
 
  return new CourtResponseSummaryList(rows, createdDatetime, judgeDirectionOrderButton);
};

const getDirectionOrderDocument = (applicationResponse: ApplicationResponse) : CcdGeneralApplicationDirectionsOrderDocument => {
  const requestForInformationDocument = applicationResponse?.case_data?.directionOrderDocument;
  if(requestForInformationDocument) {
    return requestForInformationDocument.find(doc => doc?.value?.documentType === DocumentType.DIRECTION_ORDER);
  }
  return undefined;
};

export const getJudgeApproveEdit = (applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList => {
  const rows: SummaryRow[] = [];
  const judgeApproveEditDocument = getJudgeApproveEditDocument(applicationResponse);
  const createdDatetime = judgeApproveEditDocument?.value?.createdDatetime;
  if(judgeApproveEditDocument) {
    const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(judgeApproveEditDocument?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPROVE_EDIT_DOCUMENT', {lng})}</a>`;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(createdDatetime, lng)),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_APPROVE_EDIT', {lng})),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), documentUrl),
    );
  }

  return new CourtResponseSummaryList(rows,createdDatetime);
};

const getJudgeApproveEditDocument = (applicationResponse: ApplicationResponse) => {
  const generalOrderDocument = applicationResponse?.case_data?.generalOrderDocument;
  if(generalOrderDocument) {
    return generalOrderDocument.find(doc => doc?.value?.documentType === DocumentType.GENERAL_ORDER);
  }
  return undefined;
};

export const getJudgeDismiss = (returnDashboardUrl: string, applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList => {
  const rows: SummaryRow[] = [];
  const judgeDismissDocument = getJudgeDismissDocument(applicationResponse);
  let returnDashboardButton = undefined;
  const createdDatetime = judgeDismissDocument?.value?.createdDatetime;
  if (judgeDismissDocument) {
    const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(judgeDismissDocument?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DISMISSED_DOCUMENT', {lng})}</a>`;
    rows.push(
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(createdDatetime, lng)),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DISMISSED', {lng})),
      summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), documentUrl),
    );
    returnDashboardButton = new ResponseButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD', {lng}), returnDashboardUrl);
  }
  return new CourtResponseSummaryList(rows, createdDatetime, returnDashboardButton);
};

const getJudgeDismissDocument = (applicationResponse: ApplicationResponse) => {
  const dismissalOrderDocument = applicationResponse?.case_data?.dismissalOrderDocument;
  if(dismissalOrderDocument) {
    return dismissalOrderDocument.find(doc => doc?.value?.documentType === DocumentType.DISMISSAL_ORDER);
  }
  return undefined;
};

export const getReturnDashboardUrl = (claim: Claim) : string => {
  return claim.isClaimant()
    ? DASHBOARD_CLAIMANT_URL.replace(':id', claim.id)
    : DEFENDANT_SUMMARY_URL.replace(':id', claim.id);
};

export const getHearingOrderResponses = (applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList[] => {
  const rows: SummaryRow[] = [];
  const hearingOrders = applicationResponse?.case_data?.hearingOrderDocument;
  let courtResponseSummaryList : CourtResponseSummaryList[] = [];
  if(hearingOrders) {
    courtResponseSummaryList = hearingOrders.map(hearingOrder => {
      const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(hearingOrder?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_ORDER', {lng})}</a>`;
      const createdDatetime = hearingOrder?.value?.createdDatetime;
      rows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(createdDatetime, lng)),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_ORDER_DESC', {lng})),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), documentUrl),
      );
      return new CourtResponseSummaryList(rows,createdDatetime);
    });
  }
  return courtResponseSummaryList;
};

export const getHearingNoticeResponses = (applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList[] => {
  const rows: SummaryRow[] = [];
  const hearingNotices = applicationResponse?.case_data?.hearingNoticeDocument;
  let courtResponseSummaryList : CourtResponseSummaryList[] = [];
  
  if(hearingNotices) {
    courtResponseSummaryList = hearingNotices.map(hearingNotice => {
      const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(hearingNotice?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE', {lng})}</a>`;
      const createdDatetime = hearingNotice?.value?.createdDatetime;
      rows.push(
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(createdDatetime, lng)),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE_DESC', {lng})),
        summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), documentUrl),
      );
      return new CourtResponseSummaryList(rows,createdDatetime);
    });
  }
  return courtResponseSummaryList;
};
