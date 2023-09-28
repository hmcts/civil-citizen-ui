const englishUploading = 'Uploading';
const welshUploading = 'Wrthi\'n uwchlwytho';
const englishUnknownError = 'Unknown error';
const welshUnknownError = 'Gwall anhysbys';

const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim().split('=');
    if (c[0] === name) {
      return c[1];
    }
  }
  return '';
};

function appendCaseDocument(target, value) {
  const caseDocumentInput = document.querySelector(`[id='${target}']`);
  caseDocumentInput.value = value;
}

function createLoading(event) {
  const uploadingText = getCookie('lang') === 'cy' ? welshUploading : englishUploading;
  const eventId = event.target.id;
  const existsLoading = document.getElementById(`${eventId}-loadingContainer`);
  if (!existsLoading) {
    const loadingContainer = document.createElement('div');
    loadingContainer.id = `${eventId}-loadingContainer`;
    loadingContainer.innerHTML = `
        <div class="loadingAnimation"></div>
        <p id="loadingText">${uploadingText}<span class="loadingDots"></span></p>`;

    event.target.parentNode.insertBefore(loadingContainer, event.target);
  }

}

function removeLoading(event) {
  const eventId = event.target.id;
  const loadingContainer = document.getElementById(`${eventId}-loadingContainer`);
  if (loadingContainer) {
    loadingContainer.remove();
  }
}

function elementExists(element) {
  return element?.length > 0;
}

function removeErrors(newRow) {
  const parentObject = newRow.target.closest('div');
  const errorRow = parentObject.querySelectorAll('.govuk-error-message');
  if (elementExists(errorRow)) {
    errorRow.forEach(element => element.parentNode.removeChild(element));
    parentObject.classList.remove('govuk-form-group--error');
  }

}

// Event listener for 'change' event
async function handleChange(event) {
  // Handle the change event
  const objectId = event.target.id; // Get the object identifier
  const target = event.target;
  createLoading(event);
  removeErrors(event);
  const csrfToken = document.getElementsByName('_csrf')[0].value;
  const formData = new FormData();
  formData.append('file', target.files[0]);

  const options = {
    method: 'POST',
    headers: {
      'CSRF-Token': csrfToken,
    },
    body: formData,
  };

  const response = await fetch('/upload-file', options);
  const parsed = await response.json();
  removeLoading(event);
  if (response.status !== 200) {
    parsed.errors.forEach((item) => {
      buildErrorDisplay(item, objectId, target);
    });
    target.classList.add('govuk-file-upload--error');
    target.setAttribute('aria-describedby', `${objectId}-error`);
  } else {
    appendCaseDocument(objectId.replace(/\].*/, '][caseDocument]'), JSON.stringify(parsed));
  }
}

function createObservable() {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      // Check if the mutation is an added node
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Iterate over the added nodes and check if any of them are file input elements
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            // Iterate over the node's children
            const element = node.querySelector('.govuk-file-upload');
            if (element) {
              element.addEventListener('change', (event) => {
                handleChange(event).catch(error => {
                  const unknownError = getCookie('lang') === 'cy' ? welshUnknownError : englishUnknownError;
                  console.error('Error:', error);
                  removeLoading(event);
                  buildErrorDisplay(unknownError, event.target.id, event.target);
                });
              });
            }
          }
        }
      }
    }
  });
  const observerConfig = {attributes: true, childList: true, subtree: true};
  return {observer, observerConfig};
}

function buildErrorDisplay(error, objectId, target) {
  target.value = '';
  const formGroup = target.closest('div');
  formGroup.classList.add('govuk-form-group--error');
  const errorMessage = document.createElement('p');
  errorMessage.id = `${objectId}-error`;
  errorMessage.classList.add('govuk-error-message');
  errorMessage.innerHTML = `<span class="govuk-visually-hidden"></span>${error}`;
  target.parentNode.insertBefore(errorMessage, target);
}

function addEventListenerWhenDomIsLoaded() {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.govuk-file-upload').forEach(fileUpload => {
      fileUpload.addEventListener('change', (event) => {
        handleChange(event).catch(error => {
          const unknownError = getCookie('lang') === 'cy' ? welshUnknownError : englishUnknownError;
          console.error('Error:', error);
          removeLoading(event);
          buildErrorDisplay(unknownError, event.target.id, event.target);
        });
      });
    });
  });
}

if (window.location.href.includes('upload-documents')) {
  const {observer, observerConfig} = createObservable();
  observer.observe(document, observerConfig);
  addEventListenerWhenDomIsLoaded();

}

