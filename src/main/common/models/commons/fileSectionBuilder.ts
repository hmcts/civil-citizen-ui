import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export class FileSectionBuilder extends PageSectionBuilder {
  _claimSummarySections: [] = [];

  addRow(fileName: string, fileUploadDate: string){

    const tableSection = {
      fileName: fileName,
      fileUploadDate: fileUploadDate,
      fileUploadDateInformation: {
        url: 'url',
        text: 'text',
      },
    };

    // @ts-ignore
    this._claimSummarySections.push(tableSection);
    return this;
  }

  build() {
    return this._claimSummarySections;
  }
}
