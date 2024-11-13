import {
  addApplicationStatus,
  addApplicationTypesAndDescriptionRows,
  addApplicationTypesRows,
  addAnotherApplicationRow,
  addDocumentUploadRow,
  addEvidenceOfDebtPaymentRow,
  addFinalPaymentDateDetails,
  addHearingArrangementsRows,
  addHearingContactDetailsRows,
  addHearingSupportRows,
  addInformOtherPartiesRow,
  addOrderJudgeRows,
  addOtherPartiesAgreedRow,
  addRequestingReasonRows,
  addUnavailableDatesRows,
} from './addViewApplicationRows';
import { SummaryRow } from 'models/summaryList/summaryList';
import { ApplicationResponse } from 'models/generalApplication/applicationResponse';
import { AppRequest } from 'models/AppRequest';
import {
  getApplicationFromGAService,
  toggleViewApplicationBuilderBasedOnUserAndApplicant,
} from 'services/features/generalApplication/generalApplicationService';
import { getClaimById } from 'modules/utilityService';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import { CcdDocument } from 'models/ccdGeneralApplication/ccdGeneralApplicationAddlDocument';
import { buildResponseSummaries } from './addViewApplicationResponseRows';
import { documentIdExtractor } from 'common/utils/stringUtils';
import { buildResponseFromCourtSection } from './responseFromCourtService';
import { CourtResponseSummaryList } from 'common/models/generalApplication/CourtResponseSummary';
import { CASE_DOCUMENT_VIEW_URL } from 'routes/urls';
import { t } from 'i18next';
import { GaDocumentType } from 'models/generalApplication/gaDocumentType';
import {displayToEnumKey} from 'services/translation/convertToCUI/cuiTranslation';

export type ViewApplicationSummaries = {
  summaryRows: SummaryRow[];
  responseSummaries?: SummaryRow[];
};

