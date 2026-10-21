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
    init: () => void;
    openDialog: () => void;
    closeDialog: () => void;
    isDialogOpen: () => boolean;
    resetIdleTime: () => void;
    checkIfShouldHaveTimedOut: () => void;
    extendTimeOnServer: () => void;
    redirect: () => void;
    clearTimers: () => void;
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
    expect(moduleInstance.numberToWords(105)).toBe('one hundred five');
    expect(moduleInstance.numberToWords(1001)).toBe('one thousand one');
    expect(moduleInstance.numberToWords(1000000000000)).toBe('');
  });

  it('initialises interaction listeners and records activity', () => {
    const addEventListener = jest.spyOn(window, 'addEventListener');

    moduleInstance.init();

    expect(addEventListener).toHaveBeenCalledWith('load', expect.any(Function), {passive: true});
    expect(window.localStorage.getItem('timeUserLastInteractedWithPage')).not.toBeNull();
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

  it('does not close an already closed dialog', () => {
    moduleInstance.closeDialog();
    expect(dialog.close).not.toHaveBeenCalled();
  });

  it('opens the warning when the idle time has elapsed', () => {
    window.localStorage.setItem('timeUserLastInteractedWithPage', new Date(Date.now() - 26 * 60000).toISOString());
    const openDialog = jest.spyOn(moduleInstance, 'openDialog');

    moduleInstance.checkIfShouldHaveTimedOut();

    expect(openDialog).toHaveBeenCalled();
  });

  it('redirects when the idle time and warning period have elapsed', () => {
    window.localStorage.setItem('timeUserLastInteractedWithPage', new Date(Date.now() - 31 * 60000).toISOString());
    const replace = jest.spyOn(window.location, 'replace').mockImplementation(() => undefined);

    moduleInstance.checkIfShouldHaveTimedOut();

    expect(replace).toHaveBeenCalledWith('/session-timeout');
    replace.mockRestore();
  });

  it('sends the session extension request with JSON accepted', () => {
    const xhrOpen = jest.fn();
    const xhrSend = jest.fn();
    const setRequestHeader = jest.fn();
    (global as unknown as {XMLHttpRequest: unknown}).XMLHttpRequest = jest.fn(() => ({
      open: xhrOpen,
      send: xhrSend,
      setRequestHeader,
    }));

    moduleInstance.extendTimeOnServer();

    expect(setRequestHeader).toHaveBeenCalledWith('Accept', 'application/json');
    expect(xhrSend).toHaveBeenCalledTimes(1);
  });
});
