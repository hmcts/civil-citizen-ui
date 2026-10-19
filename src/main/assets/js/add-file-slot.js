import { FileUpload } from 'govuk-frontend';

const SLOT_SUFFIX = /-slot-\d+$/;

const slotId = (id, slotIndex) => `${id.replace(SLOT_SUFFIX, '')}-slot-${slotIndex}`;

function createPlainFileInput(originalInput, inputId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.id = inputId;
  input.className = originalInput
    ? originalInput.className.replace(/\s*govuk-file-upload--error\s*/g, ' ').trim()
    : 'govuk-file-upload';
  const inputName = originalInput?.getAttribute('name');
  if (inputName) {
    input.setAttribute('name', inputName);
  }
  input.multiple = Boolean(originalInput?.multiple);
  return input;
}

function renameDescriptionsForSlot(row, describedBy, inputId) {
  return describedBy.split(/\s+/).map((descriptionId) => {
    const description = row.querySelector(`#${CSS.escape(descriptionId)}`);
    if (!description) {
      return descriptionId;
    }
    const descriptionType = descriptionId.match(/-([a-z]+)$/)?.[1] ?? 'description';
    description.id = `${inputId}-${descriptionType}`;
    return description.id;
  }).join(' ');
}

function clearGovukInitialisation(wrapper, label) {
  wrapper.removeAttribute(`data-${FileUpload.moduleName}-init`);
  label.removeAttribute('id');
}

function replaceWithFreshFileUpload(row, slotIndex) {
  const wrapper = row.querySelector('.govuk-file-upload-wrapper');
  const label = row.querySelector('label.govuk-label[for]');
  if (!wrapper || !label) {
    return;
  }

  const inputId = slotId(label.getAttribute('for'), slotIndex);
  const originalInput = wrapper.querySelector('input[type="file"]');
  const freshInput = createPlainFileInput(originalInput, inputId);
  const describedBy = originalInput?.getAttribute('aria-describedby');
  if (describedBy) {
    freshInput.setAttribute('aria-describedby', renameDescriptionsForSlot(row, describedBy, inputId));
  }

  wrapper.replaceChildren(freshInput);
  label.setAttribute('for', inputId);
  clearGovukInitialisation(wrapper, label);

  // eslint-disable-next-line no-new
  new FileUpload(wrapper);
}

function clearErrors(row) {
  row.querySelectorAll('.govuk-error-message').forEach((errorMessage) => errorMessage.remove());
  row.querySelectorAll('.govuk-form-group--error').forEach((formGroup) => formGroup.classList.remove('govuk-form-group--error'));
}

function wireSaveButtonForSlot(row, slotIndex) {
  const saveButton = row.querySelector('.js-auto-upload-button');
  if (!saveButton) {
    return;
  }
  if (saveButton.id) {
    saveButton.id = slotId(saveButton.id, slotIndex);
  }
  if (typeof window.wireAutoUploadButton === 'function') {
    delete saveButton.dataset.autoUploadWired;
    window.wireAutoUploadButton(saveButton);
  }
}

function addUploadSlot(slotsContainer, rows) {
  const slotIndex = rows.length;
  const newRow = rows[slotIndex - 1].cloneNode(true);
  clearErrors(newRow);
  slotsContainer.appendChild(newRow);
  replaceWithFreshFileUpload(newRow, slotIndex);
  wireSaveButtonForSlot(newRow, slotIndex);
}

const emptyFileInputIn = (row) => {
  const fileInput = row.querySelector('input[type="file"]');
  return fileInput && !fileInput.files?.length ? fileInput : null;
};

function addAnotherFile(slotsContainer) {
  const rows = slotsContainer.getElementsByClassName('row-container');
  if (!rows.length) {
    return;
  }
  const emptyFileInput = emptyFileInputIn(rows[rows.length - 1]);
  if (emptyFileInput) {
    emptyFileInput.click();
  } else {
    addUploadSlot(slotsContainer, rows);
  }
}

function wireAddAnotherFileButtons() {
  document.querySelectorAll('.add-file-slot').forEach((addButton) => {
    addButton.addEventListener('click', (event) => {
      event.preventDefault();
      const slotsContainer = addButton.previousElementSibling;
      if (slotsContainer?.classList.contains('file-upload-slots')) {
        addAnotherFile(slotsContainer);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', wireAddAnotherFileButtons);
