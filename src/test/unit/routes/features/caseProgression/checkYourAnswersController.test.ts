import {Request, Response} from 'express';
import controller from 'routes/features/caseProgression/checkAnswersController';
import {CP_EVIDENCE_UPLOAD_SUBMISSION_URL, TYPES_OF_DOCUMENTS_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getBottomElements, getSummarySections, getTopElements, saveUploadedDocuments} from 'services/features/caseProgression/checkYourAnswers/checkAnswersService';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {UploadDocumentsUserForm, FileOnlySection} from 'models/caseProgression/uploadDocumentsUserForm';
import {CaseRole} from 'form/models/caseRoles';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {DocumentUploadSubmissionForm} from 'form/models/caseProgression/documentUploadSubmission';
import {getUploadDocumentsForm} from 'services/features/caseProgression/caseProgressionService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({getClaimById: jest.fn()}));
jest.mock('modules/draft-store/draftStoreService', () => ({deleteDraftClaimFromStore: jest.fn(), generateRedisKey: jest.fn()}));
jest.mock('services/features/caseProgression/checkYourAnswers/checkAnswersService', () => ({
  getTopElements: jest.fn(), getBottomElements: jest.fn(), getSummarySections: jest.fn(), saveUploadedDocuments: jest.fn(),
}));
jest.mock('client/civilServiceClient', () => {
  const updateTaskStatus = jest.fn();
  return {CivilServiceClient: jest.fn(() => ({updateTaskStatus})), updateTaskStatus};
});

const updateTaskStatus = jest.requireMock('client/civilServiceClient').updateTaskStatus as jest.Mock;
const get = getRouteHandler(controller, 'get');
const post = getRouteHandler(controller, 'post');
const id = '1645882162449409';

