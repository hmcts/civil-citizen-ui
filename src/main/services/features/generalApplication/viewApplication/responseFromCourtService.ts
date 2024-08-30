import {summaryRow, SummaryRow} from 'models/summaryList/summaryList';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {AppRequest} from 'models/AppRequest';
import {toggleViewApplicationBuilderBasedOnUserAndApplicant} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {
  CASE_DOCUMENT_VIEW_URL,
  GA_MAKE_WITH_NOTICE_DOCUMENT_VIEW_URL,
  GA_PAY_ADDITIONAL_FEE_URL,
  GA_PROVIDE_MORE_INFORMATION_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL,
} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {constructDocumentUrlWithIdParamsAndDocumentId, constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {DocumentType} from 'models/document/documentType';
import { CourtResponseSummaryList, ResponseButton } from 'common/models/generalApplication/CourtResponseSummary';
import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import { CcdGAMakeWithNoticeDocument } from 'common/models/ccdGeneralApplication/ccdGAMakeWithNoticeDocument';

/**
 * Creates Response from court summary list by sorting on response time.
 */
export const buildResponseFromCourtSection = async (req : AppRequest, application: ApplicationResponse, lang: string): Promise<CourtResponseSummaryList[]> => {
  const claimId = req.params.id;
  const claim = await getClaimById(claimId, req, true);
  let judgeDirectionWithNotice : CourtResponseSummaryList = undefined;
  
  if(toggleViewApplicationBuilderBasedOnUserAndApplicant(claim,application)) {
    judgeDirectionWithNotice = getJudgeDirectionWithNotice(req, application, lang);
  }

  return [
    judgeDirectionWithNotice,
    ...getHearingNoticeResponses(application, lang),
    ...getHearingOrderResponses(req, application, lang),
    ...getRequestMoreInfoResponse(application, lang),
    ...getJudgesDirectionsOrder(req, application, lang),
    ...getJudgeApproveEdit(application, lang),
    ...getJudgeDismiss(application, lang),
    ...getWrittenRepSequentialDocument(req, application, lang),
    ...getWrittenRepConcurrentDocument(req, application, lang),
  ].filter(courtResponseSummary =>  courtResponseSummary && courtResponseSummary.rows.length > 0)
    .sort((summaryList1,summaryList2) => {
      return new Date(summaryList2?.responseDateTime).getTime() - new Date(summaryList1?.responseDateTime).getTime();
    });
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

export const getJudgesDirectionsOrder = (req: AppRequest, applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList[] => {
  let courtResponseSummaryList : CourtResponseSummaryList[] = [];
  const claimId = req.params.id;
  const directionOrderDocuments = applicationResponse?.case_data?.directionOrderDocument;
  const judgesDirectionsOrderUrl = constructResponseUrlWithIdAndAppIdParams(claimId, applicationResponse.id, GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL);
  if(directionOrderDocuments) {
    courtResponseSummaryList = directionOrderDocuments
      .filter(directionOrderDocument => {
        return directionOrderDocument?.value?.documentType === DocumentType.DIRECTION_ORDER;
      })
      .map(directionOrderDocument => {
        const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(directionOrderDocument?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.JUDGE_HAS_MADE_ORDER_DOCUMENT', {lng})}</a>`;
        const createdDatetime = directionOrderDocument?.value?.createdDatetime;
        const rows = getResponseSummaryRows(documentUrl, t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.JUDGE_HAS_MADE_ORDER', {lng}), createdDatetime, lng);
        const judgeDirectionOrderButton = new ResponseButton(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPOND_TO_REQUEST', {lng}), judgesDirectionsOrderUrl);
        return new CourtResponseSummaryList(rows, createdDatetime, judgeDirectionOrderButton);
      });
  }

  return courtResponseSummaryList;
};

export const getJudgeApproveEdit = (applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList[] => {
  let courtResponseSummaryList : CourtResponseSummaryList[] = [];
  const judgeApproveEditDocuments = applicationResponse?.case_data?.generalOrderDocument;

  if(judgeApproveEditDocuments) {
    courtResponseSummaryList = judgeApproveEditDocuments
      .filter(judgeDismissDocument => {
        return judgeDismissDocument?.value?.documentType === DocumentType.GENERAL_ORDER;
      })
      .map(judgeApproveEditDocument => {
        const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(judgeApproveEditDocument?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPROVE_EDIT_DOCUMENT', {lng})}</a>`;
        const createdDatetime = judgeApproveEditDocument?.value?.createdDatetime;
        const rows = getResponseSummaryRows(documentUrl, t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_APPROVE_EDIT', {lng}), createdDatetime, lng);
        return new CourtResponseSummaryList(rows, createdDatetime);
      });
  }
  return courtResponseSummaryList;
};

export const getJudgeDismiss = (applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList[] => {
  let courtResponseSummaryList : CourtResponseSummaryList[] = [];
  const judgeDismissDocuments = applicationResponse?.case_data?.dismissalOrderDocument;
  if(judgeDismissDocuments) {
    courtResponseSummaryList = judgeDismissDocuments
      .filter(judgeDismissDocument => {
        return judgeDismissDocument?.value?.documentType === DocumentType.DISMISSAL_ORDER;
      })
      .map(judgeDismissDocument => {
        const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(judgeDismissDocument?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DISMISSED_DOCUMENT', {lng})}</a>`;
        const createdDatetime = judgeDismissDocument?.value?.createdDatetime;
        const rows = getResponseSummaryRows(documentUrl, t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DISMISSED', {lng}), createdDatetime, lng);

        return new CourtResponseSummaryList(rows, createdDatetime);
      });
  }
  return courtResponseSummaryList;
};

export const getHearingOrderResponses = (req: AppRequest, applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList[] => {
  const hearingOrders = applicationResponse?.case_data?.hearingOrderDocument;
  let courtResponseSummaryList : CourtResponseSummaryList[] = [];
  const uploadAddlDocsButtonHref = constructResponseUrlWithIdAndAppIdParams(req.params.id, applicationResponse.id, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL);
  const uploadAddlDocsButton = new ResponseButton(t('COMMON.BUTTONS.UPLOAD_ADDITIONAL_DOCUMENTS', {lng}), uploadAddlDocsButtonHref);

  if(hearingOrders) {
    courtResponseSummaryList = hearingOrders
      .filter(directionOrderDocument => {
        return directionOrderDocument?.value?.documentType === DocumentType.HEARING_ORDER;
      })
      .map(hearingOrder => {
        const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(hearingOrder?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_ORDER', {lng})}</a>`;
        const createdDatetime = hearingOrder?.value?.createdDatetime;
        const rows = getResponseSummaryRows(documentUrl, t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_ORDER_DESC', {lng}), createdDatetime, lng);
  
        return new CourtResponseSummaryList(rows,createdDatetime, uploadAddlDocsButton);
      });
  }
  return courtResponseSummaryList;
};

export const getHearingNoticeResponses = (applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList[] => {
  const hearingNotices = applicationResponse?.case_data?.hearingNoticeDocument;
  let courtResponseSummaryList : CourtResponseSummaryList[] = [];
  
  if(hearingNotices) {
    courtResponseSummaryList = hearingNotices
      .filter(directionOrderDocument => {
        return directionOrderDocument?.value?.documentType === DocumentType.HEARING_NOTICE;
      })
      .map(hearingNotice => {
        const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(hearingNotice?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE', {lng})}</a>`;
        const createdDatetime = hearingNotice?.value?.createdDatetime;
        const rows = getResponseSummaryRows(documentUrl, t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE_DESC', {lng}), createdDatetime, lng);
        return new CourtResponseSummaryList(rows,createdDatetime);
      });
  }
  return courtResponseSummaryList;
};

export const getRequestMoreInfoResponse = (applicationResponse: ApplicationResponse, lng: string): CourtResponseSummaryList[] => {
 
  const requestMoreInfos = applicationResponse?.case_data?.requestForInformationDocument;
  let courtResponseSummaryList : CourtResponseSummaryList[] = [];
  
  if(requestMoreInfos) {
    courtResponseSummaryList = requestMoreInfos
      .filter(requestMoreInfo => {
        return requestMoreInfo?.value?.documentType === DocumentType.REQUEST_MORE_INFORMATION;
      })
      .map(requestMoreInfo => {
        const documentName = requestMoreInfo?.value?.documentName;
        const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(requestMoreInfo?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${documentName}</a>`;
        const createdDatetime = requestMoreInfo?.value?.createdDatetime;
        const rows = getResponseSummaryRows(documentUrl, t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_MORE_INFO', {lng}) ,createdDatetime, lng);
        const respondToRequestHref = '';
        const respondToRequestButton = new ResponseButton(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPOND_TO_REQUEST', {lng}), respondToRequestHref);
        return new CourtResponseSummaryList(rows, createdDatetime, respondToRequestButton);
      });
  }
  return courtResponseSummaryList;
};

export const getWrittenRepSequentialDocument = (req : AppRequest, applicationResponse: ApplicationResponse, lng: string) : CourtResponseSummaryList[] => {
  const claimId = req.params.id;
  const writtenRepSequentialDocs = applicationResponse?.case_data?.writtenRepSequentialDocument;
  let courtResponseSummaryList : CourtResponseSummaryList[] = [];
  
  if(writtenRepSequentialDocs) {
    courtResponseSummaryList = writtenRepSequentialDocs
      .filter(writtenRepSequentialDocs => {
        return writtenRepSequentialDocs?.value?.documentType === DocumentType.WRITTEN_REPRESENTATION_SEQUENTIAL;
      })
      .map(writtenRepSequentialDocs => {
        const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(writtenRepSequentialDocs?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_WRITTEN_REPRESENTATION_DOCUMENT', {lng})}</a>`;
        const createdDatetime = writtenRepSequentialDocs?.value?.createdDatetime;
        const rows = getResponseSummaryRows(documentUrl, t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_WRITTEN_REPRESENTATION', {lng}) ,createdDatetime, lng);
        const requestWrittenRepresentationsUrl = constructResponseUrlWithIdAndAppIdParams(claimId, applicationResponse.id, GA_PROVIDE_MORE_INFORMATION_URL);
        const requestWrittenRepButton = new ResponseButton(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPOND_TO_REQUEST', {lng}), requestWrittenRepresentationsUrl);
 
        return new CourtResponseSummaryList(rows, createdDatetime,requestWrittenRepButton);
      });
  }
  return courtResponseSummaryList;
};

export const getWrittenRepConcurrentDocument = (req : AppRequest, applicationResponse: ApplicationResponse, lng: string) : CourtResponseSummaryList[] => {
  const claimId = req.params.id;
  const writtenRepConcurrentDocs = applicationResponse?.case_data?.writtenRepConcurrentDocument;
  let courtResponseSummaryList : CourtResponseSummaryList[] = [];
  
  if(writtenRepConcurrentDocs) {
    courtResponseSummaryList = writtenRepConcurrentDocs
      .filter(writtenRepConcurrentDoc => {
        return writtenRepConcurrentDoc?.value?.documentType === DocumentType.WRITTEN_REPRESENTATION_CONCURRENT;
      })
      .map(writtenRepConcurrentDoc => {
        const documentUrl = `<a href=${CASE_DOCUMENT_VIEW_URL.replace(':id', applicationResponse.id).replace(':documentId', documentIdExtractor(writtenRepConcurrentDoc?.value?.documentLink.document_binary_url))} target="_blank" rel="noopener noreferrer" class="govuk-link">${t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_WRITTEN_REPRESENTATION_DOCUMENT', {lng})}</a>`;
        const createdDatetime = writtenRepConcurrentDoc?.value?.createdDatetime;
        const rows = getResponseSummaryRows(documentUrl, t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.REQUEST_WRITTEN_REPRESENTATION', {lng}) ,createdDatetime, lng);
        const requestWrittenRepresentationsUrl = constructResponseUrlWithIdAndAppIdParams(claimId, applicationResponse.id, GA_PROVIDE_MORE_INFORMATION_URL);
        const requestWrittenRepButton = new ResponseButton(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.RESPOND_TO_REQUEST', {lng}), requestWrittenRepresentationsUrl);
        return new CourtResponseSummaryList(rows, createdDatetime, requestWrittenRepButton);
      });
  }
  return courtResponseSummaryList;
};

const getMakeWithNoticeDocument = (applicationResponse: ApplicationResponse) : CcdGAMakeWithNoticeDocument => {
  const requestForInformationDocument = applicationResponse?.case_data?.requestForInformationDocument;
  if(requestForInformationDocument) {
    return requestForInformationDocument.find(doc => doc?.value?.documentType === DocumentType.SEND_APP_TO_OTHER_PARTY);
  }
  return undefined;
};

const getResponseSummaryRows = (documentUrl : string, typeOfResponse: string, responseDate : Date, lng: string) => {
  const rows: SummaryRow[] = [];
  rows.push(
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DATE_RESPONSE', {lng}), formatDateToFullDate(responseDate, lng)),
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TYPE_RESPONSE', {lng}), typeOfResponse),
    summaryRow(t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.READ_RESPONSE', {lng}), documentUrl),
  );
  return rows;
};