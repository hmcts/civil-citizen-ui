function createLoading(event) {
  const eventId = event.target.id;
  const loadingContainer = document.createElement('div');
  loadingContainer.id = `${eventId}-loadingContainer`;
  loadingContainer.innerHTML = `
  <div id="loadingAnimation"></div>
    <p id="loadingText">Uploading<span id="loadingDots"></span></p>
`;
  event.target.parentNode.insertBefore(loadingContainer, event.target);

}

function removeLoading(event) {
  const eventId = event.target.id;
  const loadingContainer = document.getElementById(`${eventId}-loadingContainer`);
  loadingContainer.remove();

}

function elementExists(element) {
  return element?.length > 0;
}

function removeExistsFile(event) {
  const eventId = event.target.id;
  const elementToRemove = document.getElementById(`${eventId}-fileOk`);

  if (elementToRemove) {
    elementToRemove.remove();
  }
}

function removeErrors(newRow) {
  const parentObject = newRow.target.closest('div');
  const errorRow = parentObject.querySelectorAll('.govuk-error-message');
  if (elementExists(errorRow)) {
    errorRow.forEach(element => element.parentNode.removeChild(element));
    parentObject.classList.remove('govuk-form-group--error');
  }

}

document.addEventListener('DOMContentLoaded', async function () {
  document.querySelectorAll('.govuk-file-upload').forEach(fileUpload => {
    fileUpload.addEventListener('change', async (event) => {
      try {
        createLoading(event);
        removeErrors(event);
        const csrfToken = document.getElementsByName('_csrf')[0].value;
        const formData = new FormData();
        formData.append('file', fileUpload.files[0]); // Assuming you have an input element with type="file" and id="fileInput"

        const options = {
          method: 'POST',
          headers: {
            'CSRF-Token': csrfToken,
          },
          body: formData,
        };

        const objectId = event.target.id; // Get the object identifier

        const response = await fetch('/upload-file', options);
        const parsed = await response.json();
        if (response.status === 400) {
          removeLoading(event);
          fileUpload.value = '';
          const formGroup = fileUpload.closest('div');
          formGroup.classList.add('govuk-form-group--error');

          parsed.errors.forEach((item) => {
            const errorMessage = document.createElement('p');
            errorMessage.id = `${objectId}-error`;
            errorMessage.classList.add('govuk-error-message');
            errorMessage.innerHTML = `<span class="govuk-visually-hidden"></span>${item}`;
            fileUpload.parentNode.insertBefore(errorMessage, fileUpload);
          });
          fileUpload.classList.add('govuk-file-upload--error');
          fileUpload.setAttribute('aria-describedby', `${objectId}-error`);
        }
        if (response.status === 200) {
          removeLoading(event);
          removeExistsFile(event);
          const fileOkHtml = document.createElement('p');
          fileOkHtml.id = `${objectId}-fileOk`;
          fileOkHtml.classList.add('govuk-input--fileOk');
          fileOkHtml.innerHTML = `<span class="govuk-visually-hidden"></span>${parsed.document.documentName}`;
          fileUpload.parentNode.insertBefore(fileOkHtml, fileUpload);
          event.target.value = '';
        }

      } catch (error) {
        // Handle any errors that occurred during the fetch request or file upload logic
        console.error('Error:', error);
      }

    });
  });
});
