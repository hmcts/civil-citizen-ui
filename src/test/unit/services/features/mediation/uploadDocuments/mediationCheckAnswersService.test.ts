import {Claim} from 'models/claim';
import {
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {CivilServiceClient} from 'client/civilServiceClient';
import {saveMediationUploadedDocuments} from 'services/features/mediation/uploadDocuments/mediationCheckAnswersService';
import {
  getNonAttendanceDocumentsCCD,
  getReferredDocumentCCD,
  getTypeOfDocuments, getTypeOfDocumentsWithReferredDocuments, getTypeOfDocumentsWithYourStatement,
} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';
import {CaseEvent} from 'models/events/caseEvent';
import config from 'config';

jest.mock('client/civilServiceClient');
jest.mock('uuid', () => ({ v4: () => '1221' }));

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const mockSubmitEvent = civilServiceClient.submitEvent as jest.Mock;
mockSubmitEvent.mockImplementation((eventName, claimId, updatedCcdClaim, req) => {
  return {eventName: eventName, claimId: claimId, updatedCcdClaim: updatedCcdClaim, req: req};
});
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

describe('Check answers service For Mediation', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('save Mediation Uploaded Documents method', () => {
    it('should save the document with both documents', async () => {
      //given
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockReturnValue(
          new Promise((resolve) => resolve(new Claim()),
          ),
        );
      jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

      const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

      const uploadDocuments = new UploadDocuments(getTypeOfDocuments());

      const claim = new Claim();

      claim.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD();
      claim.res1MediationDocumentsReferred = getReferredDocumentCCD();

      //When
      await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

      //Then
      expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
      expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', claim, null);

    });

    it('should save the document with res1MediationNonAttendance Documents', async () => {
      //given
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockReturnValue(
          new Promise((resolve) => resolve(new Claim()),
          ),
        );
      jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

      const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

      const uploadDocuments = new UploadDocuments(getTypeOfDocumentsWithYourStatement());

      const claim = new Claim();

      claim.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD();

      //When
      await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

      //Then
      expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
      expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', claim, null);

    });
  });

  it('should save the document with res1MediationDocumentsReferred Documents', async () => {
    //given
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockReturnValue(
        new Promise((resolve) => resolve(new Claim()),
        ),
      );
    jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

    const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

    const uploadDocuments = new UploadDocuments(getTypeOfDocumentsWithReferredDocuments());

    const claim = new Claim();

    claim.res1MediationDocumentsReferred = getReferredDocumentCCD();

    //When
    await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

    //Then
    expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
    expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', claim, null);

  });

  it('should add new documents on oldRes1MediationDocumentsReferred and oldRes1MediationNonAttendanceDocs', async () => {
    //given
    const oldClaimWithDocuments = new Claim();
    oldClaimWithDocuments.res1MediationDocumentsReferred = getReferredDocumentCCD();
    oldClaimWithDocuments.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD();
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockReturnValue(
        new Promise((resolve) => resolve(oldClaimWithDocuments),
        ),
      );
    jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

    const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

    const uploadDocuments = new UploadDocuments(getTypeOfDocuments());

    const expectedOldClaim = new Claim();
    const referredDocumentCCD = getReferredDocumentCCD();
    referredDocumentCCD.push(referredDocumentCCD[0]);
    const nonAttendanceDocumentsCCD = getNonAttendanceDocumentsCCD();
    nonAttendanceDocumentsCCD.push(nonAttendanceDocumentsCCD[0]);

    expectedOldClaim.res1MediationDocumentsReferred = referredDocumentCCD;
    expectedOldClaim.res1MediationNonAttendanceDocs = nonAttendanceDocumentsCCD;

    //When
    await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

    //Then
    expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
    expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', expectedOldClaim, null);

  });
});
