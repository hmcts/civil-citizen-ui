import {ValidationError} from 'class-validator';
import {GenericForm} from 'form/models/genericForm';

const buildError = (property: string, message?: string, children?: ValidationError[]): ValidationError => {
  const error = new ValidationError();
  error.property = property;
  error.constraints = message ? {isDefined: message} : undefined;
  error.children = children;
  return error;
};

describe('GenericForm', () => {
  describe('when errors are undefined', () => {
    const form = new GenericForm({});

    it('should return false for hasErrors', () => {
      expect(form.hasErrors()).toBe(false);
    });

    it('should return false for hasNestedErrors', () => {
      expect(form.hasNestedErrors()).toBe(false);
    });

    it('should return an empty array for getErrors', () => {
      expect(form.getErrors()).toEqual([]);
    });

    it('should return an empty array for getNestedErrors', () => {
      expect(form.getNestedErrors()).toEqual([]);
    });

    it('should return undefined for errorFor', () => {
      expect(form.errorFor('field')).toBeUndefined();
    });
  });

  describe('when errors have no children', () => {
    const form = new GenericForm({}, [buildError('field', 'ERRORS.FIELD_REQUIRED', undefined)]);

    it('should return true for hasErrors', () => {
      expect(form.hasErrors()).toBe(true);
    });

    it('should return false for hasNestedErrors', () => {
      expect(form.hasNestedErrors()).toBe(false);
    });

    it('should return an empty array for getNestedErrors', () => {
      expect(form.getNestedErrors()).toEqual([]);
    });

    it('should return false for hasNestedFieldError', () => {
      expect(form.hasNestedFieldError('field')).toBe(false);
    });

    it('should return the error message for errorFor', () => {
      expect(form.errorFor('field')).toBe('ERRORS.FIELD_REQUIRED');
    });

    it('should return undefined for errorFor on a field without an error', () => {
      expect(form.errorFor('otherField')).toBeUndefined();
    });
  });

  describe('when errors have nested children', () => {
    const grandChild = buildError('day', 'ERRORS.VALID_DAY', undefined);
    const child = buildError('0', undefined, [grandChild]);
    const leafChild = buildError('1', 'ERRORS.VALID_DATE', undefined);
    const form = new GenericForm({}, [buildError('items', undefined, [child, leafChild])]);

    it('should return true for hasNestedErrors', () => {
      expect(form.hasNestedErrors()).toBe(true);
    });

    it('should return child and grandchild errors for getNestedErrors', () => {
      const properties = form.getNestedErrors().map(error => error.property);
      expect(properties).toEqual(['items[0]', 'items[0][day]', 'items[1]']);
    });

    it('should prefix nested errors with the parent property when provided', () => {
      const properties = form.getNestedErrors('parent').map(error => error.property);
      expect(properties).toEqual(['parent[items][0]', 'parent[items][0][day]', 'parent[items][1]']);
    });

    it('should return true for hasNestedFieldError on a nested field', () => {
      expect(form.hasNestedFieldError('items[0][day]')).toBe(true);
    });

    it('should return the nested error message for errorFor', () => {
      expect(form.errorFor('items[0][day]')).toBe('ERRORS.VALID_DAY');
    });
  });
});
