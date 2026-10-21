import {JSDOM} from 'jsdom';

describe('auto-upload-file', () => {
  const HIDDEN_CLASS = 'govuk-!-display-none';
  let dom: JSDOM;
  let document: Document;
  let submitted: number;

  function setupDom(saveButtonAttributes = '') {
    dom = new JSDOM(`<!DOCTYPE html><html><body>
      <form>
        <div class="row-container govuk-inset-text">
          <input type="text" id="typeOfDocument" name="typeOfDocument">
          <input type="file" id="selectedFile" name="selectedFile" multiple>
          <button class="js-auto-upload-button" name="action" value="uploadButton" ${saveButtonAttributes}>Save file</button>
        </div>
      </form>
    </body></html>`, {runScripts: 'dangerously'});
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

  function chooseFiles(...names: string[]) {
    const fileInput = document.getElementById('selectedFile') as HTMLInputElement;
    const files = names.map((name) => new dom.window.File(['%PDF-1.4'], name, {type: 'application/pdf'}));
    Object.defineProperty(fileInput, 'files', {value: files, configurable: true});
    fileInput.dispatchEvent(new dom.window.Event('change'));
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
});
