import {
  addApplicationStatus,
  addApplicationTypesAndDescriptionRows,
  addAnotherApplicationRow,
  addEvidenceOfDebtPaymentRow,
  addFinalPaymentDateDetails,
  addHearingArrangementsRows,
  addHearingContactDetailsRows,
  addHearingSupportRows,
  addInformOtherPartiesRow,
  addOrderJudgeRow,
  addOtherPartiesAgreedRow,
  addRequestingReasonRow,
  addUnavailableDatesRows,
  addApplicationTypeRow,
} from './addViewApplicationRows';
import {SummaryCard, SummaryRow, summaryRow} from 'models/summaryList/summaryList';
import { ApplicationResponse } from 'models/generalApplication/applicationResponse';
import { AppRequest } from 'models/AppRequest';
import {
  getApplicationFromGAService, hasRespondentResponded,
  toggleViewApplicationBuilderBasedOnUserAndApplicant,
} from 'services/features/generalApplication/generalApplicationService';
import { getClaimById } from 'modules/utilityService';
import { formatDateToFullDate } from 'common/utils/dateUtils';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {
  CcdDocument,
  CcdGeneralApplicationAddlDocument,
} from 'models/ccdGeneralApplication/ccdGeneralApplicationAddlDocument';
import { buildResponseSummaries } from './addViewApplicationResponseRows';
import { documentIdExtractor } from 'common/utils/stringUtils';
import { buildResponseFromCourtSection } from './responseFromCourtService';
import { CourtResponseSummaryList } from 'common/models/generalApplication/CourtResponseSummary';
import { CASE_DOCUMENT_VIEW_URL } from 'routes/urls';
import { t } from 'i18next';
import { GaDocumentType } from 'models/generalApplication/gaDocumentType';
import {displayToEnumKey} from 'services/translation/convertToCUI/cuiTranslation';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  ApplicationTypeOptionSelection,
  getApplicationTypeOptionByTypeAndDescription,
} from 'models/generalApplication/applicationType';
import {DocumentType} from 'models/document/documentType';

export type ViewApplicationSummaries = {
  summaryRows: SummaryRow[];
  responseSummaries?: SummaryRow[];
};

const buildApplicationSections = (application: ApplicationResponse, lang: string ): SummaryRow[] => {
  const singleAppType = application.case_data.generalAppType.types.length === 1;
  if (displayToEnumKey(application.case_data.applicationTypes) === 'CONFIRM_CCJ_DEBT_PAID') {
    const applicationSections: SummaryRow[] = [];
    if (singleAppType) {
      applicationSections.push(
        ...addApplicationStatus(application, lang),
        ...addApplicationTypeRow(application, 0, lang));
    }
    applicationSections.push(
      ...addFinalPaymentDateDetails(application, lang),
      ...addEvidenceOfDebtPaymentRow(application, lang),
    );
    return applicationSections;
  }
  const applicationSections: SummaryRow[] = [];
  if (singleAppType) {
    applicationSections.push(
      ...addApplicationStatus(application, lang),
      ...addApplicationTypeRow(application, 0, lang),
    );
  }
  applicationSections.push(
    ...addAnotherApplicationRow(application, lang),
    ...addOtherPartiesAgreedRow(application, lang),
    ...addInformOtherPartiesRow(application, lang),
  );
  if (singleAppType) {
    applicationSections.push(
      ...addOrderJudgeRow(application, 0, lang),
      ...addRequestingReasonRow(application, 0, lang),
    );
  }
  applicationSections.push(
    ...addHearingArrangementsRows(application, lang),
    ...addHearingContactDetailsRows(application, lang),
    ...addUnavailableDatesRows(application, lang),
    ...addHearingSupportRows(application, lang),
  );
  return applicationSections;
};

const buildViewApplicationToRespondentSections = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  const singleAppType = application.case_data.generalAppType.types.length === 1;
  const summaryRows: SummaryRow[] = [];
  if (singleAppType) {
    summaryRows.push(...addApplicationTypesAndDescriptionRows(application, lang));
  }
  summaryRows.push(
    ...addAnotherApplicationRow(application, lang),
    ...addOtherPartiesAgreedRow(application, lang),
    ...addInformOtherPartiesRow(application, lang),
  );
  if (singleAppType) {
    summaryRows.push(
      ...addOrderJudgeRow(application, 0, lang),
      ...addRequestingReasonRow(application, 0, lang),
    );
  }
  summaryRows.push(
    ...addHearingArrangementsRows(application, lang),
    ...addHearingContactDetailsRows(application, lang),
    ...addUnavailableDatesRows(application, lang),
    ...addHearingSupportRows(application, lang),
  );
  return summaryRows;
};

