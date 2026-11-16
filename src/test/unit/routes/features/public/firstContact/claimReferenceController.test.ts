import {NextFunction, Response} from 'express';
import {AppRequest, AppSession} from 'common/models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import claimReferenceController from 'routes/features/public/firstContact/claimReferenceController';
import {DASHBOARD_URL, FIRST_CONTACT_CLAIM_REFERENCE_URL, FIRST_CONTACT_PIN_URL} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {isDefendantLinked: jest.fn()};
  return {CivilServiceClient: jest.fn(() => methods)};
});

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {isDefendantLinked: jest.Mock};

const invoke = async (method: 'get' | 'post', req: Partial<AppRequest>) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  await getRouteHandler(claimReferenceController, method, FIRST_CONTACT_CLAIM_REFERENCE_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Respond to Claim - Claim Reference Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the claim reference view', async () => {
    const {res} = await invoke('get', {body: {}});

    expect(res.render).toHaveBeenCalledWith(
      'features/public/firstContact/claim-reference',
      expect.objectContaining({form: expect.anything()}),
    );
  });

  it('renders the form again when the claim number is blank', async () => {
    const {res, next} = await invoke('post', {body: {claimReferenceValue: ''}, session: {} as AppSession});

    expect(res.render).toHaveBeenCalledWith(
      'features/public/firstContact/claim-reference',
      expect.objectContaining({form: expect.objectContaining({hasErrors: expect.any(Function)})}),
    );
    const renderedForm = res.render.mock.calls[0][1].form;
    expect(renderedForm.hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(civilServiceMethods.isDefendantLinked).not.toHaveBeenCalled();
  });

  it('stores the claim number and redirects to the pin page when the case is not linked', async () => {
    civilServiceMethods.isDefendantLinked.mockResolvedValue(false);
    const session = {} as AppSession;

    const {res} = await invoke('post', {body: {claimReferenceValue: '123JE123'}, session});

    expect(res.redirect).toHaveBeenCalledWith(FIRST_CONTACT_PIN_URL);
    expect(session.firstContact?.claimReference).toBe('123JE123');
  });

  it('redirects to the dashboard when the defendant is already linked', async () => {
    civilServiceMethods.isDefendantLinked.mockResolvedValue(true);
    const session = {} as AppSession;

    const {res} = await invoke('post', {body: {claimReferenceValue: '123KA123'}, session});

    expect(res.redirect).toHaveBeenCalledWith(DASHBOARD_URL);
    expect(session.firstContact?.claimReference).toBe('123KA123');
  });

  it('calls next with the error when the link check fails', async () => {
    const error = new Error('civil service down');
    civilServiceMethods.isDefendantLinked.mockRejectedValue(error);

    const {next, res} = await invoke('post', {body: {claimReferenceValue: '123JE123'}, session: {} as AppSession});

    expect(next).toHaveBeenCalledWith(error);
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
