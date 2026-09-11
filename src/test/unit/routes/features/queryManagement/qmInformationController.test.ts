import {Request, Response} from 'express';
import qmInformationController from '../../../../../main/routes/features/queryManagement/qmInformationController';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getCancelUrl, getCaption} from 'services/features/queryManagement/queryManagementService';
import {QualifyingQuestionTypeOption, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';
import {Claim} from 'models/claim';
import {isJudgmentBufferEnabled} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/queryManagement/queryManagementService', () => ({
  getCancelUrl: jest.fn(),
  getCaption: jest.fn(),
}));
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

describe('Query management Information controller', () => {
  const getHandler = getRouteHandler(qmInformationController, 'get');
  const postHandler = getRouteHandler(qmInformationController, 'post');
  const viewPath = 'features/queryManagement/qm-information-template.njk';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId, qmType: WhatToDoTypeOption.CHANGE_CASE, qmQualifyOption: QualifyingQuestionTypeOption.GA_OFFLINE},
      query: {},
      cookies: {},
      path: '/case/12345/qm/information/CHANGE_CASE/GA_OFFLINE',
    };
    res = createMockResponse();
    next = jest.fn();
    (getCaption as jest.Mock).mockReturnValue('PAGES.QM.CAPTIONS.CHANGE_CASE');
    (getCancelUrl as jest.Mock).mockReturnValue('/dashboard');
    (isJudgmentBufferEnabled as jest.Mock).mockResolvedValue(false);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(new Claim());
  });

  describe('on GET', () => {
    it('should render the information page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        caption: 'PAGES.QM.CAPTIONS.CHANGE_CASE',
      }));
    });
  });

  describe('on POST', () => {
    it('should redirect to the cancel URL', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith('/dashboard');
    });
  });
});
