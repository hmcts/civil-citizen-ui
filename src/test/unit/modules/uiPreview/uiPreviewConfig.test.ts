import {isUiPreviewEnabled, uiPreviewHost} from 'common/utils/uiPreviewConfig';
import {uiPreviewBoundary} from 'modules/uiPreview/boundary';

describe('explicit local preview policy', () => {
  const original = {...process.env};
  afterEach(() => {process.env = {...original};});
  it.each(['e2eTest', 'development', 'test', 'production', 'unknown', undefined].flatMap(NODE_ENV =>
    ['true', 'false', '', 'TRUE', '1', ' true', undefined].map(UI_PREVIEW_ENABLED => ({NODE_ENV, UI_PREVIEW_ENABLED}))))(
    'requires exact e2eTest/true: %j', environment => {
      expect(isUiPreviewEnabled(environment)).toBe(environment.NODE_ENV === 'e2eTest' && environment.UI_PREVIEW_ENABLED === 'true');
    });
  it('uses loopback on a host and explicit internal container binding only in preview', () => {
    expect(uiPreviewHost({NODE_ENV: 'e2eTest', UI_PREVIEW_ENABLED: 'true'})).toBe('127.0.0.1');
    expect(uiPreviewHost({NODE_ENV: 'e2eTest', UI_PREVIEW_ENABLED: 'true', UI_PREVIEW_CONTAINER: 'true'})).toBe('0.0.0.0');
    expect(() => uiPreviewHost({NODE_ENV: 'production', UI_PREVIEW_ENABLED: 'true'})).toThrow('disabled');
  });
  it.each(['/ui-preview', '/ui-preview/'])('returns an unrendered disabled 404 at %s', path => {
    process.env.NODE_ENV = 'production'; process.env.UI_PREVIEW_ENABLED = 'true';
    const res = {status: jest.fn().mockReturnThis(), type: jest.fn().mockReturnThis(), send: jest.fn()}; const next = jest.fn();
    uiPreviewBoundary({path, method: 'GET'} as never, res as never, next);
    expect(res.status).toHaveBeenCalledWith(404); expect(res.send).toHaveBeenCalledWith('Not found'); expect(next).not.toHaveBeenCalled();
  });
  it.each(['/ui-preview-other', '/ui-preview/nested', '/%75i-preview', '/UI-PREVIEW'])('gives no special treatment to %s', path => {
    const next = jest.fn(); uiPreviewBoundary({path, method: 'GET'} as never, {} as never, next); expect(next).toHaveBeenCalledTimes(1);
  });
});
