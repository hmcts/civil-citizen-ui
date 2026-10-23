import {Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import isCaseReadyController from 'routes/features/caseProgression/trialArrangements/isCaseReadyController';
import {HAS_ANYTHING_CHANGED_URL, IS_CASE_READY_URL} from 'routes/urls';
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
const viewPath = 'features/caseProgression/trialArrangements/is-case-ready';

const claim = (): Claim => {
  const loaded = new Claim();
  loaded.caseRole = CaseRole.DEFENDANT;
  loaded.totalClaimAmount = 15000;
  loaded.applicant1 = new Party();
  return loaded;
};

describe('Is case ready', () => {
  const getHandler = getRouteHandler(isCaseReadyController, 'get', IS_CASE_READY_URL);
  const postHandler = getRouteHandler(isCaseReadyController, 'post', IS_CASE_READY_URL);

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
        isCaseReadyContents: expect.anything(),
        cancelUrl: expect.any(String),
        backLinkUrl: expect.any(String),
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
      expect(mockSaveCaseProgression).not.toHaveBeenCalled();
    });

    it('saves the answer and redirects to has anything changed', async () => {
      const res = createMockResponse();
      const req = {params: {id: claimId}, body: {option: YesNo.NO}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockSaveCaseProgression).toHaveBeenCalledWith(req, YesNo.NO, 'isCaseReady', 'defendantTrialArrangements');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, HAS_ANYTHING_CHANGED_URL));
    });
  });
});
