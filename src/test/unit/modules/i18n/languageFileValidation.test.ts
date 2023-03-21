const en = require('../../../../main/modules/i18n/locales/en.json');
const cy = require('../../../../main/modules/i18n/locales/cy.json');

const getTypedKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;

const getKeys = (obj: object, prefix = ''): string[] =>
  getTypedKeys(obj).reduce((res: string[], el) => {
    if(Array.isArray(obj[el])) {
      return res;
    } else if( typeof obj[el] === 'object' && obj[el] !== null ) {
      return [...res, ...getKeys(obj[el], prefix + el + '.')];
    }
    return [...res, prefix + el];
  }, []);

describe('Compare language file structure', () => {
  it('should have the same translation keys in both language files', () => {
    // Given the english and welsh language translation files
    // When all translation keys are extracted
    const allEnKeys = getKeys(en);
    const allCyKeys = getKeys(cy);

    // Then the same translation keys should appear in the same sections, in alphabetical order
    expect(allEnKeys.length).toEqual(allCyKeys.length);
    expect(allEnKeys).toEqual(allCyKeys);
  });
});
