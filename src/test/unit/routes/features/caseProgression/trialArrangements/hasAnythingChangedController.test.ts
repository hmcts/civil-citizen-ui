import {Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {HasAnythingChangedForm} from 'models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import hasAnythingChangedController from 'routes/features/caseProgression/trialArrangements/hasAnythingChangedController';
import {HAS_ANYTHING_CHANGED_URL, TRIAL_ARRANGEMENTS_HEARING_DURATION} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

jest.mock('services/features/caseProgression/caseProgressionService', () => ({
  saveCaseProgression: jest.fn(),
}));

const mockGetClaimById = getClaimById as jest.Mock;
const mockSaveCaseProgression = saveCaseProgression as jest.Mock;

const claimId = '1111';
const viewPath = 'features/caseProgression/trialArrangements/has-anything-changed';

const claim = (): Claim => {
  const loaded = new Claim();
  loaded.caseRole = CaseRole.DEFENDANT;
  loaded.totalClaimAmount = 15000;
  loaded.applicant1 = new Party();
  return loaded;
};

describe('Has anything changed', () => {
  const getHandler = getRouteHandler(hasAnythingChangedController, 'get', HAS_ANYTHING_CHANGED_URL);
  const postHandler = getRouteHandler(hasAnythingChangedController, 'post', HAS_ANYTHING_CHANGED_URL);

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClaimById.mockResolvedValue(claim());
    mockSaveCaseProgression.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('renders the page', async () => {
      const res = createMockResponse();

      await getHandler(
        {params: {id: claimId}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        hasAnythingChangedContents: expect.anything(),
        backLinkUrl: expect.any(String),
        cancelUrl: expect.any(String),
      }));
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);
      const next = jest.fn();

      await getHandler(
        {params: {id: claimId}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('re-renders when neither Yes nor No is selected', async () => {
      const res = createMockResponse();

      await postHandler(
        {params: {id: claimId}, body: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.render.mock.calls[0][1].form.errors[0].constraints.isNotEmpty).toBe('ERRORS.VALID_YES_NO_OPTION_TRIAL_ARR');
    });

    it('re-renders when Yes is selected without details', async () => {
      const res = createMockResponse();

      await postHandler(
        {params: {id: claimId}, body: {option: YesNo.YES}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      const messages = JSON.stringify(res.render.mock.calls[0][1].form.errors);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(messages).toContain('ERRORS.VALID_ENTER_SUPPORT');
      expect(mockSaveCaseProgression).not.toHaveBeenCalled();
    });

    it('clears the details and redirects when No is selected', async () => {
      const res = createMockResponse();
      const req = {params: {id: claimId}, body: {option: YesNo.NO, textArea: 'leftover'}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockSaveCaseProgression).toHaveBeenCalledWith(
        req,
        expect.objectContaining({option: YesNo.NO, textArea: ''}),
        'hasAnythingChanged',
        'defendantTrialArrangements',
      );
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, TRIAL_ARRANGEMENTS_HEARING_DURATION));
    });

    it('saves the details and redirects when Yes is selected', async () => {
      const res = createMockResponse();
      const req = {params: {id: claimId}, body: {option: YesNo.YES, textArea: 'some text'}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      const saved = mockSaveCaseProgression.mock.calls[0][1] as HasAnythingChangedForm;
      expect(saved.option).toBe(YesNo.YES);
      expect(saved.textArea).toBe('some text');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, TRIAL_ARRANGEMENTS_HEARING_DURATION));
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);
      const next = jest.fn();

      await postHandler(
        {params: {id: claimId}, body: {option: YesNo.NO}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
