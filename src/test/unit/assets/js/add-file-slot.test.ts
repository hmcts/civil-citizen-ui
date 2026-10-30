import {JSDOM} from 'jsdom';

jest.mock('govuk-frontend', () => ({FileUpload: class { static moduleName = 'govuk-file-upload'; }}));

describe('add-file-slot', () => {
  const HIDDEN_CLASS = 'govuk-!-display-none';
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {runScripts: 'dangerously'});
    Object.assign(global, {
      window: dom.window,
      document: dom.window.document,
      CSS: {escape: (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, (char) => '\\' + char)},
    });
  });

  function setupDom({uploadedFiles = 0, error = false, singleUploadBox = false} = {}) {
    const uploadedSlots = Array.from({length: uploadedFiles}, (_, i) =>
      `<div class="govuk-inset-text app-uploaded-file-slot"><p class="app-uploaded-file-slot__name">file-${i}.pdf</p></div>`).join('');
    document.body.innerHTML = `
      <div class="file-upload-slots" ${uploadedFiles ? 'data-has-uploaded-files="true"' : ''} ${singleUploadBox ? 'data-single-upload-box="true"' : ''}>
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
    loadScript();
  }

  function loadScript() {
    jest.isolateModules(() => require('../../../../main/assets/js/add-file-slot'));
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  }

  function setupSlots(slotsHtml: string) {
    document.body.innerHTML = `
      <div class="file-upload-slots">${slotsHtml}</div>
      <button type="button" class="add-file-slot" id="add-file">Add another file</button>
    `;
    loadScript();
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

  it('does not add a second upload box on single upload box pages', () => {
    setupDom({singleUploadBox: true});

    clickAddAnotherFile();
    clickAddAnotherFile();

    expect(uploadRows()).toHaveLength(1);
    expect(document.activeElement).toBe(document.querySelector('input[type="file"]'));
  });

  it('shows the hidden upload box once on single upload box pages', () => {
    setupDom({uploadedFiles: 1, singleUploadBox: true});

    clickAddAnotherFile();
    clickAddAnotherFile();

    expect(uploadRows()).toHaveLength(1);
    expect(uploadRows()[0].classList.contains(HIDDEN_CLASS)).toBe(false);
  });

  it('gives a new upload box its own ids, clears its errors and wires its save button', () => {
    const wireAutoUploadButton = jest.fn();
    Object.assign(dom.window, {wireAutoUploadButton});
    setupSlots(`
      <div class="row-container govuk-inset-text">
        <div class="govuk-form-group govuk-form-group--error">
          <label class="govuk-label" for="upload">Upload a file</label>
          <p class="govuk-error-message">Choose a file</p>
          <div class="govuk-file-upload-wrapper" data-govuk-file-upload-init>
            <input type="file" class="govuk-file-upload govuk-file-upload--error" id="upload" multiple aria-describedby="missing-id">
          </div>
          <button id="save" class="js-auto-upload-button" data-auto-upload-wired="true">Save file</button>
        </div>
      </div>
    `);

    clickAddAnotherFile();

    const newRow = uploadRows()[1];
    const newInput = newRow.querySelector('input[type="file"]') as HTMLInputElement;
    const newSaveButton = newRow.querySelector('.js-auto-upload-button') as HTMLButtonElement;
    expect(newInput.id).toBe('upload-slot-1');
    expect(newInput.multiple).toBe(true);
    expect(newInput.className).toBe('govuk-file-upload');
    expect(newInput.getAttribute('aria-describedby')).toBe('missing-id');
    expect(newRow.querySelector('.govuk-file-upload-wrapper').hasAttribute('data-govuk-file-upload-init')).toBe(false);
    expect(newRow.querySelector('.govuk-error-message')).toBeNull();
    expect(newRow.querySelector('.govuk-form-group--error')).toBeNull();
    expect(newSaveButton.id).toBe('save-slot-1');
    expect(newSaveButton.dataset.autoUploadWired).toBeUndefined();
    expect(wireAutoUploadButton).toHaveBeenCalledWith(newSaveButton);
  });

  it('copies an upload box without a file input or save button as it is', () => {
    setupSlots('<div class="row-container"><p>Upload a file</p></div>');

    clickAddAnotherFile();

    expect(uploadRows()).toHaveLength(2);
    expect(uploadRows()[1].innerHTML).toBe('<p>Upload a file</p>');
  });

  it('does nothing when there is no upload box to show', () => {
    setupSlots('');

    clickAddAnotherFile();

    expect(uploadRows()).toHaveLength(0);
  });
});
