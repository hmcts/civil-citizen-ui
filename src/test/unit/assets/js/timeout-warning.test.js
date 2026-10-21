/**
 * @jest-environment jsdom
 */
import {TimeoutWarning} from '../../../../main/assets/js/timeout-warning.js';

describe('TimeoutWarning', () => {
  let dialog;
  let moduleInstance;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="main-content"></div>
      <div class="govuk-timeout-warning-fallback"></div>
      <dialog class="govuk-timeout-warning"
        data-module="govuk-timeout-warning"
        data-minutes-idle-timeout="25"
        data-minutes-modal-visible="5"
        data-url-redirect="/session-timeout"
        data-url-extend="/session/extend"
        data-timer-text="We will sign you out in "
        data-timer-extra-text="This is to protect your data."
        data-timer-redirect-text="You are about to be redirected">
        <div class="govuk-timeout-warning__timer timer"></div>
        <div class="govuk-timeout-warning__at-timer at-timer"></div>
        <button type="button" class="js-dialog-close">Stay signed in</button>
      </dialog>
    `;
    dialog = document.querySelector('[data-module="govuk-timeout-warning"]');
    dialog.showModal = jest.fn(function () {
      this.open = true;
    });
    dialog.close = jest.fn(function () {
      this.open = false;
    });
    moduleInstance = new TimeoutWarning(dialog);
  });

  it('converts numbers to words for screen readers', () => {
    expect(moduleInstance.numberToWords(0)).toBe('zero');
    expect(moduleInstance.numberToWords(21)).toBe('twenty one');
  });

  it('opens the dialog and starts the countdown', () => {
    moduleInstance.openDialog();
    expect(dialog.showModal).toHaveBeenCalled();
    expect(document.body.classList.contains('govuk-timeout-warning-overlay')).toBe(true);
    expect(moduleInstance.isDialogOpen()).toBe(true);
  });

  it('closes the dialog and clears timers', () => {
    const xhrOpen = jest.fn();
    const xhrSend = jest.fn();
    global.XMLHttpRequest = jest.fn(() => ({
      open: xhrOpen,
      send: xhrSend,
      setRequestHeader: jest.fn(),
    }));

    moduleInstance.openDialog();
    moduleInstance.closeDialog();

    expect(dialog.close).toHaveBeenCalled();
    expect(document.body.classList.contains('govuk-timeout-warning-overlay')).toBe(false);
    expect(xhrOpen).toHaveBeenCalledWith('GET', '/session/extend', true);
    expect(xhrSend).toHaveBeenCalled();
  });
});
