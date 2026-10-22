import {Claim} from 'models/claim';
import {ViewQueriesService} from 'services/features/queryManagement/viewQueriesService';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

describe('ViewQueriesService', () => {
  const userId = 'user-1';

  const buildClaimWithMessages = () => {
    const claim = new Claim();
    claim.queries = {
      caseMessages: [
        {
          value: {
            id: 'q1',
            subject: 'First query',
            body: 'Hello',
            createdBy: `${userId}::CLAIMANT`,
            createdOn: '2024-01-01T10:00:00.000Z',
            name: 'User One',
            isHearingRelated: YesNoUpperCamelCase.NO,
            attachments: [],
          },
        },
        {
          value: {
            id: 'r1',
            parentId: 'q1',
            subject: 'First query',
            body: 'Court reply',
            createdBy: 'staff::CASEWORKER',
            createdOn: '2024-01-02T10:00:00.000Z',
            name: 'Court Staff',
            isHearingRelated: YesNoUpperCamelCase.NO,
            isClosed: YesNoUpperCamelCase.NO,
            attachments: [
              {
                value: {
                  document_filename: 'file.pdf',
                  document_binary_url: 'http://dm/file/binary',
                },
              },
            ],
          },
        },
        {
          value: {
            id: 'q2',
            subject: 'Second query',
            body: 'Another',
            createdBy: `${userId}::CLAIMANT`,
            createdOn: '2024-01-03T10:00:00.000Z',
            name: 'User One',
            isHearingRelated: YesNoUpperCamelCase.YES,
            hearingDate: '2024-02-01',
            attachments: [],
          },
        },
      ],
    } as Claim['queries'];
    return claim;
  };

  it('should return empty threads when no queries', () => {
    expect(ViewQueriesService.getMessageThreads(new Claim())).toEqual([]);
  });

  it('should group parent and child messages into threads', () => {
    const threads = ViewQueriesService.getMessageThreads(buildClaimWithMessages());
    expect(threads).toHaveLength(2);
    expect(threads[0][0].id).toBe('q1');
    expect(threads[0]).toHaveLength(2);
    expect(threads[1][0].id).toBe('q2');
    expect(threads.map(thread => thread.map(message => [message.id, message.body]))).toEqual([
      [['q1', 'Hello'], ['r1', 'Court reply']], [['q2', 'Another']],
    ]);
  });

  it('should get a single message thread by id', () => {
    const thread = ViewQueriesService.getMessageThread(buildClaimWithMessages(), 'q1');
    expect(thread).toHaveLength(2);
    expect(thread.map(message => message.id)).toEqual(['q1', 'r1']);
  });

  it('should build query list items with court received status for even-length threads', () => {
    const items = ViewQueriesService.buildQueryListItems(userId, buildClaimWithMessages(), 'en');
    expect(items.length).toBe(2);
    const first = items.find(i => i.id === 'q1');
    expect(first.status).toBe('PAGES.QM.VIEW_QUERY.STATUS_RECEIVED');
    expect(first.lastUpdatedBy).toBe('PAGES.QM.VIEW_QUERY.UPDATED_BY_COURT_STAFF');
    const second = items.find(i => i.id === 'q2');
    expect(second.status).toBe('PAGES.QM.VIEW_QUERY.STATUS_SENT');
  });

  it('should build query detail by id including attachments', () => {
    const detail = ViewQueriesService.buildQueryListItemsByQueryId(buildClaimWithMessages(), userId, 'q1', 'en');
    expect(detail.title).toBe('First query');
    expect(detail.lastStatus).toBe('PAGES.QM.VIEW_QUERY.STATUS_RECEIVED');
    expect(detail.items).toHaveLength(2);
    expect(detail.items.map(item => item.documents.map(document => document.fileName))).toEqual([[], ['file.pdf']]);
  });

  it('should mark closed status when a message is closed', () => {
    const claim = buildClaimWithMessages();
    claim.queries.caseMessages[1].value.isClosed = YesNoUpperCamelCase.YES;
    const detail = ViewQueriesService.buildQueryListItemsByQueryId(claim, userId, 'q1', 'en');
    expect(detail.isQueryClosed).toBe(true);
    expect(detail.lastStatus).toBe('PAGES.QM.VIEW_QUERY.STATUS_CLOSED');
    expect(detail.queryClosedDate).toBe('2 January 2024');
  });
});
