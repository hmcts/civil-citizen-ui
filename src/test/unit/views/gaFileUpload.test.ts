import * as path from 'path';
import * as nunjucks from 'nunjucks';

describe('gaFileUpload macro', () => {
  let env: nunjucks.Environment;

  beforeAll(() => {
    env = nunjucks.configure([
      path.join(process.cwd(), 'src/main/views'),
      path.join(process.cwd(), 'node_modules/govuk-frontend/dist'),
    ], {autoescape: true});
  });

  const uploadedFileRow = (documentName: string) => ({key: {text: documentName}, actions: {items: [{href: '/delete'}]}});
  const typeOfDocumentRow = {key: {text: 'Type of document'}, value: {text: 'Witness statement'}};

  const render = (params: object, callerContent = '') => env.renderString(
    '{% from "macro/generalApplication/file-upload.njk" import gaFileUpload %}'
      + (callerContent
        ? `{% call gaFileUpload(t, params) %}${callerContent}{% endcall %}`
        : '{{ gaFileUpload(t, params) }}'),
    {t: (key: string) => key, params},
  );

  const count = (html: string, text: string) => html.split(text).length - 1;

  it('shows one upload box that takes one file when nothing is uploaded', () => {
    const html = render({id: 'selectedFile', summaryRows: []});

    expect(count(html, 'app-uploaded-file-slot"')).toBe(0);
    expect(count(html, 'class="row-container')).toBe(1);
    expect(html).not.toContain('data-has-uploaded-files');
    expect(html).toContain('data-single-upload-box="true"');
    expect(html).not.toMatch(/<input[^>]*name="selectedFile"[^>]*multiple/);
    expect(html).toContain('PAGES.UPLOAD_DOCUMENTS.ADD_ANOTHER_FILE_HINT');
    expect(html).toContain('data-i18n.choose-files-button="COMMON.FILE_UPLOAD.CHOOSE_FILE"');
    expect(html).toContain('PAGES.UPLOAD_DOCUMENTS.ADD_ANOTHER_FILE');
    expect(html).toContain('js-auto-upload-button');
  });

  it('shows a filled upload box for each uploaded file before the empty box', () => {
    const html = render({id: 'selectedFile', summaryRows: [typeOfDocumentRow, uploadedFileRow('statement.pdf'), uploadedFileRow('evidence.png')]});

    expect(count(html, 'app-uploaded-file-slot"')).toBe(2);
    expect(html.indexOf('statement.pdf')).toBeLessThan(html.indexOf('evidence.png'));
    expect(html.indexOf('evidence.png')).toBeLessThan(html.indexOf('class="row-container'));
    expect(html).not.toContain('Witness statement');
    expect(html).toContain('data-has-uploaded-files="true"');
  });

  it('does not mark files as uploaded when only other rows are listed', () => {
    expect(render({id: 'selectedFile', summaryRows: [typeOfDocumentRow]})).not.toContain('data-has-uploaded-files');
  });

  it('passes the file type and size messages to the upload script', () => {
    const html = render({id: 'selectedFile', summaryRows: []});

    expect(html).toContain('data-file-type-error="ERRORS.VALID_MIME_TYPE_FILE"');
    expect(html).toContain('data-file-size-error="ERRORS.VALID_SIZE_FILE"');
    expect(html).toContain('data-error-summary-title="ERRORS.THERE_WAS_A_PROBLEM"');
    expect(html).toContain('data-error-prefix="ERRORS.ERROR"');
  });

  it('works without a summary list', () => {
    expect(count(render({id: 'selectedFile'}), 'class="row-container')).toBe(1);
  });

  it('shows the error and puts caller content and save button attributes in the upload box', () => {
    const html = render({
      id: 'fileUpload',
      errorText: 'Choose a file',
      saveButtonAttributes: {'data-auto-upload-requires': 'typeOfDocument'},
    }, '<input id="typeOfDocument">');

    const uploadBox = html.slice(html.indexOf('class="row-container'));
    expect(uploadBox.indexOf('id="typeOfDocument"')).toBeGreaterThan(-1);
    expect(uploadBox.indexOf('id="typeOfDocument"')).toBeLessThan(uploadBox.indexOf('type="file"'));
    expect(html).toContain('Choose a file');
    expect(html).toContain('data-auto-upload-requires="typeOfDocument"');
  });
});

describe('gaUploadedFiles macro', () => {
  let env: nunjucks.Environment;

  beforeAll(() => {
    env = nunjucks.configure([
      path.join(process.cwd(), 'src/main/views'),
      path.join(process.cwd(), 'node_modules/govuk-frontend/dist'),
    ], {autoescape: true});
  });

  const uploadedFileRow = (documentName: string, documentId: string) => ({key: {text: documentName}, actions: {items: [{href: '/delete'}]}, documentId});
  const typeOfDocumentRow = (type: string) => ({key: {text: 'Type of document'}, value: {text: type}});

  const render = (summaryRows: object[]) => env.renderString(
    '{% from "macro/generalApplication/file-upload.njk" import gaUploadedFiles %}{{ gaUploadedFiles(t, summaryRows) }}',
    {t: (key: string) => key, summaryRows},
  );

  it('shows the heading and an empty row when nothing is uploaded', () => {
    const html = render([]);

    expect(html).toContain('PAGES.UPLOAD_DOCUMENTS.UPLOADED_FILE');
    expect(html).toContain('PAGES.UPLOAD_DOCUMENTS.NO_FILE_UPLOADED');
    expect(html).not.toContain('app-uploaded-file');
  });

  it('marks each uploaded file and numbers its delete button among the files only', () => {
    const html = render([
      typeOfDocumentRow('Witness statement'), uploadedFileRow('statement.pdf', 'doc-1'),
      typeOfDocumentRow('Photo'), uploadedFileRow('evidence.png', 'doc-2'),
    ]);

    expect(html).not.toContain('PAGES.UPLOAD_DOCUMENTS.NO_FILE_UPLOADED');
    expect(html.split('app-uploaded-file"').length - 1).toBe(2);
    expect(html).toContain('Witness statement');
    expect(html).toContain('value="deleteFile[0][doc-1]"');
    expect(html).toContain('value="deleteFile[1][doc-2]"');
  });
});
