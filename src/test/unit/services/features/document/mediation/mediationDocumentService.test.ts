import {
  getNonAttendanceDocumentsCCD,
  getReferredDocumentCCD,
} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';
import {
  getClaimantMediationDocuments,
  getDefendantMediationDocuments,
  isMediationDocumentsReferred,
  isMediationNonAttendanceDocs,
  orderByDocumentUploadedDate,
} from 'services/features/document/mediation/mediationDocumentService';
import {Claim} from 'models/claim';

describe('Mediation Document Service', () => {

  it('should order By Date', async () => {
    //given
    const referredDocumentCCD = getReferredDocumentCCD('ClaimantOneMediationDocs')
      .concat(getNonAttendanceDocumentsCCD('ClaimantOneMediationDocs'));

    //When
    const result = orderByDocumentUploadedDate(referredDocumentCCD);
    //Then
    expect(result).toBe(result.reverse());
  });

  it('should get Claimant Mediation Documents', async () => {
    //given
    const updatedClaim = new Claim();
    updatedClaim.app1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD('ClaimantOneMediationDocs');
    updatedClaim.app1MediationDocumentsReferred = getReferredDocumentCCD('ClaimantOneMediationDocs');

    //When
    const result = getClaimantMediationDocuments(updatedClaim);
    //Then
    expect(result).toBe(result.reverse());

  });

  it('should get Defendant Mediation Documents', async () => {
    //given
    const updatedClaim = new Claim();
    updatedClaim.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD('ClaimantOneMediationDocs');
    updatedClaim.res1MediationDocumentsReferred = getReferredDocumentCCD('ClaimantOneMediationDocs');

    //When
    const result = getDefendantMediationDocuments(updatedClaim);
    //Then
    expect(result).toBe(result.reverse());

  });

  it('should get Claimant Mediation Documents with empty array', async () => {
    //given
    const updatedClaim = new Claim();

    //When
    const result = getClaimantMediationDocuments(updatedClaim);
    //Then
    expect(result).toStrictEqual([]);

  });

  it('should get Defendant Mediation Documents with empty array', async () => {
    //given
    const updatedClaim = new Claim();

    //When
    const result = getDefendantMediationDocuments(updatedClaim);
    //Then
    expect(result).toStrictEqual([]);

  });

  it('should check if is Referred document', async () => {
    //given
    const updatedClaim = new Claim();
    updatedClaim.res1MediationDocumentsReferred = getReferredDocumentCCD('ClaimantOneMediationDocs');

    //When
    const result = isMediationDocumentsReferred(updatedClaim.res1MediationDocumentsReferred[0].value);
    //Then
    expect(result).toBe(true);

  });

  it('should check if is NonAttendance Docs', async () => {
    //given
    const updatedClaim = new Claim();
    updatedClaim.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD('ClaimantOneMediationDocs');

    //When
    const result = isMediationNonAttendanceDocs(updatedClaim.res1MediationNonAttendanceDocs[0].value);
    //Then
    expect(result).toBe(true);

  });

});
