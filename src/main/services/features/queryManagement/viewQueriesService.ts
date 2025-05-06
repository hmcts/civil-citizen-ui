import {Claim} from 'models/claim';
import {CaseQueries, FormDocument} from 'models/queryManagement/caseQueries';
import {CaseRole} from 'form/models/caseRoles';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {dateTimeFormat, formatDateToFullDate} from 'common/utils/dateUtils';
import {formatDocumentViewURL} from 'common/utils/formatDocumentURL';

export interface QueryListItem {
  id: string;
  subject: string;
  body: string;
  attachments?: FormDocument[];
  isHearingRelated: YesNoUpperCamelCase;
  hearingDate?: string;
  createdOn: Date;
  parentId?: string;
  children: QueryListItem[];
  lastUpdatedOn: Date;
  lastUpdatedOnString: string;
  createdOnString: string;
  lastUpdatedBy: string;
  status: string;
  parentDocumentLinks?: string[];
  childDocumentLinks?: string[];
  hearingDateString?: string;
}

export class ViewObjects {
  id: string;
  createdBy: string;
  subject: string;
  sentOn: string;
  lastUpdatedBy: string;
  lastUpdatedOn: string;
  status: string;

  constructor(id: string, createdBy: string, subject: string, sentOn: string, lastUpdatedBy: string, lastUpdatedOn: string, status: string) {
    this.id = id;
    this.createdBy = createdBy;
    this.subject = subject;
    this.sentOn = sentOn;
    this.lastUpdatedBy = lastUpdatedBy;
    this.lastUpdatedOn = lastUpdatedOn;
    this.status = status;
  }
}

export class formattedDocument {
  fileName: string;
  documentUrl: string;
}

export class queryListItem {
  messageDetails: string;
  isHearingRelated: YesNoUpperCamelCase;
  hearingDate?: string;
  documents: formattedDocument[];
  sentBy: string;
  sentOn: string;

  constructor(messageDetails: string, isHearingRelated: YesNoUpperCamelCase, documents: formattedDocument[], sentBy: string, sentOn: string, hearingDate?: string ) {
    this.messageDetails = messageDetails;
    this.isHearingRelated = isHearingRelated;
    this.hearingDate = hearingDate;
    this.documents = documents;
    this.sentBy = sentBy;
    this.sentOn = sentOn;
  }
}

export class QueryDetail {
  title: string;
  lastStatus: string;
  items: queryListItem[];

  constructor(title: string, lastStatus: string, items: queryListItem[]) {
    this.title = title;
    this.lastStatus = lastStatus;
    this.items = items;
  }
}

export class ViewQueriesService {

  private static getCaseQueries(claim: Claim): CaseQueries | undefined {
    return claim.caseRole === CaseRole.CLAIMANT
      ? claim.qmApplicantCitizenQueries
      : claim.qmRespondentCitizenQueries;
  }

  public static buildQueryListItems(claim: Claim, lang: string): ViewObjects[] {

    const queries = this.getCaseQueries(claim);
    if (!queries?.caseMessages) {
      return [];
    }

    const viewObjects: ViewObjects[] = [];
    queries.caseMessages.forEach(queryItem => {
      if (queryItem.value.parentId) {
        const viewObject = viewObjects.find((item) => item.id = queryItem.value.parentId);
        if (viewObject.createdBy !== queryItem.value.createdBy) {
          viewObject.lastUpdatedBy = 'PAGES.QM.VIEW_QUERY.UPDATED_BY_COURT_STAFF';
          viewObject.status = 'STATUS_RECEIVED';
        } else {
          viewObject.lastUpdatedBy = 'PAGES.QM.VIEW_QUERY.UPDATED_BY_YOU';
          viewObject.status = 'PAGES.QM.VIEW_QUERY.STATUS_SENT';
        }
        viewObject.lastUpdatedOn = dateTimeFormat(queryItem.value.createdOn, lang);
      } else {
        viewObjects.push(new ViewObjects(
          queryItem.id,
          queryItem.value.createdBy,
          queryItem.value.subject,
          dateTimeFormat(queryItem.value.createdOn, lang),
          'PAGES.QM.VIEW_QUERY.UPDATED_BY_YOU',
          dateTimeFormat(queryItem.value.createdOn, lang),
          'PAGES.QM.VIEW_QUERY.STATUS_SENT',
        ));
      }
    });
    return viewObjects;
  }

  public static buildQueryListItemsByQueryId(claim: Claim, queryId: string, lang: string): QueryDetail {
    const queries = this.getCaseQueries(claim);
    if (!queries?.caseMessages) {
      return undefined;
    }

    const parent = queries.caseMessages.find(claim => claim.id === queryId);
    const children = queries.caseMessages.filter(item => item.value.parentId === queryId);
    const combined = [parent, ...children];
    const lastStatus = combined.length % 2 === 0 ? 'PAGES.QM.VIEW_QUERY.STATUS_RECEIVED' : 'PAGES.QM.VIEW_QUERY.STATUS_SENT'  ;
    const formatted = combined.map(item => {
      const { body, isHearingRelated, hearingDate, attachments, createdBy, createdOn } = item.value;
      const documents = attachments?.map(doc => {
        const { document_filename, document_binary_url } = doc.value ?? {};
        return {
          fileName: document_filename,
          documentUrl: formatDocumentViewURL(document_filename, parent.id, document_binary_url),
        };
      }) || [];

      return new queryListItem(
        body,
        isHearingRelated,
        documents,
        createdBy,
        dateTimeFormat(createdOn, lang),
        formatDateToFullDate(new Date(hearingDate), lang),
      );
    });
    return new QueryDetail(parent.value.subject, lastStatus, formatted);
  }
}
