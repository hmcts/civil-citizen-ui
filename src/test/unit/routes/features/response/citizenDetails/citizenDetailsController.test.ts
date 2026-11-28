import {Response} from 'express';
import citizenDetailsController from 'routes/features/response/citizenDetails/citizenDetailsController';
import {CITIZEN_DETAILS_URL, CITIZEN_PHONE_NUMBER_URL, DOB_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {saveDefendantPropertyToResponseDraft} from 'services/features/common/defendantDetailsService';
import {saveTelephoneToResponseDraft} from 'services/features/claim/yourDetails/phoneService';
import {getResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {isCarmEnabledForCase} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyPhone} from 'models/PartyPhone';
import {lookupByPostcodeAndDataSet} from 'modules/ordnance-survey-key/ordnanceSurveyKeyService';
import {buildAddress} from '../../../../../utils/mockClaim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/common/defendantDetailsService');
jest.mock('services/features/claim/yourDetails/phoneService');
jest.mock('modules/draft-store/response/responseDraftStoreService');
jest.mock('modules/ordnance-survey-key/ordnanceSurveyKeyService');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isCarmEnabledForCase: jest.fn(),
}));

const claimId = '12345';
const individualView = 'features/response/citizenDetails/citizen-details';
const companyView = 'features/response/citizenDetails/citizen-details-company';

const validAddress = {
  addressLine1: ['Flat 3A Middle Road', 'Flat 3A Middle Road'],
  addressLine2: ['', ''],
  addressLine3: ['', ''],
  city: ['London', 'London'],
  postCode: ['SW1H 9AJ', 'SW1H 9AJ'],
  postToThisAddress: 'no',
};

const respondent = (type?: PartyType, phone?: PartyPhone): Party => {
  const party = new Party();
  party.type = type;
  party.partyDetails = new PartyDetails({});
  party.partyDetails.title = 'title';
  party.partyDetails.firstName = 'firstName';
  party.partyDetails.lastName = 'lastName';
  party.partyDetails.primaryAddress = buildAddress();
  party.partyDetails.correspondenceAddress = buildAddress();
  party.partyPhone = phone;
  return party;
};

const mockDraftWithRespondent = (party: Party = new Party()) => {
  const claim = new Claim();
  claim.submittedDate = new Date(2024, 5, 23);
  claim.respondent1 = party;
  (getResponseDraft as jest.Mock).mockResolvedValue({
    claimResponse: {id: 'draft-123', case_data: claim},
    rawResponse: {draftId: 'draft-123', payload: claim},
    createdAt: '',
    updatedAt: '',
    expiresAt: '',
  });
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(citizenDetailsController, method, CITIZEN_DETAILS_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Confirm Details page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDraftWithRespondent(respondent(PartyType.INDIVIDUAL));
    (isCarmEnabledForCase as jest.Mock).mockResolvedValue(true);
    (saveDefendantPropertyToResponseDraft as jest.Mock).mockResolvedValue(undefined);
    (saveTelephoneToResponseDraft as jest.Mock).mockResolvedValue(undefined);
    (lookupByPostcodeAndDataSet as jest.Mock).mockResolvedValue({
      valid: true,
      addresses: [{country: 'England'}],
    });
  });

  describe('on GET', () => {
    it('should render the individual details page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(individualView, expect.objectContaining({
        type: PartyType.INDIVIDUAL,
        carmEnabled: true,
      }));
      expect(res.render.mock.calls[0][1].party.model.firstName).toBe('firstName');
    });

    it('should render the individual page when respondent details are empty', async () => {
      mockDraftWithRespondent(new Party());

      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(individualView, expect.objectContaining({
        carmEnabled: true,
      }));
    });

    it('should render the company details page', async () => {
      mockDraftWithRespondent(respondent(PartyType.COMPANY));

      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(companyView, expect.objectContaining({
        type: PartyType.COMPANY,
      }));
    });

    it('should return the error when loading respondent details fails', async () => {
      const error = new Error('draft failure');
      (getResponseDraft as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the primary address is empty', async () => {
      const {res} = await invoke('post', {
        body: {
          addressLine1: ['', ''],
          addressLine2: ['', ''],
          addressLine3: ['', ''],
          city: ['', ''],
          postCode: ['', ''],
          postToThisAddress: 'no',
        },
      });

      expect(res.render.mock.calls[0][0]).toBe(individualView);
      expect(res.render.mock.calls[0][1].party.hasErrors()).toBe(true);
      expect(saveDefendantPropertyToResponseDraft).not.toHaveBeenCalled();
    });

    it('should re-render a company when the contact person is empty and CARM is on', async () => {
      mockDraftWithRespondent(respondent(PartyType.COMPANY));

      const {res} = await invoke('post', {body: {...validAddress, contactPerson: ''}});

      expect(res.render.mock.calls[0][0]).toBe(companyView);
      expect(res.render.mock.calls[0][1].carmEnabled).toBe(true);
      expect(res.render.mock.calls[0][1].party.hasErrors()).toBe(true);
    });

    it('should re-render with CARM disabled when the address is invalid', async () => {
      (isCarmEnabledForCase as jest.Mock).mockResolvedValue(false);
      mockDraftWithRespondent(respondent(PartyType.COMPANY));

      const {res} = await invoke('post', {
        body: {contactPerson: 'Joe Bloggs', postToThisAddress: 'no'},
      });

      expect(res.render.mock.calls[0][1].carmEnabled).toBe(false);
      expect(res.render.mock.calls[0][1].party.hasErrors()).toBe(true);
    });

    it('should save and redirect an individual to date of birth', async () => {
      const {res} = await invoke('post', {body: validAddress});

      expect(saveDefendantPropertyToResponseDraft).toHaveBeenCalledWith(
        expect.objectContaining({params: {id: claimId}}),
        claimId,
        'partyDetails',
        expect.anything(),
      );
      expect(saveTelephoneToResponseDraft).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DOB_URL));
    });

    it('should redirect a company without a CCD phone number to the phone page', async () => {
      mockDraftWithRespondent(respondent(PartyType.COMPANY));

      const {res} = await invoke('post', {body: {...validAddress, contactPerson: 'Joe Bloggs'}});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL));
    });

    it('should save the CCD phone number and redirect a company to the task list', async () => {
      mockDraftWithRespondent(respondent(PartyType.COMPANY, new PartyPhone('123456', true)));

      const {res} = await invoke('post', {body: {...validAddress, contactPerson: 'Joe Bloggs'}});

      expect(saveTelephoneToResponseDraft).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should return the error when saving fails', async () => {
      const error = new Error('draft failure');
      (saveDefendantPropertyToResponseDraft as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: validAddress});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
