import * as externalURLs from 'common/utils/externalURLs';

describe('externalURLs', () => {
  it('should export https URLs for all known constants', () => {
    const entries = Object.entries(externalURLs);

    expect(entries.length).toBeGreaterThan(0);
    for (const [name, value] of entries) {
      expect(typeof value).toBe('string');
      expect(value.startsWith('https://')).toBe(true);
      expect(value.length).toBeGreaterThan('https://'.length);
      expect(name).toBeTruthy();
    }
  });

  it('should include expected key URLs', () => {
    expect(externalURLs.legacyServiceUrl).toBe('https://www.moneyclaim.gov.uk/web/mcol/welcome');
    expect(externalURLs.feesHelpUrl).toBe('https://www.gov.uk/get-help-with-court-fees');
    expect(externalURLs.findLegalAdviceUrl).toBe('https://www.gov.uk/find-legal-advice');
    expect(externalURLs.interpreterUrl).toBe('https://www.gov.uk/get-interpreter-at-court-or-tribunal');
  });
});
