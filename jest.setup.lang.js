jest.mock('./src/main/modules/i18n/languageService', () => ({
  getLanguage: jest.fn(() => 'en'),
  setLanguage: jest.fn(),
}));
