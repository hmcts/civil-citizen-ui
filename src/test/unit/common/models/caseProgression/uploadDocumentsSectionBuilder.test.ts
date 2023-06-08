import { UploadDocumentsSectionBuilder } from 'common/models/caseProgression/uploadDocumentsSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';

describe('UploadDocumentsSectionBuilder tests', ()=> {
  it('should create Input Array', ()=> {
    //Given
    const inputArrayExpected = ({
      type: ClaimSummaryType.INPUT_ARRAY,
      data: {
        category: 'category',
        field: 'field',
        text: 'title',
        classes: 'classes',
        hint: 'hint',
        value: 'value',
        index: 0,
      },
    });

    //When
    const inputArrayBuilt = new UploadDocumentsSectionBuilder()
      .addInputArray(inputArrayExpected.data.text,inputArrayExpected.data.classes,
        inputArrayExpected.data.hint,inputArrayExpected.data.category,inputArrayExpected.data.field, inputArrayExpected.data.value)
      .build();

    //Then
    expect(inputArrayBuilt).toEqual([inputArrayExpected]);
  });

  it('should create Date Array', ()=> {
    //Given
    const dateArrayExpected = ({
      type: ClaimSummaryType.DATE_ARRAY,
      data: {
        category: 'category',
        field: 'date',
        text: 'title',
        hint: 'hint',
        dayValue: 'dayValue',
        monthValue: 'monthValue',
        yearValue: 'yearValue',
        index: 0,
      },
    });

    //When
    const dateArrayBuilt = new UploadDocumentsSectionBuilder()
      .addDateArray(dateArrayExpected.data.text,dateArrayExpected.data.hint,
        dateArrayExpected.data.category, dateArrayExpected.data.dayValue, dateArrayExpected.data.monthValue, dateArrayExpected.data.yearValue)
      .build();

    //Then
    expect(dateArrayBuilt).toEqual([dateArrayExpected]);
  });

  it('should create Upload Array', ()=> {
    //Given
    const uploadArrayExpected = ({
      type: ClaimSummaryType.UPLOAD_ARRAY,
      data: {
        category: 'category',
        field: 'field',
        text: 'title',
        html: 'html',
        index: 0,
      },
    });

    //When
    const uploadArrayBuilt = new UploadDocumentsSectionBuilder()
      .addUploadArray(uploadArrayExpected.data.text,uploadArrayExpected.data.html,
        uploadArrayExpected.data.category,uploadArrayExpected.data.field)
      .build();

    //Then
    expect(uploadArrayBuilt).toEqual([uploadArrayExpected]);
  });
});
