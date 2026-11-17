import {Response} from 'express';
import evidenceUploadDocumentsController from 'routes/features/caseProgression/evidenceUploadDocumentsController';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, EVIDENCE_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {CaseRole} from 'form/models/caseRoles';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {AppRequest} from 'models/AppRequest';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    retrieveClaimDetails: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveClaimDetails: jest.Mock;
};

const viewPath = 'features/caseProgression/evidence-upload-documents';
const claimId = '123';

const buildClaim = (caseRole: CaseRole): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 1000;
  claim.applicant1 = new Party();
  claim.caseProgression = new CaseProgression();
  claim.caseProgression.claimantUploadDocuments = new UploadDocuments([], [], [], [], []);
  claim.caseProgression.defendantUploadDocuments = new UploadDocuments([], [], [], [], []);
  return claim;
};

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(evidenceUploadDocumentsController, 'get', EVIDENCE_UPLOAD_DOCUMENTS_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Evidence upload documents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the claimant dashboard link for a claimant', async () => {
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(buildClaim(CaseRole.CLAIMANT));

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      pageTitle: 'COMMON.VIEW_DOCUMENTS',
      pageCaption: 'PAGES.DASHBOARD.HEARINGS.HEARING',
      claimId: caseNumberPrettify(claimId),
      claimAmount: 1000,
      dashboardUrl: DASHBOARD_CLAIMANT_URL.replace(':id', claimId),
      documentSections: expect.any(Array),
    }));
  });

  it('should render the defendant dashboard link for a defendant', async () => {
    civilServiceMethods.retrieveClaimDetails.mockResolvedValue(buildClaim(CaseRole.DEFENDANT));

    const {res} = await invoke();

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      dashboardUrl: DEFENDANT_SUMMARY_URL.replace(':id', claimId),
    }));
  });

  it('should call next when claim retrieval fails', async () => {
    const error = new Error('claim retrieval failed');
    civilServiceMethods.retrieveClaimDetails.mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
