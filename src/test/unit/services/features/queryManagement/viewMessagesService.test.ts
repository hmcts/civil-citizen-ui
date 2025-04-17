import {getViewMessagesLink} from 'services/features/queryManagement/viewMessagesService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import * as launchDarklyService from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CaseRole} from 'form/models/caseRoles';

const req = {params: {id: '123'}} as unknown as AppRequest;
describe('View Messages Service', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should generate the view messages link for claimant', async () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    claim.qmApplicantCitizenQueries = {
      caseRole: CaseRole.CLAIMANT,
      caseMessages: [{id: '12345', subject: 'Test Message'}],
    };
    jest.spyOn(launchDarklyService, 'isQueryManagementEnabled').mockResolvedValueOnce(true);
    const generatedLink = await getViewMessagesLink(req, claim, 'en');
    expect(generatedLink).toBeDefined();
  });

  it('should generate the view messages link for defendant', async () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;
    claim.qmRespondentCitizenQueries = {
      caseRole: CaseRole.DEFENDANT,
      caseMessages: [{id: '12345', subject: 'Test Message'}],
    };
    jest.spyOn(launchDarklyService, 'isQueryManagementEnabled').mockResolvedValueOnce(true);
    const generatedLink = await getViewMessagesLink(req, claim, 'en');
    expect(generatedLink).toBeDefined();
  });

  it('should not the generate the view message if the flag is off', async () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;
    claim.qmRespondentCitizenQueries = {
      caseRole: CaseRole.DEFENDANT,
      caseMessages: [{id: '12345', subject: 'Test Message'}],
    };
    jest.spyOn(launchDarklyService, 'isQueryManagementEnabled').mockResolvedValueOnce(false);
    const generatedLink = await getViewMessagesLink(req, claim, 'en');
    expect(generatedLink).toBeUndefined();
  });
});
