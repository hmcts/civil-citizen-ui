/**
 * Timeout warning based on the MoJ design pattern:
 * https://design-patterns.service.justice.gov.uk/components/timeout-warning/
 * (adapted from the accessible timeout warning prototype)
 */
function TimeoutWarning($module) {
  this.$module = $module;
  this.$lastFocusedEl = null;
  this.$closeButton = $module.querySelector('.js-dialog-close');
  this.overLayClass = 'govuk-timeout-warning-overlay';
  this.$fallBackElement = document.querySelector('.govuk-timeout-warning-fallback');
  this.timers = [];
  this.$countdown = $module.querySelector('.govuk-timeout-warning__timer') || $module.querySelector('.timer');
  this.$accessibleCountdown = $module.querySelector('.govuk-timeout-warning__at-timer') || $module.querySelector('.at-timer');
  this.idleMinutesBeforeTimeOut = Number($module.getAttribute('data-minutes-idle-timeout')) || 25;
  this.minutesTimeOutModalVisible = Number($module.getAttribute('data-minutes-modal-visible')) || 5;
  this.timeOutRedirectUrl = $module.getAttribute('data-url-redirect') || '/session-timeout';
  this.extendSessionUrl = $module.getAttribute('data-url-extend') || '/session/extend';
  this.timerText = $module.getAttribute('data-timer-text') || 'Your session will be reset in ';
  this.timerExtraText = $module.getAttribute('data-timer-extra-text') || 'This is to protect your data.';
  this.timerRedirectText = $module.getAttribute('data-timer-redirect-text') || 'You are about to be redirected';
  this.idleTimeoutId = null;
  this.extendDebounceId = null;
}

TimeoutWarning.prototype.init = function () {
  if (!this.$module || !this.dialogSupported()) {
    return;
  }

  this.countIdleTime();
  this.$closeButton.addEventListener('click', this.closeDialog.bind(this));
  this.$module.addEventListener('keydown', this.escClose.bind(this));
  window.addEventListener('focus', this.checkIfShouldHaveTimedOut.bind(this));
};

TimeoutWarning.prototype.dialogSupported = function () {
  if (typeof HTMLDialogElement === 'function') {
    return true;
  }

  try {
    window.dialogPolyfill.registerDialog(this.$module);
    return true;
  } catch (error) {
    if (this.$fallBackElement) {
      this.$fallBackElement.classList.add('govuk-!-display-block');
    }
    return false;
  }
};

TimeoutWarning.prototype.resetIdleTime = function () {
  if (this.isDialogOpen()) {
    return;
  }

  var milliSecondsBeforeTimeOut = this.idleMinutesBeforeTimeOut * 60000;
  clearTimeout(this.idleTimeoutId);
  clearTimeout(this.extendDebounceId);

  this.extendDebounceId = setTimeout(function () {
    this.extendTimeOnServer();
    this.idleTimeoutId = setTimeout(this.openDialog.bind(this), milliSecondsBeforeTimeOut);
  }.bind(this), 3000);

  if (window.localStorage) {
    window.localStorage.setItem('timeUserLastInteractedWithPage', new Date().toISOString());
  }
};

TimeoutWarning.prototype.countIdleTime = function () {
  var resetIdleTime = this.resetIdleTime.bind(this);

  ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress', 'keyup', 'touchstart'].forEach(function (eventName) {
    window.addEventListener(eventName, resetIdleTime, {passive: true});
  });

  resetIdleTime();
};

TimeoutWarning.prototype.openDialog = function () {
  if (this.isDialogOpen()) {
    return;
  }

  document.body.classList.add(this.overLayClass);
  this.saveLastFocusedEl();
  this.makePageContentInert();
  this.$module.showModal();
  this.startUiCountdown();
};

TimeoutWarning.prototype.startUiCountdown = function () {
  this.clearTimers();
  var $module = this;
  var $countdown = this.$countdown;
  var $accessibleCountdown = this.$accessibleCountdown;
  var minutes = this.minutesTimeOutModalVisible;
  var timerRunOnce = false;
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var seconds = 60 * minutes;

  $countdown.innerHTML = minutes + ' minute' + (minutes > 1 ? 's' : '');

  (function runTimer() {
    var minutesLeft = parseInt(seconds / 60, 10);
    var secondsLeft = parseInt(seconds % 60, 10);
    var timerExpired = minutesLeft < 1 && secondsLeft < 1;
    var minutesText = minutesLeft > 0
      ? '<span class="tabular-numbers">' + minutesLeft + '</span> minute' + (minutesLeft > 1 ? 's' : '')
      : '';
    var secondsText = secondsLeft >= 1
      ? ' <span class="tabular-numbers">' + secondsLeft + '</span> second' + (secondsLeft > 1 ? 's' : '')
      : '';
    var atMinutesNumberAsText;
    var atSecondsNumberAsText;

    try {
      atMinutesNumberAsText = $module.numberToWords(minutesLeft);
      atSecondsNumberAsText = $module.numberToWords(secondsLeft);
    } catch (e) {
      atMinutesNumberAsText = minutesLeft;
      atSecondsNumberAsText = secondsLeft;
    }

    var atMinutesText = minutesLeft > 0
      ? atMinutesNumberAsText + ' minute' + (minutesLeft > 1 ? 's' : '')
      : '';
    var atSecondsText = secondsLeft >= 1
      ? ' ' + atSecondsNumberAsText + ' second' + (secondsLeft > 1 ? 's' : '')
      : '';

    var text = $module.timerText + minutesText + secondsText + '.';
    var atText = $module.timerText + atMinutesText;
    if (atSecondsText) {
      if (minutesLeft > 0) {
        atText += ' and';
      }
      atText += atSecondsText + '.';
    } else {
      atText += '.';
    }
    var extraText = ' ' + $module.timerExtraText;

    if (timerExpired) {
      $countdown.innerHTML = $module.timerRedirectText;
      $accessibleCountdown.innerHTML = $module.timerRedirectText;
      setTimeout($module.redirect.bind($module), 1000);
      return;
    }

    seconds--;
    $countdown.innerHTML = text + extraText;

    if (minutesLeft < 1 && secondsLeft < 20) {
      $accessibleCountdown.setAttribute('aria-live', 'assertive');
    }

    if (!timerRunOnce) {
      $accessibleCountdown.innerHTML = iOS ? atText : atText + extraText;
      timerRunOnce = true;
    } else if (secondsLeft % 15 === 0) {
      $accessibleCountdown.innerHTML = atText;
    }

    $module.timers.push(setTimeout(runTimer, 1000));
  })();
};

