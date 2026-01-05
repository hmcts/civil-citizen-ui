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
const{addTotalClaimAmountCalculationEventListener} = require('./calculate-total-amount');

document.addEventListener('DOMContentLoaded', function () {
  const indexRegex = /\[(\d+)\]/;
  const checkboxIndexRegex = /-(\d+)-/;
  const checkboxConditionalHidden = 'govuk-checkboxes__conditional--hidden';
  const checkboxConditional = 'govuk-checkboxes__conditional';
  const checkboxConditionalClassName = '.govuk-checkboxes__conditional';
  const radioButtonConditionalHidden = 'govuk-radios__conditional--hidden';
  const radioButtonConditional = 'govuk-radios__conditional';
  const radioButtonConditionalClassName = '.govuk-radios__conditional';
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
    const rowContainerElement = document.getElementsByClassName('row-container');
    if(elementExists(rowContainerElement)) {
      const lastRowContainer = getLastRow(rowContainerElement);
      const newRowContainer = lastRowContainer.cloneNode(true);
      const children = newRowContainer.children;
      Array.from(children).forEach((child) => {
        const elements = child.querySelectorAll(`div, input, textarea, select, label, ${checkboxConditionalClassName}, ${radioButtonConditionalClassName}`);
        updateInputs(elements);
        removeErrors(child);
      });
      lastRowContainer.parentNode.appendChild(newRowContainer);
      updateNewRow(document.getElementsByClassName('row-container'));
      updateRowNumbers();
      if (elementExists(document.getElementsByClassName('civil-amountRow'))) {
        addCalculationEventListener();
      }
      if(elementExists(document.getElementsByClassName('civil-amount-breakdown-row'))) {
        addTotalClaimAmountCalculationEventListener();
      }
    }
  }

  function updateRowNumbers() {
    document.querySelectorAll('[id^="row-number-"]').forEach((el, i) => {
      el.textContent = `Row ${i + 1}`;
    });
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
        if (element.className?.includes(checkboxConditional)
            && !element.className?.includes(checkboxConditionalHidden)) {
          element.classList.add(checkboxConditionalHidden);
        }
        if (element.type === 'checkbox') {
          addEventToAddedCheckbox(element);
        }
        if (element.className?.includes(radioButtonConditional)
            && !element.className?.includes(radioButtonConditionalHidden)) {
          element.classList.add(radioButtonConditionalHidden);
        }
        if (element.type === 'radio') {
          addEventToUnavailableDatesRadios(element);
        }
      });
    }
  }

  function getNumberFromElementName() {
    const elements = document.getElementsByClassName('multiple-row');
    const lastItem = elements[elements.length-1];
    const lastRadioInput = lastItem.getElementsByClassName('govuk-radios__input');
    const lastCheckboxInput = lastItem.getElementsByClassName('govuk-checkboxes__input');

    if (lastRadioInput.length) {
      const number = lastRadioInput[0].id.split('-')[1];
      return Number(number) + 1;
    } else if (lastCheckboxInput.length) {
      const number = lastCheckboxInput[0].id.split('-')[1];
      return Number(number) + 1;
    }
    return document.getElementsByClassName('multiple-row').length;
  }

  function incrementIndexOnNameAndId(element) {
    const newIndex = getNumberFromElementName();
    if (element.name) {
      element.name = element.name.replace(indexRegex, '[' + newIndex + ']');
      element.id = element.id.replace(checkboxIndexRegex, '-' + newIndex + '-');
    }
    if (element.localName === 'label') {
      element.innerHTML = element.innerHTML.replace(/\d/g, newIndex + 1);
    }
    element.id = element.id.replace(indexRegex, '[' + newIndex + ']');
    element.id = element.id.replace(checkboxIndexRegex, '-' + newIndex + '-');
  }

  function updateAttributes(element) {
    const newIndex = getNumberFromElementName();
    if (element.getAttribute('for')) {
      element.setAttribute(
        'for',
        element
          .getAttribute('for')
          .replace(checkboxIndexRegex, '-' + newIndex + '-'),
      );
      element.setAttribute(
        'for',
        element.getAttribute('for').replace(indexRegex, '[' + newIndex + ']'),
      );
    }
    if (element.getAttribute('aria-controls')) {
      element.setAttribute(
        'aria-controls',
        element
          .getAttribute('aria-controls')
          .replace(checkboxIndexRegex, '-' + newIndex + '-'),
      );
    }
    if (element.getAttribute('aria-describedby')) {
      const describedBy = element.getAttribute('aria-describedby')
        .replace(checkboxIndexRegex, '-' + newIndex + '-')
        .replace(indexRegex, '[' + newIndex + ']');
      element.setAttribute('aria-describedby', describedBy);
    }
    if (element.getAttribute('aria-label')) {
      const updatedIndex = newIndex + 1;
      const ariaLabel = element.getAttribute('aria-label')
        .replace(checkboxIndexRegex, '-' + updatedIndex + '-')
        .replace(indexRegex, '[' + updatedIndex + ']');
      element.setAttribute('aria-label', ariaLabel);
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
      if (conditional?.className?.includes(checkboxConditionalHidden)) {
        conditional.classList.remove(checkboxConditionalHidden);
      } else {
        conditional.classList.add(checkboxConditionalHidden);
      }
    });
  }

  let elementSelectedBefore = [];

  function addEventToUnavailableDatesRadios(radioButton) {
    radioButton.addEventListener('click', (event) => {
      const index = event.target.id.split('-')[1];

      if(elementSelectedBefore[index]?.id === radioButton.id) return;

      elementSelectedBefore[index] = radioButton;

      const fieldName = event.target.id.split('-')[2];
      const name = fieldName === 'longer' ? 'longer-period' : 'single-date';
      const oppositeName = fieldName === 'longer' ? 'single-date' : 'longer-period';
      const conditional = document.getElementById(`conditional-items-${index}-${name}`);
      const oppositeConditional = document.getElementById(`conditional-items-${index}-${oppositeName}`);

      if (conditional?.className?.includes(radioButtonConditionalHidden)) {
        conditional.classList.remove(radioButtonConditionalHidden);
        oppositeConditional.classList.add(radioButtonConditionalHidden);
      } else {
        conditional.classList.add(radioButtonConditionalHidden);
        oppositeConditional.classList.remove(radioButtonConditionalHidden);
      }
    });
  }
});
