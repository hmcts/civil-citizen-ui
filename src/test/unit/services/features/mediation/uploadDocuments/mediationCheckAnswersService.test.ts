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
import {CaseRole} from 'form/models/caseRoles';

jest.mock('client/civilServiceClient');
jest.mock('uuid', () => ({ v4: () => '1221' }));
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const mockSubmitEvent = civilServiceClient.submitEvent as jest.Mock;
mockSubmitEvent.mockImplementation((eventName, claimId, updatedCcdClaim, req) => {
  return {eventName: eventName, claimId: claimId, updatedCcdClaim: updatedCcdClaim, req: req};
});

const CLAIMANT_ONE_MEDIATION_DOCS = 'ClaimantOneMediationDocs';
const DEFENDANT_ONE_MEDIATION_DOCS = 'DefendantOneMediationDocs';

const createRespondentOneClaim = () => {
  const claimRespondentOne = new Claim();
  claimRespondentOne.caseRole = CaseRole.RESPONDENTSOLICITORONE;
  return claimRespondentOne;
};

const createClaimantOneClaim = () => {
  const claimRespondentOne = new Claim();
  claimRespondentOne.caseRole = CaseRole.APPLICANTSOLICITORONE;
  return claimRespondentOne;
};

describe('Check answers service For Mediation', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('save Mediation Uploaded Documents method', () => {
    describe('save Mediation Uploaded Documents method for claimant one', () => {
      it('should save the document with both documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createClaimantOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocuments());

        const updatedClaim = new Claim();
        updatedClaim.app1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        updatedClaim.app1MediationDocumentsReferred = getReferredDocumentCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should save the document with app1MediationNonAttendance Documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createClaimantOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocumentsWithYourStatement());

        const updatedClaim = new Claim();
        updatedClaim.app1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should save the document with app1MediationDocumentsReferred Documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createClaimantOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocumentsWithReferredDocuments());

        const updatedClaim = new Claim();
        updatedClaim.app1MediationDocumentsReferred = getReferredDocumentCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should add new documents on oldApp1MediationDocumentsReferred and oldApp1MediationNonAttendanceDocs', async () => {
        //given
        const oldClaimWithDocuments = createClaimantOneClaim();
        oldClaimWithDocuments.app1MediationDocumentsReferred = getReferredDocumentCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        oldClaimWithDocuments.app1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(CLAIMANT_ONE_MEDIATION_DOCS);
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
        const referredDocumentCCD = getReferredDocumentCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        referredDocumentCCD.push(referredDocumentCCD[0]);
        const nonAttendanceDocumentsCCD = getNonAttendanceDocumentsCCD(CLAIMANT_ONE_MEDIATION_DOCS);
        nonAttendanceDocumentsCCD.push(nonAttendanceDocumentsCCD[0]);

        expectedOldClaim.app1MediationDocumentsReferred = referredDocumentCCD;
        expectedOldClaim.app1MediationNonAttendanceDocs = nonAttendanceDocumentsCCD;
        delete expectedOldClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', expectedOldClaim, null);

      });

    });

    describe('save Mediation Uploaded Documents method for respondent one', () => {
      it('should save the document with both documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createRespondentOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocuments());

        const updatedClaim = new Claim();
        updatedClaim.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        updatedClaim.res1MediationDocumentsReferred = getReferredDocumentCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should save the document with res1MediationNonAttendance Documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createRespondentOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocumentsWithYourStatement());

        const updatedClaim = new Claim();
        updatedClaim.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should save the document with res1MediationDocumentsReferred Documents', async () => {
        //given
        jest
          .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
          .mockReturnValue(
            new Promise((resolve) => resolve(createRespondentOneClaim()),
            ),
          );
        jest.useFakeTimers().setSystemTime(new Date('2022-12-12T00:00:00.000Z'));

        const mockSubmitEvent = jest.spyOn(CivilServiceClient.prototype, 'submitEvent');

        const uploadDocuments = new UploadDocuments(getTypeOfDocumentsWithReferredDocuments());

        const updatedClaim = new Claim();
        updatedClaim.res1MediationDocumentsReferred = getReferredDocumentCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        delete updatedClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', updatedClaim, null);

      });

      it('should add new documents on oldRes1MediationDocumentsReferred and oldRes1MediationNonAttendanceDocs', async () => {
        //given
        const oldClaimWithDocuments = createRespondentOneClaim();
        oldClaimWithDocuments.res1MediationDocumentsReferred = getReferredDocumentCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        oldClaimWithDocuments.res1MediationNonAttendanceDocs = getNonAttendanceDocumentsCCD(DEFENDANT_ONE_MEDIATION_DOCS);
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
        const referredDocumentCCD = getReferredDocumentCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        referredDocumentCCD.push(referredDocumentCCD[0]);
        const nonAttendanceDocumentsCCD = getNonAttendanceDocumentsCCD(DEFENDANT_ONE_MEDIATION_DOCS);
        nonAttendanceDocumentsCCD.push(nonAttendanceDocumentsCCD[0]);

        expectedOldClaim.res1MediationDocumentsReferred = referredDocumentCCD;
        expectedOldClaim.res1MediationNonAttendanceDocs = nonAttendanceDocumentsCCD;
        delete expectedOldClaim.refreshDataForDJ;
        //When
        await saveMediationUploadedDocuments('1111', uploadDocuments,  null);

        //Then
        expect(mockSubmitEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmitEvent).toHaveBeenCalledWith(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, '1111', expectedOldClaim, null);

      });
    });
  });
});
