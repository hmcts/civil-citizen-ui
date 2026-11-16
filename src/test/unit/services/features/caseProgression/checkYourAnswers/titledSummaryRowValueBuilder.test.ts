import {TitledSummaryRowElement, Value} from 'models/summaryList/summaryList';
import {
  buildTitledSummaryRowValue,
} from 'services/features/caseProgression/checkYourAnswers/titledSummaryRowValueBuilder';

describe('test titleSummaryRowValueBuilder', () => {
  const title = 'title';
  const value = 'value';
  const nextLine = '</br>';
  const sectionBreak = '<hr class="govuk-section-break--visible--l">';

  test('Creates summary row value without break, if size 1', () => {
    //Given
    const expectedTitle = `<span class="govuk-!-font-weight-bold">${title}</span>`;
    const expectedTitledSummaryRowValue = {html: expectedTitle+nextLine+value} as Value;
    const singleTitledSummaryRowElement = [{title: title, value: value}] as TitledSummaryRowElement[];

    //When
    const actualTitledSummaryRowValue = buildTitledSummaryRowValue(singleTitledSummaryRowElement);

    //Then
    expect(actualTitledSummaryRowValue).toEqual(expectedTitledSummaryRowValue);

  });

  test('Creates summary row value with break, if larger than 1', () => {
    //Given
    const expectedTitle = `<span class="govuk-!-font-weight-bold">${title}</span>`;
    const expectedTitledSummaryRowValue = {html: expectedTitle+nextLine+value+sectionBreak+expectedTitle+nextLine+value} as Value;
    const multipleTitledSummaryRowElement = [{title: title, value: value}, {title: title, value: value}] as TitledSummaryRowElement[];

    //When
    const actualTitledSummaryRowValue = buildTitledSummaryRowValue(multipleTitledSummaryRowElement);

    //Then
    expect(actualTitledSummaryRowValue).toEqual(expectedTitledSummaryRowValue);
  });

  test('Escapes text values while preserving explicitly supplied HTML', () => {
    const elements = [
      {title: '<Title>', value: '<strong>literal</strong>'},
      {title: 'Document', html: '<a href="/document">document.pdf</a>'},
    ] as TitledSummaryRowElement[];

    const actualTitledSummaryRowValue = buildTitledSummaryRowValue(elements);

    expect(actualTitledSummaryRowValue.html).toContain('&lt;Title&gt;');
    expect(actualTitledSummaryRowValue.html).toContain('&lt;strong&gt;literal&lt;/strong&gt;');
    expect(actualTitledSummaryRowValue.html).toContain('<a href="/document">document.pdf</a>');
  });
});
