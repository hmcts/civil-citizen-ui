/*
/!*
import {validate} from 'class-validator';

document.addEventListener('DOMContentLoaded', function () {
  console.log('addEventListener');
  /!*  const multipleRows = document.getElementsByClassName('uploadFile');
  if (multipleRows < 2) {
    hideRemoveButton();
  }*!/
  validate(form).then(errors => {
    if (errors.length > 0) {
      console.log('Validation errors:', errors);
    } else {
      console.log('Data is valid');
    }
  });
},
);
document.querySelectorAll('.govuk-file-upload').forEach(fileUpload => {
  fileUpload.addEventListener('change', () => {
    const selectedFiles = fileUpload.files; // Get the selected files
    const objectId = fileUpload.dataset.objectId; // Get the object identifier

    // Iterate over the selected files
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      console.log('Object ID:', objectId);

      // Access file information
      console.log('File Name:', file.name);
      console.log('File Size:', file.size);
      console.log('File Type:', file.type);
      console.log('Last Modified Date:', file.lastModifiedDate);

      validate(file).then(errors => {
    if (errors.length > 0) {
      console.log('Validation errors:', errors);
    } else {
      console.log('Data is valid');
    }
  });
    }
  });
});

*!/
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.govuk-file-upload').forEach(fileUpload => {
    const storedFile = localStorage.getItem(fileUpload.id);
    if (storedFile) {
/// Decode the base64-encoded file data
      var byteCharacters = Uint8Array.from(atob(storedFile), c => c.charCodeAt(0));

      // Create a Blob object from the decoded byte characters
      var blob = new Blob([byteCharacters]);

      // Create a File object using the Blob and assign a filename
      var file = new File([blob], 'myFile');
      // Use the retrieved file as needed
      console.log(file);
    }
    fileUpload.addEventListener('change', (event) => {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        // Access file information
        console.log('File Name:', file.name);
        console.log('File Size:', file.size);
        console.log('File Type:', file.type);
        var reader = new FileReader();

        reader.onload = function(event) {
          var fileData = event.target.result; // Get the file data (contents)

          // Save the file data to local storage or perform any desired operations
          localStorage.setItem(fileUpload.id, fileData);
          console.log('File saved to local storage');
        };
        reader.readAsDataURL(file); // Read the file as data URL
      }
    });
  });
});
*/
/*import {validate} from 'class-validator';



document.addEventListener('DOMContentLoaded', function() {
  var myForm = document.getElementById('myForm');

  myForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission behavior
    var formData = new FormData(this);
    var url = `/case/1685714556571061/case-progression/upload-file?_csrf=${this._csrf.value}`;


    // Make an AJAX POST request
    $.ajax({
      url: url,
      enctype:'multipart/form-data',
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false,
      success: function(response) {
        // Handle the response from the server
        // Update the page content dynamically if needed
        console.log('response' + response);

        console.log('Error messages:', errorMessages);
      },
      error: function(xhr, status, error) {
        // Handle error console.log('submitted'); if necessary
        console.log('status' + status);
        var errorContainer = document.getElementById('error-container');

        errorContainer.innerHTML = `<div class="govuk-error-summary" data-module="govuk-error-summary">
  <div role="alert">
    <h2 class="govuk-error-summary__title">
      There is a problem
    </h2>
    <div class="govuk-error-summary__body">
      <ul class="govuk-list govuk-error-summary__list">
        <li>
          <a href="#">The date your passport was issued must be in the past</a>
        </li>
        <li>
          <a href="#">Enter a postcode, like AA1 1AA</a>
        </li>
      </ul>
    </div>
  </div>
</div>
  `;

      }
    });
    console.log('submitted');
  });
});*/
function elementExists(element) {
  return element?.length > 0;
}
function removeErrorClass(errorField) {
  if (elementExists(errorField)) {
    errorField.forEach(element => element.classList.remove('govuk-form-group--error'));
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


document.addEventListener('DOMContentLoaded', async function() {
  document.querySelectorAll('.govuk-file-upload').forEach(fileUpload => {
    fileUpload.addEventListener('change', async (event) => {
      try {
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

        const objectId = fileUpload.dataset.id; // Get the object identifier

        const response = await fetch('/upload-file', options);
        const parsed = await response.json();
        if (response.status === 400) {
          fileUpload.value = '';
          // Add the 'govuk-form-group--error' class to the parent container
          const formGroup = fileUpload.closest('div');
          formGroup.classList.add('govuk-form-group--error');

          parsed.errors.forEach((item) => {
            const errorMessage = document.createElement('p');
            errorMessage.id = `${objectId}-error`;
            errorMessage.classList.add('govuk-error-message');
            errorMessage.innerHTML = `<span class="govuk-visually-hidden"></span>${item}`;
            fileUpload.parentNode.insertBefore(errorMessage, fileUpload);
          });
          //fileUpload.parentNode.insertBefore(errorMessage, fileUpload);
          fileUpload.classList.add('govuk-file-upload--error');
          fileUpload.setAttribute('aria-describedby', `${objectId}-error`);
          // Process the data returned from the API
        }
        if (response.status === 200 ){

          const fileOkHtml = document.createElement('p');
          fileOkHtml.id = `${objectId}-fileOk`;
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
