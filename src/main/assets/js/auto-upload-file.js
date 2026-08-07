/**
 * Spike: auto-submit upload when a file is chosen or dropped (case progression / mediation).
 * Keeps existing server upload flow via the hidden "Save file" button.
 */
export function initAutoUploadFile() {
  document.querySelectorAll('.govuk-inset-text').forEach((container) => {
    const uploadButton = container.querySelector('.js-auto-upload-button');
    if (!(uploadButton instanceof HTMLButtonElement)) {
      return;
    }

    // Hide Save file only when JS can auto-upload
    uploadButton.classList.add('govuk-!-display-none');

    const fileInput = container.querySelector('input[type="file"]');
    if (!(fileInput instanceof HTMLInputElement)) {
      return;
    }

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        uploadButton.click();
      }
    });
  });
}
