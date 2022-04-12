/**
 * This is client logic to stop showing the "add another item" button once the maximumNumberOfRows has been reached.
 * Future pages using MoJ add-another component can leverage this logic by defining the id attribute in the add button
 * (of class 'moj-add-another__add-button') and adding the corresponding maximum number of rows value in the map below.
 */
const maximumNumberOfRowsByButtonId = [
  {
    buttonId: 'add-another-court-order',
    maximumNumberOfRows: 10,
  },
];

maximumNumberOfRowsByButtonId.forEach(entry => {
  const addButton = document.getElementById(entry.buttonId);
  addButton.addEventListener('click', () => {
    const addAnotherItemsCount = [...document.getElementsByClassName('moj-add-another__item')].length;
    if (addAnotherItemsCount > entry.maximumNumberOfRows - 2) {
      addButton.classList.add('hide');
    }
  });
});
