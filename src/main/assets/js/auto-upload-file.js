const HIDDEN_CLASS = 'govuk-!-display-none';
const FORM_GROUP_ERROR_CLASS = 'govuk-form-group--error';
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const MAX_FILES_PER_UPLOAD = 10;
const ALLOWED_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'rtf', 'txt', 'csv', 'jpg', 'jpeg', 'png', 'bmp', 'tif', 'tiff'];

const fieldRequiredBeforeUploadFor = (saveButton) => {
  const fieldId = saveButton.dataset.autoUploadRequires;
  return fieldId ? document.getElementById(fieldId) : null;
};

function askForFieldBeforeSaving(saveButton, field) {
  saveButton.classList.remove(HIDDEN_CLASS);
  field.focus();
}

const extensionOf = (fileName) => {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? '' : fileName.substring(dot + 1).toLowerCase();
};

const fileRulesFor = (saveButton) =>
  saveButton.closest('[data-file-type-error], [data-file-size-error], [data-too-many-files-error]')?.dataset ?? {};

const fileProblemFor = (files, fileRules) => {
  const {fileTypeError, fileSizeError, tooManyFilesError} = fileRules;
  if (tooManyFilesError && files.length > MAX_FILES_PER_UPLOAD) {
    return tooManyFilesError;
  }
  for (const file of files) {
    if (fileTypeError && !ALLOWED_EXTENSIONS.includes(extensionOf(file.name))) {
      return fileTypeError;
    }
    if (fileSizeError && file.size > MAX_FILE_SIZE_BYTES) {
      return fileSizeError;
    }
  }
  return null;
};

const formGroupOf = (fileInput) => fileInput.closest('.govuk-form-group') || fileInput.parentElement;

function clearFileProblem(fileInput) {
  const formGroup = formGroupOf(fileInput);
  formGroup.querySelector('.js-file-problem')?.remove();
  if (!formGroup.querySelector('.govuk-error-message')) {
    formGroup.classList.remove(FORM_GROUP_ERROR_CLASS);
  }
}

function showFileProblem(fileInput, message, errorPrefix) {
  const formGroup = formGroupOf(fileInput);
  const error = document.createElement('p');
  error.id = `${fileInput.id}-file-problem`;
  error.className = 'govuk-error-message js-file-problem';
  const hiddenPrefix = document.createElement('span');
  hiddenPrefix.className = 'govuk-visually-hidden';
  hiddenPrefix.textContent = `${errorPrefix}: `;
  error.append(hiddenPrefix, message);
  const label = formGroup.querySelector('label');
  if (label) {
    label.after(error);
  } else {
    formGroup.prepend(error);
  }
  formGroup.classList.add(FORM_GROUP_ERROR_CLASS);
  fileInput.setAttribute('aria-describedby', error.id);
  fileInput.value = '';
  fileInput.dataset.clearingRejectedFiles = 'true';
  fileInput.dispatchEvent(new window.Event('change'));
  delete fileInput.dataset.clearingRejectedFiles;
  fileInput.focus();
}

function wireAutoUpload(saveButton) {
  if (saveButton.dataset.autoUploadWired) {
    return;
  }
  saveButton.dataset.autoUploadWired = 'true';
  saveButton.classList.add(HIDDEN_CLASS);

  const uploadBox = saveButton.closest('.row-container, .govuk-inset-text');
  const fileInput = uploadBox?.querySelector('input[type="file"]');
  if (!fileInput) {
    return;
  }
  const fileRules = fileRulesFor(saveButton);
  if (fileRules.fileTypeError) {
    fileInput.setAttribute('accept', ALLOWED_EXTENSIONS.map((extension) => `.${extension}`).join(','));
  }
  const fieldRequiredBeforeUpload = fieldRequiredBeforeUploadFor(saveButton);

  fileInput.addEventListener('change', () => {
    const filesChosen = fileInput.files?.length > 0;
    if (!filesChosen || fileInput.dataset.clearingRejectedFiles) {
      return;
    }
    clearFileProblem(fileInput);
    const problem = fileProblemFor(fileInput.files, fileRules);
    if (problem) {
      showFileProblem(fileInput, problem, fileRules.errorPrefix || 'Error');
      return;
    }
    if (fieldRequiredBeforeUpload && !fieldRequiredBeforeUpload.value.trim()) {
      askForFieldBeforeSaving(saveButton, fieldRequiredBeforeUpload);
      return;
    }
    saveButton.click();
  });
}

window.wireAutoUploadButton = wireAutoUpload;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.js-auto-upload-button').forEach(wireAutoUpload);
});
