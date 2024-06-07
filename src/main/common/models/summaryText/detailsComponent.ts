import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export class DetailsComponentContentBuilder extends PageSectionBuilder {

  addTitle(title: string, variables?: any, classes ='') {
    const titleSection = ({
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: title,
        variables: variables,
        classes: 'govuk-!-font-weight-bold govuk-!-margin-0 ' + classes,
      },
    });
    this._claimSummarySections.push(titleSection);
    return this;
  }
}

export class DetailsComponent {
  title : string;
  content : ClaimSummarySection[];

  constructor(title: string, content: ClaimSummarySection[]) {
    this.title = title;
    this.content = content;
  }
}
