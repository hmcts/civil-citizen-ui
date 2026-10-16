const HIDDEN_CLASS = 'govuk-!-display-none';

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

  fileInput.addEventListener('change', () => {
    const filesChosen = fileInput.files?.length > 0;
    if (filesChosen) {
      saveButton.click();
    }
  });
}

window.wireAutoUploadButton = wireAutoUpload;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.js-auto-upload-button').forEach(wireAutoUpload);
});
