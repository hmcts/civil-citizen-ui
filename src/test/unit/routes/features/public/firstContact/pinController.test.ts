import {NextFunction, Response} from 'express';
import {AppRequest, AppSession} from 'common/models/AppRequest';
import {Claim} from 'models/claim';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CivilServiceClient} from 'client/civilServiceClient';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import pinController from 'routes/features/public/firstContact/pinController';
import {
  FIRST_CONTACT_ACCESS_DENIED_URL,
  FIRST_CONTACT_CLAIM_SUMMARY_URL,
  FIRST_CONTACT_PIN_URL,
} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    verifyPin: jest.fn(),
    verifyOcmcPin: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});

jest.mock('modules/draft-store/draftStoreService', () => ({
  saveDraftClaim: jest.fn(),
}));

const mockSaveDraftClaim = saveDraftClaim as jest.Mock;
const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  verifyPin: jest.Mock;
  verifyOcmcPin: jest.Mock;
};

const invoke = async (method: 'get' | 'post', req: Partial<AppRequest>) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  await getRouteHandler(pinController, method, FIRST_CONTACT_PIN_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

const claimReferenceSession = (claimReference: string): AppSession => ({firstContact: {claimReference}} as AppSession);

describe('Respond to Claim - Pin Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the pin view', async () => {
    const {res} = await invoke('get', {body: {}});

    expect(res.render).toHaveBeenCalledWith(
      'features/public/firstContact/pin',
      expect.objectContaining({form: expect.anything()}),
    );
  });

  it('renders an error when the pin is empty', async () => {
    const {res, next} = await invoke('post', {body: {pin: ''}, session: claimReferenceSession('000JE000')});

    const renderedForm = res.render.mock.calls[0][1].form;
    expect(renderedForm.hasErrors()).toBe(true);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(civilServiceMethods.verifyPin).not.toHaveBeenCalled();
  });

  it('saves the claim and redirects to the claim summary when the pin matches', async () => {
    const claim = new Claim();
    claim.id = '1662129391355637';
    civilServiceMethods.verifyPin.mockResolvedValue(claim);
    const session = claimReferenceSession('000JE000');

    const {res} = await invoke('post', {body: {pin: '000033331111'}, session});

    expect(civilServiceMethods.verifyPin).toHaveBeenCalled();
    expect(mockSaveDraftClaim).toHaveBeenCalledWith(claim.id, claim, true);
    expect(res.redirect).toHaveBeenCalledWith(FIRST_CONTACT_CLAIM_SUMMARY_URL);
    expect(session.firstContact?.claimId).toBe(claim.id);
    expect(session.firstContact?.pin).toEqual(expect.any(String));
  });

  it('renders the legal-representative message and does not save the claim', async () => {
    const claim = new Claim();
    claim.respondent1Represented = YesNoUpperCamelCase.YES;
    civilServiceMethods.verifyPin.mockResolvedValue(claim);

    const {res} = await invoke('post', {body: {pin: '000033331111'}, session: claimReferenceSession('000JE000')});

    expect(res.render).toHaveBeenCalledWith(
      'features/public/firstContact/pin',
      expect.objectContaining({form: expect.objectContaining({isLRDefendant: true})}),
    );
    expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('redirects to the OCMC url when the pin is 8 characters', async () => {
    civilServiceMethods.verifyOcmcPin.mockResolvedValue('https://ocmc.example/next');

    const {res} = await invoke('post', {body: {pin: '00000001'}, session: claimReferenceSession('000JE000')});

    expect(civilServiceMethods.verifyOcmcPin).toHaveBeenCalledWith('00000001', '000JE000');
    expect(res.redirect).toHaveBeenCalledWith('https://ocmc.example/next');
    expect(civilServiceMethods.verifyPin).not.toHaveBeenCalled();
  });

  it('redirects to access denied when verification is unauthorised', async () => {
    civilServiceMethods.verifyPin.mockRejectedValue(new Error('Request failed with status code 401'));

    const {res, next} = await invoke('post', {body: {pin: '1234'}, session: claimReferenceSession('000JE000')});

    expect(res.redirect).toHaveBeenCalledWith(FIRST_CONTACT_ACCESS_DENIED_URL);
    expect(next).not.toHaveBeenCalled();
  });

  it('renders an error when verification returns 400', async () => {
    civilServiceMethods.verifyPin.mockRejectedValue(new Error('Request failed with status code 400'));

    const {res, next} = await invoke('post', {body: {pin: '1111'}, session: claimReferenceSession('111JE111')});

    expect(res.render).toHaveBeenCalled();
    expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next with any other verification error', async () => {
    const error = new Error('Request failed with status code 500');
    civilServiceMethods.verifyPin.mockRejectedValue(error);

    const {next} = await invoke('post', {body: {pin: 'error'}, session: claimReferenceSession('error')});

    expect(next).toHaveBeenCalledWith(error);
  });
});
