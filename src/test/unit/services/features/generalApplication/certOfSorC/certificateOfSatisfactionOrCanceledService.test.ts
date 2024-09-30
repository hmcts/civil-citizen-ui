import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  getCertificateOfSatisfactionOrCanceled, saveCertificateOfSatisfactionOrCanceled,
} from 'services/features/generalApplication/certOfSorC/certificateOfSatisfactionOrCanceledService';
import {Request} from 'express';
import {CertificateOfSatisfactionOrCanceled} from 'models/generalApplication/CertificateOfSatisfactionOrCanceled';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import {getClaimById} from 'modules/utilityService';
import {GenericForm} from 'form/models/genericForm';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('modules/utilityService');
jest.mock('modules/draft-store/draftStoreService');

const mockGetClaimByID = getClaimById as jest.Mock;

const mockReq = {
  params: { id: '123' },
} as unknown as Request;

const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication();
mockClaim.generalApplication.certificateOfSatisfactionOrCanceled = new CertificateOfSatisfactionOrCanceled();

const mockDefendantFinalPaymentDate = new DefendantFinalPaymentDate('2024', '01', '01');

describe('Certification of satisfaction or Canceled service', () => {
  describe('get Certificate of satisfaction', () => {
    it('should return an empty model', async () => {
      //Given
      mockGetClaimByID.mockReturnValue(new Claim());
      //When
      const result = await getCertificateOfSatisfactionOrCanceled(mockReq);
      //Then
      expect(result).toEqual(new CertificateOfSatisfactionOrCanceled());
    });

    it('should return CertificateOfSatisfactionOrCanceled model with value', async () => {
      //Given
      mockClaim.generalApplication.certificateOfSatisfactionOrCanceled.defendantFinalPaymentDate = mockDefendantFinalPaymentDate;
      const expectedResult = new CertificateOfSatisfactionOrCanceled();
      expectedResult.defendantFinalPaymentDate = mockDefendantFinalPaymentDate;
      mockGetClaimByID.mockReturnValue(mockClaim);

      //When
      const result = await getCertificateOfSatisfactionOrCanceled(mockReq);
      //Then
      expect(result).toEqual(expectedResult);
    });

    it('should thrown an error', async () => {
      //Given
      mockGetClaimByID.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getCertificateOfSatisfactionOrCanceled(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

  });

  describe('save CertificateOfSatisfactionOrCanceled data', () => {
    it('should save data successfully when CertificateOfSatisfactionOrCanceled exist', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockForm = new GenericForm(mockDefendantFinalPaymentDate);
      mockClaim.generalApplication.certificateOfSatisfactionOrCanceled.defendantFinalPaymentDate = mockDefendantFinalPaymentDate;
      mockGetClaimByID.mockReturnValue(mockClaim);
      //When
      await saveCertificateOfSatisfactionOrCanceled(mockReq, mockForm.model, 'defendantFinalPaymentDate');
      //Then
      expect(spySave).toHaveBeenCalledWith(undefined, mockClaim);

    });

    it('should save data successfully when generalApplication no exists', async () => {
      //Given
      const expectedResult = mockClaim;
      expectedResult.generalApplication.certificateOfSatisfactionOrCanceled.defendantFinalPaymentDate = mockDefendantFinalPaymentDate;
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockForm = new GenericForm(mockDefendantFinalPaymentDate);
      mockGetClaimByID.mockReturnValue(new Claim());

      //When
      await saveCertificateOfSatisfactionOrCanceled(mockReq, mockForm.model, 'defendantFinalPaymentDate');
      //Then
      expect(spySave).toHaveBeenCalledWith(undefined, expectedResult);

    });

    it('should thrown an error', async () => {
      //Given
      mockGetClaimByID.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveCertificateOfSatisfactionOrCanceled(mockReq, mockDefendantFinalPaymentDate, 'defendantFinalPaymentDate')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

  });
});

