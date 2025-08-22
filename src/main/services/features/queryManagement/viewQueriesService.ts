import {Claim} from 'models/claim';
import {CaseMessage, QueryMessage} from 'models/queryManagement/caseQueries';
import {dateTimeFormat, formatDateToFullDate} from 'common/utils/dateUtils';
import {formatDocumentViewURL} from 'common/utils/formatDocumentURL';
import {QueryDetail, QueryListItem, ViewObjects} from 'form/models/queryManagement/viewQuery';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

export class ViewQueriesService {

  private static getCaseMessages(claim: Claim): QueryMessage[] {
    return claim.queries?.caseMessages || [];
  }

  public static getMessageThreads(claim:Claim) {
    const allMessages = this.getCaseMessages(claim)
      .map(messageItem => messageItem.value);
    return allMessages
      .filter(message => !message.parentId)
      .map(parentMessage => [parentMessage, ...allMessages.filter(message => message.parentId === parentMessage.id)] as CaseMessage[] );
  }

  public static getMessageThread(claim:Claim, messageId: string) {
    return this.getMessageThreads(claim).find(thread => thread[0].id === messageId);
  }

  public static buildQueryListItems(userId: string, claim: Claim, lang: string): ViewObjects[] {
    const messageThreads = this.getMessageThreads(claim)
      .map(messageThread => {
        const parentMessage = messageThread[0];
        const latestMessage = messageThread[messageThread.length - 1];

        const viewObject = {
          id: parentMessage.id,
          subject: parentMessage.subject,
          sentOn: dateTimeFormat(parentMessage.createdOn, lang, true),
          createdBy: parentMessage.createdBy === userId ? 'PAGES.QM.VIEW_QUERY.UPDATED_BY_YOU' : parentMessage.name,
          lastUpdatedOn: dateTimeFormat(latestMessage.createdOn, lang, true),
        } as ViewObjects;

        if (messageThread.length % 2 == 0) {
          return {...viewObject,
            lastUpdatedBy: 'PAGES.QM.VIEW_QUERY.UPDATED_BY_COURT_STAFF',
            status: latestMessage.isClosed === YesNoUpperCamelCase.YES ? 'PAGES.QM.VIEW_QUERY.STATUS_CLOSED' : 'PAGES.QM.VIEW_QUERY.STATUS_RECEIVED',
          };
        }
        else {
          return {...viewObject,
            lastUpdatedBy: latestMessage.createdBy === userId ? 'PAGES.QM.VIEW_QUERY.UPDATED_BY_YOU' : latestMessage.name,
            status: 'PAGES.QM.VIEW_QUERY.STATUS_SENT',
          };
        }
      });
    messageThreads.sort((a, b) => {
      return new Date(b.lastUpdatedOn).getTime() - new Date(a.lastUpdatedOn).getTime();
    });
    return messageThreads;
  }

  public static buildQueryListItemsByQueryId(claim: Claim, userId:string, queryId: string, lang: string): QueryDetail {
    const messageThread = this.getMessageThread(claim, queryId);
    const parent = messageThread[0];
    const isQueryClosed = messageThread.some(message => message.isClosed === 'Yes');
    const queryClosedDate = isQueryClosed ? messageThread.filter(message => message.isClosed === 'Yes')
      .map(message => formatDateToFullDate(new Date(message.createdOn), lang))?.[0] : '';
    const lastStatus = isQueryClosed ? 'PAGES.QM.VIEW_QUERY.STATUS_CLOSED'
      : messageThread.length % 2 === 0 ? 'PAGES.QM.VIEW_QUERY.STATUS_RECEIVED' : 'PAGES.QM.VIEW_QUERY.STATUS_SENT'  ;
    const formatted = messageThread.map((item, index) => {
      const { body, isHearingRelated, hearingDate, attachments, createdBy, createdOn, name } = item;
      const documents = attachments?.map(doc => {
        const { document_filename, document_binary_url } = doc.value ?? {};
        return {
          fileName: document_filename,
          documentUrl: formatDocumentViewURL(document_filename, parent.id, document_binary_url),
        };
      }) || [];

      return new QueryListItem(
        body,
        isHearingRelated,
        documents,
        createdBy,
        name,
        dateTimeFormat(createdOn, lang, true),
        item.createdBy === userId,
        formatDateToFullDate(new Date(hearingDate), lang),
      );
    });
    return new QueryDetail(parent.subject, lastStatus, formatted, isQueryClosed, queryClosedDate);
  }
}
