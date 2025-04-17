import {Claim} from 'models/claim';
import {CaseQueries} from 'models/queryManagement/caseQueries';
import {CaseRole} from 'form/models/caseRoles';
import {dateTimeFormat} from 'common/utils/dateUtils';

// Defines the shape of each query item and its computed metadata
export interface QueryListItem {
  id: string;
  subject: string;
  createdOn: Date;
  createdBy: string;
  parentId?: string;
  children: QueryListItem[];
  body: string;
  lastUpdatedOn: Date;
  lastUpdatedOnString: string;
  createdOnString: string;
  lastUpdatedBy: string;
}

export class ViewQueriesService {

  private static getCaseQueries(claim: Claim): CaseQueries | undefined {
    return claim.caseRole === CaseRole.CLAIMANT
      ? claim.qmApplicantCitizenQueries
      : claim.qmRespondentCitizenQueries;
  }

  // Build hierarchical QueryListItem tree with computed fields
  public static buildQueryListItems(claim: Claim, lang: string): QueryListItem[] {
    const queries = this.getCaseQueries(claim);
    if (!queries?.caseMessages) {
      return [];
    }

    // 1. Map raw messages into QueryListItem objects
    const allItems: QueryListItem[] = queries.caseMessages.map(message => ({
      id: message.value.id!,
      subject: message.value.subject,
      createdOn: new Date(message.value.createdOn),
      createdBy: message.value.createdBy,
      parentId: message.value.parentId ?? null,
      body: message.value.body,
      children: [],
      lastUpdatedOn: null,
      lastUpdatedOnString: null,
      createdOnString: null,
      lastUpdatedBy: null,
    }));

    // 2. Build lookup map
    const lookup = new Map<string, QueryListItem>();
    allItems.forEach(item => lookup.set(item.id, item));

    // 3. Link children to parent and collect roots
    const rootItems: QueryListItem[] = [];
    allItems.forEach(item => {
      if (item.body) {
        const parent = lookup.get(item.body);
        if (parent) {
          parent.children.push(item);
        }
      } else {
        rootItems.push(item);
      }
    });

    // 4. Recursively assign lastUpdatedOn (Date)
    function assignLastUpdatedOn(item: QueryListItem): Date {
      let latest = item.createdOn;
      item.children.forEach(child => {
        const childLatest = assignLastUpdatedOn(child);
        if (childLatest > latest) {
          latest = childLatest;
        }
      });
      item.lastUpdatedOn = latest;
      return latest;
    }
    rootItems.forEach(root => assignLastUpdatedOn(root));

    // 5. Count messages and determine who updated last
    function countMessages(item: QueryListItem): number {
      return 1 + item.children.reduce((sum, child) => sum + countMessages(child), 0);
    }
    rootItems.forEach(item => {
      const totalCount = countMessages(item);
      const isEven = totalCount % 2 === 0;
      item.lastUpdatedBy = isEven
        ? 'PAGES.QM.VIEW_QUERY.UPDATED_BY_COURT_STAFF'
        : 'PAGES.QM.VIEW_QUERY.UPDATED_BY_COURT_YOU';
    });

    // 6. Format date fields for the view
    function formatDates(item: QueryListItem): void {
      item.createdOnString = dateTimeFormat(item.createdOn.toISOString(), lang);
      item.lastUpdatedOnString = dateTimeFormat(item.lastUpdatedOn!.toISOString(), lang);
      item.children.forEach(formatDates);
    }
    rootItems.forEach(formatDates);

    return rootItems;
  }
}
