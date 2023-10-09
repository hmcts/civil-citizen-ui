import {TitledSummaryRowElement, Value} from 'models/summaryList/summaryList';

export const buildTitledSummaryRowValue = (titledSummaryRowElements: TitledSummaryRowElement[]): Value => {

  const summaryRowValue = {html: ''} as Value;
  const nextLine = '</br>';
  const sectionBreak = '<hr class="govuk-section-break--visible--l">';

  let index = 0;
  for(const element of titledSummaryRowElements){
    index++;
    summaryRowValue.html = summaryRowValue.html + getBoldTitle(element.title)+nextLine+element.value;
    summaryRowValue.html = index < titledSummaryRowElements.length ? summaryRowValue.html + sectionBreak : summaryRowValue.html;
  }

  return summaryRowValue;
};

const getBoldTitle = (title: string): string => {

  return `<span class="govuk-!-font-weight-bold">${title}</span>`;

};
