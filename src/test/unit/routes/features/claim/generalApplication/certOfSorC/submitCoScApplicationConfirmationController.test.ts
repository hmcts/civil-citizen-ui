import {Response} from 'express';
import controller from 'routes/features/generalApplication/certOfSorC/submitCoScApplicationConfirmationController';
import {GA_COSC_CONFIRM_URL, DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {deleteFieldDraftClaimFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getRouteHandler} from '../../../../../../utils/getRouteHandler';

// The GA service imports the response store, whose app reference is an external
// collaborator here. Keep this handler suite from constructing the application.
jest.mock('../../../../../../../main/app', () => ({app: {locals: {}}}));
jest.mock('modules/utilityService', () => ({getClaimById: jest.fn()}));
jest.mock('modules/draft-store/draftStoreService');

const claimId = '123';
const collectionId = 'selected-entry';
const get = getRouteHandler(controller, 'get', GA_COSC_CONFIRM_URL);
const invalidQueries = [
  {}, {id: collectionId}, {appFee: '108'},
  {id: '', appFee: '108'}, {id: ' ', appFee: '108'},
  {id: 'undefined', appFee: '108'}, {id: 'null', appFee: '108'},
  {id: 'entry/other', appFee: '108'}, {id: 'entry&other', appFee: '108'},
  {id: [collectionId, 'other-entry'], appFee: '108'}, {id: {value: collectionId}, appFee: '108'},
  ...['', ' ', 'undefined', 'null', 'NaN', 'Infinity', '-1', 'wrong', '0x10', '1e2', '1.001'].map(appFee => ({id: collectionId, appFee})),
  {id: collectionId, appFee: ['108', '19']},
  {id: collectionId, appFee: {value: '108'}},
];

describe('GA confirmation parameter boundary', () => {
  let claim: Claim;
  let req: AppRequest;
  let res: Response;
  let render: jest.Mock;
  let redirect: jest.Mock;
  let next: jest.Mock;
  beforeEach(() => {
    jest.resetAllMocks();
    claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    claim.generalApplications = [
      {id: 'unrelated-entry', value: {caseLink: {CaseReference: '9990000000000001'}}},
      {id: collectionId, value: {caseLink: {CaseReference: '9990000000000002'}}},
    ] as Claim['generalApplications'];
    claim.generalApplication = {applicationFee: {calculatedAmountInPence: 99900}} as Claim['generalApplication'];
    jest.mocked(getClaimById).mockResolvedValue(claim);
    req = {params: {id: claimId}, query: {}, cookies: {}, session: {user: {id: 'owner'}}} as unknown as AppRequest;
    render = jest.fn(); redirect = jest.fn(); next = jest.fn();
    res = {render, redirect} as unknown as Response;
  });

  it.each(['0', '108', '108.25'])('renders the explicit collection item and fee %s without borrowing the draft fee', async appFee => {
    req.query = {id: collectionId, appFee};

    await get(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledWith('features/generalApplication/submit-general-application-confirmation', expect.objectContaining({
      confirmationContent: expect.any(Array),
    }));
    const {confirmationContent} = render.mock.calls[0][1];
    expect(JSON.stringify(confirmationContent)).toContain('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_PAY_FEE');
    const button = confirmationContent.find((section: {data: {href?: string}}) => section.data.href?.includes('apply-help-fee-selection'));
    expect(button.data.href).toBe(`/case/${claimId}/general-application/apply-help-fee-selection?id=${collectionId}&appFee=${appFee}`);
    expect(JSON.stringify(confirmationContent)).not.toContain('appFee=999');
    expect(getClaimById).toHaveBeenCalledWith(claimId, req, true);
  });

  it.each(invalidQueries)('recovers invalid query %p without rendering or deleting draft data', async query => {
    req.query = query as AppRequest['query'];

    await get(req, res, next);

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith(DASHBOARD_CLAIMANT_URL.replace(':id', claimId));
    expect(render).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(deleteFieldDraftClaimFromStore).not.toHaveBeenCalled();
    expect(saveDraftClaim).not.toHaveBeenCalled();
  });

  it('recovers a defendant to their own dashboard', async () => {
    claim.caseRole = CaseRole.DEFENDANT;
    await get(req, res, next);
    expect(redirect).toHaveBeenCalledWith(DEFENDANT_SUMMARY_URL.replace(':id', claimId));
    expect(render).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards a claim-read failure instead of guessing a recovery or application', async () => {
    const failure = new Error('claim unavailable');
    jest.mocked(getClaimById).mockRejectedValue(failure);
    await get(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(failure);
    expect(render).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
