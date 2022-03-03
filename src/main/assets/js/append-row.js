document.addEventListener('DOMContentLoaded', function () {
  console.log('loaded');
  const appendRowButton = document.getElementsByClassName('append-row');
  if (appendRowButton && appendRowButton.length > 0) {
    appendRowButton[0].addEventListener('click', (event) => {
      event.preventDefault();
      cloneRow();
    });
  }

  function cloneRow() {
    if (document.getElementsByClassName('multiple-row') && document.getElementsByClassName('multiple-row').length > 0) {
      const lastElementIndex = document.getElementsByClassName('multiple-row').length - 1;
      const lastRow = document.getElementsByClassName('multiple-row')[lastElementIndex];
      const newRow = lastRow.cloneNode(true);
      incrementIndex(newRow);
      sanitizeContent(newRow);
      lastRow.parent().append(newRow);
    }
  }

  function incrementIndex(newRow) {
    let newIndex = 0;
    const indexRegex = /\[[0-9]+\]/;
    newRow.html((index, oldHtml) => {
      return oldHtml.replace(indexRegex, (match, capturedRowIndex) => {
        newIndex = parseInt(capturedRowIndex) + 1;
        return '[' + newIndex + ']';
      });
    });
  }

  function sanitizeContent(newRow) {
    newRow.find('input, textarea').val('');
    newRow.removeClass('govuk-input--error');
  }
});
