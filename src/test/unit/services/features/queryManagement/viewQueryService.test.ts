import {ViewQueriesService} from 'services/features/queryManagement/viewQueriesService';
import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseQueries} from 'models/queryManagement/caseQueries';
import {QueryDetail, QueryListItem} from 'form/models/queryManagement/viewQuery';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

jest.mock('common/utils/dateUtils', () => ({
  dateTimeFormat: jest.fn((date, lang) => `formatted-${date}-${lang}`),
  formatDateToFullDate: jest.fn(() => '01 Jan 2025'),
}));

jest.mock('common/utils/formatDocumentURL', () => ({
  formatDocumentViewURL: jest.fn(() => 'formatted-url'),
}));

describe('ViewQueriesService', () => {
  const claimantUser = { id: 'claimant-user-id', name: 'claimant' };
  const defendantUser = { id: 'defendant-user-id', name: 'defendant' };
  const caseworkerUser = { id: 'caseworker-user-id', name: 'caseworker' };

  it('should return empty array when no queries ', () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    claim.queries = { partyName: 'All queries', caseMessages: [] };

    const result = ViewQueriesService.buildQueryListItems(claimantUser.id, claim, 'en');
    expect(result).toEqual([]);
  });

  it('should return queries raised by the logged in user.', () => {
    const claim = new Claim();
    claim.queries = {
      caseMessages: [
        {
          value: {
            id: 'parentQuery1',
            subject: 'test subject',
            createdOn: '2025-02-20T12:00:00Z',
            createdBy: claimantUser.id,
            name: claimantUser.name,
            parentId: null,
            isHearingRelated: 'Yes',
            hearingDate: new Date('2025-05-10'),
          },
        },
        {
          value: {
            id: 'childQuery',
            subject: 'test subject',
            createdOn: '2025-02-27T12:00:00Z',
            createdBy: caseworkerUser.id,
            name: caseworkerUser.name,
            body: 'body 2',
            isHearingRelated: 'No',
            parentId: 'parentQuery1',
            attachments: [
              {
                value: {
                  document_filename: 'document1.pdf',
                  document_binary_url: 'binary-url-1',
                },
              },
            ],
          },
        },
        {
          value: {
            id: 'parentQuery2',
            subject: 'another subject',
            createdOn: '2025-02-27T12:00:00Z',
            createdBy: claimantUser.id,
            name: claimantUser.name,
            parentId: null,
            isHearingRelated: 'No',
          },
        },
      ],
    } as CaseQueries;

    const result = ViewQueriesService.buildQueryListItems(claimantUser.id, claim, 'en');
    expect(result.length).toBe(2);

    const parent1 = result[0];
    expect(parent1.id).toBe('parentQuery1');
    expect(parent1.subject).toBe('test subject');
    expect(parent1.lastUpdatedOn).toBe('formatted-2025-02-27T12:00:00Z-en');
    expect(parent1.lastUpdatedBy).toBe('PAGES.QM.VIEW_QUERY.UPDATED_BY_COURT_STAFF');
    expect(parent1.status).toBe('PAGES.QM.VIEW_QUERY.STATUS_RECEIVED');

    const parent2 = result[1];
    expect(parent2.id).toBe('parentQuery2');
    expect(parent2.subject).toBe('another subject');
    expect(parent2.lastUpdatedOn).toBe('formatted-2025-02-27T12:00:00Z-en');
    expect(parent2.lastUpdatedBy).toBe('PAGES.QM.VIEW_QUERY.UPDATED_BY_YOU');
    expect(parent2.status).toBe('PAGES.QM.VIEW_QUERY.STATUS_SENT');
  });

  it('should return queries raised by the other party.', () => {
    const claim = new Claim();
    claim.queries = {
      caseMessages: [
        {
          value: {
            id: 'parentQuery1',
            subject: 'test subject',
            createdOn: '2025-02-20T12:00:00Z',
            createdBy: defendantUser.id,
            name: defendantUser.name,
            parentId: null,
            isHearingRelated: 'Yes',
            hearingDate: new Date('2025-05-10'),
          },
        },
        {
          value: {
            id: 'childQuery',
            subject: 'test subject',
            createdOn: '2025-02-27T12:00:00Z',
            createdBy: caseworkerUser.id,
            name: caseworkerUser.name,
            body: 'body 2',
            isHearingRelated: 'No',
            parentId: 'parentQuery1',
            attachments: [
              {
                value: {
                  document_filename: 'document1.pdf',
                  document_binary_url: 'binary-url-1',
                },
              },
            ],
          },
        },
        {
          value: {
            id: 'parentQuery2',
            subject: 'another subject',
            createdOn: '2025-02-27T12:00:00Z',
            createdBy: defendantUser.id,
            name: defendantUser.name,
            parentId: null,
            isHearingRelated: 'No',
          },
        },
      ],
    } as CaseQueries;

    const result = ViewQueriesService.buildQueryListItems(claimantUser.id, claim, 'en');
    expect(result.length).toBe(2);

    const parent1 = result[0];
    expect(parent1.id).toBe('parentQuery1');
    expect(parent1.subject).toBe('test subject');
    expect(parent1.lastUpdatedOn).toBe('formatted-2025-02-27T12:00:00Z-en');
    expect(parent1.lastUpdatedBy).toBe('PAGES.QM.VIEW_QUERY.UPDATED_BY_COURT_STAFF');
    expect(parent1.status).toBe('PAGES.QM.VIEW_QUERY.STATUS_RECEIVED');

    const parent2 = result[1];
    expect(parent2.id).toBe('parentQuery2');
    expect(parent2.subject).toBe('another subject');
    expect(parent2.lastUpdatedOn).toBe('formatted-2025-02-27T12:00:00Z-en');
    expect(parent2.lastUpdatedBy).toBe(defendantUser.name);
    expect(parent2.status).toBe('PAGES.QM.VIEW_QUERY.STATUS_SENT');
  });

  it('should return queries raised by both parties.', () => {
    const claim = new Claim();
    claim.queries = {
      caseMessages: [
        {
          value: {
            id: 'parentQuery1',
            subject: 'claimant query',
            createdOn: '2025-02-20T12:00:00Z',
            createdBy: claimantUser.id,
            name: claimantUser.name,
            parentId: null,
            isHearingRelated: 'Yes',
            hearingDate: new Date('2025-05-10').toISOString(),
          },
        },
        {
          value: {
            id: 'childQuery',
            subject: 'claimant query',
            createdOn: '2025-02-27T12:00:00Z',
            createdBy: caseworkerUser.id,
            name: caseworkerUser.name,
            body: 'body 2',
            isHearingRelated: YesNoUpperCamelCase.YES,
            parentId: 'parentQuery1',
            attachments: [
              {
                value: {
                  document_filename: 'document1.pdf',
                  document_binary_url: 'binary-url-1',
                },
              },
            ],
          },
        },
        {
          value: {
            id: 'parentQuery2',
            subject: 'defendant query',
            createdOn: '2025-02-21T12:00:00Z',
            createdBy: defendantUser.id,
            name: defendantUser.name,
            parentId: null,
            isHearingRelated: YesNoUpperCamelCase.YES,
            hearingDate: new Date('2025-05-10').toISOString(),
          },
        },
      ],
    } as CaseQueries;

    const result = ViewQueriesService.buildQueryListItems(claimantUser.id, claim, 'en');
    expect(result.length).toBe(2);

    const parent1 = result[0];
    expect(parent1.id).toBe('parentQuery1');
    expect(parent1.subject).toBe('claimant query');
    expect(parent1.lastUpdatedOn).toBe('formatted-2025-02-27T12:00:00Z-en');
    expect(parent1.lastUpdatedBy).toBe('PAGES.QM.VIEW_QUERY.UPDATED_BY_COURT_STAFF');
    expect(parent1.status).toBe('PAGES.QM.VIEW_QUERY.STATUS_RECEIVED');

    const parent2 = result[1];
    expect(parent2.id).toBe('parentQuery2');
    expect(parent2.subject).toBe('defendant query');
    expect(parent2.lastUpdatedOn).toBe('formatted-2025-02-21T12:00:00Z-en');
    expect(parent2.lastUpdatedBy).toBe(defendantUser.name);
    expect(parent2.status).toBe('PAGES.QM.VIEW_QUERY.STATUS_SENT');
  });

  it('should return query messages for query raised by the logged in user', () => {
    const claim = new Claim();
    claim.queries = {
      caseMessages: [
        {
          value: {
            id: 'parentQuery1',
            subject: 'test subject',
            body: 'body 1',
            createdOn: '2025-02-20T12:00:00Z',
            createdBy: claimantUser.id,
            name: claimantUser.name,
            parentId: null,
            isHearingRelated: YesNoUpperCamelCase.NO,
          },
        },
        {
          value: {
            id: 'childQuery',
            subject: 'test subject',
            createdOn: '2025-02-27T12:00:00Z',
            createdBy: caseworkerUser.id,
            name: caseworkerUser.name,
            body: 'body 2',
            isHearingRelated: YesNoUpperCamelCase.NO,
            parentId: 'parentQuery1',
            attachments: [
              {
                value: {
                  document_filename: 'document1.pdf',
                  document_binary_url: 'binary-url-1',
                },
              },
            ],
          },
        },
      ],
    } as CaseQueries;

    const result = ViewQueriesService.buildQueryListItemsByQueryId(claim, claimantUser.id,'parentQuery1','en');

    const expected: QueryDetail = new QueryDetail(
      'test subject',
      'PAGES.QM.VIEW_QUERY.STATUS_RECEIVED',
      Array.of(new QueryListItem(
        'body 1',
        YesNoUpperCamelCase.NO,
        [],
        claimantUser.id,
        claimantUser.name,
        'formatted-2025-02-20T12:00:00Z-en',
        '01 Jan 2025',
        true,
        '01 Jan 2025',
      ),

      new QueryListItem(
        'body 2',
        YesNoUpperCamelCase.NO,
        [{ fileName:'document1.pdf', documentUrl: 'formatted-url'}],
        caseworkerUser.id,
        'caseworker',
        'formatted-2025-02-27T12:00:00Z-en',
        '01 Jan 2025',
        false,
        '01 Jan 2025',
      )), false, '',
    );
    expect(result.items.length).toBe(2);
    expect(result).toEqual(expected);
  });

  it('should return query messages for a query not raised by the logged in user', () => {
    const claim = new Claim();
    claim.queries = {
      caseMessages: [
        {
          value: {
            id: 'parentQuery1',
            subject: 'test subject',
            body: 'body 1',
            createdOn: '2025-02-20T12:00:00Z',
            createdBy: defendantUser.id,
            name: defendantUser.name,
            parentId: null,
            isHearingRelated: YesNoUpperCamelCase.YES,
            hearingDate: new Date('2025-05-10').toISOString(),
          },
        },
        {
          value: {
            id: 'childQuery',
            subject: 'test subject',
            createdOn: '2025-02-27T12:00:00Z',
            createdBy: caseworkerUser.id,
            name: caseworkerUser.name,
            body: 'body 2',
            isHearingRelated: YesNoUpperCamelCase.YES,
            hearingDate: new Date('2025-05-10').toISOString(),
            parentId: 'parentQuery1',
            attachments: [
              {
                value: {
                  document_filename: 'document1.pdf',
                  document_binary_url: 'binary-url-1',
                },
              },
            ],
          },
        },
        {
          value: {
            id: 'childQuery2',
            subject: 'test subject',
            body: 'body 3',
            createdOn: '2025-02-28T12:00:00Z',
            createdBy: defendantUser.id,
            name: defendantUser.name,
            parentId: 'parentQuery1',
            isHearingRelated: YesNoUpperCamelCase.YES,
            hearingDate: new Date('2025-05-10').toISOString(),
          },
        },
      ],
    } as CaseQueries;

    const result = ViewQueriesService.buildQueryListItemsByQueryId(claim, claimantUser.id,'parentQuery1','en');

    const expected: QueryDetail = new QueryDetail(
      'test subject',
      'PAGES.QM.VIEW_QUERY.STATUS_SENT',
      Array.of(new QueryListItem(
        'body 1',
        YesNoUpperCamelCase.YES,
        [],
        defendantUser.id,
        defendantUser.name,
        'formatted-2025-02-20T12:00:00Z-en',
        '01 Jan 2025',
        false,
        '01 Jan 2025',
      ),

      new QueryListItem(
        'body 2',
        YesNoUpperCamelCase.YES,
        [{ fileName:'document1.pdf', documentUrl: 'formatted-url'}],
        caseworkerUser.id,
        'caseworker',
        'formatted-2025-02-27T12:00:00Z-en',
        '01 Jan 2025',
        false,
        '01 Jan 2025',
      ),

      new QueryListItem(
        'body 3',
        YesNoUpperCamelCase.YES,
        [],
        defendantUser.id,
        defendantUser.name,
        'formatted-2025-02-28T12:00:00Z-en',
        '01 Jan 2025',
        false,
        '01 Jan 2025',
      ),
      ), false, '',
    );
    expect(result.items.length).toBe(3);
    expect(result).toEqual(expected);
  });

  it('should return queries by without parent id', () => {
    const claim = new Claim();
    claim.queries = {
      caseMessages: [
        {
          value: {
            id: 'parentQuery1',
            subject: 'test subject',
            body: 'body 1',
            createdOn: '2025-02-20T12:00:00Z',
            createdBy: claimantUser.id,
            name: claimantUser.name,
            parentId: null,
            isHearingRelated: YesNoUpperCamelCase.YES,
            hearingDate: new Date('2025-05-10').toISOString(),
          },
        },
      ],
    } as CaseQueries;

    const result = ViewQueriesService.buildQueryListItemsByQueryId(claim, claimantUser.id,'parentQuery1','en');

    const expected: QueryDetail = new QueryDetail(
      'test subject',
      'PAGES.QM.VIEW_QUERY.STATUS_SENT',
      Array.of(new QueryListItem(
        'body 1',
        YesNoUpperCamelCase.YES,
        [],
        claimantUser.id,
        claimantUser.name,
        'formatted-2025-02-20T12:00:00Z-en',
        '01 Jan 2025',
        true,
        '01 Jan 2025',
      )), false, '',
    );
    expect(result.items.length).toBe(1);
    expect(result).toEqual(expected);

  });

  it('should return closed status for queries', () => {
    const claim = new Claim();
    claim.queries = {
      caseMessages: [
        {
          value: {
            id: 'parentQuery1',
            subject: 'test subject',
            body: 'body 1',
            createdOn: '2025-02-20T12:00:00Z',
            createdBy: claimantUser.id,
            name: claimantUser.name,
            parentId: null,
            isHearingRelated: 'No',
          },
        },
        {
          value: {
            id: 'childQuery',
            subject: 'test subject',
            createdOn: '2025-02-27T12:00:00Z',
            createdBy: caseworkerUser.id,
            name: caseworkerUser.name,
            body: 'body 2',
            isHearingRelated: 'No',
            parentId: 'parentQuery1',
            isClosed: 'Yes',
            attachments: [
              {
                value: {
                  document_filename: 'document1.pdf',
                  document_binary_url: 'binary-url-1',
                },
              },
            ],
          },
        },
      ],
    } as CaseQueries;

    const result = ViewQueriesService.buildQueryListItemsByQueryId(claim, claimantUser.id,'parentQuery1','en');

    const expected: QueryDetail = new QueryDetail(
      'test subject',
      'PAGES.QM.VIEW_QUERY.STATUS_CLOSED',
      Array.of(new QueryListItem(
        'body 1',
        YesNoUpperCamelCase.NO,
        [],
        claimantUser.id,
        claimantUser.name,
        'formatted-2025-02-20T12:00:00Z-en',
        '01 Jan 2025',
        true,
        '01 Jan 2025',
      ),

      new QueryListItem(
        'body 2',
        YesNoUpperCamelCase.NO,
        [{ fileName:'document1.pdf', documentUrl: 'formatted-url'}],
        caseworkerUser.id,
        'caseworker',
        'formatted-2025-02-27T12:00:00Z-en',
        '01 Jan 2025',
        false,
        '01 Jan 2025',
      )), true, '01 Jan 2025',
    );
    expect(result.items.length).toBe(2);
    expect(result).toEqual(expected);

  });
});
