/**
 * This adds a cloning functionality to a button with class name append-row.
 * Anything in a div wth name multiple-row will be cloned (duplicated). Indexes for the input elements would be increased accordingly.
 * The input elements would be reset to their original state.
 * To use this functionality create a button with class name append-row, create a div with class name multiple-row.
 * Put all the elements that are needed to be cloned in the div with class name multiple-row
 * If you have a remove row button in your repeating section add remove-row class to it to enable it to remove rows
 * If there is only one row then remove button will be hidden
 */
const {getCalculation, addCalculationEventListener} = require('./calculate-amount');

document.addEventListener('DOMContentLoaded', function () {
  const indexRegex = /\[(\d+)\]/;
  const checkboxIndexRegex = /\-(\d+)\-/;
  const chechboxCondtionalHidden = 'govuk-checkboxes__conditional--hidden';
  const checkboxConditional = 'govuk-checkboxes__conditional';
  const checkboxConditionalClassName = '.govuk-checkboxes__conditional';
  const appendRowButton = document.getElementsByClassName('append-row');
  if (elementExists(appendRowButton)) {
    appendRowButton[0].addEventListener('click', (event) => {
      event.preventDefault();
      cloneRow();
      showRemoveButton();
      addEventListenerToRemoveButtons();
    });
    addEventListenerToRemoveButtons();
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
      if (document.getElementsByClassName('civil-amountRow')) {
        getCalculation().catch(err => {
          console.log(err);
        });
      }
    });
  }

  function cloneRow() {
    const multipleRowElement = document.getElementsByClassName('multiple-row');
    if (elementExists(multipleRowElement)) {
      const lastRow = getLastRow(multipleRowElement);
      const newRow = lastRow.cloneNode(true);
      const children = newRow.children;
      Array.from(children).forEach((child) => {
        const elements = child.querySelectorAll('input, textarea, select, label,' + checkboxConditionalClassName);
        updateInputs(elements);
        removeErrors(child);
      });
      lastRow.parentNode.appendChild(newRow);
      updateNewRow(document.getElementsByClassName('multiple-row'));
      if (elementExists(document.getElementsByClassName('civil-amountRow'))) {
        addCalculationEventListener();
      }
    }
  }

  function getLastRow(multipleRowElement) {
    const lastElementIndex = multipleRowElement.length - 1;
    return multipleRowElement[lastElementIndex];
  }

  function updateNewRow(addedRow) {
    const newRow = getLastRow(addedRow);
    removeErrors(newRow);
  }

  function removeErrors(newRow) {
    const errorRow = newRow.querySelectorAll('.govuk-error-message');
    if (elementExists(errorRow)) {
      errorRow.forEach(element => element.parentNode.removeChild(element));
    }
    const errorField = newRow.querySelectorAll('.govuk-form-group--error');
    removeErrorClass(errorField);
  }

  function removeErrorClass(errorField) {
    if (elementExists(errorField)) {
      errorField.forEach(element => element.classList.remove('govuk-form-group--error'));
    }
  }

  function updateInputs(elements) {
    if (elementExists(elements)) {
      elements.forEach(element => {
        if (element.type !== 'radio' && element.type !== 'checkbox') {
          element.value = '';
        }
        if (element.checked) {
          element.checked = false;
        }
        element.classList.remove('govuk-input--error', 'govuk-select--error', 'govuk-textarea--error');
        element.parentNode.classList.remove('govuk-form-group--error');
        incrementIndexOnNameAndId(element);
        updateAttributes(element);
        if (
          element.className?.includes(checkboxConditional) &&
          !element.className?.includes(chechboxCondtionalHidden)
        ) {
          element.classList.add(chechboxCondtionalHidden);
        }
        if (element.type === 'checkbox') {
          addEventToAddedCheckbox(element);
        }
      });
    }
  }

  function incrementIndexOnNameAndId(element) {
    const newIndex = document.getElementsByClassName('multiple-row').length;
    if (element.name) {
      element.name = element.name.replace(indexRegex, '[' + newIndex + ']');
      element.id = element.id.replace(checkboxIndexRegex, '-' + newIndex + '-');
    }
    element.id = element.id.replace(indexRegex, '[' + newIndex + ']');
    element.id = element.id.replace(checkboxIndexRegex, '-' + newIndex + '-');
  }

  function updateAttributes(element) {
    const newIndex = document.getElementsByClassName('multiple-row').length;
    if (element.getAttribute('for')) {
      element.setAttribute(
        'for',
        element
          .getAttribute('for')
          .replace(checkboxIndexRegex, '-' + newIndex + '-')
      );
      element.setAttribute(
        'for',
        element.getAttribute('for').replace(indexRegex, '[' + newIndex + ']')
      );
    }
    if (element.getAttribute('aria-controls')) {
      element.setAttribute(
        'aria-controls',
        element
          .getAttribute('aria-controls')
          .replace(checkboxIndexRegex, '-' + newIndex + '-')
      );
    }
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

  function addEventToAddedCheckbox(checkbox) {
    checkbox.addEventListener('click', (event) => {
      event.target.ariaExpanded = event.target.ariaExpanded === 'true' ? false : true;
      const index = event.target.id.match(checkboxIndexRegex);
      const fieldName = event.target.id.split('-')[2];
      const conditional = document.getElementById(`conditional-declared-${index[1]}-${fieldName}`);
      if (conditional?.className?.includes(chechboxCondtionalHidden)) {
        conditional.classList.remove(chechboxCondtionalHidden);
      } else {
        conditional.classList.add(chechboxCondtionalHidden);
      }
    });
  }
});
