import {TitledSummaryRowElement, Value} from 'models/summaryList/summaryList';
import {escapeHtml} from 'common/utils/escapeHtml';

export const buildTitledSummaryRowValue = (titledSummaryRowElements: TitledSummaryRowElement[]): Value => {

  const summaryRowValue = {html: ''} as Value;
  const nextLine = '</br>';
  const sectionBreak = '<hr class="govuk-section-break--visible--l">';

  let index = 0;
  for(const element of titledSummaryRowElements){
    index++;
    const elementValue = element.html ?? escapeHtml(element.value);
    summaryRowValue.html = summaryRowValue.html + getBoldTitle(element.title)+nextLine+elementValue;
    summaryRowValue.html = index < titledSummaryRowElements.length ? summaryRowValue.html + sectionBreak : summaryRowValue.html;
  }

  return summaryRowValue;
};

const getBoldTitle = (title: string): string => {

  return `<span class="govuk-!-font-weight-bold">${escapeHtml(title)}</span>`;

};
