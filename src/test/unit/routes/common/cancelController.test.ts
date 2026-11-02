import {NextFunction, Response} from 'express';
import {CaseRole} from 'form/models/caseRoles';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as utilityService from 'modules/utilityService';
import cancelController from 'routes/common/cancelController';
import {CANCEL_URL, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {TestMessages} from '../../../utils/errorMessageTestConstants';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../utils/getRouteHandler';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/utilityService');
jest.mock('../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));

const mockGetClaimById = utilityService.getClaimById as jest.Mock;
const claimId = '12345';

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {
    params: {id: claimId, propertyName: 'generalApplication'},
    session: createMockSession({user: {id: 'user-1'}}),
  };
  await getRouteHandler(cancelController, 'get', CANCEL_URL)(
    req as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Cancel controller ', () => {
  beforeEach(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
    jest.spyOn(draftStoreService, 'deleteFieldDraftClaimFromStore').mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should redirect to the Claimant dashboard', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseRole = CaseRole.CLAIMANT;
        return claim;
      });

      const {res} = await invoke();

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
    });

    it('should redirect to the defendant dashboard', async () => {
      mockGetClaimById.mockImplementation(async () => {
        const claim = new Claim();
        claim.caseRole = CaseRole.DEFENDANT;
        return claim;
      });

      const {res} = await invoke();

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL));
    });

    it('should return http 500 when has error', async () => {
      const error = new Error(TestMessages.REDIS_FAILURE);
      mockGetClaimById.mockRejectedValue(error);

      const {res, next} = await invoke();

      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
