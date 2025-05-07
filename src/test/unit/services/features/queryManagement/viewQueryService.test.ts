import {ViewQueriesService} from 'services/features/queryManagement/viewQueriesService';
import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseQueries} from 'models/queryManagement/caseQueries';
import {FormattedDocument, QueryDetail, QueryListItem} from 'form/models/queryManagement/viewQuery';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

jest.mock('common/utils/dateUtils', () => ({
  dateTimeFormat: jest.fn((date, lang) => `formatted-${date}-${lang}`),
  formatDateToFullDate: jest.fn((date, lang) => `fullDate-${date}-${lang}`),
}));

jest.mock('common/utils/formatDocumentURL', () => ({
  formatDocumentViewURL: jest.fn(() => 'formatted-url'),
}));

describe('ViewQueriesService', () => {
  it('should return empty array when no queries', () => {
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    claim.qmApplicantCitizenQueries = { caseMessages: [] };

    const result = ViewQueriesService.buildQueryListItems(claim, 'en');
    expect(result).toEqual([]);
  });

  const testCases = [
    {
      role: CaseRole.CLAIMANT,
      property: 'qmApplicantCitizenQueries',
    },
    {
      role: CaseRole.DEFENDANT,
      property: 'qmRespondentCitizenQueries',
    },
  ];

  it.each(testCases)('should return parent with child queries for %s', ({ role, property }) => {
    const claim = new Claim();
    claim.caseRole = role;
    claim[property] = {
      caseMessages: [
        {
          value: {
            id: 'parentQuery1',
            subject: 'test subject',
            createdOn: '2025-02-20T12:00:00Z',
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
            parentId: null,
            isHearingRelated: 'No',
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

    const result = ViewQueriesService.buildQueryListItems(claim, 'en');
    expect(result.length).toBe(2);

    const parent1 = result[0];
    expect(parent1.id).toBe('parentQuery1');
    expect(parent1.subject).toBe('test subject');
    expect(parent1.lastUpdatedOn).toBe('formatted-2025-02-27T12:00:00Z-en');
    expect(parent1.lastUpdatedBy).toBe('PAGES.QM.VIEW_QUERY.UPDATED_BY_YOU');
    expect(parent1.status).toBe('PAGES.QM.VIEW_QUERY.STATUS_SENT');

    const parent2 = result[1];
    expect(parent2.id).toBe('parentQuery2');
    expect(parent2.subject).toBe('another subject');
    expect(parent2.lastUpdatedOn).toBe('formatted-2025-02-27T12:00:00Z-en');
    expect(parent2.lastUpdatedBy).toBe('PAGES.QM.VIEW_QUERY.UPDATED_BY_YOU');
    expect(parent2.status).toBe('PAGES.QM.VIEW_QUERY.STATUS_SENT');
  });

  it.each(testCases)('should return parent with child queries with COURT_STAFF for %s', ({ role, property }) => {
    const claim = new Claim();
    claim.caseRole = role;
    claim[property] = {
      caseMessages: [
        {
          value: {
            id: 'parentQuery1',
            subject: 'test subject',
            createdOn: '2025-02-20T12:00:00Z',
            createdBy: 'a71d3791-b58d-4a57-957f-78dc48a12462',
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
            createdBy: 'other',
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
            createdBy: 'a71d3791-b58d-4a57-957f-78dc48a12462',
            parentId: null,
            isHearingRelated: 'No',
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

    const result = ViewQueriesService.buildQueryListItems(claim, 'en');
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

  it.each(testCases)('should return queries by with parent id for %s', ({ role, property }) => {
    const claim = new Claim();
    claim.caseRole = role;
    claim[property] = {
      caseMessages: [
        {
          value: {
            id: 'parentQuery1',
            subject: 'test subject',
            body: 'body 1',
            createdOn: '2025-02-20T12:00:00Z',
            createdBy: 'a71d3791-b58d-4a57-957f-78dc48a12462',
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
            createdBy: 'other',
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
      ],
    } as CaseQueries;

    const result = ViewQueriesService.buildQueryListItemsByQueryId(claim, 'parentQuery1','en');

    const expected: QueryDetail = new QueryDetail(
      'test subject',
      'PAGES.QM.VIEW_QUERY.STATUS_RECEIVED',
      Array.of(new QueryListItem(
        'body 1',
        YesNoUpperCamelCase.YES,
        [],
        'a71d3791-b58d-4a57-957f-78dc48a12462',
        'formatted-2025-02-20T12:00:00Z-en',
        'fullDate-Sat May 10 2025 01:00:00 GMT+0100 (British Summer Time)-en',
      ),

      new QueryListItem(
        'body 2',
        YesNoUpperCamelCase.NO,
        Array.of(new FormattedDocument('document1.pdf', 'formatted-url')),
        'other',
        'formatted-2025-02-27T12:00:00Z-en',
        'fullDate-Invalid Date-en',
      )),
    );
    expect(result.items.length).toBe(2);
    expect(result).toEqual(expected);

  });

  it.each(testCases)('should return queries by without parent id for %s', ({ role, property }) => {
    const claim = new Claim();
    claim.caseRole = role;
    claim[property] = {
      caseMessages: [
        {
          value: {
            id: 'parentQuery1',
            subject: 'test subject',
            body: 'body 1',
            createdOn: '2025-02-20T12:00:00Z',
            createdBy: 'a71d3791-b58d-4a57-957f-78dc48a12462',
            parentId: null,
            isHearingRelated: 'Yes',
            hearingDate: new Date('2025-05-10'),
          },
        },
      ],
    };

    const result = ViewQueriesService.buildQueryListItemsByQueryId(claim, 'parentQuery1','en');

    const expected: QueryDetail = new QueryDetail(
      'test subject',
      'PAGES.QM.VIEW_QUERY.STATUS_SENT',
      Array.of(new QueryListItem(
        'body 1',
        YesNoUpperCamelCase.YES,
        [],
        'a71d3791-b58d-4a57-957f-78dc48a12462',
        'formatted-2025-02-20T12:00:00Z-en',
        'fullDate-Sat May 10 2025 01:00:00 GMT+0100 (British Summer Time)-en',
      )),
    );
    expect(result.items.length).toBe(1);
    expect(result).toEqual(expected);

  });

});
