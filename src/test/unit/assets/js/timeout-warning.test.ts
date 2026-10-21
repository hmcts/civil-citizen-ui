/**
 * Uses manual JSDOM setup instead of @jest-environment jsdom to avoid
 * virtualConsole.sendTo incompatibility with jsdom 28.
 */
const {JSDOM} = require('jsdom');

export {};

describe('TimeoutWarning', () => {
  let dialog: HTMLDialogElement;
  let moduleInstance: {
    numberToWords: (n: number) => string;
    openDialog: () => void;
    closeDialog: () => void;
    isDialogOpen: () => boolean;
  };

  beforeAll(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost/',
    });
    (global as unknown as { window: Window }).window = dom.window as unknown as Window;
    (global as unknown as { document: Document }).document = dom.window.document;
    (global as unknown as { HTMLDialogElement: unknown }).HTMLDialogElement = dom.window.HTMLDialogElement;
    (global as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = dom.window.XMLHttpRequest;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    document.body.innerHTML = `
      <div id="main-content" class="govuk-modal-dialogue-inert-container"></div>
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
    dialog = document.querySelector('[data-module="govuk-timeout-warning"]') as HTMLDialogElement;
    dialog.showModal = jest.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    dialog.close = jest.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {TimeoutWarning} = require('../../../../main/assets/js/timeout-warning.js');
    moduleInstance = new TimeoutWarning(dialog);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
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

  it('closes the dialog and extends the session', () => {
    const xhrOpen = jest.fn();
    const xhrSend = jest.fn();
    (global as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = jest.fn(() => ({
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