export const getStatusRow = (applicationResponse: ApplicationResponse, lang?: string): SummaryRow[] => {
  const singleAppType = applicationResponse.case_data.generalAppType.types.length === 1;
  if (singleAppType) {
    // Only show status above cards if there are multiple app types
    return null;
  }
  return [...addApplicationStatus(applicationResponse, lang)];
};

export const getSummaryCardSections = (applicationResponse: ApplicationResponse, lang?: string): SummaryCard[] => {
  const lng = getLng(lang);
  const singleAppType = applicationResponse.case_data.generalAppType.types.length === 1;
  if (singleAppType) {
    // Only use summary cards if there are multiple app types
    return null;
  }
  const summaryCards: SummaryCard[] = [];
  applicationResponse.case_data.generalAppType.types.forEach((value, index) => {
    summaryCards.push({
      card: {
        title: {text: `${t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION', {lng})} ${index + 1}`},
      },
      rows: [
        ...addApplicationTypeRow(applicationResponse, index, lng),
        ...addOrderJudgeRow(applicationResponse, index, lang),
        ...addRequestingReasonRow(applicationResponse, index, lang),
      ],
    });
  });
  return summaryCards;
};

export const getResponseSummaryCardSections = (applicationResponse: ApplicationResponse, lang?: string): SummaryCard[] => {
  return hasRespondentResponded(applicationResponse)
    ? getSummaryCardSections(applicationResponse, lang)
    : getPreResponseSummaryCardSections(applicationResponse, lang);
};

export const getPreResponseSummaryCardSections = (applicationResponse: ApplicationResponse, lang?: string): SummaryCard[] => {
  const lng = getLng(lang);
  const singleAppType = applicationResponse.case_data.generalAppType.types.length === 1;
  if (singleAppType) {
    // Only use summary cards if there are multiple app types
    return null;
  }
  const summaryCards: SummaryCard[] = [];
  applicationResponse.case_data.generalAppType.types.forEach((value, index) => {
    const applicationTypeDisplay =
      getApplicationTypeOptionByTypeAndDescription(value, ApplicationTypeOptionSelection.BY_APPLICATION_TYPE);
    const applicationTypeDescription = getApplicationTypeOptionByTypeAndDescription(value, ApplicationTypeOptionSelection.BY_APPLICATION_TYPE_DESCRIPTION);
    summaryCards.push({
      card: {
        title: {text: `${t('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION', {lng})} ${index + 1}`},
      },
      rows: [
        summaryRow(
          t('PAGES.GENERAL_APPLICATION.RESPONDENT_VIEW_APPLICATION.APPLICATION_TYPE_AND_DESC', {
            lng,
          }),
          t(applicationTypeDisplay, { lng }) + '.</br>' + t(applicationTypeDescription, {lng}),
          null,
          null,
          undefined,
        ),
        ...addOrderJudgeRow(applicationResponse, index, lang),
        ...addRequestingReasonRow(applicationResponse, index, lang),
      ],
    });
  });
  return summaryCards;
};

