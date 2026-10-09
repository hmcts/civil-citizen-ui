import { FileUpload } from 'govuk-frontend';

/**
 * Lets a user add more than one file to a single upload section by cloning just the
 * govukFileUpload box (and its Save-file fallback button), not a whole new fieldset/section.
 *
 * The existing row is already enhanced by GOV.UK's FileUpload component (drag & drop, "Choose
 * file" button), so cloning it verbatim copies stale generated markup with duplicate ids and no
 * event handlers. Instead, the clone's upload control is reset back to a plain, unenhanced
 * `<input type="file">` with a fresh unique id, its label re-linked to that id, and GOV.UK's
 * FileUpload component is constructed fresh on it - the same thing a full page load would do.
 */
function resetAndEnhanceFileUpload(row, slotIndex) {
  const wrapper = row.querySelector('.govuk-file-upload-wrapper');
  const label = row.querySelector('label.govuk-label[for]');
  if (!wrapper || !label) {
    return;
  }

  // Strip any suffix from a previous slot (each new slot clones the most recently added one,
  // not the original), so ids stay flat (`...-slot-2`) instead of cascading (`...-slot-1-slot-2`).
  const baseId = label.getAttribute('for').replace(/-slot-\d+$/, '');
  const newId = `${baseId}-slot-${slotIndex}`;
  const originalInput = wrapper.querySelector('input[type="file"]');
  const inputClasses = originalInput ? originalInput.className.replace(/\s*govuk-file-upload--error\s*/g, ' ').trim() : 'govuk-file-upload';
  const inputName = originalInput ? originalInput.getAttribute('name') : null;
  const originalDescribedBy = originalInput ? originalInput.getAttribute('aria-describedby') : null;

  const freshInput = document.createElement('input');
  freshInput.type = 'file';
  freshInput.id = newId;
  freshInput.className = inputClasses;
  if (inputName) {
    freshInput.setAttribute('name', inputName);
  }
  if (originalInput?.multiple) {
    freshInput.multiple = true;
  }

  // The hint (and any other describedby target) was cloned with the original's static id, so it's
  // now a duplicate on the page - give it a fresh id matching this slot and re-link the input.
  // Only the trailing "-hint"/"-error" suffix is kept: a describedby id cloned from a previous
  // slot (e.g. "...-slot-1-hint") would otherwise keep accumulating "-slot-N" segments forever.
  if (originalDescribedBy) {
    const newDescribedBy = originalDescribedBy.split(/\s+/).map((describedById) => {
      const describedByEl = row.querySelector(`#${CSS.escape(describedById)}`);
      if (!describedByEl) {
        return describedById;
      }
      const suffixMatch = describedById.match(/-([a-z]+)$/);
      const newDescribedById = `${newId}-${suffixMatch ? suffixMatch[1] : 'description'}`;
      describedByEl.id = newDescribedById;
      return newDescribedById;
    }).join(' ');
    freshInput.setAttribute('aria-describedby', newDescribedBy);
  }

  wrapper.innerHTML = '';
  wrapper.appendChild(freshInput);
  label.setAttribute('for', newId);
  // Cloned from an already-enhanced wrapper, so both GOV.UK's "already initialised" marker and the
  // label's previously-assigned id came along for the ride: the marker would make a fresh
  // FileUpload() throw, and the stale label id (now a duplicate of the original's) would stop
  // GOV.UK's own findLabel()/aria-labelledby wiring from ever assigning this slot its own id.
  wrapper.removeAttribute(`data-${FileUpload.moduleName}-init`);
  label.removeAttribute('id');

  // eslint-disable-next-line no-new
  new FileUpload(wrapper);
}

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
      const newSlotIndex = rows.length;

      // After an auto-upload the page reloads with the upload box empty again, so a new slot would
      // just sit next to an identical empty one. Open the empty box's file chooser instead.
      const lastInput = rows[newSlotIndex - 1].querySelector('input[type="file"]');
      if (lastInput && !lastInput.files?.length) {
        lastInput.click();
        return;
      }

      const newRow = rows[newSlotIndex - 1].cloneNode(true);

      newRow.querySelectorAll('.govuk-error-message').forEach((el) => el.remove());
      newRow.querySelectorAll('.govuk-form-group--error').forEach((el) => el.classList.remove('govuk-form-group--error'));

      slotsContainer.appendChild(newRow);
      resetAndEnhanceFileUpload(newRow, newSlotIndex);

      const uploadButton = newRow.querySelector('.js-auto-upload-button');
      if (uploadButton) {
        if (uploadButton.id) {
          uploadButton.id = `${uploadButton.id.replace(/-slot-\d+$/, '')}-slot-${newSlotIndex}`;
        }
        if (typeof window.wireAutoUploadButton === 'function') {
          delete uploadButton.dataset.autoUploadWired;
          window.wireAutoUploadButton(uploadButton);
        }
      }
    });
  });
});
