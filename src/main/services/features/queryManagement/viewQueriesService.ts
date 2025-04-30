import {Claim} from 'models/claim';
import {CaseQueries, FormDocument} from 'models/queryManagement/caseQueries';
import {CaseRole} from 'form/models/caseRoles';
import {dateTimeFormat, formatDateToFullDate} from 'common/utils/dateUtils';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
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

export class ViewQueriesService {

  private static getCaseQueries(claim: Claim): CaseQueries | undefined {
    return claim.caseRole === CaseRole.CLAIMANT
      ? claim.qmApplicantCitizenQueries
      : claim.qmRespondentCitizenQueries;
  }

  public static buildQueryListItems(claim: Claim, lang: string): QueryListItem[] {
    const queries = this.getCaseQueries(claim);
    if (!queries?.caseMessages) {
      return [];
    }

    const allQueryItems: QueryListItem[] = queries.caseMessages.map(message => {
      const attachments = message.value.attachments ?? [];
      const documentLinks: string[] = [];

      attachments.forEach(attachment => {
        const { document_filename, document_binary_url } = attachment.value ?? {};
        if (document_binary_url) {
          documentLinks.push(formatDocumentViewURL(document_filename, claim.id, document_binary_url));
        }
      });

      return {
        id: message.value.id,
        subject: message.value.subject,
        body: message.value.body,
        attachments: message.value.attachments,
        isHearingRelated: message.value.isHearingRelated,
        hearingDate: message.value.hearingDate,
        createdOn: new Date(message.value.createdOn),
        parentId: message.value.parentId ?? null,
        children: [],
        lastUpdatedOn: null,
        lastUpdatedOnString: null,
        createdOnString: null,
        lastUpdatedBy: null,
        parentDocumentLinks: null,
        childDocumentLinks: null,
        hearingDateString: null,
        status: null,
        ...(message.value.parentId ? { childDocumentLinks: documentLinks } : { parentDocumentLinks: documentLinks }),
      };
    });

    const lookup = new Map<string, QueryListItem>();
    allQueryItems.forEach(item => lookup.set(item.id, item));

    const parentQueryItems: QueryListItem[] = [];
    allQueryItems.forEach(queryItem => {
      if (queryItem.parentId) {
        const isChildQuery = lookup.get(queryItem.parentId);
        if (isChildQuery) {
          isChildQuery.children.push(queryItem);
        }
      } else {
        parentQueryItems.push(queryItem);
      }
    });

    // Determine the date the query thread was last updated on i.e. the created date of the latest query.
    parentQueryItems.forEach(parent => {
      const latest = parent.children.reduce((latestDate, child) =>
        child.createdOn > latestDate ? child.createdOn : latestDate, parent.createdOn,
      );
      parent.lastUpdatedOn = latest;
    });

    // Determine who has last updated the query thread, if the number of queries parent + child are odd,
    // it was updated by claimant/defendant user, else if even last updated by court user
    parentQueryItems.forEach(parent => {
      const totalCount = 1 + parent.children.length;
      const isEven = totalCount % 2 === 0;
      parent.lastUpdatedBy = isEven
        ? 'PAGES.QM.VIEW_QUERY.UPDATED_BY_COURT_STAFF'
        : 'PAGES.QM.VIEW_QUERY.UPDATED_BY_YOU';
      parent.status = isEven
        ? 'PAGES.QM.VIEW_QUERY.STATUS_RECEIVED'
        : 'PAGES.QM.VIEW_QUERY.STATUS_SENT';
    });

    parentQueryItems.forEach(parent => {
      parent.createdOnString = dateTimeFormat(parent.createdOn.toISOString(), lang);
      parent.lastUpdatedOnString = dateTimeFormat(parent.lastUpdatedOn.toISOString(), lang);
      parent.hearingDateString = formatDateToFullDate(new Date(parent.hearingDate), lang);

      parent.children.forEach(child => {
        child.createdOnString = dateTimeFormat(child.createdOn.toISOString(), lang);
      });
    });

    return parentQueryItems;
  }
}
