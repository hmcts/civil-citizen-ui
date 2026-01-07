/**
 * @jest-environment jsdom
 */

describe('reindex-add-another-actions', () => {
  const scriptPath = '../../../../main/assets/js/reindex-add-another-actions.js';

  beforeEach(() => {
    // Reset DOM between tests
    document.body.innerHTML = '';
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  function setupDom() {
    // Build minimal DOM expected by the script
    document.body.innerHTML = `
      <div data-module="moj-add-another" id="container-1">
        <div class="moj-add-another__item">
          <button name="action" data-value="documentsForDisclosure[%index%][uploadButton]" value="documentsForDisclosure[0][uploadButton]">Upload</button>
          <button name="action" data-value="documentsForDisclosure[%index%][removeButton]" value="documentsForDisclosure[0][removeButton]">Remove</button>
        </div>
        <div class="moj-button-action">
          <button type="button" class="govuk-button moj-add-another__add-button" id="add-btn-1">Add another</button>
        </div>
      </div>
    `;

    // Load the script (IIFE) and fire DOMContentLoaded to attach listeners
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(scriptPath);
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }

  it('reindexes action buttons in the newly added last item using data-value templates', () => {
    setupDom();

    const container = document.getElementById('container-1');
    const addBtn = document.getElementById('add-btn-1');
    expect(container).not.toBeNull();
    expect(addBtn).not.toBeNull();

    // Click add: the script will schedule a setTimeout(…, 0) and then reindex the last item.
    addBtn!.dispatchEvent(new MouseEvent('click'));

    // Simulate MoJ component having cloned a new row as the last item (index 1)
    const newItem = document.createElement('div');
    newItem.className = 'moj-add-another__item';
    const newUpload = document.createElement('button');
    newUpload.setAttribute('name', 'action');
    newUpload.setAttribute('data-value', 'documentsForDisclosure[%index%][uploadButton]');
    const newRemove = document.createElement('button');
    newRemove.setAttribute('name', 'action');
    newRemove.setAttribute('data-value', 'documentsForDisclosure[%index%][removeButton]');
    newItem.appendChild(newUpload);
    newItem.appendChild(newRemove);
    container!.insertBefore(newItem, container!.querySelector('.moj-button-action'));

    // Let the scheduled reindex run
    jest.runAllTimers();

    expect(newUpload.value).toBe('documentsForDisclosure[1][uploadButton]');
    expect(newRemove.value).toBe('documentsForDisclosure[1][removeButton]');

    // Ensure the original first item values are unchanged
    const firstItem = container!.querySelector('.moj-add-another__item');
    const firstButtons = firstItem!.querySelectorAll('button[name="action"][data-value]');
    expect(firstButtons[0].getAttribute('value')).toBe('documentsForDisclosure[0][uploadButton]');
    expect(firstButtons[1].getAttribute('value')).toBe('documentsForDisclosure[0][removeButton]');
  });

  it('does nothing if the last item has no matching buttons (no throws)', () => {
    setupDom();
    const container = document.getElementById('container-1')!;
    const addBtn = document.getElementById('add-btn-1')!;

    addBtn.dispatchEvent(new MouseEvent('click'));

    // Append a new item that has no action buttons with data-value
    const newItem = document.createElement('div');
    newItem.className = 'moj-add-another__item';
    const unrelated = document.createElement('button');
    unrelated.textContent = 'Unrelated';
    newItem.appendChild(unrelated);
    container.insertBefore(newItem, container.querySelector('.moj-button-action'));

    expect(() => jest.runAllTimers()).not.toThrow();
  });
});
