import {Response} from 'express';
import claimantClaimSummaryController from 'routes/features/dashboard/claimantClaimSummaryController';
import {DASHBOARD_CLAIMANT_URL, OLD_DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import * as urlFormatter from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

const invoke = async (claimId: string) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(claimantClaimSummaryController, 'get', OLD_DASHBOARD_CLAIMANT_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Claimant claim summary controller', () => {
  it.each(['draft', '1776415088475066'])('should redirect %s to the new claimant dashboard', async (claimId) => {
    const {res, next} = await invoke(claimId);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
  });

  it('should call next when url construction fails', async () => {
    const error = new Error('Mock redirect construction error');
    jest.spyOn(urlFormatter, 'constructResponseUrlWithIdParams').mockImplementationOnce(() => {
      throw error;
    });

    const {next} = await invoke('draft');

    expect(next).toHaveBeenCalledWith(error);
  });
});
