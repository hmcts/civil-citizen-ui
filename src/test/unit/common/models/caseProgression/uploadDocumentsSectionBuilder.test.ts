import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';

describe('UploadDocumentsSectionBuilder tests', ()=> {
  it('should add Select', ()=> {
    //Given
    const selectExpected = ({
      type: ClaimSummaryType.SELECT,
      data: {
        category: 'category',
        field: 'field',
        text: 'title',
        classes: 'classes',
        hint: 'hint',
        choose: 'choose',
        items: ['item1','item2','item2'],
      },
    });

    //When
    const selectBuilt = new UploadDocumentsSectionBuilder()
      .addSelect(selectExpected.data.text,selectExpected.data.classes,selectExpected.data.hint
        ,selectExpected.data.choose,selectExpected.data.items,selectExpected.data.category,selectExpected.data.field)
      .build();

    //Then
    expect(selectBuilt).toEqual([selectExpected]);
  });
});
