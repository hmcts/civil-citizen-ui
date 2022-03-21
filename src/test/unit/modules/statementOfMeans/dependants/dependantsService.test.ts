import dependantsService from '../../../../../main/modules/statementOfMeans/dependants/dependantsService';
import {Dependants} from '../../../../../main/common/form/models/statementOfMeans/dependants/dependants';


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
    test('should raise error if declared is not true or false', async () => {
      //Given
      const dependants: Dependants = {
        declared: undefined,
      };
      //When
      const form = dependantsService.validateDependants(dependants);
      //Then
      expect(form.getErrors().length).toBe(1);
      expect(form.getErrors()[0].constraints).toBe('');
    });
  });
});
