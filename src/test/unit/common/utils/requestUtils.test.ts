import {Request} from 'express';
import {queryParamNumber} from 'common/utils/requestUtils';

describe('requestUtils', () => {
  describe('queryParamNumber', () => {
    it('should return number when query param is present', () => {
      const req = {query: {page: '3'}} as unknown as Request;
      expect(queryParamNumber(req, 'page')).toEqual(3);
    });

    it('should parse decimal query values', () => {
      const req = {query: {amount: '12.5'}} as unknown as Request;
      expect(queryParamNumber(req, 'amount')).toEqual(12.5);
    });

    it('should return undefined when query param is missing', () => {
      const req = {query: {}} as unknown as Request;
      expect(queryParamNumber(req, 'page')).toBeUndefined();
    });

    it('should return undefined when query param is empty string', () => {
      const req = {query: {page: ''}} as unknown as Request;
      expect(queryParamNumber(req, 'page')).toBeUndefined();
    });
  });
});