export const getApplicationSections = async (req: AppRequest, applicationResponse: ApplicationResponse, lang?: string): Promise<ViewApplicationSummaries> => {
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

export const getResponseFromCourtSection = async (req: AppRequest, applicationId: string, showButtons: boolean, lang?: string): Promise<CourtResponseSummaryList[]> => {
  const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
  return await buildResponseFromCourtSection(req, applicationResponse, showButtons, lang);
};

const getAddlnDocuments = (applicationResponse: ApplicationResponse, lang: string, createdBy: string) => {
  const addlDoc = applicationResponse?.case_data?.gaAddlDoc;
  const preTranslationDocs = createdBy === 'Applicant' ? applicationResponse?.case_data?.preTranslationGaDocsApplicant : applicationResponse?.case_data?.preTranslationGaDocsRespondent;
  const translationDocTypes = createdBy === 'Applicant' ? [DocumentType.WRITTEN_REPRESENTATION_APPLICANT_TRANSLATED, DocumentType.REQUEST_MORE_INFORMATION_APPLICANT_TRANSLATED]
    : [DocumentType.WRITTEN_REPRESENTATION_RESPONDENT_TRANSLATED, DocumentType.REQUEST_MORE_INFORMATION_RESPONDENT_TRANSLATED];
  const gaAddlDocuments = [...(addlDoc ?? []), ...(preTranslationDocs ?? [])];

  let addlnDocInfoArray : DocumentInformation[] = [];
  if(gaAddlDocuments) {
    addlnDocInfoArray = gaAddlDocuments.filter(gaAddlDocument => gaAddlDocument.value.createdBy === createdBy || translationDocTypes.includes(gaAddlDocument.value.documentType))
      .sort((item1,item2) => {
        return new Date(item2?.value?.createdDatetime).getTime() - new Date(item1?.value?.createdDatetime).getTime();
      }).map(gaAddlDoc => {
        return setUpDocumentLinkObject(gaAddlDoc?.value?.documentLink, gaAddlDoc?.value?.createdDatetime, applicationResponse?.id, lang,  getAddlDocumentLabel(gaAddlDoc));
      });
  }
  return addlnDocInfoArray;
};

const getAddlDocumentLabel = (additionalDocument: CcdGeneralApplicationAddlDocument): string => {
  switch (additionalDocument?.value?.documentType) {
    case DocumentType.WRITTEN_REPRESENTATION_APPLICANT_TRANSLATED:
      return 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TRANSLATED_WRITTEN_REPRESENTATION_RESPONSE_APPLICANT';
    case DocumentType.WRITTEN_REPRESENTATION_RESPONDENT_TRANSLATED:
      return 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TRANSLATED_WRITTEN_REPRESENTATION_RESPONSE_RESPONDENT';
    case DocumentType.REQUEST_MORE_INFORMATION_APPLICANT_TRANSLATED:
      return 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TRANSLATED_MORE_INFO_RESPONSE_APPLICANT';
    case DocumentType.REQUEST_MORE_INFORMATION_RESPONDENT_TRANSLATED:
      return 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TRANSLATED_MORE_INFO_RESPONSE_RESPONDENT';
    case DocumentType.REQUEST_MORE_INFORMATION:
      return 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.ADDITIONAL_INFORMATION';
    case DocumentType.WRITTEN_REPRESENTATION_SEQUENTIAL:
      return 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.WRITTEN_REPRESENTATION_DOC';
    default:
      return additionalDocument.value.documentName;
  }
};

export const getDraftDocument =  (applicationResponse: ApplicationResponse, lang: string) => {
  const generalAppDraftDocs = applicationResponse?.case_data?.gaDraftDocument;
  let gaDraftDocInfoArray : DocumentInformation[] = [];
  if(generalAppDraftDocs) {
    gaDraftDocInfoArray = generalAppDraftDocs.sort((item1,item2) => {
      return new Date(item2.value.createdDatetime).getTime() - new Date(item1.value.createdDatetime).getTime();
    }).map(gaDraftDocument => {
      return setUpDocumentLinkObject(gaDraftDocument.value.documentLink, gaDraftDocument.value.createdDatetime, applicationResponse.id, lang, gaDraftDocument.value.documentName.indexOf('Translated') !== -1
        ? 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TRANSLATED_APPLICATION_DRAFT_DOCUMENT'
        : 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.APPLICATION_DRAFT_DOCUMENT' , gaDraftDocument.value.documentName);
    });
  }
  return gaDraftDocInfoArray;
};

export const getHearingOrder = (applicationResponse: ApplicationResponse, lng: string) => {
  const hearingOrderDocs = applicationResponse?.case_data?.hearingOrderDocument;
  let hearingOrderDocInfoArray : DocumentInformation[] = [];
  if(hearingOrderDocs) {
    hearingOrderDocInfoArray = hearingOrderDocs.sort((item1,item2) => {
      return new Date(item2?.value?.createdDatetime).getTime() - new Date(item1?.value?.createdDatetime).getTime();
    }).map(hearingOrder => {
      const documentLabel = hearingOrder.value.documentName.indexOf('Translated') !== -1
        ? t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TRANSLATED_HEARING_ORDER', {lng})
        : t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_ORDER', {lng});
      return setUpDocumentLinkObject(hearingOrder.value?.documentLink, hearingOrder.value?.createdDatetime, applicationResponse?.id, lng, documentLabel, hearingOrder.value.documentName);
    });
  }
  return hearingOrderDocInfoArray;
};

export const getHearingNotice = (applicationResponse: ApplicationResponse, lng: string) => {
  const hearingNoticeDocs = applicationResponse?.case_data?.hearingNoticeDocument;
  let hearingOrderDocInfoArray : DocumentInformation[] = [];
  if(hearingNoticeDocs) {
    hearingOrderDocInfoArray = hearingNoticeDocs.sort((item1,item2) => {
      return new Date(item2.value.createdDatetime).getTime() - new Date(item1.value.createdDatetime).getTime();
    }).map(hearingNotice => {
      const documentLabel = hearingNotice.value.documentName.indexOf('Translated') !== -1
        ? t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TRANSLATED_HEARING_NOTICE_DESC', {lng})
        : t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.HEARING_NOTICE', {lng});
      return setUpDocumentLinkObject(hearingNotice.value.documentLink, hearingNotice.value.createdDatetime, applicationResponse.id, lng, documentLabel);
    });
  }
  return hearingOrderDocInfoArray;
};

export const getGeneralOrder = (applicationResponse: ApplicationResponse, lng: string) => {
  const generalOrderDocs = applicationResponse?.case_data?.generalOrderDocument;
  let generalOrderDocInfoArray : DocumentInformation[] = [];
  if(generalOrderDocs) {
    generalOrderDocInfoArray = generalOrderDocs.sort((item1,item2) => {
      return new Date(item2.value.createdDatetime).getTime() - new Date(item1.value.createdDatetime).getTime();
    }).map(generalOrder => {
      const documentLabel = generalOrder.value.documentName.indexOf('Translated') !== -1
        ? t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.TRANSLATED_GENERAL_ORDER', {lng})
        : t('PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.GENERAL_ORDER', {lng});
      return setUpDocumentLinkObject(generalOrder.value?.documentLink, generalOrder.value?.createdDatetime, applicationResponse?.id, lng, documentLabel);
    });
  }
  return generalOrderDocInfoArray;
};

export const getDismissalOrder = (applicationResponse: ApplicationResponse, lang: string) => {
  const dismissOrderDoc = applicationResponse?.case_data?.dismissalOrderDocument;
  let dismissalOrderDocInfoArray : DocumentInformation[] = [];
  if (dismissOrderDoc) {
    dismissalOrderDocInfoArray = dismissOrderDoc.sort((item1,item2) => {
      return new Date(item2.value.createdDatetime).getTime() - new Date(item1.value.createdDatetime).getTime();
    }).map(dismissalOrder => {
      return setUpDocumentLinkObject(dismissalOrder.value.documentLink, dismissalOrder.value.createdDatetime, applicationResponse.id, lang, 'PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DISMISSAL_ORDER', dismissalOrder.value.documentName);
    });
  }
  return dismissalOrderDocInfoArray;
};

const setUpDocumentLinkObject = (document: CcdDocument, documentDate: Date, applicationId: string, lang: string, fileName: string, documentName?: string ) => {
  return new DocumentInformation(
    getTranslatedDocumentName(fileName, lang),
    formatDateToFullDate(documentDate, lang),
    new DocumentLinkInformation(
      CASE_DOCUMENT_VIEW_URL.replace(':id', applicationId)
        .replace(':documentId',
          documentIdExtractor(document.document_binary_url)),
      documentName ?? document.document_filename));
};

const getTranslatedDocumentName = (documentName: string, lng: string) => {
  let documentType: GaDocumentType;
  switch (documentName) {
    case 'Supporting evidence':
      documentType = GaDocumentType.SUPPORTING_EVIDENCE;
      break;
    case 'Respond evidence':
      documentType = GaDocumentType.RESPOND_EVIDENCE;
      break;
    default:
      documentType = null;
  }
  return documentType ? t(`PAGES.GENERAL_APPLICATION.VIEW_APPLICATION.DOCUMENT_TYPES.${documentType}`, { lng }) : documentName;
};
