import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
export class UploadDocumentsSectionBuilder extends PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

  addTitle(title:string) {
    const section = ({
      type: ClaimSummaryType.TITLE,
      data: {
        text: title,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addInputArray(title:string, classes:string, hint:string, category:string, field:string) {
    const section = ({
      type: ClaimSummaryType.INPUT_ARRAY,
      data: {
        category: category,
        field: field,
        text: title,
        classes:classes,
        hint: hint,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addDateArray(title:string, hint:string, category:string) {
    const section = ({
      type: ClaimSummaryType.DATE_ARRAY,
      data: {
        category: category,
        field: 'date',
        text: title,
        hint: hint,
        classes:'govuk-fieldset__legend--s',
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addUploadArray(title:string, html:string, category:string, field:string) {
    const section = ({
      type: ClaimSummaryType.UPLOAD_ARRAY,
      data: {
        category: category,
        field: field,
        text: title,
        html: html,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addSelect(title:string, classes:string, hint:string, choose:string, selectItems:string[], category:string, field:string) {
    const section = ({
      type: ClaimSummaryType.SELECT,
      data: {
        category: category,
        field: field,
        text: title,
        classes:classes,
        hint: hint,
        choose: choose,
        items: selectItems,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  build() {
    return this._claimSummarySections;
  }
}
