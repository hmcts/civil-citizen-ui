import {request} from 'express';
import {getOtherWitnesses} from 'services/features/directionsQuestionnaire/otherWitnessesService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {OtherWitnesses} from 'common/models/directionsQuestionnaire/witnesses/otherWitnesses';
import {Claim} from 'common/models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import civilClaimResponseExpertAndWitnessMock from '../../../../utils/mocks/civilClaimResponseExpertAndWitnessMock.json';
import {Witnesses} from 'common/models/directionsQuestionnaire/witnesses/witnesses';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;

describe('Other witnesses service', () => {
  describe('Get other witnesses', () => {
    const req = request;
    req.params = {
      id: '12345',
    };
    it('should return other witnesses from draft store if present', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        return civilClaimResponseExpertAndWitnessMock.case_data;
      });
      //When
      const form = await getOtherWitnesses(req);
      //Then
      expect(form.witnessItems?.length).toBe(2);
      expect(form.option).toBe('');
      expect(form.witnessItems[0]?.firstName).toEqual('John');
      expect(form.witnessItems[0]?.lastName).toEqual('Doe');
      expect(form.witnessItems[1]?.firstName).toEqual('Jane');
      expect(form.witnessItems[1]?.lastName).toEqual('Smith');
    });
    it('should return new form when no data existing on draft store', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        const mockDetails = new OtherWitnesses(undefined, []);
        claim.directionQuestionnaire = {
          witnesses: {
            otherWitnesses: mockDetails,
          },
        };
        return claim;
      });
      //When
      const form = await getOtherWitnesses(req);
      //Then
      expect(form).toBeTruthy();
      expect(form.witnessItems?.length).toBe(0);
      expect(form.option).toBeUndefined();
      expect(form.witnessItems).toEqual([]);
    });
    it('should return new form when no otherWitnesses existing on draft store', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = {
          witnesses: {
            otherWitnesses: new OtherWitnesses(),
          },
        };
        return claim;
      });
      //When
      const form = await getOtherWitnesses(req);
      //Then
      expect(form).toBeTruthy();
      expect(form.option).toBeUndefined();
      expect(form.witnessItems).toBeUndefined();
    });
    it('should return new form when no witnesses existing on draft store', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.directionQuestionnaire = {
          witnesses: new Witnesses(),
        };
        return claim;
      });
      //When
      const form = await getOtherWitnesses(req);
      //Then
      expect(form).toBeTruthy();
      expect(form.option).toBeUndefined();
      expect(form.witnessItems).toBeUndefined();
    });
    it('should return new form when no directionQuestionnaire existing on draft store', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        return claim;
      });
      //When
      const form = await getOtherWitnesses(req);
      //Then
      expect(form).toBeTruthy();
      expect(form.option).toBeUndefined();
      expect(form.witnessItems).toBeUndefined();
    });
    it('should throw an error when error is thrown from draft store', async () => {
      //When
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getOtherWitnesses(req)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
