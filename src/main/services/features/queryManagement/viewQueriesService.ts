import {Claim} from 'models/claim';
import {CaseQueries} from 'models/queryManagement/caseQueries';
import {CaseRole} from 'form/models/caseRoles';
import {dateTimeFormat, formatDateToFullDate} from 'common/utils/dateUtils';
import {formatDocumentViewURL} from 'common/utils/formatDocumentURL';
import {QueryDetail, QueryListItem, ViewObjects} from 'form/models/queryManagement/viewQuery';

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
          viewObject.status = 'PAGES.QM.VIEW_QUERY.STATUS_RECEIVED';
        } else {
          viewObject.lastUpdatedBy = 'PAGES.QM.VIEW_QUERY.UPDATED_BY_YOU';
          viewObject.status = 'PAGES.QM.VIEW_QUERY.STATUS_SENT';
        }
        viewObject.lastUpdatedOn = dateTimeFormat(queryItem.value.createdOn, lang);
      } else {
        viewObjects.push(new ViewObjects(
          queryItem.value.id,
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
    const parent = queries.caseMessages.find(query => query.value.id === queryId);
    const children = queries.caseMessages.filter(query => query.value.parentId === queryId);
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

      return new QueryListItem(
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
