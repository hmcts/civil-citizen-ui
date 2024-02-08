import {Claim} from 'models/claim';
import {
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {CivilServiceClient} from 'client/civilServiceClient';
import {saveMediationUploadedDocuments} from 'services/features/mediation/uploadDocuments/mediationCheckAnswersService';
import {
  getNonAttendanceDocumentsCCD,
  getReferredDocumentCCD,
  getTypeOfDocuments,
  getYourStatement,
} from '../../../../../utils/mocks/Mediation/uploadFilesMediationMocks';
import {createCCDClaimForUploadedDocuments} from '../../../../../utils/caseProgression/mockCCDClaimForEvidenceUpload';
import {CaseEvent} from 'models/events/caseEvent';
import config from 'config';
import {mapperMediationDocumentToCCDDocuments} from 'models/mediation/uploadDocuments/mapperCaseDocumentToCCDDocuments';
import {
  MediationDocumentsReferred, MediationMediationNonAttendanceDocs,
  MediationUploadDocumentsCCD,
} from 'models/mediation/uploadDocuments/uploadDocumentsCCD';
import {v4 as uuidv4} from 'uuid';

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

      claim.res1MediationDocumentsReferred = getReferredDocumentCCD();
      claim.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD();
      //When
      await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

      //Then
      expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', claim);

    });
  });
});
