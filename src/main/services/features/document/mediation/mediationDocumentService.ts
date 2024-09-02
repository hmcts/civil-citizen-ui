import {
  MediationDocumentsReferred, MediationMediationNonAttendanceDocs,
  MediationUploadDocumentsCCD,
} from 'models/mediation/uploadDocuments/uploadDocumentsCCD';
import {Claim} from 'models/claim';

export const orderByDocumentUploadedDate = (mediationDocuments: MediationUploadDocumentsCCD[]) =>
  mediationDocuments
    .sort((a, b) =>
      new Date(b.value.documentUploadedDatetime).getTime() - new Date(a.value.documentUploadedDatetime).getTime());

export const getClaimantMediationDocuments = (claim: Claim) => {
  const mediationDocuments:MediationUploadDocumentsCCD[] = [];
  if (claim.app1MediationDocumentsReferred) {
    mediationDocuments.push(...claim.app1MediationDocumentsReferred);
  }
  if (claim.app1MediationNonAttendanceDocs) {
    mediationDocuments.push(...claim.app1MediationNonAttendanceDocs);
  }
  return mediationDocuments.length > 0 ? orderByDocumentUploadedDate(mediationDocuments) : mediationDocuments;
};

export const getDefendantMediationDocuments = (claim: Claim) => {
  const mediationDocuments:MediationUploadDocumentsCCD[] = [];
  if (claim.res1MediationDocumentsReferred) {
    mediationDocuments.push(...claim.res1MediationDocumentsReferred);
  }
  if (claim.res1MediationNonAttendanceDocs) {
    mediationDocuments.push(...claim.res1MediationNonAttendanceDocs);
  }
  return mediationDocuments.length > 0 ? orderByDocumentUploadedDate(mediationDocuments) : mediationDocuments;
};

export const isMediationDocumentsReferred = (value: any): value is MediationDocumentsReferred => {
  return (value as MediationDocumentsReferred).documentType !== undefined;
};

export const isMediationNonAttendanceDocs = (value: any): value is MediationMediationNonAttendanceDocs => {
  return (value as MediationMediationNonAttendanceDocs).yourName !== undefined;
};
