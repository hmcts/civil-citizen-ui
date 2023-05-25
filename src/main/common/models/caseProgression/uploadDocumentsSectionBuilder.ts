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

  addCustomInput(title:string, classes:string, hint:string, id:string) {
    const section = ({
      type: ClaimSummaryType.CUSTOM_INPUT,
      data: {
        id: id+'-input',
        name: id+'-input',
        text: title,
        classes:classes,
        hint: hint,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addCustomDateInput(title:string,  hint:string, id: string) {
    const section = ({
      type: ClaimSummaryType.DATE,
      data: {
        id:  id+'-date',
        name: id+'-date',
        text: title,
        hint: hint,
        classes:'govuk-fieldset__legend--s',
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addCustomUploadInput(title:string,  html:string, id: string) {
    const section = ({
      type: ClaimSummaryType.UPLOAD,
      data: {
        id: id+'-file-upload',
        name: id+'-file-upload',
        text: title,
        html: html,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  build() {
    return this._claimSummarySections;
  }
}