const buildApplicationSections = (application: ApplicationResponse, lang: string ): SummaryRow[] => {
  if (displayToEnumKey(application.case_data.applicationTypes) === 'CONFIRM_CCJ_DEBT_PAID') {
    return [
      ...addApplicationStatus(application, lang),
      ...addApplicationTypesRows(application, lang),
      ...addFinalPaymentDateDetails(application, lang),
      ...addEvidenceOfDebtPaymentRow(application, lang),
    ];
  }
  return [
    ...addApplicationStatus(application, lang),
    ...addApplicationTypesRows(application, lang),
    ...addAnotherApplicationRow(application, lang),
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
    ...addAnotherApplicationRow(application, lang),
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

export const getApplicationSections = async (req: AppRequest, applicationId: string, lang?: string): Promise<ViewApplicationSummaries> => {
  const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
  const claim = await getClaimById(req.params.id, req, true);
  return toggleViewApplicationBuilderBasedOnUserAndApplicant(claim, applicationResponse)
    ? { summaryRows: buildApplicationSections(applicationResponse, lang),
      responseSummaries: buildResponseSummaries(applicationResponse.case_data, lang) }
    : { summaryRows: buildViewApplicationToRespondentSections(applicationResponse, lang) };
};

export const getCourtDocuments = (applicationResponse : ApplicationResponse, lang: string) => {
  const courtDocumentsArray: DocumentInformation[] = [];
  courtDocumentsArray.push(...getHearingNotice(applicationResponse, lang));
  courtDocumentsArray.push(...getHearingOrder(applicationResponse, lang));
  courtDocumentsArray.push(...getGeneralOrder(applicationResponse, lang));
  courtDocumentsArray.push(...getDismissalOrder(applicationResponse, lang));
  return new DocumentsViewComponent('CourtDocument', courtDocumentsArray);
};

export const getApplicantDocuments = (applicationResponse : ApplicationResponse, lang: string) => {
  const applicantDocumentsArray: DocumentInformation[] = [];
  applicantDocumentsArray.push(...getDraftDocument(applicationResponse, lang));
  applicantDocumentsArray.push(...getAddlnDocuments(applicationResponse, lang, 'Applicant'));
  return new DocumentsViewComponent('ApplicantDocuments', applicantDocumentsArray);
};

export const getRespondentDocuments = (applicationResponse : ApplicationResponse, lang: string) => {
  const respondentDocumentsArray: DocumentInformation[] = [];
  if (applicationResponse.case_data.respondentsResponses != null && applicationResponse.case_data.respondentsResponses?.length > 0) {
    respondentDocumentsArray.push(...getDraftDocument(applicationResponse, lang));
  }
  respondentDocumentsArray.push(...getAddlnDocuments(applicationResponse, lang, 'Respondent One'));
  return new DocumentsViewComponent('RespondentDocuments', respondentDocumentsArray);
};

export const getResponseFromCourtSection = async (req: AppRequest, applicationId: string, lang?: string): Promise<CourtResponseSummaryList[]> => {
  const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
  return await buildResponseFromCourtSection(req, applicationResponse, lang);
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

export const getDraftDocument =  (applicationResponse: ApplicationResponse, lang: string) => {
  const generalAppDraftDocs = applicationResponse?.case_data?.gaDraftDocument;
  let gaDraftDocInfoArray : DocumentInformation[] = [];
  if(generalAppDraftDocs) {
    gaDraftDocInfoArray = generalAppDraftDocs.map(gaDraftDocument => {
      return setUpDocumentLinkObject(gaDraftDocument?.value?.documentLink, gaDraftDocument?.value?.createdDatetime, applicationResponse?.id, lang, 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DRAFT_DOCUMENT');
    });
  }
  return gaDraftDocInfoArray;
};

export const getHearingOrder = (applicationResponse: ApplicationResponse, lang: string) => {
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

export const getHearingNotice = (applicationResponse: ApplicationResponse, lang: string) => {
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

export const getGeneralOrder = (applicationResponse: ApplicationResponse, lang: string) => {
  const generalOrderDocs = applicationResponse?.case_data?.generalOrderDocument;
  let generalOrderDocInfoArray : DocumentInformation[] = [];
  if(generalOrderDocs) {
    generalOrderDocInfoArray = generalOrderDocs.sort((item1,item2) => {
      return new Date(item2?.value?.createdDatetime).getTime() - new Date(item1?.value?.createdDatetime).getTime();
    }).map(hearingOrder => {
      return setUpDocumentLinkObject(hearingOrder?.value?.documentLink, hearingOrder?.value?.createdDatetime, applicationResponse?.id, lang, 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.GENERAL_ORDER');
    });
  }
  return generalOrderDocInfoArray;
};

export const getDismissalOrder = (applicationResponse: ApplicationResponse, lang: string) => {
  const dismissOrderDoc = applicationResponse?.case_data?.dismissalOrderDocument;
  let dismissalOrderDocInfoArray : DocumentInformation[] = [];
  if (dismissOrderDoc) {
    dismissalOrderDocInfoArray = dismissOrderDoc.map(dismissalOrder => {
      return setUpDocumentLinkObject(dismissalOrder?.value?.documentLink, dismissalOrder?.value?.createdDatetime, applicationResponse.id, lang, 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DISMISSAL_ORDER');
    });
  }
  return dismissalOrderDocInfoArray;
};

const setUpDocumentLinkObject = (document: CcdDocument, documentDate: Date, applicationId: string, lang: string, fileName: string) => {
  return new DocumentInformation(
    getTranslatedDocumentName(fileName, lang),
    formatDateToFullDate(documentDate, lang),
    new DocumentLinkInformation(
      CASE_DOCUMENT_VIEW_URL.replace(':id', applicationId)
        .replace(':documentId',
          documentIdExtractor(document.document_binary_url)),
      document.document_filename));
};

const getTranslatedDocumentName = (documentName: string, lng: string) => {
  let documentType: GaDocumentType;
  switch (documentName) {
    case 'Supporting evidence':
      documentType = GaDocumentType.SUPPORTING_EVIDENCE;
      break;
    default:
      documentType = null;
  }
  return documentType ? t(`PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DOCUMENT_TYPES.${documentType}`, { lng }) : documentName;
};
