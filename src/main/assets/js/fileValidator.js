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


document.querySelectorAll('.govuk-file-upload').forEach(fileUpload => {
  fileUpload.addEventListener('change', (event) => {
    const selectedFiles = fileUpload.files; // Get the selected files
    const objectId = fileUpload.dataset.id; // Get the object identifier
    const formGroup = fileUpload.closest('div');

// Add the 'govuk-form-group--error' class to the parent container
    formGroup.classList.add('govuk-form-group--error');

    // Create the error message <p> element
    const errorMessage = document.createElement('p');
    errorMessage.id = 'file-upload-1-error';
    errorMessage.classList.add('govuk-error-message');
    errorMessage.innerHTML = '<span class="govuk-visually-hidden">Error:</span> The CSV must be smaller than 2MB';

// Append the error message element to the parent container

    // Insert the fileUpload element as the first child of the wrapping div
    fileUpload.parentNode.insertBefore(errorMessage, fileUpload);

// Add the 'govuk-file-upload--error' class to the input element

    fileUpload.classList.add('govuk-file-upload--error');
    fileUpload.setAttribute('aria-describedby', 'file-upload-1-error');
  });
});
