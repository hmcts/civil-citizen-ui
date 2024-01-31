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
        errorMessage: null as string,
      },
    });

    //When
    const inputArrayBuilt = new UploadDocumentsSectionBuilder()
      .addInputArray(inputArrayExpected.data.text,inputArrayExpected.data.classes,
        inputArrayExpected.data.hint,inputArrayExpected.data.category,inputArrayExpected.data.field, inputArrayExpected.data.value)
      .build();

    //Then
    expect(inputArrayBuilt).toEqual([inputArrayExpected]);
    expect(inputArrayBuilt[0].type).toEqual(ClaimSummaryType.INPUT_ARRAY);
  });

  it('should create Date Array', ()=> {
    //Given
    const errors = {
      invalidDayError : 'invalidDayError',
      invalidMonthError : 'invalidMonthError',
      invalidYearError : 'invalidYearError',
      invalidDateError : 'invalidDateError',
    };

    const dateArrayExpected = ({
      type: ClaimSummaryType.DATE_ARRAY,
      data: {
        category: 'category',
        parentField: 'parentField',
        field: 'date',
        text: 'title',
        hint: 'hint',
        invalidDayError: 'invalidDayError',
        invalidMonthError: 'invalidMonthError',
        invalidYearError: 'invalidYearError',
        invalidDateError: 'invalidDateError',
        dayValue: 'dayValue',
        monthValue: 'monthValue',
        yearValue: 'yearValue',
        index: 0,
      },
    });

    //When
    const dateArrayBuilt = new UploadDocumentsSectionBuilder()
      .addDateArray(dateArrayExpected.data.text, errors, dateArrayExpected.data.hint,
        dateArrayExpected.data.category, dateArrayExpected.data.parentField,  dateArrayExpected.data.field, dateArrayExpected.data.dayValue, dateArrayExpected.data.monthValue, dateArrayExpected.data.yearValue)
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
        caseDocument: '',
        classes: '',
        errorMessage: '',
        documentName: '',
      },
    });

    //When
    const uploadArrayBuilt = new UploadDocumentsSectionBuilder()
      .addUploadArray(uploadArrayExpected.data.text,uploadArrayExpected.data.html,
        uploadArrayExpected.data.category,uploadArrayExpected.data.field, 0, uploadArrayExpected.data.classes, uploadArrayExpected.data.errorMessage)
      .build();

    //Then
    expect(uploadArrayBuilt).toEqual([uploadArrayExpected]);
  });

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
        items: [{'value': '', 'text': ''}],
        value: '',
        index: 0,
        errorMessage: null as string,
      },
    });

    //When
    const selectBuilt = new UploadDocumentsSectionBuilder()
      .addSelect(selectExpected.data.text,selectExpected.data.classes,selectExpected.data.hint
        ,selectExpected.data.choose,selectExpected.data.items,selectExpected.data.category,selectExpected.data.field, selectExpected.data.value)
      .build();

    //Then
    expect(selectBuilt).toEqual([selectExpected]);
  });
});
