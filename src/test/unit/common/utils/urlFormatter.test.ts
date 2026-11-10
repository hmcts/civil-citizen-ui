import {
  constructDocumentUrlWithIdParamsAndDocumentId,
  constructResponseUrlWithIdAndAppIdParams,
  constructResponseUrlWithIdParams,
  constructUrlWithIndex,
  constructUrlWithNotEligibleReason,
} from 'common/utils/urlFormatter';
import {NotEligibleReason} from 'common/form/models/eligibility/NotEligibleReason';

describe('urlFormatter', () => {
  describe('constructResponseUrlWithIdParams', () => {
    it('should replace :id with claim id', () => {
      expect(constructResponseUrlWithIdParams('123', '/case/:id/response')).toEqual('/case/123/response');
    });

    it('should replace uppercase :ID', () => {
      expect(constructResponseUrlWithIdParams('abc', '/case/:ID/details')).toEqual('/case/abc/details');
    });

    it('should use first array element when id is string array', () => {
      expect(constructResponseUrlWithIdParams(['first', 'second'], '/case/:id')).toEqual('/case/first');
    });

    it('should replace with empty string when id is undefined', () => {
      expect(constructResponseUrlWithIdParams(undefined, '/case/:id')).toEqual('/case/');
    });
  });

  describe('constructResponseUrlWithIdAndAppIdParams', () => {
    it('should replace :id and :appId', () => {
      expect(constructResponseUrlWithIdAndAppIdParams('1', '2', '/case/:id/app/:appId'))
        .toEqual('/case/1/app/2');
    });

    it('should normalize array params', () => {
      expect(constructResponseUrlWithIdAndAppIdParams(['cid'], ['aid'], '/:id/:appId'))
        .toEqual('/cid/aid');
    });
  });

  describe('constructDocumentUrlWithIdParamsAndDocumentId', () => {
    it('should replace :id and :documentId', () => {
      expect(constructDocumentUrlWithIdParamsAndDocumentId('99', 'doc-1', '/case/:id/documents/:documentId'))
        .toEqual('/case/99/documents/doc-1');
    });
  });

  describe('constructUrlWithNotEligibleReason', () => {
    it('should append reason query param', () => {
      expect(constructUrlWithNotEligibleReason('/eligibility/not-eligible', NotEligibleReason.UNDER_18_CLAIMANT))
        .toEqual('/eligibility/not-eligible?reason=under-18');
    });
  });

  describe('constructUrlWithIndex', () => {
    it('should append index query param', () => {
      expect(constructUrlWithIndex('/path', 3)).toEqual('/path?index=3');
    });

    it('should support zero index', () => {
      expect(constructUrlWithIndex('/path', 0)).toEqual('/path?index=0');
    });
  });
});