describe.each([CaseRole.CLAIMANT, CaseRole.DEFENDANT])('case-progression check and send (%s)', role => {
  let claim: Claim;
  let req: AppRequest;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const own = role === CaseRole.CLAIMANT ? 'claimantDocuments' : 'defendantDocuments';
  const other = role === CaseRole.CLAIMANT ? 'defendantDocuments' : 'claimantDocuments';

  beforeEach(() => {
    jest.resetAllMocks();
    claim = new Claim();
    claim.caseRole = role;
    claim.caseProgression = new CaseProgression();
    const savedRow = Object.assign(new FileOnlySection(), {caseDocument: {
      documentName: 'saved.pdf', documentLink: {document_binary_url: '/documents/saved/binary'},
    }});
    claim.caseProgression[own] = new UploadDocumentsUserForm(undefined, [savedRow]);
    claim.caseProgression[other] = new UploadDocumentsUserForm(undefined, [Object.assign(new FileOnlySection(), structuredClone(savedRow))]);
    req = {params: {id}, query: {}, cookies: {lang: 'en'}, body: {},
      session: createMockSession({user: {id: 'user'}, dashboard: {taskIdHearingUploadDocuments: 'upload-task'}}),
    } as unknown as AppRequest;
    res = createMockResponse();
    next = jest.fn();
    jest.mocked(getClaimById).mockResolvedValue(claim);
    jest.mocked(generateRedisKey).mockReturnValue('owned-draft');
    jest.mocked(getTopElements).mockReturnValue([]);
    jest.mocked(getBottomElements).mockReturnValue([]);
    jest.mocked(getSummarySections).mockReturnValue({} as ReturnType<typeof getSummarySections>);
    jest.mocked(saveUploadedDocuments).mockResolvedValue(claim);
    jest.mocked(deleteDraftClaimFromStore).mockResolvedValue(undefined);
    updateTaskStatus.mockResolvedValue(undefined);
  });

  it.each(['en', 'cy'])('renders the existing role draft and language (%s)', async language => {
    req.query.lang = language;
    await get(req, res as unknown as Response, next);
    expect(getSummarySections).toHaveBeenCalledWith(claim.caseProgression[own], id, claim.isSmallClaimsTrackDQ, language);
    expect(res.render).toHaveBeenCalledWith('features/caseProgression/check-answers', expect.objectContaining({form: expect.any(GenericForm), summarySections: {}}));
    expect(next).not.toHaveBeenCalled();
  });

  it.each(Object.keys(new UploadDocumentsUserForm()))('accepts saved evidence in %s', async category => {
    const saved = claim.caseProgression[own].disclosureList[0];
    claim.caseProgression[own] = Object.assign(new UploadDocumentsUserForm(), {[category]: [saved]});
    await get(req, res as unknown as Response, next);
    expect(getSummarySections).toHaveBeenCalledWith(claim.caseProgression[own], id, claim.isSmallClaimsTrackDQ, 'en');
    expect(res.render).toHaveBeenCalledTimes(1);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  describe.each([
    'missing role draft', 'null role draft', 'missing case progression', 'empty object', 'empty collections',
    'unsaved row', 'missing reference', 'blank reference', 'mixed saved and unsaved rows',
  ])('%s', state => {
    beforeEach(() => {
      if (state === 'missing case progression') delete claim.caseProgression;
      else if (state === 'null role draft') Object.assign(claim.caseProgression, {[own]: null});
      else if (state === 'missing role draft') delete claim.caseProgression[own];
      else if (state === 'empty object') Object.assign(claim.caseProgression, {[own]: {}});
      else if (state === 'empty collections') claim.caseProgression[own] = getUploadDocumentsForm({body: {}} as Request);
      else if (state === 'unsaved row') claim.caseProgression[own].disclosureList = [new FileOnlySection()];
      else if (state === 'mixed saved and unsaved rows') claim.caseProgression[own].disclosureList.push(new FileOnlySection());
      else claim.caseProgression[own].disclosureList[0].caseDocument.documentLink.document_binary_url = state === 'blank reference' ? '  ' : undefined;
    });
    it.each(['GET', 'bodyless POST', 'invalid POST', 'signed POST'])('recovers %s without changing stored data', async method => {
      const before = JSON.stringify(claim);
      req.body = method === 'signed POST' ? {signed: true} : method === 'bodyless POST' ? undefined : {};
      await (method === 'GET' ? get : post)(req, res as unknown as Response, next);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(TYPES_OF_DOCUMENTS_URL.replace(':id', id));
      expect(res.render).not.toHaveBeenCalled();
      expect(getTopElements).not.toHaveBeenCalled();
      expect(getSummarySections).not.toHaveBeenCalled();
      expect(saveUploadedDocuments).not.toHaveBeenCalled();
      expect(updateTaskStatus).not.toHaveBeenCalled();
      expect(deleteDraftClaimFromStore).not.toHaveBeenCalled();
      expect(JSON.stringify(claim)).toBe(before);
      expect(next).not.toHaveBeenCalled();
    });
  });

  it('redisplays signature errors when the draft exists', async () => {
    await post(req, res as unknown as Response, next);
    const form = res.render.mock.calls[0][1].form as GenericForm<DocumentUploadSubmissionForm>;
    expect(form.hasErrors()).toBe(true);
    expect(saveUploadedDocuments).not.toHaveBeenCalled();
    expect(deleteDraftClaimFromStore).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('submits existing evidence, updates its task and deletes only the owned draft', async () => {
    req.body = {signed: true};
    await post(req, res as unknown as Response, next);
    expect(saveUploadedDocuments).toHaveBeenCalledTimes(1);
    expect(saveUploadedDocuments).toHaveBeenCalledWith(claim, req);
    expect(updateTaskStatus).toHaveBeenCalledWith('upload-task', req);
    expect(deleteDraftClaimFromStore).toHaveBeenCalledWith('owned-draft');
    expect(jest.mocked(saveUploadedDocuments).mock.invocationCallOrder[0]).toBeLessThan(updateTaskStatus.mock.invocationCallOrder[0]);
    expect(updateTaskStatus.mock.invocationCallOrder[0]).toBeLessThan(jest.mocked(deleteDraftClaimFromStore).mock.invocationCallOrder[0]);
    expect(res.redirect).toHaveBeenCalledWith(CP_EVIDENCE_UPLOAD_SUBMISSION_URL.replace(':id', id));
    expect(next).not.toHaveBeenCalled();
  });

  it.each(['GET', 'POST'])('forwards a read failure on %s', async method => {
    const error = new Error('read failed');
    jest.mocked(getClaimById).mockRejectedValue(error);
    await (method === 'GET' ? get : post)(req, res as unknown as Response, next);
    expect(next).toHaveBeenCalledWith(error);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(deleteDraftClaimFromStore).not.toHaveBeenCalled();
  });

  it.each(['submit', 'task'])('retains the draft when %s fails', async boundary => {
    req.body = {signed: true};
    const error = new Error('write failed');
    if (boundary === 'submit') jest.mocked(saveUploadedDocuments).mockRejectedValue(error);
    else updateTaskStatus.mockRejectedValue(error);
    await post(req, res as unknown as Response, next);
    expect(next).toHaveBeenCalledWith(error);
    expect(deleteDraftClaimFromStore).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
    if (boundary === 'submit') expect(updateTaskStatus).not.toHaveBeenCalled();
  });
});
