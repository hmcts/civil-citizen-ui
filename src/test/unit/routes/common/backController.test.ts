import {NextFunction, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import backController from 'routes/common/backController';
import {BACK_URL, ROOT_URL} from 'routes/urls';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../utils/getRouteHandler';

const invoke = async (history: string[]) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {
    session: createMockSession({history}),
  };
  await getRouteHandler(backController, 'get', BACK_URL)(
    req as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return res;
};

describe('Back controller ', () => {
  describe('on GET', () => {
    it('should redirect to / when history is empty', async () => {
      const res = await invoke([]);

      expect(res.redirect).toHaveBeenCalledWith(ROOT_URL);
    });

    it('should redirect to preview screen', async () => {
      const res = await invoke(['screen1', 'screen2']);

      expect(res.redirect).toHaveBeenCalledWith('screen1');
    });

    it('should redirect to / when has just one screen', async () => {
      const res = await invoke(['screen1']);

      expect(res.redirect).toHaveBeenCalledWith(ROOT_URL);
    });
  });
});
