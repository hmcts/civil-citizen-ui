/**
 * This adds a cloning functionality to a button with class name append-row.
 * Anything in a div wth name multiple-row will be cloned (duplicated). Indexes for the input elements would be increased accordingly.
 * The input elements would be reset to their original state.
 * To use this functionality create a button with class name append-row, create a div with class name multiple-row.
 * Put all the elements that are needed to be cloned in the div with class name multiple-row
 */
document.addEventListener('DOMContentLoaded', function () {
  const appendRowButton = document.getElementsByClassName('append-row');
  if (elementExists(appendRowButton)) {
    appendRowButton[0].addEventListener('click', (event) => {
      event.preventDefault();
      cloneRow();
    });
  }

  function cloneRow() {
    const multipleRowElement = document.getElementsByClassName('multiple-row');
    if (elementExists(multipleRowElement)) {
      const lastRow = getLastRow(multipleRowElement);
      let newRow = lastRow.cloneNode(true);
      lastRow.parentNode.appendChild(newRow);
      updateNewRow(document.getElementsByClassName('multiple-row'));
    }
  }

  function getLastRow(multipleRowElement){
    const lastElementIndex = multipleRowElement.length - 1;
    return multipleRowElement[lastElementIndex];
  }

  function updateNewRow(addedRow){
    let newRow = getLastRow(addedRow);
    let inputs = newRow.querySelectorAll('input, textarea, select');
    updateInputs(inputs);
    removeErrors(newRow);
  }

  function removeErrors(newRow) {
    let errorRow = newRow.getElementsByClassName('govuk-form-group govuk-form-group--error');
    if(elementExists(errorRow)){
      const errors = errorRow[0].getElementsByClassName('govuk-error-message');
      if(elementExists(errors)){
        while(errors[0]){
          errors[0].parentNode.removeChild(errors[0]);
        }
      }
      errorRow[0].classList.remove('govuk-form-group--error');
    }
  }

  function updateInputs(inputs) {
    if(elementExists(inputs)){
      inputs.forEach(input => {
        input.value = '';
        input.classList.remove('govuk-input--error', 'govuk-select--error', 'govuk-textarea--error');
        incrementIndexOnName(input);
      });
    }
  }

  function incrementIndexOnName(input) {
    let newIndex = document.getElementsByClassName('multiple-row').length - 1;
    const indexRegex = /\[(\d+)\]/;
    input.name = input.name.replace(indexRegex, '[' + newIndex + ']');
    input.id = input.id.replace(indexRegex, '[' + newIndex + ']');
  }

  function elementExists(element){
    return element?.length > 0;
  }
});
