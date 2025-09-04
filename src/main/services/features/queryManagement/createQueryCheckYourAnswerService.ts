import {Claim} from 'models/claim';
import {summaryRow, SummaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CASE_DOCUMENT_VIEW_URL, QM_FOLLOW_UP_MESSAGE, QUERY_MANAGEMENT_CREATE_QUERY} from 'routes/urls';
import {CreateQuery, UploadQMAdditionalFile} from 'models/queryManagement/createQuery';
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

export const getSummarySections = (claimId: string, claim: Claim, lng: string, isFollowUpQuery:boolean, queryId = ''): SummaryRow[] => {
  if (isFollowUpQuery) {
    const followUpQuery = claim.queryManagement.sendFollowUpQuery;
    return [
      ...getMessageDescription(followUpQuery.messageDetails, claimId, lng, isFollowUpQuery,queryId),
      ...getUploadedFiles(followUpQuery.uploadedFiles, claimId, lng, isFollowUpQuery, queryId),
    ];
  }

  const createQuery = claim.queryManagement.createQuery;
  return [
    ...getMessageSubject(createQuery.messageSubject, claimId, lng),
    ...getMessageDescription(createQuery.messageDetails, claimId, lng, isFollowUpQuery, queryId),
    ...getMessageAboutHearing(createQuery.isHearingRelated, claimId, lng),
    ...getHearingDate(createQuery.isHearingRelated, createQuery.date, claimId, lng),
    ...getUploadedFiles(createQuery.uploadedFiles, claimId, lng, isFollowUpQuery, queryId),
  ];
};

const getMessageSubject = (subject: string, claimId: string, lng: string) => {
  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_SUBJECT', {lng}),
    subject,
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))];
};

const getMessageDescription = (messageDetails: string, claimId: string, lng: string, isFollowUp: boolean, queryId: string) => {
  if (isFollowUp) {
    return [summaryRow(
      t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_DETAILS', {lng}),
      messageDetails,
      constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_MESSAGE).replace(':queryId', queryId),
      t('COMMON.BUTTONS.CHANGE', {lng}))];
  }

  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_DETAILS', {lng}),
    messageDetails,
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))];
};

const getMessageAboutHearing = (aboutHearing: string, claimId: string, lng: string) => {
  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_ABOUT_HEARING', {lng}),
    yesNoFormatter4(aboutHearing as YesNo, lng),
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))];
};

const yesNoFormatter4 = (yesNo: YesNo, lng: string): string => t(`COMMON.VARIATION_4.${yesNo.toUpperCase()}`, {lng});

const getHearingDate = (hearingRelated: string, hearingDate: Date, claimId: string, lng: string) => {
  if (hearingRelated === YesNo.YES) {
    return [summaryRow(
      t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_HEARING_DATE', {lng}),
      formatDateToFullDate(hearingDate, lng),
      constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
      t('COMMON.BUTTONS.CHANGE', {lng}))];
  } else return [];
};

const getUploadedFiles = (uploadedFiles: UploadQMAdditionalFile[], claimId: string, lng: string, isFollowUp: boolean, queryId: string) => {
  if (isFollowUp){
    return [summaryRow(
      t('PAGES.QM.SEND_MESSAGE_CYA.ATTACHMENTS', {lng}),
      buildDocLink(uploadedFiles, claimId, lng),
      constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_MESSAGE).replace(':queryId', queryId),
      t('COMMON.BUTTONS.CHANGE', {lng}))];
  }
  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.ATTACHMENTS', {lng}),
    buildDocLink(uploadedFiles, claimId, lng),
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))];
};

export const createQuery = async (claim: Claim, updatedClaim: Claim, req: AppRequest, isFollowUpQuery: boolean) => {
  let queries: CaseQueries;
  const date = new Date();
  if (!updatedClaim.queries) {
    queries = {
      'partyName': 'All queries',
      'caseMessages': [],
    };
  } else {
    queries = updatedClaim.queries;
  }

  if (isFollowUpQuery) {
    const parent = queries.caseMessages
      .find(query => query.value.id === claim.queryManagement.sendFollowUpQuery.parentId);

    if (!parent) {
      throw new Error(`Parent query with ID ${claim.queryManagement.sendFollowUpQuery.parentId} not found.`);
    }

    queries.caseMessages.push({
      'id': uuidV4(),
      'value': {
        'parentId': parent.value.id,
        'id': uuidV4(),
        'body': claim.queryManagement.sendFollowUpQuery.messageDetails,
        'name': claim.isClaimant() ? claim.getClaimantFullName() : claim.getDefendantFullName(),
        'subject': parent.value.subject,
        'createdBy': req.session.user.id,
        'createdOn': date.toISOString(),
        'attachments': getDocAttachments(claim.queryManagement.sendFollowUpQuery.uploadedFiles),
        'isHearingRelated': parent.value.isHearingRelated === 'Yes' ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
        'hearingDate': parent.value.isHearingRelated === 'Yes' ? parent.value.hearingDate  : undefined,
      },
    });
    await civilServiceClient.submitQueryManagementRaiseQuery(req.params.id, {queries}, req).catch(error => {
      throw error;
    });
    return;
  }

  queries.caseMessages.push({
    'id': uuidV4(),
    'value': {
      'id': uuidV4(),
      'body': claim.queryManagement.createQuery.messageDetails,
      'name': claim.isClaimant() ? claim.getClaimantFullName() : claim.getDefendantFullName(),
      'subject': claim.queryManagement.createQuery.messageSubject,
      'createdBy': req.session.user.id,
      createdOn: date.toISOString(),
      'attachments': getDocAttachments(claim.queryManagement.createQuery.uploadedFiles),
      'isHearingRelated': claim.queryManagement.createQuery.isHearingRelated === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
      'hearingDate': claim.queryManagement.createQuery.isHearingRelated === YesNo.YES ? getStringDate(claim.queryManagement.createQuery)  : undefined,
    },
  });
  await civilServiceClient.submitQueryManagementRaiseQuery(req.params.id, {queries}, req).catch(error => {
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

const getStringDate = (query: CreateQuery): string => {
  const month = query.month.toString().padStart(2, '0');
  const day = query.day.toString().padStart(2, '0');
  return query.year + '-' + month + '-' + day;
};

const buildDocLink = (uploadedFiles: UploadQMAdditionalFile[], claimId: string, lng:string) => {
  let docLinks = '';
  if (uploadedFiles.length === 0) {
    return t('PAGES.QM.SEND_MESSAGE_CYA.NO_DOCUMENTS_UPLOADED', {lng});
  }
  uploadedFiles.forEach(doc => {
    const docUrl = `${CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId',
      documentIdExtractor(doc.caseDocument.documentLink.document_binary_url))}`;
    docLinks = docLinks + `<a class='govuk-link' href='${docUrl}'   rel='noopener noreferrer' target='_blank'>${doc.caseDocument.documentName}</a><br>`;
  });
  return docLinks;
};
