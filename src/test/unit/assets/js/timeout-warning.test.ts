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
    extendTimeOnServer: (callback?: (response: {extended: boolean; expiresAt: number}) => void) => void;
    redirect: () => void;
    clearTimers: () => void;
    handleStorageChange: (event: StorageEvent) => void;
    sessionExpiresAt: number;
    dialogSupported: () => boolean;
    startUiCountdown: () => void;
    escClose: (event: {keyCode: number}) => void;
    minutesTimeOutModalVisible: number;
  };
  let initTimeoutWarning: () => void;

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
    window.localStorage.clear();
    (global as unknown as {HTMLDialogElement: unknown}).HTMLDialogElement = (window as unknown as {HTMLDialogElement: unknown}).HTMLDialogElement;
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
    const {TimeoutWarning, initTimeoutWarning: initWarning} = require('../../../../main/assets/js/timeout-warning.js');
    initTimeoutWarning = initWarning;
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

  it('uses the polyfill or displays the fallback when dialogs are unsupported', () => {
    (global as unknown as {HTMLDialogElement: unknown}).HTMLDialogElement = undefined;
    const registerDialog = jest.fn();
    (window as unknown as {dialogPolyfill: {registerDialog: jest.Mock}}).dialogPolyfill = {registerDialog};

    expect(moduleInstance.dialogSupported()).toBe(true);
    expect(registerDialog).toHaveBeenCalledWith(dialog);

    registerDialog.mockImplementation(() => { throw new Error('unsupported'); });
    expect(moduleInstance.dialogSupported()).toBe(false);
    expect(document.querySelector('.govuk-timeout-warning-fallback')?.classList.contains('govuk-!-display-block')).toBe(true);
  });

  it('returns early for an invalid stored interaction time', () => {
    window.localStorage.setItem('timeUserLastInteractedWithPage', 'invalid');
    const open = jest.spyOn(moduleInstance, 'openDialog');
    moduleInstance.checkIfShouldHaveTimedOut();
    expect(open).not.toHaveBeenCalled();
  });

  it('extends the session after activity and opens after the idle period', () => {
    const extend = jest.spyOn(moduleInstance, 'extendTimeOnServer');
    const open = jest.spyOn(moduleInstance, 'openDialog');
    moduleInstance.sessionExpiresAt = Date.now() + 30 * 60000;
    extend.mockImplementation((callback?: (response: {extended: boolean; expiresAt: number}) => void) => {
      callback?.({extended: true, expiresAt: moduleInstance.sessionExpiresAt});
    });

    moduleInstance.resetIdleTime();
    jest.advanceTimersByTime(3000);
    expect(extend).toHaveBeenCalled();

    jest.advanceTimersByTime(25 * 60000);
    expect(open).toHaveBeenCalled();
  });

  it('keeps the original warning deadline when the initial renewal fails', () => {
    const open = jest.spyOn(moduleInstance, 'openDialog');
    moduleInstance.sessionExpiresAt = Date.now() + 26 * 60000;
    jest.spyOn(moduleInstance, 'extendTimeOnServer').mockImplementation((callback) => callback?.(null as never));

    moduleInstance.resetIdleTime();
    jest.advanceTimersByTime(3000);
    jest.advanceTimersByTime(21 * 60000);

    expect(open).toHaveBeenCalled();
  });

  it('opens the dialog and starts the countdown', () => {
    moduleInstance.openDialog();
    expect(dialog.showModal).toHaveBeenCalled();
    expect(document.body.classList.contains('govuk-timeout-warning-overlay')).toBe(true);
    expect(moduleInstance.isDialogOpen()).toBe(true);
  });

  it('redirects when the countdown expires and announces the remaining time', () => {
    moduleInstance.sessionExpiresAt = 0;
    moduleInstance.minutesTimeOutModalVisible = 1 / 60;
    jest.spyOn(moduleInstance, 'numberToWords').mockImplementation(() => { throw new Error('unsupported'); });
    const redirect = jest.spyOn(moduleInstance, 'redirect').mockImplementation(() => undefined);

    moduleInstance.startUiCountdown();
    jest.advanceTimersByTime(2000);
    expect(redirect).toHaveBeenCalled();
    expect(dialog.querySelector('.govuk-timeout-warning__timer')?.textContent).toBe('You are about to be redirected');
  });

  it('restores focus after closing the dialog', () => {
    const button = dialog.querySelector('.js-dialog-close') as HTMLElement;
    button.focus();
    moduleInstance.openDialog();
    moduleInstance.closeDialog();
    jest.runOnlyPendingTimers();
    expect(document.activeElement).toBe(button);
  });

  it('initialises the warning module when present', () => {
    initTimeoutWarning();
    expect(window.localStorage.getItem('timeUserLastInteractedWithPage')).not.toBeNull();
  });

  it('handles missing countdown elements and an already open dialog', () => {
    const showModal = dialog.showModal;
    moduleInstance.openDialog();
    expect(showModal).toHaveBeenCalledTimes(1);
    moduleInstance.openDialog();
    expect(showModal).toHaveBeenCalledTimes(1);
  });

  it('closes on escape and marks the page inaccessible', () => {
    (global as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = jest.fn(() => ({
      open: jest.fn(), setRequestHeader: jest.fn(),
      send: function (this: {onreadystatechange: () => void; readyState: number; status: number; responseText: string}) {
        this.readyState = 4; this.status = 200; this.responseText = '{"extended":true}'; this.onreadystatechange();
      },
    }));
    moduleInstance.openDialog();
    moduleInstance.escClose({keyCode: 27});
    expect(dialog.close).toHaveBeenCalled();
    expect(document.querySelector('#main-content')?.getAttribute('aria-hidden')).toBeNull();
  });

  it('closes the dialog and extends the session', () => {
    const xhrOpen = jest.fn();
    const xhrSend = jest.fn();
    (global as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = jest.fn(() => ({
      open: xhrOpen,
      setRequestHeader: jest.fn(),
      send: function (this: {onreadystatechange: () => void; readyState: number; status: number; responseText: string}) {
        xhrSend(); this.readyState = 4; this.status = 200; this.responseText = '{"extended":true}'; this.onreadystatechange();
      },
    }));

    moduleInstance.openDialog();
    moduleInstance.closeDialog();

    expect(dialog.close).toHaveBeenCalled();
    expect(document.body.classList.contains('govuk-timeout-warning-overlay')).toBe(false);
    expect(xhrOpen).toHaveBeenCalledWith('POST', '/session/extend', true);
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
    const redirect = jest.spyOn(moduleInstance, 'redirect').mockImplementation(() => undefined);

    moduleInstance.checkIfShouldHaveTimedOut();

    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it('closes a warning when another tab records fresh activity', () => {
    const closeDialog = jest.spyOn(moduleInstance, 'closeDialog');
    moduleInstance.openDialog();
    moduleInstance.handleStorageChange({key: 'timeUserLastInteractedWithPage', newValue: new Date().toISOString()} as StorageEvent);

    expect(closeDialog).toHaveBeenCalledTimes(1);
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
