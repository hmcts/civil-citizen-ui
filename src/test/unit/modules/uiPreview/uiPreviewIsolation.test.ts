import config from 'config';
import {assertUiPreviewServices} from 'modules/uiPreview/isolation';
import {AppInsights} from 'modules/appinsights';

jest.mock('applicationinsights', () => ({setup: jest.fn()}));
const insights = require('applicationinsights');
const initial = {...process.env};
afterEach(() => {process.env = {...initial}; jest.restoreAllMocks();});
describe('preview outbound service and telemetry policy', () => {
  it('fails closed on remote or independently configured service URLs', () => {
    process.env.NODE_ENV = 'e2eTest'; process.env.UI_PREVIEW_ENABLED = 'true';
    jest.spyOn(config, 'get').mockReturnValue('https://example.test');
    expect(() => assertUiPreviewServices()).toThrow('isolated local service');
  });
  it('accepts only the shared local stub endpoint for every service', () => {
    process.env.NODE_ENV = 'e2eTest'; process.env.UI_PREVIEW_ENABLED = 'true';
    const get = jest.spyOn(config, 'get').mockReturnValue('http://127.0.0.1:1111');
    expect(() => assertUiPreviewServices()).not.toThrow();
    get.mockImplementation(key => key === 'services.generalApplication.url' ? 'http://127.0.0.1:4550' : 'http://127.0.0.1:1111');
    expect(() => assertUiPreviewServices()).toThrow('generalApplication.url');
  });
  it('does not initialise Application Insights even with an inherited key in preview', () => {
    process.env.NODE_ENV = 'e2eTest'; process.env.UI_PREVIEW_ENABLED = 'true';
    const get = jest.spyOn(config, 'get').mockReturnValue('test-key');
    new AppInsights().enable(); expect(insights.setup).not.toHaveBeenCalled(); expect(get).not.toHaveBeenCalled();
  });
  it('does not validate or change ordinary production service configuration', () => {
    process.env.NODE_ENV = 'production'; process.env.UI_PREVIEW_ENABLED = 'true';
    const get = jest.spyOn(config, 'get'); assertUiPreviewServices(); expect(get).not.toHaveBeenCalled();
  });
});
