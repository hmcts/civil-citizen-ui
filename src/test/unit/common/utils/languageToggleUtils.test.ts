import {getLng} from '../../../../main/common/utils/languageToggleUtils';

describe('language tolggle utils', () => {
  describe('getLng', () => {
    it('should return language passed when parameter is defined', () => {
      //Given
      const langParam = 'cy';
      //When
      const language = getLng(langParam);
      //Then
      expect(language).toBe(langParam);
    });
    it('should return eng language when parameter is not defined', () => {
      //When
      const language = getLng(undefined);
      //Then
      expect(language).toBe('en');
    });
  });
});
