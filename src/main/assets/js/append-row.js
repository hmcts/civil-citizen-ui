document.addEventListener('DOMContentLoaded', function () {
  const appendRowButton = document.getElementsByClassName('append-row');
  if (appendRowButton && appendRowButton.length > 0) {
    appendRowButton[0].addEventListener('click', (event) => {
      event.preventDefault();
      cloneRow();
    });
  }

  function cloneRow() {
    if (document.getElementsByClassName('multiple-row') && document.getElementsByClassName('multiple-row').length > 0) {
      const lastRow = getLastRow();
      let newRow = lastRow.cloneNode(true);
      lastRow.parentNode.appendChild(newRow);
      updateNewRow();
    }
  }

  function getLastRow(){
    const lastElementIndex = document.getElementsByClassName('multiple-row').length - 1;
    return document.getElementsByClassName('multiple-row')[lastElementIndex];
  }

  function updateNewRow(){
    let newRow = getLastRow();
    let inputs = newRow.querySelectorAll('input, textarea, select');
    updateInputs(inputs);
    removeErrors(newRow);
  }

  function removeErrors(newRow) {
    let errorRow = newRow.getElementsByClassName('govuk-form-group govuk-form-group--error');
    if(errorRow && errorRow.length>0){
      const errors = errorRow[0].getElementsByClassName('govuk-error-message');
      if(errors && errors.length>0){
        while(errors[0]){
          errors[0].parentNode.removeChild(errors[0]);
        }
      }
      errorRow[0].classList.remove('govuk-form-group--error');
    }
  }

  function updateInputs(inputs) {
    if(inputs && inputs.length>0){
      inputs.forEach(input => {
        input.value = '';
        input.classList.remove('govuk-input--error', 'govuk-select--error');
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
});
