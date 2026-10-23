import {Bundle} from 'models/caseProgression/bundles/bundle';

describe('testing of Bundle class', () => {
  const fixedDate = new Date(2023, 3, 26);

  it('should return formatted dates when dates are set', () => {
    const bundle = new Bundle('title', undefined, fixedDate, fixedDate);
    expect(bundle.getFormattedCreatedOn).toBe('26 Apr 2023');
    expect(bundle.getFormattedHearingDate).toBe('26 Apr 2023');
  });

  it('should return undefined for formatted dates when dates are not set', () => {
    const bundle = new Bundle('title');
    expect(bundle.getFormattedCreatedOn).toBeUndefined();
    expect(bundle.getFormattedHearingDate).toBeUndefined();
  });

  it('should set dates to null when not provided', () => {
    const bundle = new Bundle('title');
    expect(bundle.createdOn).toBeNull();
    expect(bundle.bundleHearingDate).toBeNull();
  });
});
