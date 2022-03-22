import dependantsService from '../../../../../main/modules/statementOfMeans/dependants/dependantsService';
import {Dependants} from '../../../../../main/common/form/models/statementOfMeans/dependants/dependants';

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
  });
  describe('Validation', () => {
    test('should not raise any error if declared is false and number of children unspecified', async () => {
      //Given
      const dependants: Dependants = {
        declared: false,
        numberOfChildren: undefined,
      };
      //When
      const form = dependantsService.validateDependants(dependants);
      //Then
      expect(form.errors).toHaveLength(0);
    });
    test('should raise error if declared is true and none of the age ranges is specified', async () => {
      //Given
      const dependants: Dependants = {
        declared: true,
        numberOfChildren: {
          under11: undefined,
          between11and15: undefined,
          between16and19: undefined,
        },
      };
      //When
      const form = dependantsService.validateDependants(dependants);
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].constraints).toBe('');
    });
    test('should raise no error if declared true and one age range is specified', async () => {
      //Given
      const dependants: Dependants = {
        declared: true,
        numberOfChildren: {
          under11: 1,
          between11and15: undefined,
          between16and19: undefined,
        },
      };
      //When
      const form = dependantsService.validateDependants(dependants);
      //Then
      expect(form.getErrors().length).toBe(0);
    });
  });
});
