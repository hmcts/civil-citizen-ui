jest.mock('i18next-fs-backend', () => ({
  type: 'backend',
  init: jest.fn(),
  read: jest.fn((language, namespace, callback) => {
    callback(null, {}); // Return empty resources for simplicity
  }),
  create: jest.fn()
}));

const i18next = require('i18next');
const Backend = require('i18next-fs-backend');

beforeAll(() => {
  return i18next
    .use(Backend)
    .init({
      backend: {
        loadPath: '/modules/i18n/locales/{{lng}}/{{ns}}.json',
      },
      lng: 'en',
      fallbackLng: 'en',
      ns: ['common', 'specific'],
      defaultNS: 'common',
      preload: ['en', 'fr'], // Preload languages
      interpolation: {
        escapeValue: false
      }
    });
});
