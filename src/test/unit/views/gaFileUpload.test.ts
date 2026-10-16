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

  it('shows one upload box that takes several files when nothing is uploaded', () => {
    const html = render({id: 'selectedFile', summaryRows: []});

    expect(count(html, 'app-uploaded-file-slot"')).toBe(0);
    expect(count(html, 'class="row-container')).toBe(1);
    expect(html).not.toContain('data-has-uploaded-files');
    expect(html).toContain('data-single-upload-box="true"');
    expect(html).toMatch(/<input[^>]*name="selectedFile"[^>]*multiple/);
    expect(html).toContain('data-i18n.choose-files-button="COMMON.FILE_UPLOAD.CHOOSE_FILE"');
    expect(html).toContain('PAGES.UPLOAD_DOCUMENTS.ADD_ANOTHER_FILE');
    expect(html).toContain('js-auto-upload-button');
  });

  it('shows a read-only section for each uploaded file only', () => {
    const html = render({id: 'selectedFile', summaryRows: [typeOfDocumentRow, uploadedFileRow('statement.pdf'), uploadedFileRow('evidence.png')]});

    expect(count(html, 'app-uploaded-file-slot"')).toBe(2);
    expect(html).toContain('app-uploaded-file-slot__name">statement.pdf<');
    expect(html).toContain('app-uploaded-file-slot__name">evidence.png<');
    expect(html).not.toContain('app-uploaded-file-slot__name">Type of document<');
    expect(html).toContain('data-has-uploaded-files="true"');
  });

  it('works without a summary list', () => {
    expect(count(render({id: 'selectedFile'}), 'class="row-container')).toBe(1);
  });

  it('escapes file names', () => {
    expect(render({id: 'selectedFile', summaryRows: [uploadedFileRow('<script>x</script>.pdf')]})).not.toContain('<script>x</script>');
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
