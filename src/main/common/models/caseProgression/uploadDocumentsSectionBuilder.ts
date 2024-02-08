import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {CaseDocument} from 'models/document/caseDocument';

export class UploadDocumentsSectionBuilder extends PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

  addInputArray(title: string, classes: string, hint: string, category: string, field: string, value: string = null, index = 0, errorMessage: string = null) {
    const section = ({
      type: ClaimSummaryType.INPUT_ARRAY,
      data: {
        category: category,
        field: field,
        text: title,
        classes: classes,
        hint: hint,
        value: value,
        index: index,
        errorMessage: errorMessage,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addDateArray(title: string, invalidDateErrors: Record<string, string>, hint: string, category: string, parentField = '', field: string, dayValue: string, monthValue: string, yearValue: string, index = 0) {
    const section = ({
      type: ClaimSummaryType.DATE_ARRAY,
      data: {
        category: category,
        parentField: parentField,
        field: field,
        text: title,
        hint: hint,
        invalidDayError: invalidDateErrors.invalidDayError,
        invalidMonthError: invalidDateErrors.invalidMonthError,
        invalidYearError: invalidDateErrors.invalidYearError,
        invalidDateError: invalidDateErrors.invalidDateError,
        dayValue: dayValue,
        monthValue: monthValue,
        yearValue: yearValue,
        index: index,

      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addUploadArray(title: string, html: string, category: string, field: string, index = 0, classes?: string, errorMessage?: string, caseDocument?: CaseDocument) {
    const section = ({
      type: ClaimSummaryType.UPLOAD_ARRAY,
      data: {
        category: category,
        classes: classes,
        field: field,
        text: title,
        html: html,
        index: index,
        errorMessage: errorMessage,
        caseDocument: caseDocument ? JSON.stringify(caseDocument) : '',
        documentName: caseDocument ? caseDocument.documentName : '',
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addRemoveSectionButton(showRemoveButton = false, category?: string, index = 0) {
    if (showRemoveButton) {
      const titleSection = ({
        type: ClaimSummaryType.REMOVE_BUTTON,
        data: {
          category: category,
          index: index,
          classes: 'govuk-button govuk-button--secondary moj-add-another__remove-button',
        },
      });
      this._claimSummarySections.push(titleSection);
    }
    return this;
  }

  addSelect(title:string, classes:string, hint:string, choose:string, selectItems: ({
    text: string;
    value: string
  })[], category:string, field:string, value: string = null, index = 0, errorMessage: string = null) {
    const section = ({
      type: ClaimSummaryType.SELECT,
      data: {
        category: category,
        field: field,
        text: title,
        classes: classes,
        hint: hint,
        choose: choose,
        items: selectItems,
        value: value,
        index: index,
        errorMessage: errorMessage,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  build() {
    return this._claimSummarySections;
  }
}
