import {Response} from 'express';
import claimDetailsController from '../../../../../../main/routes/features/response/claimDetails/claimDetailsController';
import {CASE_TIMELINE_DOCUMENTS_URL, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseState} from 'form/models/claimDetails';
import {DocumentType} from 'models/document/documentType';
import {civilClaimResponseMock} from '../../../../../utils/mockDraftStore';
import civilClaimResponsePDFTimeline from '../../../../../utils/mocks/civilClaimResponsePDFTimelineMock.json';
import * as interestUtils from 'common/utils/interestUtils';
import * as claimDetailsService from 'modules/claimDetailsService';
import * as claimTimelineService from 'services/features/common/claimTimelineService';
import * as launchDarklyClient from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

describe('Claim details page', () => {
  const getHandler = getRouteHandler(claimDetailsController, 'get');
  const viewPath = 'features/response/claimDetails/claim-details-new';
  const claimId = '1111';
  const isWelshEnabledForMainCase = launchDarklyClient.isWelshEnabledForMainCase as jest.Mock;
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  const buildClaim = (): Claim => Object.assign(new Claim(), civilClaimResponseMock.case_data);

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      query: {},
      cookies: {},
      locals: {env: '', lang: ''},
    };
    res = createMockResponse();
    next = jest.fn();
    isWelshEnabledForMainCase.mockResolvedValue(false);
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(buildClaim());
    jest.spyOn(interestUtils, 'getInterestDetails').mockResolvedValue({interest: 15} as never);
    jest.spyOn(claimDetailsService, 'getTotalAmountWithInterestAndFeesAndFixedCost').mockResolvedValue(285);
    jest.spyOn(claimDetailsService, 'getFixedCost').mockResolvedValue(undefined);
    jest.spyOn(claimTimelineService, 'getClaimTimeline').mockReturnValue([
      {
        timelineDate: '1 January 2022',
        timelineDescription: 'I noticed a leak on the landing and told Mr Smith about this.',
      },
    ]);
  });

  describe('on GET', () => {
    it('should call next if retrieving the claim fails', async () => {
      const error = new Error('Test error');
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValueOnce(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should render claim details with values from civil-service', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIM_DETAILS.PAGE_TITLE_NEW',
        pageCaption: 'PAGES.CLAIM_DETAILS.THE_CLAIM',
        totalAmount: 285,
        interestData: expect.objectContaining({interest: 15}),
        timelineRows: expect.arrayContaining([
          expect.objectContaining({
            timelineDescription: 'I noticed a leak on the landing and told Mr Smith about this.',
          }),
        ]),
        dashboardUrl: constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL),
        showErrorAwaitingTranslation: false,
      }));
    });

    it('should render claim details when retrieveClaimDetails returns a claim', async () => {
      const claim = buildClaim();
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(claim);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claim,
        totalAmount: 285,
        timelineRows: expect.any(Array),
      }));
    });

    it('should call calculate-interest exactly once per render (request-scoped memoisation)', async () => {
      (interestUtils.getInterestDetails as jest.Mock).mockRestore();
      (claimDetailsService.getTotalAmountWithInterestAndFeesAndFixedCost as jest.Mock).mockRestore();
      const downstreamInterestSpy = jest
        .spyOn(CivilServiceClient.prototype as unknown as { calculateClaimInterestFromCivilService: () => Promise<number> },
          'calculateClaimInterestFromCivilService')
        .mockResolvedValue(15);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalled();
      expect(downstreamInterestSpy).toHaveBeenCalledTimes(1);
    });

    it('should include timeline PDF url when the claim has a timeline document', async () => {
      const claim = Object.assign(new Claim(), civilClaimResponsePDFTimeline.case_data);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(claim);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      const documentId = claim.extractDocumentId();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        timelinePdfUrl: CASE_TIMELINE_DOCUMENTS_URL.replace(':id', claimId).replace(':documentId', documentId),
      }));
    });

    it('should call next when there is an error', async () => {
      const error = new Error('Test error');
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockRejectedValueOnce(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should render claim details when welsh is enabled', async () => {
      isWelshEnabledForMainCase.mockResolvedValue(true);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.CLAIM_DETAILS.PAGE_TITLE_NEW',
        totalAmount: 285,
        showErrorAwaitingTranslation: false,
      }));
    });

    it('should set showErrorAwaitingTranslation when claim is under translation', async () => {
      const claim = buildClaim();
      claim.ccdState = CaseState.PENDING_CASE_ISSUED;
      claim.preTranslationDocuments = [{
        id: '1234',
        value: {
          createdBy: 'some one',
          documentLink: {
            document_url: 'url',
            document_filename: 'filename',
            document_binary_url: 'http://dm-store:8080/documents/77121e9b-e83a-440a-9429-e7f0fe89e518/binary',
          },
          documentName: 'some name',
          documentType: DocumentType.SEALED_CLAIM,
          documentSize: 123,
          createdDatetime: new Date(),
        },
      }];
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(claim);
      isWelshEnabledForMainCase.mockResolvedValue(true);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        showErrorAwaitingTranslation: true,
        dashboardUrl: constructResponseUrlWithIdParams(claimId, claim.isClaimant() ? DASHBOARD_CLAIMANT_URL : DEFENDANT_SUMMARY_URL),
      }));
    });
  });
});
