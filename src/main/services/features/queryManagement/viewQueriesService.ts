import {Claim} from 'models/claim';
import {CaseQueries} from 'models/queryManagement/caseQueries';
import {CaseRole} from 'form/models/caseRoles';
import {dateTimeFormat} from 'common/utils/dateUtils';

export interface QueryListItem {
  id: string;
  subject: string;
  createdOn: Date;
  parentId?: string;
  children: QueryListItem[];
  lastUpdatedOn: Date;
  lastUpdatedOnString: string;
  createdOnString: string;
  lastUpdatedBy: string;
  status: string;
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

    const allQueryItems: QueryListItem[] = queries.caseMessages.map(message => ({
      id: message.value.id,
      subject: message.value.subject,
      createdOn: new Date(message.value.createdOn),
      parentId: message.value.parentId ?? null,
      children: [],
      lastUpdatedOn: null,
      lastUpdatedOnString: null,
      createdOnString: null,
      lastUpdatedBy: null,
      status: null,
    }));

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
    });

    return parentQueryItems;
  }
}
