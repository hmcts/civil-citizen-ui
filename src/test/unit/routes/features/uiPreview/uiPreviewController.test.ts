import {Request, Response} from 'express';
import controller from 'routes/features/uiPreview/uiPreviewController';
import {getUiPreviewPageCatalog, PreviewPageGroup} from 'services/features/uiPreview/pageCatalog';
import {getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/uiPreview/pageCatalog');

const getCatalogue = jest.mocked(getUiPreviewPageCatalog);
const response = (uiPreviewReady?: Promise<void>) => ({
  app: {locals: {uiPreviewReady}},
  status: jest.fn().mockReturnThis(),
  end: jest.fn(),
  setHeader: jest.fn(),
  render: jest.fn(),
});

describe('UI preview catalogue controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.replaceProperty(process, 'env', {...process.env, NODE_ENV: 'e2eTest', UI_PREVIEW_ENABLED: 'true'});
  });
  afterEach(() => jest.restoreAllMocks());

  it('ends the request without building or rendering a catalogue when preview is disabled', async () => {
    process.env.NODE_ENV = 'production';
    const res = response();
    const next = jest.fn();
    await getRouteHandler(controller, 'get', '/ui-preview')({} as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.end).toHaveBeenCalledTimes(1);
    expect(res.setHeader).not.toHaveBeenCalled();
    expect(res.render).not.toHaveBeenCalled();
    expect(getCatalogue).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it.each(['/ui-preview', '/ui-preview/'])('waits for fixtures before rendering %s', async path => {
    let finishSeeding!: () => void;
    const res = response(new Promise<void>(resolve => { finishSeeding = resolve; }));
    const catalog: PreviewPageGroup[] = [{title: 'Claims', description: 'Claim journeys', pages: []}];
    getCatalogue.mockReturnValue(catalog);
    const next = jest.fn();
    const request = getRouteHandler(controller, 'get', path)({} as Request, res as unknown as Response, next);
    expect(getCatalogue).not.toHaveBeenCalled();
    expect(res.render).not.toHaveBeenCalled();

    finishSeeding();
    await request;
    expect(res.setHeader).toHaveBeenCalledWith('X-UI-Preview', 'synthetic-local-only');
    expect(res.render).toHaveBeenCalledWith('features/ui-preview/index', {pageTitle: 'UI preview', catalog});
    expect(next).not.toHaveBeenCalled();
  });

  it('passes the fixture failure to Express without serving a partially seeded catalogue', async () => {
    const failure = new Error('fixture write failed');
    const res = response(Promise.reject(failure));
    const next = jest.fn();
    await getRouteHandler(controller, 'get', '/ui-preview')({} as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(failure);
    expect(res.setHeader).not.toHaveBeenCalled();
    expect(getCatalogue).not.toHaveBeenCalled();
    expect(res.render).not.toHaveBeenCalled();
  });
});
