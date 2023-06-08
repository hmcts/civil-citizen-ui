import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export class UploadDocumentsSectionBuilder extends PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

  addTitle(title: string) {
    const section = ({
      type: ClaimSummaryType.TITLE,
      data: {
        text: title,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addInputArray(title: string, classes: string, hint: string, category: string, field: string, value: string = null, index = 0, error: string = null) {
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
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addDateArray(title: string, hint: string, category: string, dayValue: string = null, monthValue: string = null, yearValue: string = null, index = 0) {
    const section = ({
      type: ClaimSummaryType.DATE_ARRAY,
      data: {
        category: category,
        field: 'date',
        text: title,
        hint: hint,
        dayValue: dayValue,
        monthValue: monthValue,
        yearValue: yearValue,
        index: index,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addUploadArray(title: string, html: string, category: string, field: string, index = 0) {
    const section = ({
      type: ClaimSummaryType.UPLOAD_ARRAY,
      data: {
        category: category,
        field: field,
        text: title,
        html: html,
        index: index,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addRemoveSectionButton(showRemoveButton = false) {
    if (showRemoveButton) {
      const titleSection = ({
        type: ClaimSummaryType.BUTTON,
        data: {
          classes: 'govuk-button govuk-button--secondary moj-add-another__remove-button',
        },
      });
      this._claimSummarySections.push(titleSection);
    }
    return this;
  }

  build() {
    return this._claimSummarySections;
  }
}
