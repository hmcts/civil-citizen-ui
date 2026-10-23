import {GenericForm} from 'common/form/models/genericForm';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';

describe('NumberOfChildren', () => {
  describe('constructor', () => {
    it('should assign age band counts', () => {
      const children = new NumberOfChildren(1, 2, 3);

      expect(children.under11).toBe(1);
      expect(children.between11and15).toBe(2);
      expect(children.between16and19).toBe(3);
    });
  });

  describe('fromObject', () => {
    it('should convert string values to numbers', () => {
      expect(NumberOfChildren.fromObject('1', '2', '3')).toEqual(new NumberOfChildren(1, 2, 3));
    });

    it('should convert blank values to undefined', () => {
      expect(NumberOfChildren.fromObject('', undefined, 'abc')).toEqual(
        new NumberOfChildren(undefined, undefined, undefined),
      );
    });
  });

  describe('totalNumberOfChildren', () => {
    it('should sum only integer age bands', () => {
      expect(new NumberOfChildren(1, 2, 3).totalNumberOfChildren()).toBe(6);
      expect(new NumberOfChildren(1, undefined, 2).totalNumberOfChildren()).toBe(3);
      expect(new NumberOfChildren().totalNumberOfChildren()).toBe(0);
      expect(new NumberOfChildren(1.5 as never, 2, 3).totalNumberOfChildren()).toBe(5);
    });
  });

  describe('validation', () => {
    it('should pass for valid integers', async () => {
      const form = new GenericForm(new NumberOfChildren(0, 1, 2));

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });

    it('should reject negative values', async () => {
      const form = new GenericForm(new NumberOfChildren(-1, -2, -3));

      await form.validate();

      expect(form.errorFor('under11')).toBe('ERRORS.VALID_POSITIVE_NUMBER');
      expect(form.errorFor('between11and15')).toBe('ERRORS.VALID_POSITIVE_NUMBER');
      expect(form.errorFor('between16and19')).toBe('ERRORS.VALID_POSITIVE_NUMBER');
    });

    it('should reject non-integer values', async () => {
      const form = new GenericForm(new NumberOfChildren(1.5 as never, 2.2 as never, 3.3 as never));

      await form.validate();

      expect(form.errorFor('under11')).toBe('ERRORS.VALID_INTEGER');
      expect(form.errorFor('between11and15')).toBe('ERRORS.VALID_INTEGER');
      expect(form.errorFor('between16and19')).toBe('ERRORS.VALID_INTEGER');
    });

    it('should skip validation when values are undefined', async () => {
      const form = new GenericForm(new NumberOfChildren());

      await form.validate();

      expect(form.hasErrors()).toBeFalsy();
    });
  });
});
