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
  }

  function updateInputs(inputs) {
    if(inputs && inputs.length>0){
      inputs.forEach(input => {
        input.value = '';
        incrementIndexOnName(input);
      });
    }
  }

  function incrementIndexOnName(input) {
    let newIndex = document.getElementsByClassName('multiple-row').length - 1;
    const indexRegex = /\[rows(\d+)\]/;
    input.name = input.name.replace(indexRegex, '[rows' + newIndex + ']');
  }
});
