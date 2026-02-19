import { AppRequest } from 'common/models/AppRequest';
import { Claim } from 'common/models/claim';
import { UploadAdditionalDocument } from 'common/models/generalApplication/UploadAdditionalDocument';
import { SummaryRow, summaryRow } from 'common/models/summaryList/summaryList';
import { SummarySection, summarySection } from 'common/models/summaryList/summarySections';
import { generateRedisKey, saveDraftClaim } from 'modules/draft-store/draftStoreService';
import { TypeOfDocumentSectionMapper } from '../caseProgression/TypeOfDocumentSectionMapper';
import { GenericForm } from 'common/form/models/genericForm';
import { translateErrors } from './uploadEvidenceDocumentService';
import { FILE_UPLOAD_SOURCE } from 'common/utils/fileUploadUtils';
import { t } from 'i18next';
import config from 'config';
import { CivilServiceClient } from 'client/civilServiceClient';
import { GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL } from 'routes/urls';
import { getClaimById } from 'modules/utilityService';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { PaymentSuccessfulSectionBuilder } from '../claim/paymentSuccessfulSectionBuilder';
import { getLng } from 'common/utils/languageToggleUtils';
import { constructResponseUrlWithIdAndAppIdParams } from 'common/utils/urlFormatter';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {ApplicationState} from 'models/generalApplication/applicationSummary';

const { v4: uuIdv4 } = require('uuid');
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('additionalDocumentService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

export const getSummaryList = (additionalDocumentsList: UploadAdditionalDocument[], claimId: string, gaId: string, lng: any): SummarySection => {
  let index = 0;
  const toc = t('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', {lng});
  const formattedSummary = summarySection(
    {
      title: '',
      summaryRows: [],
    });
  additionalDocumentsList.forEach((uploadDocument: UploadAdditionalDocument) => {
    index = index + 1;
    formattedSummary.summaryList.rows.push(summaryRow(toc, uploadDocument.typeOfDocument));
    formattedSummary.summaryList.rows.push(summaryRow(uploadDocument.caseDocument.documentName, '', `${constructResponseUrlWithIdAndAppIdParams(claimId, gaId, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL)}?indexId=${index}`, 'Remove document'));
  });
  return formattedSummary;
};

export const removeSelectedDocument = async (redisKey: string, claim: Claim, index: number): Promise<void> => {
  try {
    claim?.generalApplication?.uploadAdditionalDocuments?.splice(index, 1);
    await saveDraftClaim(redisKey, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const uploadSelectedFile = async (req: AppRequest, claim: Claim) => {
  const uploadedDocument = new UploadAdditionalDocument();
  const fileUpload = TypeOfDocumentSectionMapper.mapToSingleFile(req);
  uploadedDocument.fileUpload = fileUpload;
  uploadedDocument.typeOfDocument = req.body.typeOfDocument;
  const form = new GenericForm(uploadedDocument);
  const uploadAdditionalDocuments = claim.generalApplication.uploadAdditionalDocuments;
  form.validateSync();
  delete uploadedDocument.fileUpload; //release file memory
  if (!form.hasErrors()) {
    uploadedDocument.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(req, fileUpload);
    uploadAdditionalDocuments.push(uploadedDocument);
    await saveDraftClaim(generateRedisKey(req), claim);
  } else {
    const errors = translateErrors(form.getAllErrors(), t);
    req.session.fileUpload = JSON.stringify(errors);
    req.session.fileUploadSource = FILE_UPLOAD_SOURCE.GA_ADDITIONAL_DOCUMENTS;
  }
};

export const getClaimDetailsById = async (req: AppRequest): Promise<Claim> => {
  try {
    const claim = await getClaimById(req.params.id, req, true);
    const gaApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication = gaApplication;
    return claim;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const prepareCCDData = (uploadAdditionalDocuments: UploadAdditionalDocument[]) => {
  return uploadAdditionalDocuments.map(doc => {
    return {
      id: uuIdv4(),
      value: {
        typeOfDocument: doc.typeOfDocument,
        documentUpload: {
          document_url: doc.caseDocument.documentLink.document_url,
          document_binary_url: doc.caseDocument.documentLink.document_binary_url,
          document_filename: doc.caseDocument.documentName,
        },
      },
    };
  });
};

export const buildSummarySectionForAdditionalDoc = (additionalDocumentsList: UploadAdditionalDocument[], claimId: string, gaId: string, lng: any) => {
  const rows: SummaryRow[] = [];
  const toc = t('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT', {lng});
  const uf = t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_DOCUMENT_UPLOADED_2', {lng});
  const changeLabel = (): string => t('COMMON.BUTTONS.CHANGE', {lng});
  additionalDocumentsList.forEach(doc => {
    rows.push(summaryRow(toc, doc.typeOfDocument));
    rows.push(summaryRow(uf, doc.caseDocument.documentName, GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL.replace(':id', claimId).replace(':appId', gaId), changeLabel()));
  });
  return rows;
};

export const getContentForPanel = (lng: string) => {
  const panelBuilder = new PaymentSuccessfulSectionBuilder();
  panelBuilder.addPanelForConfirmation('PAGES.GENERAL_APPLICATION.ADDITIONAL_DOCUMENTS.UPLOADED_ADDITIONAL_DOCS', getLng(lng));
  return panelBuilder.build();
};

export const getContentForBody = (lng: string) => {
  const contentBuilder = new PaymentSuccessfulSectionBuilder();
  return contentBuilder.addTitle('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT', { lng: getLng(lng) })
    .addParagraph('PAGES.GENERAL_APPLICATION.ADDITIONAL_DOCUMENTS.JUDGE_WILL_REVIEW', { lng: getLng(lng) })
    .build();
};

export const getContentForCloseButton = (redirectUrl: string) => {
  return new PaymentSuccessfulSectionBuilder()
    .addButton('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD', redirectUrl)
    .build();
};

export const canUploadAddlDoc = (applicationResponse: ApplicationResponse): boolean => {
  const availableStates: ApplicationState[] = [ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION,
    ApplicationState.AWAITING_RESPONDENT_RESPONSE,
    ApplicationState.AWAITING_DIRECTIONS_ORDER_DOCS,
    ApplicationState.AWAITING_WRITTEN_REPRESENTATIONS,
    ApplicationState.AWAITING_ADDITIONAL_INFORMATION,
    ApplicationState.APPLICATION_ADD_PAYMENT,
    ApplicationState.LISTING_FOR_A_HEARING,
    ApplicationState.HEARING_SCHEDULED,
  ];
  if(availableStates.includes(applicationResponse.state)) {
    return true;
  }
  return false;
};
