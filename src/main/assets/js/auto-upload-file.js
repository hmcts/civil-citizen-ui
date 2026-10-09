/**
 * Progressive enhancement for file-upload rows: hides the "Save file" button and auto-submits
 * it as soon as a file is chosen, so citizens no longer need to click "Save file" themselves.
 * The button is only hidden once JS actually runs, so a no-JS visitor still sees and can use it.
 */
function wireAutoUpload(uploadButton) {
  if (uploadButton.dataset.autoUploadWired) {
    return;
  }
  uploadButton.dataset.autoUploadWired = 'true';
  uploadButton.classList.add('govuk-!-display-none');

  const container = uploadButton.closest('.row-container, .govuk-inset-text');
  const fileInput = container?.querySelector('input[type="file"]');
  if (!fileInput) {
    return;
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      uploadButton.click();
    }
  });
}

function initAutoUploadFile(root = document) {
  root.querySelectorAll('.js-auto-upload-button').forEach(wireAutoUpload);
}

// exposed so add-file-slot.js can wire newly cloned "Save file" buttons the same way
window.wireAutoUploadButton = wireAutoUpload;

document.addEventListener('DOMContentLoaded', () => initAutoUploadFile());
