import {Response} from 'express';
import claimantEvidenceController from '../../../../../../main/routes/features/claim/yourDetails/claimantEvidenceController';
import {CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Evidence} from 'form/models/evidence/evidence';
import {EvidenceItem} from 'form/models/evidence/evidenceItem';
import {EvidenceType} from 'models/evidence/evidenceType';
import {FREE_TEXT_MAX_LENGTH} from 'form/validators/validationConstraints';
import {getClaimDetails, saveClaimDetails} from 'services/features/claim/details/claimDetailsService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/details/claimDetailsService', () => ({
  getClaimDetails: jest.fn(),
  saveClaimDetails: jest.fn(),
}));

describe('Claimant Evidence', () => {
  const getHandler = getRouteHandler(claimantEvidenceController, 'get');
  const postHandler = getRouteHandler(claimantEvidenceController, 'post');
  const viewPath = 'features/claim/claimant-evidences';
  const pageTitle = 'PAGES.EVIDENCE.PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimDetails = getClaimDetails as jest.Mock;
  const mockSaveClaimDetails = saveClaimDetails as jest.Mock;
  const tooLongEvidenceDetails = Array(FREE_TEXT_MAX_LENGTH + 2).join('a');
  const evidenceItem = [
    {type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: 'Test evidence details'},
    {type: null, description: ''},
    {type: null, description: ''},
    {type: null, description: ''},
  ];
  const evidenceItemInvalid = [
    {type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: tooLongEvidenceDetails},
    {type: null, description: ''},
    {type: null, description: ''},
    {type: null, description: ''},
  ];

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimDetails.mockResolvedValue(new ClaimDetails());
    mockSaveClaimDetails.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render evidence list page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should render evidence list page when no items are saved', async () => {
      const claimDetails = new ClaimDetails();
      claimDetails.evidence = new Evidence('', [new EvidenceItem(null, '')]);
      mockGetClaimDetails.mockResolvedValue(claimDetails);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should render evidence list page when less than 4 items are saved', async () => {
      const claimDetails = new ClaimDetails();
      claimDetails.evidence = new Evidence('', [
        new EvidenceItem(EvidenceType.EXPERT_WITNESS, 'Nam ac ante id turpis elementum laoreet.'),
      ]);
      mockGetClaimDetails.mockResolvedValue(claimDetails);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should render evidence list page when more than 4 items are saved', async () => {
      const claimDetails = new ClaimDetails();
      claimDetails.evidence = new Evidence('', [
        new EvidenceItem(EvidenceType.EXPERT_WITNESS, 'Nam ac ante id turpis elementum laoreet.'),
        new EvidenceItem(EvidenceType.CONTRACTS_AND_AGREEMENTS, 'Nam ac ante id turpis elementum laoreet.'),
        new EvidenceItem(EvidenceType.CORRESPONDENCE, 'Nam ac ante id turpis elementum laoreet.'),
        new EvidenceItem(EvidenceType.PHOTO, 'Nam ac ante id turpis elementum laoreet.'),
        new EvidenceItem(EvidenceType.RECEIPTS, 'Nam ac ante id turpis elementum laoreet.'),
        new EvidenceItem(EvidenceType.STATEMENT_OF_ACCOUNT, 'Nam ac ante id turpis elementum laoreet.'),
        new EvidenceItem(EvidenceType.EXPERT_WITNESS, 'Nam ac ante id turpis elementum laoreet.'),
      ]);
      mockGetClaimDetails.mockResolvedValue(claimDetails);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading claim details fails', async () => {
      const error = new Error('error');
      mockGetClaimDetails.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when evidence description is longer than the max length', async () => {
      req.body = {evidenceItem: evidenceItemInvalid};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to task list when evidence items are empty', async () => {
      req.body = {evidenceItem: []};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimDetails).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_TASK_LIST_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveClaimDetails.mockRejectedValue(error);
      req.body = {evidenceItem};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
