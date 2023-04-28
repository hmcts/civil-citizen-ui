jest.mock('./src/main/modules/i18n/languageService.ts', () => ({
  getLanguage: jest.fn().mockReturnValue('en'),
  setLanguage: jest.fn(),
}));
