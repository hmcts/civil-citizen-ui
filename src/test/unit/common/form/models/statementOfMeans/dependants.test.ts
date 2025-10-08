import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';

describe('Dependants model', () => {
  describe('fromObject', () => {
    it('should map declared true and create number of children record', () => {
      const result = Dependants.fromObject('yes', '1', '2', '3');

      expect(result.declared).toBe(true);
      expect(result.numberOfChildren).toEqual(new NumberOfChildren(1, 2, 3));
    });

    it('should return declared false and undefined children when value is false', () => {
      const result = Dependants.fromObject('no', '1', '2', '3');

      expect(result.declared).toBe(false);
      expect(result.numberOfChildren).toBeUndefined();
    });

    it('should leave declared undefined when value is not boolean-like', () => {
      const result = Dependants.fromObject('perhaps', '1', '2', '3');

      expect(result.declared).toBeUndefined();
      expect(result.numberOfChildren).toBeUndefined();
    });
  });

  describe('hasChildrenBetween16and19', () => {
    it('should return true when number of children aged 16-19 is greater than zero', () => {
      const dependants = new Dependants(true, new NumberOfChildren(undefined, undefined, 1));

      expect(dependants.hasChildrenBetween16and19()).toBe(true);
    });

    it('should return false when there are no children aged 16-19', () => {
      const dependants = new Dependants(false);

      expect(dependants.hasChildrenBetween16and19()).toBe(false);
    });
  });
});
