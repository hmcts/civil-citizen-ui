import {ViewQueriesService} from 'services/features/queryManagement/viewQueriesService';
import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseQueries} from 'models/queryManagement/caseQueries';

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
});
