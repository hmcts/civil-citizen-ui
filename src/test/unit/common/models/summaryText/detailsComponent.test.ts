import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {DetailsComponentContentBuilder} from 'models/summaryText/detailsComponent';

describe('Details componet tests', ()=> {
  it('should create title as paragraph bold', ()=> {
    //Given
    const titleExpected = ({
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'text',
        variables: 'variables',
        classes: 'govuk-!-font-weight-bold govuk-!-margin-0 ' ,
      },
    });

    //When
    const titleBuilt = new DetailsComponentContentBuilder()
      .addTitle(titleExpected.data.text,titleExpected.data.variables)
      .build();

    //Then
    expect(titleBuilt).toEqual([titleExpected]);
  });
});
