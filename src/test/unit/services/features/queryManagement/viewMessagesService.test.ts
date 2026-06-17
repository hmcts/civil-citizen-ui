import {getViewMessagesLink} from 'services/features/queryManagement/viewMessagesService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {CaseRole} from 'form/models/caseRoles';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

const req = {params: {id: '123'}} as unknown as AppRequest;
describe('View Messages Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate the view messages link for claimant', async () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    claim.queries = {
      roleOnCase: CaseRole.CLAIMANT,
      partyName: 'partyName',
      caseMessages: [
        {id: '12345', value: {
          name: 'name',
          subject: 'Test Message',
          body: 'body',
          isHearingRelated: YesNoUpperCamelCase.NO,
          createdOn: '2023-10-01T00:00:00Z',
          createdBy: 'user',
        }},
      ],
    };
    const generatedLink = await getViewMessagesLink(req, claim, 'en');
    expect(generatedLink).toBeDefined();
  });

  it('should generate the view messages link for defendant', async () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;
    claim.queries = {
      roleOnCase: CaseRole.DEFENDANT,
      partyName: 'partyName',
      caseMessages: [
        {id: '12345', value: {
          name: 'name',
          subject: 'Test Message',
          body: 'body',
          isHearingRelated: YesNoUpperCamelCase.NO,
          createdOn: '2023-10-01T00:00:00Z',
          createdBy: 'user',
        }},
      ],
    };
    const generatedLink = await getViewMessagesLink(req, claim, 'en');
    expect(generatedLink).toBeDefined();
  });

  it('should not generate the view message link when there are no messages', async () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;
    claim.queries = {
      roleOnCase: CaseRole.DEFENDANT,
      partyName: 'partyName',
      caseMessages: [],
    };
    const generatedLink = await getViewMessagesLink(req, claim, 'en');
    expect(generatedLink).toBeUndefined();
  });
});
