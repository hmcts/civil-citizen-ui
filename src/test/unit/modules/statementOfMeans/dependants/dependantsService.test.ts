import dependantsService from '../../../../../main/modules/statementOfMeans/dependants/dependantsService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Dependants} from '../../../../../main/common/form/models/statementOfMeans/dependants/dependants';
import {NumberOfChildren} from '../../../../../main/common/form/models/statementOfMeans/dependants/numberOfChildren';
import {
  ENTER_AT_LEAST_ONE, INTEGER_REQUIRED,
  NON_NEGATIVE_NUMBER_REQUIRED,
} from '../../../../../main/common/form/validationErrors/errorMessageConstants';

const mockDraftResponse = require('../../../routes/features/response/statementOfMeans/civilClaimResponseMock.json');

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn(async () => {
        return JSON.stringify(mockDraftResponse);
      }),
      set: jest.fn(async () => {
        return;
      }),
    };
  });
});

jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseDataFromDraftStore = draftStoreService.getDraftClaimFromStore as jest.Mock;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

describe('Dependants service', () => {
  describe('Serialisation', () => {
    test('should set declared to true when Yes option is selected', async () => {
      //Given
      const declared = 'yes';
      //When
      const dependants = dependantsService.buildDependants(declared);
      //Then
      expect(dependants.declared).toBe(true);
    });
    test('should set declared to false when `No` option is selected', async () => {
      //Given
      const declared = 'no';
      //When
      const dependants = dependantsService.buildDependants(declared);
      //Then
      expect(dependants.declared).toBe(false);
    });
    test('should set declared to undefined when no option is selected', async () => {
      //Given
      const declared: unknown = null;
      //When
      const dependants = dependantsService.buildDependants(declared);
      //Then
      expect(dependants.declared).toBe(undefined);
    });
    test('should keep the form input values unchanged after validation', async () => {
      //Given
      const dependants = dependantsService.buildDependants('yes', '0', '0', '0');
      //Then
      expect(dependants.declared).toBe(true);
      expect(dependants.numberOfChildren?.under11).toBe(0);
      expect(dependants.numberOfChildren?.between11and15).toBe(0);
      expect(dependants.numberOfChildren?.between16and19).toBe(0);
    });
    test('should keep the form input values unchanged after validation', async () => {
      //Given
      const dependants = dependantsService.buildDependants('yes', '--', '-', '+');
      //Then
      expect(dependants.declared).toBe(true);
      expect(dependants.numberOfChildren?.under11).toBeUndefined();
      expect(dependants.numberOfChildren?.between11and15).toBeUndefined();
      expect(dependants.numberOfChildren?.between16and19).toBeUndefined();
    });
  });
  describe('Validation', () => {
    test('should not raise any error if declared is false and number of children unspecified', async () => {
      //Given
      const dependants = new Dependants(false, undefined);
      //When
      const form = dependantsService.validateDependants(dependants);
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    test('should raise an error if declared is true and none of the age ranges is specified', async () => {
      //Given
      const numberOfChildren = new NumberOfChildren(undefined, undefined, undefined);
      const dependants = new Dependants(true, numberOfChildren);
      //When
      const form = dependantsService.validateDependants(dependants);
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('numberOfChildren');
      expect(form.getErrors()[0].constraints).toEqual({AtLeastOneFieldIsPopulatedConstraint: ENTER_AT_LEAST_ONE});
    });
    test('should raise no error if declared true and one age range is specified', async () => {
      //Given
      const numberOfChildren = new NumberOfChildren(1, undefined, undefined);
      const dependants = new Dependants(true, numberOfChildren);
      //When
      const form = dependantsService.validateDependants(dependants);
      //Then
      expect(form.getErrors().length).toBe(0);
    });
    test('should raise an error if declared true and one age range has a negative value', async () => {
      //Given
      const numberOfChildren = new NumberOfChildren(-1, undefined, undefined);
      const dependants = new Dependants(true, numberOfChildren);
      //When
      const form = dependantsService.validateDependants(dependants);
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('numberOfChildren');
      expect(form.getErrors()[0].constraints).toBeUndefined();
      expect(form.getNestedErrors()[0].property).toBe('under11');
      expect(form.getNestedErrors()[0].constraints).toEqual({min: NON_NEGATIVE_NUMBER_REQUIRED});
    });
    test('should raise an error if declared true and one age range has a decimal value', async () => {
      //Given
      const numberOfChildren = new NumberOfChildren(undefined, 1.5, undefined);
      const dependants = new Dependants(true, numberOfChildren);
      //When
      const form = dependantsService.validateDependants(dependants);
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('numberOfChildren');
      expect(form.getErrors()[0].constraints).toBeUndefined();
      expect(form.getNestedErrors()[0].property).toBe('between11and15');
      expect(form.getNestedErrors()[0].constraints).toEqual({isInt: INTEGER_REQUIRED});
    });
    test('should raise 3 errors if declared true and 3 age ranges aren\'t valid', async () => {
      //Given
      const numberOfChildren = new NumberOfChildren(-1, 1.5, -2);
      const dependants = new Dependants(true, numberOfChildren);
      //When
      const form = dependantsService.validateDependants(dependants);
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].property).toBe('numberOfChildren');
      expect(form.getErrors()[0].constraints).toBeUndefined();
      expect(form.getNestedErrors().length).toBe(3);
      expect(form.getNestedErrors()[0].property).toBe('under11');
      expect(form.getNestedErrors()[0].constraints).toEqual({min: NON_NEGATIVE_NUMBER_REQUIRED});
      expect(form.getNestedErrors()[1].property).toBe('between11and15');
      expect(form.getNestedErrors()[1].constraints).toEqual({isInt: INTEGER_REQUIRED});
      expect(form.getNestedErrors()[2].property).toBe('between16and19');
      expect(form.getNestedErrors()[2].constraints).toEqual({min: NON_NEGATIVE_NUMBER_REQUIRED});
    });
  });
  describe('Exception Handling', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should throw error when retrieving data from draft store fails', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error('get from draft store error');
      });
      //When
      try {
        await dependantsService.getDependants('claimId');
      }
      //Then
      catch (error) {
        expect(error.message).toBe('get from draft store error');
      }
      expect.assertions(1);
    });

    test('should throw error when saving data to draft store fails', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        return mockDraftResponse;
      });
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error('save to draft store error');
      });
      //When
      try {
        await dependantsService.saveDependants('claimId', new Dependants());
      }
      //Then
      catch (error) {
        expect(error.message).toBe('save to draft store error');
      }
      expect.assertions(1);
    });
  });
});
