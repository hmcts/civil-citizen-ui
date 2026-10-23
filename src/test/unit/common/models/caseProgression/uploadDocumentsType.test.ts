import {UploadDocumentTypes, UploadEvidenceWitness} from 'models/caseProgression/uploadDocumentsType';
import {Document} from 'common/models/document/document';

describe('testing of UploadDocumentTypes class', () => {
  it('should return formatted created date when caseDocument is set', () => {
    const caseDocument = new UploadEvidenceWitness('name', new Date(2023, 3, 26), {} as Document, new Date(2023, 3, 26));
    expect(new UploadDocumentTypes(true, caseDocument).createdDateTimeFormatted).toBe('26 Apr 2023');
  });

  it('should return empty string when caseDocument is not set', () => {
    expect(new UploadDocumentTypes(true).createdDateTimeFormatted).toBe('');
  });
});
