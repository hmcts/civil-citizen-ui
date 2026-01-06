/**
 * Reindex action buttons (upload/remove) inside newly added MoJ add-another rows.
 * The MoJ component updates inputs using data-name/data-id placeholders, but not button values.
 * This script mirrors that behaviour for buttons that have a `data-value` placeholder.
 */
(function () {
  const ADD_BUTTON_SELECTOR = '.moj-add-another__add-button';
  const CONTAINER_SELECTOR = '[data-module="moj-add-another"]';
  const ITEM_SELECTOR = '.moj-add-another__item';
  const ACTION_BUTTON_SELECTOR = 'button[name="action"][data-value]';

  const reindexButtonsInItem = (itemEl, newIndex) => {
    const buttons = itemEl.querySelectorAll(ACTION_BUTTON_SELECTOR);
    buttons.forEach((btn) => {
      const template = btn.getAttribute('data-value');
      if (template) {
        btn.value = template.replace('%index%', String(newIndex));
      }
    });
  };

  const onAddAnotherClicked = (evt) => {
    const addBtn = evt.currentTarget;
    const container = addBtn.closest(CONTAINER_SELECTOR);
    if (!container) return;

    // Allow MoJ component time to clone the new item
    setTimeout(() => {
      const items = container.querySelectorAll(ITEM_SELECTOR);
      if (!items || items.length === 0) return;
      const newIndex = items.length - 1;
      const lastItem = items[items.length - 1];
      reindexButtonsInItem(lastItem, newIndex);
    }, 0);
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(ADD_BUTTON_SELECTOR).forEach((btn) => {
      btn.addEventListener('click', onAddAnotherClicked);
    });
  });
})();
