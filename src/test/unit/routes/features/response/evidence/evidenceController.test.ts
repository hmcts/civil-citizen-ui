import {Response} from 'express';
import evidenceController from '../../../../../../main/routes/features/response/evidence/evidenceController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Evidence} from 'form/models/evidence/evidence';
import {EvidenceItem} from 'form/models/evidence/evidenceItem';
import {EvidenceType} from 'models/evidence/evidenceType';
import {FREE_TEXT_MAX_LENGTH} from 'form/validators/validationConstraints';
import {getEvidence, saveEvidence} from 'services/features/response/evidence/evidenceService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/response/evidence/evidenceService', () => ({
  getEvidence: jest.fn(),
  saveEvidence: jest.fn(),
}));

describe('List your evidence', () => {
  const getHandler = getRouteHandler(evidenceController, 'get');
  const postHandler = getRouteHandler(evidenceController, 'post');
  const viewPath = 'features/response/evidence/evidences';
  const claimId = '12345';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetEvidence = getEvidence as jest.Mock;
  const mockSaveEvidence = saveEvidence as jest.Mock;
  const comment = 'Nam ac ante id turpis elementum laoreet. Nunc a erat nec eros iaculis lobortis ut in quam.';
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
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetEvidence.mockResolvedValue(new Evidence());
    mockSaveEvidence.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render your evidence list page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render your evidence list page when less than 4 items saved', async () => {
      mockGetEvidence.mockResolvedValue(new Evidence('', [new EvidenceItem(EvidenceType.EXPERT_WITNESS, 'details')]));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading evidence fails', async () => {
      const error = new Error('error');
      mockGetEvidence.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when comment max length is greater than 99000 characters', async () => {
      req.body = {comment: tooLongEvidenceDetails, evidenceItem};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when description max length is greater than 99000 characters', async () => {
      req.body = {comment, evidenceItem: evidenceItemInvalid};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect with empty input', async () => {
      req.body = {comment: '', evidenceItem: []};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveEvidence).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect with correct input', async () => {
      req.body = {comment, evidenceItem};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveEvidence).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect with empty input when claim is full admission', async () => {
      req.body = {comment: '', evidenceItem: []};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect with correct input when claim is full admission', async () => {
      req.body = {comment, evidenceItem};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveEvidence.mockRejectedValue(error);
      req.body = {comment, evidenceItem};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
