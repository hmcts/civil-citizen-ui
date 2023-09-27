import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {TableCell} from 'models/summaryList/summaryList';
import {TabSectionBuilder} from 'models/caseProgression/TabSectionBuilder';

describe('TabSectionBuilder tests', ()=> {
  const tableHeaders = [{html: 'Column1'}, {html: 'Column2'}] as TableCell[];
  const row1 = [{html: 'Row1 Column1'}, {html: 'Row2 Column2'}] as TableCell[];
  const row2 = [{html: 'Row2 Column 1'}, {html: 'Row2 Column2'}] as TableCell[];
  const tableRows = [row1, row2] as TableCell[][];
  const classes = 'classes';

  it('create table with headers and rows', ()=> {

    //Given
    const tableExpected = ({
      type: ClaimSummaryType.TABLE,
      data: {
        head: tableHeaders,
        classes: classes,
        tableRows: tableRows,
      },
    });

    //When
    const tableActual = new TabSectionBuilder()
      .addTable(tableHeaders, tableRows, classes)
      .build();

    //Then
    expect(tableActual).toEqual([tableExpected]);
  });

  it('create table with headers only', ()=> {

    //Given
    const tableExpected = ({
      type: ClaimSummaryType.TABLE,
      data: {
        head: tableHeaders,
      },
    });

    //When
    const tableActual = new TabSectionBuilder()
      .addTable(tableHeaders)
      .build();

    //Then
    expect(tableActual).toEqual([tableExpected]);
  });

  it('create table with rows only', ()=> {

    //Given
    const tableExpected = ({
      type: ClaimSummaryType.TABLE,
      data: {
        tableRows: tableRows,
      },
    });

    //When
    const tableActual = new TabSectionBuilder()
      .addTable(undefined, tableRows)
      .build();

    //Then
    expect(tableActual).toEqual([tableExpected]);
  });

  it('if no headers or rows given, should not create a table', ()=> {

    //Given
    const tableExpected = [] as any;

    //When
    const tableActual = new TabSectionBuilder()
      .addTable(null, null)
      .build();

    //Then
    expect(tableActual).toEqual(tableExpected);
  });

});
