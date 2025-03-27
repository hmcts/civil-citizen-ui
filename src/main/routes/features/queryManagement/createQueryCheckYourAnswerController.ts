import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {getClaimById} from 'modules/utilityService';
import {BACK_URL, CASE_DOCUMENT_VIEW_URL, QM_CYA, QUERY_MANAGEMENT_CREATE_QUERY} from 'routes/urls';
import {summaryRow, SummaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {Claim} from 'models/claim';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {CaseQueries, FormDocument} from 'models/queryManagement/caseQueries';
import {getCancelUrl, saveQueryManagement} from 'services/features/queryManagement/queryManagementService';
import {UploadQMAdditionalFile} from 'models/queryManagement/createQuery';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {documentIdExtractor} from 'common/utils/stringUtils';


const viewPath = 'features/queryManagement/createQueryCheckYourAnswer.njk';
const createQueryCheckYourAnswerController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

createQueryCheckYourAnswerController.get(QM_CYA, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, req, true)
    const backLinkUrl = BACK_URL;
    const headerTitle = 'send a message';
    const cancelUrl = getCancelUrl(req.params.id);
    res.render(viewPath, {headerTitle, summaryRows: getSummarySections(req.params.id, claim), backLinkUrl, cancelUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler)

createQueryCheckYourAnswerController.post(QM_CYA, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true)
    const updatedClaim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim.isClaimant()) {
      await createApplicantCitizenQuery(claim, updatedClaim, req)
    } else {
      await createRespondentCitizenQuery(claim, updatedClaim, req);
    }
    await saveQueryManagement(claimId, null, 'createQuery', req);
    res.status(200).send('Request was successful');
  } catch (error) {
    next(error);
  }
})
export default createQueryCheckYourAnswerController;

const getSummarySections = (claimId: string, claim: Claim): SummaryRow[] => {
  const lng = 'en';
  const createQuery = claim.queryManagement.createQuery
  return [
    ...getMessageSubject(createQuery.messageSubject, claimId, lng),
    ...getMessageDescription(createQuery.messageDetails, claimId, lng),
    ...getMessageAboutHearing(createQuery.isHearingRelated, claimId, lng),
    ...getUploadedFiles(createQuery.uploadedFiles, claimId, lng),
  ]

}

const getMessageSubject = (subject: string, claimId: string, lng: string) => {
  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_SUBJECT', {lng}),
    subject,
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))]
}

const getMessageDescription = (messageDetails: string, claimId: string, lng: string) => {
  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_DETAILS', {lng}),
    messageDetails,
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))]
}

const getMessageAboutHearing = (aboutHearing: string, claimId: string, lng: string) => {
  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.MESSAGE_ABOUT_HEARING', {lng}),
    aboutHearing,
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))];
}

const getUploadedFiles = (uploadedFiles: UploadQMAdditionalFile[], claimId: string, lng: string) => {
  return [summaryRow(
    t('PAGES.QM.SEND_MESSAGE_CYA.UPLOAD_DOCUMENTS', {lng}),
    buildDocLink(uploadedFiles, claimId),
    constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY),
    t('COMMON.BUTTONS.CHANGE', {lng}))];
}

const createApplicantCitizenQuery = async (claim: Claim, updatedClaim: Claim, req: AppRequest) => {
  let qmApplicantCitizenQueries: CaseQueries;
  const date = new Date();
  if (!updatedClaim.qmApplicantCitizenQueries) {

    qmApplicantCitizenQueries = {
      "partyName": claim.getClaimantFullName(),
      "roleOnCase": claim.caseRole,
      "caseMessages": []
    }
  } else {
    qmApplicantCitizenQueries = updatedClaim.qmApplicantCitizenQueries;
  }
  qmApplicantCitizenQueries.caseMessages.push({
    "value": {
      "body": claim.queryManagement.createQuery.messageDetails,
      "name": claim.getClaimantFullName(),
      "subject": claim.queryManagement.createQuery.messageSubject,
      "createdBy": req.session.user.id,
      createdOn: date.toISOString(),
      "attachments": getDocAttachments(claim.queryManagement.createQuery.uploadedFiles),
      "isHearingRelated": claim.queryManagement.createQuery.isHearingRelated === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    }
  })
  await civilServiceClient.submitQueryManagementRaiseQuery(req.params.id, {qmApplicantCitizenQueries}, req).catch(error => {
    console.log(error);
  });

}

const getDocAttachments = (uploadedFiles: UploadQMAdditionalFile[]): FormDocument[] => {
  if (!uploadedFiles.length) {
    return [];
  }
  return uploadedFiles.map(file => ({
    value: {
      document_url: file.caseDocument.documentLink.document_url,
      document_filename: file.caseDocument.documentLink.document_filename,
      document_binary_url: file.caseDocument.documentLink.document_binary_url
    }
  }))
}
const createRespondentCitizenQuery = async (claim: Claim, updatedClaim: Claim, req: AppRequest) => {
  let qmRespondentCitizenQueries: CaseQueries;
  const date = new Date();
  if (!updatedClaim.qmApplicantCitizenQueries) {

    qmRespondentCitizenQueries = {
      "partyName": claim.getDefendantFullName(),
      "roleOnCase": claim.caseRole,
      "caseMessages": []
    }
  } else {
    qmRespondentCitizenQueries = updatedClaim.qmRespondentCitizenQueries;
  }
  qmRespondentCitizenQueries.caseMessages.push({
    "value": {
      "body": claim.queryManagement.createQuery.messageDetails,
      "name": claim.getDefendantFullName(),
      "subject": claim.queryManagement.createQuery.messageSubject,
      "createdBy": req.session.user.id,
      createdOn: date.toISOString(),
      "attachments": getDocAttachments(claim.queryManagement.createQuery.uploadedFiles),
      "isHearingRelated": claim.queryManagement.createQuery.isHearingRelated === YesNo.YES ? YesNoUpperCamelCase.YES : YesNoUpperCamelCase.NO,
    }
  })
  await civilServiceClient.submitQueryManagementRaiseQuery(req.params.id, {qmRespondentCitizenQueries}, req).catch(error => {
    console.log(error);
  });
}

const buildDocLink = (uploadedFiles: UploadQMAdditionalFile[], claimId: string) => {
  let docLinks = ``
  uploadedFiles.forEach(doc => {
    const docUrl = `${CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId',
      documentIdExtractor(doc.caseDocument.documentLink.document_binary_url))}`
    docLinks = docLinks + `<a class="govuk-link" href="${docUrl}"   rel="noopener noreferrer" target="_blank">${doc.caseDocument.documentName}</a><br>`
  });
  return docLinks;
}
