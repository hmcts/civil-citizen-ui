/**
 * Lets a user add more than one file to a single upload section by cloning just the
 * govukFileUpload box (and its Save-file fallback button), not a whole new fieldset/section.
 * Every cloned slot shares the same field name as the original: only one slot is ever
 * unsubmitted at a time in practice, because a chosen file auto-uploads (see auto-upload-file.js)
 * before the user can reasonably fill a second slot.
 */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.add-file-slot').forEach((addButton) => {
    addButton.addEventListener('click', (event) => {
      event.preventDefault();
      const slotsContainer = addButton.previousElementSibling;
      if (!slotsContainer || !slotsContainer.classList.contains('file-upload-slots')) {
        return;
      }
      const rows = slotsContainer.getElementsByClassName('row-container');
      if (!rows.length) {
        return;
      }
      const newRow = rows[rows.length - 1].cloneNode(true);

      const fileInput = newRow.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
      newRow.querySelectorAll('.govuk-error-message').forEach((el) => el.remove());
      newRow.querySelectorAll('.govuk-form-group--error').forEach((el) => el.classList.remove('govuk-form-group--error'));
      newRow.querySelectorAll('.govuk-file-upload--error').forEach((el) => el.classList.remove('govuk-file-upload--error'));

      slotsContainer.appendChild(newRow);

      const uploadButton = newRow.querySelector('.js-auto-upload-button');
      if (uploadButton && typeof window.wireAutoUploadButton === 'function') {
        delete uploadButton.dataset.autoUploadWired;
        window.wireAutoUploadButton(uploadButton);
      }
    });
  });
});
