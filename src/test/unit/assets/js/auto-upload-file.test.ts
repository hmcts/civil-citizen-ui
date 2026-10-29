import {JSDOM} from 'jsdom';

describe('auto-upload-file', () => {
  const HIDDEN_CLASS = 'govuk-!-display-none';
  let dom: JSDOM;
  let document: Document;
  let submitted: number;

  const plainFileInput = '<input type="file" id="selectedFile" name="selectedFile" multiple>';
  const govukEnhancedFileInput = '<div class="govuk-file-upload-wrapper"><input type="file" id="selectedFile-input" name="selectedFile" multiple>'
    + '<button type="button" class="govuk-file-upload-button" id="selectedFile">Choose file</button></div>';

  function setupDom(saveButtonAttributes = '', uploadSlotsAttributes = '', serverErrors = {summary: '', inline: ''}, fileInputHtml = plainFileInput) {
    dom = new JSDOM(`<!DOCTYPE html><html><body><main id="main-content">
      <div class="govuk-grid-row">${serverErrors.summary}</div>
      <form>
        <div class="file-upload-slots" ${uploadSlotsAttributes}>
          <div class="row-container govuk-inset-text">
            <div class="govuk-form-group">
              <label for="selectedFile">Upload a file</label>
              ${serverErrors.inline}
              <input type="text" id="typeOfDocument" name="typeOfDocument">
              ${fileInputHtml}
            </div>
            <button class="js-auto-upload-button" name="action" value="uploadButton" ${saveButtonAttributes}>Save file</button>
          </div>
        </div>
      </form>
    </main></body></html>`, {runScripts: 'dangerously'});
    document = dom.window.document;
    submitted = 0;
    document.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      submitted += 1;
    });
    Object.assign(global, {window: dom.window, document});
    jest.isolateModules(() => require('../../../../main/assets/js/auto-upload-file'));
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  }

  const saveButton = () => document.querySelector('.js-auto-upload-button');

  const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;
  const fileProblem = () => document.querySelector('.js-file-problem');
  const fileRules = 'data-file-type-error="Document must be Word, Excel, PowerPoint, PDF" data-file-size-error="Document must be less than 100MB"'
    + ' data-too-many-files-error="You can only upload up to 10 documents at a time"';
  const pdfNames = (count: number) => Array.from({length: count}, (_, index) => `document-${index + 1}.pdf`);

  function chooseFiles(...names: string[]) {
    const files = names.map((name) => new dom.window.File(['%PDF-1.4'], name, {type: 'application/pdf'}));
    Object.defineProperty(fileInput(), 'files', {value: files, configurable: true});
    fileInput().dispatchEvent(new dom.window.Event('change'));
  }

  function chooseFileOfSize(name: string, size: number) {
    const file = new dom.window.File(['%PDF-1.4'], name, {type: 'application/pdf'});
    Object.defineProperty(file, 'size', {value: size});
    Object.defineProperty(fileInput(), 'files', {value: [file], configurable: true});
    fileInput().dispatchEvent(new dom.window.Event('change'));
  }

  it('hides "Save file" and submits as soon as files are chosen', () => {
    setupDom();

    expect(saveButton().classList.contains(HIDDEN_CLASS)).toBe(true);
    chooseFiles('first.pdf', 'second.pdf');

    expect(submitted).toBe(1);
  });

  it('waits for the required field before uploading', () => {
    setupDom('data-auto-upload-requires="typeOfDocument"');

    chooseFiles('evidence.pdf');

    expect(submitted).toBe(0);
    expect(saveButton().classList.contains(HIDDEN_CLASS)).toBe(false);
    expect(document.activeElement).toBe(document.getElementById('typeOfDocument'));
  });

  it('uploads straight away when the required field is filled in', () => {
    setupDom('data-auto-upload-requires="typeOfDocument"');
    (document.getElementById('typeOfDocument') as HTMLInputElement).value = 'Witness statement';

    chooseFiles('evidence.pdf');

    expect(submitted).toBe(1);
  });

  it('limits the file picker to the allowed types when the page passes the file rules', () => {
    setupDom(fileRules);

    expect(fileInput().getAttribute('accept')).toContain('.pdf');
    expect(fileInput().getAttribute('accept')).toContain('.tiff');
  });

  it('does not upload a file type that is not allowed and shows the type error', () => {
    setupDom(fileRules);

    chooseFiles('evidence.pdf', 'notes.foc');

    expect(submitted).toBe(0);
    expect(fileProblem().textContent).toContain('Document must be Word, Excel, PowerPoint, PDF');
    expect(fileInput().getAttribute('aria-describedby')).toBe(fileProblem().id);
  });

  it('does not upload a file over 100MB and shows the size error', () => {
    setupDom(fileRules);

    chooseFileOfSize('scan.tif', 100 * 1024 * 1024 + 1);

    expect(submitted).toBe(0);
    expect(fileProblem().textContent).toContain('Document must be less than 100MB');
  });

  it('does not upload more than 10 files at once and shows the file count error', () => {
    setupDom(fileRules);

    chooseFiles(...pdfNames(11));

    expect(submitted).toBe(0);
    expect(fileProblem().textContent).toContain('You can only upload up to 10 documents at a time');
  });

  it('uploads 10 files at once', () => {
    setupDom(fileRules);

    chooseFiles(...pdfNames(10));

    expect(submitted).toBe(1);
  });

  it('uploads a file of exactly 100MB', () => {
    setupDom(fileRules);

    chooseFileOfSize('scan.TIFF', 100 * 1024 * 1024);

    expect(submitted).toBe(1);
    expect(fileProblem()).toBeNull();
  });

  it('removes the error once an allowed file is chosen', () => {
    setupDom(fileRules);
    chooseFiles('notes.foc');

    chooseFiles('evidence.pdf');

    expect(fileProblem()).toBeNull();
    expect(submitted).toBe(1);
  });

  it('reads the file rules from the upload area around the button', () => {
    setupDom('', `${fileRules} data-error-prefix="Gwall"`);

    chooseFiles('notes.foc');

    expect(submitted).toBe(0);
    expect(fileProblem().textContent).toBe('Gwall: Document must be Word, Excel, PowerPoint, PDF');
  });

  it('shows the problem in the error summary at the top of the page and moves focus to it', () => {
    setupDom(fileRules);

    chooseFiles('notes.foc');

    const summary = document.querySelector('.govuk-error-summary');
    expect(summary.querySelector('.govuk-error-summary__title').textContent).toBe('There was a problem');
    const links = summary.querySelectorAll('.govuk-error-summary__list a');
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toBe('Document must be Word, Excel, PowerPoint, PDF');
    expect(links[0].getAttribute('href')).toBe('#selectedFile');
    expect(document.activeElement).toBe(summary);
  });

  it('shows only this problem, replacing earlier errors on the page', () => {
    setupDom(fileRules, '', {
      summary: '<div class="govuk-error-summary"><h2 class="govuk-error-summary__title">There was a problem</h2>'
        + '<ul class="govuk-list govuk-error-summary__list"><li><a href="#selectedFile">You need to upload at least one file.</a></li></ul></div>',
      inline: '<p class="govuk-error-message">You need to upload at least one file.</p>',
    });

    chooseFileOfSize('scan.pdf', 100 * 1024 * 1024 + 1);

    expect(document.querySelectorAll('.govuk-error-summary')).toHaveLength(1);
    expect(document.querySelector('.govuk-error-summary__list').textContent.trim()).toBe('Document must be less than 100MB');
    expect(document.querySelectorAll('.govuk-error-message')).toHaveLength(1);
    expect(document.body.textContent).not.toContain('You need to upload at least one file.');
  });

  it('points the error summary and error message at the GOV.UK choose file button', () => {
    setupDom(fileRules, '', {summary: '', inline: ''}, govukEnhancedFileInput);

    chooseFiles('notes.foc');

    expect(document.querySelector('.govuk-error-summary__list a').getAttribute('href')).toBe('#selectedFile');
    expect(document.getElementById('selectedFile').getAttribute('aria-describedby')).toBe(fileProblem().id);
  });

  it('uses the translated error summary title from the page', () => {
    setupDom('', `${fileRules} data-error-summary-title="Roedd problem"`);

    chooseFiles('notes.foc');

    expect(document.querySelector('.govuk-error-summary__title').textContent).toBe('Roedd problem');
  });

  it('uploads any file when the page does not pass the file rules', () => {
    setupDom();

    chooseFiles('notes.foc');

    expect(submitted).toBe(1);
    expect(fileInput().hasAttribute('accept')).toBe(false);
  });
});
