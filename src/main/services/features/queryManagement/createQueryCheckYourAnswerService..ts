import {Claim} from 'models/claim';
import {summaryRow, SummaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CASE_DOCUMENT_VIEW_URL, QUERY_MANAGEMENT_CREATE_QUERY} from 'routes/urls';
import {UpcomingHearingDate, UploadQMAdditionalFile} from 'models/queryManagement/createQuery';
import {AppRequest} from 'models/AppRequest';
import {CaseQueries, FormDocument} from 'models/queryManagement/caseQueries';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {documentIdExtractor} from 'common/utils/stringUtils';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {v4 as uuidV4} from 'uuid';
import {formatDateToFullDate} from 'common/utils/dateUtils';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const getSummarySections = (claimId: string, claim: Claim): SummaryRow[] => {
  const lng = 'en';
  const createQuery = claim.queryManagement.createQuery;
  return [
    ...getMessageSubject(createQuery.messageSubject, claimId, lng),
    ...getMessageDescription(createQuery.messageDetails, claimId, lng),
    ...getMessageAboutHearing(createQuery.isHearingRelated, claimId, lng),
    ...getHearingDate(createQuery.isHearingRelated, createQuery.hearingDate, claimId, lng),
    ...getUploadedFiles(createQuery.uploadedFiles, claimId, lng),
  ];
};

const getMessageSubject = (subject: string, claimId: string, lng: string) => {
  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_SUBJECT', {lng}),
    subject,
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))];
};

const getMessageDescription = (messageDetails: string, claimId: string, lng: string) => {
  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_DETAILS', {lng}),
    messageDetails,
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))];
};

const getMessageAboutHearing = (aboutHearing: string, claimId: string, lng: string) => {
  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_ABOUT_HEARING', {lng}),
    aboutHearing,
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))];
};

const getHearingDate = (hearingRelated: string, hearingDate: UpcomingHearingDate, claimId: string, lng: string) => {
  if (hearingRelated === YesNo.YES) {
    return [summaryRow(
      t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_HEARING_DATE', {lng}),
      formatDateToFullDate(hearingDate.date, lng),
      constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
      t('COMMON.BUTTONS.CHANGE', {lng}))];
  } else return [];
};

const getUploadedFiles = (uploadedFiles: UploadQMAdditionalFile[], claimId: string, lng: string) => {
  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.UPLOAD_DOCUMENTS', {lng}),
    buildDocLink(uploadedFiles, claimId),
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))];
};

export const createApplicantCitizenQuery = async (claim: Claim, updatedClaim: Claim, req: AppRequest) => {
  let qmApplicantCitizenQueries: CaseQueries;
  const date = new Date();
  if (!updatedClaim.qmApplicantCitizenQueries) {

    qmApplicantCitizenQueries = {
      'partyName': claim.getClaimantFullName(),
      'roleOnCase': claim.caseRole,
      'caseMessages': [],
    };
  } else {
    qmApplicantCitizenQueries = updatedClaim.qmApplicantCitizenQueries;
  }
  qmApplicantCitizenQueries.caseMessages.push({
    'id': uuidV4(),
    'value': {
      'id': uuidV4(),
      'body': claim.queryManagement.createQuery.messageDetails,
      'name': claim.getClaimantFullName(),
      'subject': claim.queryManagement.createQuery.messageSubject,
      'createdBy': req.session.user.id,
      createdOn: date.toISOString(),
      'attachments': getDocAttachments(claim.queryManagement.createQuery.uploadedFiles),
      'isHearingRelated': claim.queryManagement.createQuery.isHearingRelated === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
      'hearingDate': claim.queryManagement.createQuery.isHearingRelated === YesNo.YES ? claim.queryManagement.createQuery.hearingDate.date.toISOString() : undefined,
    },
  });
  await civilServiceClient.submitQueryManagementRaiseQuery(req.params.id, {qmApplicantCitizenQueries}, req).catch(error => {
    throw error;
  });

};

const getDocAttachments = (uploadedFiles: UploadQMAdditionalFile[]): FormDocument[] => {
  if (!uploadedFiles.length) {
    return [];
  }
  return uploadedFiles.map(file => ({
    value: {
      document_url: file.caseDocument.documentLink.document_url,
      document_filename: file.caseDocument.documentLink.document_filename,
      document_binary_url: file.caseDocument.documentLink.document_binary_url,
    },
  }));
};

export const createRespondentCitizenQuery = async (claim: Claim, updatedClaim: Claim, req: AppRequest) => {
  let qmRespondentCitizenQueries: CaseQueries;
  const date = new Date();
  if (!updatedClaim.qmRespondentCitizenQueries) {

    qmRespondentCitizenQueries = {
      'partyName': claim.getDefendantFullName(),
      'roleOnCase': claim.caseRole,
      'caseMessages': [],
    };
  } else {
    qmRespondentCitizenQueries = updatedClaim.qmRespondentCitizenQueries;
  }
  qmRespondentCitizenQueries.caseMessages.push({
    'id': uuidV4(),
    'value': {
      'id': uuidV4(),
      'body': claim.queryManagement.createQuery.messageDetails,
      'name': claim.getDefendantFullName(),
      'subject': claim.queryManagement.createQuery.messageSubject,
      'createdBy': req.session.user.id,
      'createdOn': date.toISOString(),
      'attachments': getDocAttachments(claim.queryManagement.createQuery.uploadedFiles),
      'isHearingRelated': claim.queryManagement.createQuery.isHearingRelated === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
      'hearingDate': claim.queryManagement.createQuery.isHearingRelated === YesNo.YES ? claim.queryManagement.createQuery.hearingDate.date.toISOString() : undefined,
    },
  });
  await civilServiceClient.submitQueryManagementRaiseQuery(req.params.id, {qmRespondentCitizenQueries}, req).catch(error => {
    throw error;
  });
};

const buildDocLink = (uploadedFiles: UploadQMAdditionalFile[], claimId: string) => {
  let docLinks = '';
  uploadedFiles.forEach(doc => {
    const docUrl = `${CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId',
      documentIdExtractor(doc.caseDocument.documentLink.document_binary_url))}`;
    docLinks = docLinks + `<a class='govuk-link' href='${docUrl}'   rel='noopener noreferrer' target='_blank'>${doc.caseDocument.documentName}</a><br>`;
  });
  return docLinks;
};
