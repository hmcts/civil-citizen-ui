import {Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {GaTrackHistory} from 'routes/guards/GaTrackHistory';
import {BACK_URL} from 'routes/urls';

describe('GaTrackHistory', () => {
  const upload = '/case/123/general-application/upload-documents';
  const res = {} as Response;
  const next = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it.each([undefined, '', BACK_URL])('does not record %s', async originalUrl => {
    const req = {originalUrl, session: {history: [upload]}} as AppRequest;
    await GaTrackHistory(req, res, next);

    expect(req.session.history).toEqual([upload]);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it.each([{history: undefined}, {history: [] as string[]}])('initializes history while preserving the first query string (%j)', async ({history}) => {
    const req = {originalUrl: `${upload}?file=1`, session: {history}} as AppRequest;
    await GaTrackHistory(req, res, next);

    expect(req.session.history).toEqual([`${upload}?file=1`]);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it.each([upload, `${upload}?file=1`, `${upload}?file=2`])('does not duplicate the current path for %s', async originalUrl => {
    const req = {originalUrl, session: {history: [`${upload}?file=1`]}} as AppRequest;
    await GaTrackHistory(req, res, next);

    expect(req.session.history).toEqual([`${upload}?file=1`]);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('records a different path and allows returning to an earlier path', async () => {
    const req = {originalUrl: `${upload}?file=2`, session: {history: [upload, '/next-page']}} as AppRequest;
    await GaTrackHistory(req, res, next);

    expect(req.session.history).toEqual([upload, '/next-page', `${upload}?file=2`]);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('forwards a session access failure once', async () => {
    const error = new Error('session unavailable');
    const req = {originalUrl: upload, get session() {throw error;}} as unknown as AppRequest;
    await GaTrackHistory(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });
});