TimeoutWarning.prototype.saveLastFocusedEl = function () {
  this.$lastFocusedEl = document.activeElement;
  if (!this.$lastFocusedEl || this.$lastFocusedEl === document.body) {
    this.$lastFocusedEl = null;
  } else if (document.querySelector) {
    this.$lastFocusedEl = document.querySelector(':focus');
  }
};

TimeoutWarning.prototype.setFocusOnLastFocusedEl = function () {
  if (this.$lastFocusedEl) {
    window.setTimeout(function () {
      this.$lastFocusedEl.focus();
    }.bind(this), 0);
  }
};

TimeoutWarning.prototype.getInertTarget = function () {
  return document.querySelector('.govuk-modal-dialogue-inert-container') ||
    document.querySelector('#main-content') ||
    document.querySelector('#content');
};

TimeoutWarning.prototype.makePageContentInert = function () {
  var $content = this.getInertTarget();
  if ($content) {
    $content.inert = true;
    $content.setAttribute('aria-hidden', 'true');
  }
};

TimeoutWarning.prototype.removeInertFromPageContent = function () {
  var $content = this.getInertTarget();
  if ($content) {
    $content.inert = false;
    $content.setAttribute('aria-hidden', 'false');
  }
};

TimeoutWarning.prototype.isDialogOpen = function () {
  return Boolean(this.$module.open);
};

TimeoutWarning.prototype.closeDialog = function () {
  if (!this.isDialogOpen()) {
    return;
  }

  document.body.classList.remove(this.overLayClass);
  this.$module.close();
  this.setFocusOnLastFocusedEl();
  this.removeInertFromPageContent();
  this.clearTimers();
  this.extendTimeOnServer();
  this.resetIdleTime();
};

TimeoutWarning.prototype.clearTimers = function () {
  for (var i = 0; i < this.timers.length; i++) {
    clearTimeout(this.timers[i]);
  }
  this.timers = [];
};

TimeoutWarning.prototype.escClose = function (event) {
  if (this.isDialogOpen() && event.keyCode === 27) {
    this.closeDialog();
  }
};

TimeoutWarning.prototype.checkIfShouldHaveTimedOut = function () {
  if (!window.localStorage) {
    return;
  }

  var timeUserLastInteractedWithPage = new Date(window.localStorage.getItem('timeUserLastInteractedWithPage'));
  if (Number.isNaN(timeUserLastInteractedWithPage.getTime())) {
    return;
  }

  var seconds = Math.abs((timeUserLastInteractedWithPage - new Date()) / 1000);
  if (seconds > (this.idleMinutesBeforeTimeOut + this.minutesTimeOutModalVisible) * 60) {
    this.redirect();
  } else if (seconds > this.idleMinutesBeforeTimeOut * 60) {
    this.openDialog();
  }
};

TimeoutWarning.prototype.redirect = function () {
  window.location.replace(this.timeOutRedirectUrl);
};

TimeoutWarning.prototype.extendTimeOnServer = function () {
  var request = new XMLHttpRequest();
  request.open('GET', this.extendSessionUrl, true);
  request.setRequestHeader('Accept', 'application/json');
  request.send();
};

TimeoutWarning.prototype.numberToWords = function (n) {
  var string = n.toString();
  var units;
  var tens;
  var scales;
  var start;
  var end;
  var chunks;
  var chunksLen;
  var chunk;
  var ints;
  var i;
  var word;
  var words;

  if (parseInt(string, 10) === 0) {
    return 'zero';
  }

  units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  scales = ['', 'thousand', 'million', 'billion'];

  start = string.length;
  chunks = [];
  while (start > 0) {
    end = start;
    chunks.push(string.slice((start = Math.max(0, start - 3)), end));
  }

  chunksLen = chunks.length;
  if (chunksLen > scales.length) {
    return '';
  }

  words = [];
  for (i = 0; i < chunksLen; i++) {
    chunk = parseInt(chunks[i], 10);

    if (chunk) {
      ints = chunks[i].split('').reverse().map(parseFloat);

      if (ints[1] === 1) {
        ints[0] += 10;
      }

      if ((word = scales[i])) {
        words.push(word);
      }
      if ((word = units[ints[0]])) {
        words.push(word);
      }
      if ((word = tens[ints[1]])) {
        words.push(word);
      }
      if ((word = units[ints[2]])) {
        words.push(word + ' hundred');
      }
    }
  }
  return words.reverse().join(' ');
};

function initTimeoutWarning() {
  var $timeoutWarning = document.querySelector('[data-module="govuk-timeout-warning"]');
  if ($timeoutWarning) {
    new TimeoutWarning($timeoutWarning).init();
  }
}

export {TimeoutWarning, initTimeoutWarning};
export default initTimeoutWarning;
