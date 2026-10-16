import * as fs from 'fs';
import * as path from 'path';
import {JSDOM} from 'jsdom';

describe('add-file-slot', () => {
  const govukFrontendImport = /^import .*govuk-frontend.*$/m;
  const scriptWithStubbedFileUpload = fs.readFileSync(path.join(process.cwd(), 'src/main/assets/js/add-file-slot.js'), 'utf8')
    .replace(govukFrontendImport, '');
  const HIDDEN_CLASS = 'govuk-!-display-none';
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {runScripts: 'dangerously'});
    (global as unknown as { document: Document }).document = dom.window.document;
    dom.window.eval(`
      window.CSS = {escape: (value) => value.replace(/[^a-zA-Z0-9_-]/g, (char) => '\\\\' + char)};
      var FileUpload = class { static moduleName = 'govuk-file-upload'; };
    `);
  });

  function setupDom({uploadedFiles = 0, error = false} = {}) {
    const uploadedSlots = Array.from({length: uploadedFiles}, (_, i) =>
      `<div class="govuk-inset-text app-uploaded-file-slot"><p class="app-uploaded-file-slot__name">file-${i}.pdf</p></div>`).join('');
    document.body.innerHTML = `
      <div class="file-upload-slots" ${uploadedFiles ? 'data-has-uploaded-files="true"' : ''}>
        ${uploadedSlots}
        <div class="row-container govuk-inset-text">
          <label class="govuk-label" for="witnessStatement[0][fileUpload]">Upload a file</label>
          ${error ? '<p class="govuk-error-message">Choose a file</p>' : ''}
          <div class="govuk-file-upload-wrapper" data-module="govuk-file-upload">
            <input type="file" class="govuk-file-upload" id="witnessStatement[0][fileUpload]" name="witnessStatement[0][fileUpload]">
          </div>
          <button class="js-auto-upload-button" value="witnessStatement[0][uploadButton]">Save file</button>
        </div>
      </div>
      <button type="button" class="add-file-slot" id="add-file">Add another file</button>
    `;
    dom.window.eval(scriptWithStubbedFileUpload);
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  }

  const uploadRows = () => Array.from(document.querySelectorAll('.row-container'));
  const clickAddAnotherFile = () => document.getElementById('add-file')!.dispatchEvent(new dom.window.MouseEvent('click'));

  it('keeps the upload box visible when no file is uploaded yet', () => {
    setupDom();

    expect(uploadRows()[0].classList.contains(HIDDEN_CLASS)).toBe(false);
  });

  it('hides the empty upload box when files are already uploaded', () => {
    setupDom({uploadedFiles: 2});

    expect(document.querySelectorAll('.app-uploaded-file-slot')).toHaveLength(2);
    expect(uploadRows()[0].classList.contains(HIDDEN_CLASS)).toBe(true);
  });

  it('keeps the upload box visible when it shows an error', () => {
    setupDom({uploadedFiles: 1, error: true});

    expect(uploadRows()[0].classList.contains(HIDDEN_CLASS)).toBe(false);
  });

  it('shows the hidden upload box on the first "Add another file" click', () => {
    setupDom({uploadedFiles: 1});

    clickAddAnotherFile();

    expect(uploadRows()).toHaveLength(1);
    expect(uploadRows()[0].classList.contains(HIDDEN_CLASS)).toBe(false);
  });

  it('adds a new upload box when the existing one is already shown, even if it is empty', () => {
    setupDom();

    clickAddAnotherFile();

    const rows = uploadRows();
    expect(rows).toHaveLength(2);
    expect(rows[1].querySelector('input[type="file"]')!.id).toBe('witnessStatement[0][fileUpload]-slot-1');
    expect(rows[1].querySelector('label')!.getAttribute('for')).toBe('witnessStatement[0][fileUpload]-slot-1');
  });
});
