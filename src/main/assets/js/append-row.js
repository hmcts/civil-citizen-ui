/**
 * This adds a cloning functionality to a button with class name append-row.
 * Anything in a div wth name multiple-row will be cloned (duplicated). Indexes for the input elements would be increased accordingly.
 * The input elements would be reset to their original state.
 * To use this functionality create a button with class name append-row, create a div with class name multiple-row.
 * Put all the elements that are needed to be cloned in the div with class name multiple-row
 * If you have a remove row button in your repeating section add remove-row class to it to enable it to remove rows
 * If there is only one row then remove button will be hidden
 */
document.addEventListener('DOMContentLoaded', function () {
  const appendRowButton = document.getElementsByClassName('append-row');
  if (elementExists(appendRowButton)) {
    appendRowButton[0].addEventListener('click', (event) => {
      event.preventDefault();
      cloneRow();
      showRemoveButton();
      addEventListenerToRemoveButtons();
    });
    document.querySelectorAll('.remove-row')?.forEach((element) => {
      removeRowButtonEventListener(element);
    });
  }

  function removeRowButtonEventListener(element) {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      const topParent = element.parentNode.parentNode;
      topParent?.removeChild(element.parentNode);
      const multipleRows = document.getElementsByClassName('multiple-row')?.length;
      if (multipleRows < 2) {
        hideRemoveButton();
      }
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

  function getLastRow(multipleRowElement) {
    const lastElementIndex = multipleRowElement.length - 1;
    return multipleRowElement[lastElementIndex];
  }

  function updateNewRow(addedRow) {
    let newRow = getLastRow(addedRow);
    let inputs = newRow.querySelectorAll('input, textarea, select');
    updateInputs(inputs);
    removeErrors(newRow);
  }

  function removeErrors(newRow) {
    const errorRow = newRow.querySelectorAll('.govuk-form-group .govuk-form-group--error .govuk-error-message');
    if (elementExists(errorRow)) {
      errorRow.forEach(element => element.parentNode.removeChild(element));
    }
    const errorField = newRow.querySelectorAll('.govuk-form-group .govuk-form-group--error');
    if (elementExists(errorField)) {
      errorField.forEach(element => element.classList.remove('govuk-form-group--error'));
    }
  }

  function updateInputs(inputs) {
    if (elementExists(inputs)) {
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

  function showRemoveButton() {
    const hiddenRemoveButton = document.getElementsByClassName('remove-row govuk-visually-hidden');
    if (elementExists(hiddenRemoveButton)) {
      Array.from(hiddenRemoveButton).forEach(element => element.classList.remove('govuk-visually-hidden'));
    }
  }

  function hideRemoveButton() {
    const removeButton = document.getElementsByClassName('remove-row');
    if (elementExists(removeButton)) {
      Array.from(removeButton).forEach(element => element.classList.add('govuk-visually-hidden'));
    }
  }

  function addEventListenerToRemoveButtons() {
    const removeButton = document.getElementsByClassName('remove-row');
    if (elementExists(removeButton)) {
      Array.from(removeButton).forEach(element => removeRowButtonEventListener(element));
    }
  }

  function elementExists(element) {
    return element?.length > 0;
  }
});
