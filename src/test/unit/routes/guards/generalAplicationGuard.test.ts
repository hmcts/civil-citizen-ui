import {isGaForLipsEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import { Claim } from 'common/models/claim';
import { Request, Response } from 'express';
import * as utilityService from 'modules/utilityService';
import { isGAForLiPEnabled } from 'routes/guards/generalAplicationGuard';
import {civilClaimResponseMock} from '../../../utils/mockDraftStore';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {CCDRespondentResponseLanguage} from 'models/ccdResponse/ccdRespondentLiPResponse';

jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/utilityService', () => ({
  getRedisStoreForSession: jest.fn(),
  getClaimById: jest.fn(),
}));
jest.mock('../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));
jest.mock('../../../../main/modules/draft-store/gaHwFeesDraftStore', () => ({
  saveDraftGAHWFDetails: jest.fn(),
  getDraftGAHWFDetails: jest.fn(),
}));
describe('GAFlagGuard', () => {
  let req: Partial<Request>;
  let res: Partial<Response> & { redirect: jest.Mock };
  let next: jest.Mock;
  beforeEach(() => {
    req = { params: { id: '123' }, originalUrl: 'test' };
    res = { redirect: jest.fn() };
    next = jest.fn();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should call next if isGAFlag enabled returns true', async () => {
    (isGaForLipsEnabled as jest.Mock).mockReturnValueOnce(true);
    jest.spyOn(utilityService , 'getClaimById').mockResolvedValueOnce({ isAnyPartyBilingual: () => false } as Claim);
    await isGAForLiPEnabled(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
  it('should call redirect if isGAFlag returns false', async () => {
    (isGaForLipsEnabled as jest.Mock).mockReturnValueOnce(false);
    jest.spyOn(utilityService , 'getClaimById').mockResolvedValueOnce({ isAnyPartyBilingual: () => true } as Claim);
    await isGAForLiPEnabled(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalled();
  });
  it('should call redirect if anyParty is bilingual returns false', async () => {
    (isGaForLipsEnabled as jest.Mock).mockReturnValueOnce(true);
    jest.spyOn(utilityService , 'getClaimById').mockResolvedValueOnce({ isAnyPartyBilingual: () => true } as Claim);
    await isGAForLiPEnabled(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalled();
  });
  it('should call next if anyParty is bilingual but GA created before respondent response returns true', async () => {
    (isGaForLipsEnabled as jest.Mock).mockReturnValueOnce(true);
    const claim = Object.assign(new Claim(), civilClaimResponseMock.case_data);
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    claim.generalApplications = [
      {
        'id': 'test',
        'value': {
          'caseLink': {
            'CaseReference': '6789',
          },
          'generalAppSubmittedDateGAspec': new Date('2024-05-29T14:39:28.483971'),
        },
      },
    ];
    jest.spyOn(utilityService , 'getClaimById').mockResolvedValueOnce(claim);
    await isGAForLiPEnabled(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
  it('should call next if defendant response language is welsh to create a COSC application', async () => {
    (isGaForLipsEnabled as jest.Mock).mockReturnValueOnce(true);
    const claim = Object.assign(new Claim(), civilClaimResponseMock.case_data);
    claim.respondent1LiPResponse = { respondent1ResponseLanguage: CCDRespondentResponseLanguage.BOTH };
    claim.generalApplications = [
      {
        'id': 'test',
        'value': {
          'caseLink': {
            'CaseReference': '6789',
          },
          'generalAppSubmittedDateGAspec': new Date('2024-05-29T14:39:28.483971'),
        },
      },
    ];
    jest.spyOn(utilityService , 'getClaimById').mockResolvedValueOnce(claim);
    const MOCK_REQUEST_COSC = { originalUrl: '/case/1741/general-application/cosc/ask-proof', params: { id: '123' } } as unknown as Request;
    await isGAForLiPEnabled(MOCK_REQUEST_COSC, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

});
