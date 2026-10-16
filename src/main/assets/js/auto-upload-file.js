const HIDDEN_CLASS = 'govuk-!-display-none';

const fieldRequiredBeforeUploadFor = (saveButton) => {
  const fieldId = saveButton.dataset.autoUploadRequires;
  return fieldId ? document.getElementById(fieldId) : null;
};

function askForFieldBeforeSaving(saveButton, field) {
  saveButton.classList.remove(HIDDEN_CLASS);
  field.focus();
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
  const fieldRequiredBeforeUpload = fieldRequiredBeforeUploadFor(saveButton);

  fileInput.addEventListener('change', () => {
    const filesChosen = fileInput.files?.length > 0;
    if (!filesChosen) {
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
