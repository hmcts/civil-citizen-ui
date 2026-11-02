import {Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {getHearingDurationAndOtherInformation} from 'services/features/caseProgression/trialArrangements/hearingDurationAndOtherInformation';
import hearingDurationController from 'routes/features/caseProgression/trialArrangements/hearingDurationAndOtherInformationController';
import {TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS, TRIAL_ARRANGEMENTS_HEARING_DURATION} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

jest.mock('services/features/caseProgression/caseProgressionService', () => ({
  saveCaseProgression: jest.fn(),
}));

jest.mock('services/features/caseProgression/trialArrangements/hearingDurationAndOtherInformation', () => ({
  getHearingDurationAndOtherInformation: jest.fn((): unknown[] => []),
}));

const mockGetClaimById = getClaimById as jest.Mock;
const mockSaveCaseProgression = saveCaseProgression as jest.Mock;
const mockContents = getHearingDurationAndOtherInformation as jest.Mock;

const claimId = '1111';
const viewPath = 'features/caseProgression/trialArrangements/hearing-duration-other-info';

const claim = (): Claim => {
  const loaded = new Claim();
  loaded.caseRole = CaseRole.DEFENDANT;
  loaded.totalClaimAmount = 15000;
  loaded.applicant1 = new Party();
  return loaded;
};

describe('Hearing duration & other info', () => {
  const getHandler = getRouteHandler(hearingDurationController, 'get', TRIAL_ARRANGEMENTS_HEARING_DURATION);
  const postHandler = getRouteHandler(hearingDurationController, 'post', TRIAL_ARRANGEMENTS_HEARING_DURATION);

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClaimById.mockResolvedValue(claim());
    mockSaveCaseProgression.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('renders the page', async () => {
      const loaded = claim();
      mockGetClaimById.mockResolvedValue(loaded);
      const res = createMockResponse();

      await getHandler(
        {params: {id: claimId}, query: {lang: 'en'}, cookies: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      expect(mockContents).toHaveBeenCalledWith(claimId, loaded, 'en');
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
        hearingDurationContents: [],
        backLinkUrl: expect.any(String),
        cancelUrl: expect.any(String),
      }));
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);
      const next = jest.fn();

      await getHandler(
        {params: {id: claimId}, query: {}, cookies: {}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('saves the other information and redirects to check your answers', async () => {
      const res = createMockResponse();
      const req = {params: {id: claimId}, body: {otherInformation: 'Info put in'}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockSaveCaseProgression).toHaveBeenCalledWith(req, 'Info put in', 'otherTrialInformation', 'defendantTrialArrangements');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS));
    });

    it('saves an empty field when only spaces are entered', async () => {
      const res = createMockResponse();
      const req = {params: {id: claimId}, body: {otherInformation: '    '}} as unknown as AppRequest;

      await postHandler(req, res as unknown as Response, jest.fn());

      expect(mockSaveCaseProgression).toHaveBeenCalledWith(req, '', 'otherTrialInformation', 'defendantTrialArrangements');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS));
    });

    it('calls next when other information is missing', async () => {
      const next = jest.fn();

      await postHandler(
        {params: {id: claimId}, body: {}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(expect.any(TypeError));
      expect(mockSaveCaseProgression).not.toHaveBeenCalled();
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);
      const next = jest.fn();

      await postHandler(
        {params: {id: claimId}, body: {otherInformation: 'Info put in'}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
