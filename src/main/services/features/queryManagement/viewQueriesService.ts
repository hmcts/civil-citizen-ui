import {Claim} from 'models/claim';
import {CaseQueries, FormDocument} from 'models/queryManagement/caseQueries';
import {CaseRole} from 'form/models/caseRoles';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {dateTimeFormat} from "common/utils/dateUtils";

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

  public static buildQueryListItemsByQueryId(claim: Claim, queryId: string, lang: string): any[] {
    const queries = this.getCaseQueries(claim);
    if (!queries?.caseMessages) {
      return [];
    }

    const parent = queries.caseMessages.find(claim => claim.value.id === queryId);
    const children = queries.caseMessages.filter(item => item.value.parentId === queryId);
    const combined = [parent, ...children];
    return combined;
  }
}
