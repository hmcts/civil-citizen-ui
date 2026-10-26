/**
 * Timeout warning based on the MoJ design pattern:
 * https://design-patterns.service.justice.gov.uk/components/timeout-warning/
 * (adapted from the accessible timeout warning prototype)
 */
function TimeoutWarning($module) {
  this.lastInteractionKey = 'timeUserLastInteractedWithPage';
  this.signOutKey = 'civilCitizenSignedOutAt';
  this.sessionExpiryKey = 'civilCitizenSessionExpiresAt';
  this.warningStateKey = 'civilCitizenTimeoutWarning';
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
  this.sessionExpiresAt = Number($module.getAttribute('data-session-expires-at')) || 0;
  this.csrfToken = $module.getAttribute('data-csrf-token') || '';
  if (window.localStorage) {
    this.sessionExpiresAt = Number(window.localStorage.getItem(this.sessionExpiryKey)) || this.sessionExpiresAt;
  }
  this.timerText = $module.getAttribute('data-timer-text') || 'Your session will be reset in ';
  this.timerExtraText = $module.getAttribute('data-timer-extra-text') || 'This is to protect your data.';
  this.timerRedirectText = $module.getAttribute('data-timer-redirect-text') || 'You are about to be redirected';
  this.idleTimeoutId = null;
  this.extendDebounceId = null;
  this.renewalInFlight = false;
  this.renewalCallbacks = [];
  this.redirectInFlight = false;
  this.previousAriaHidden = null;
}

TimeoutWarning.prototype.init = function () {
  if (!this.$module || !this.dialogSupported()) {
    return;
  }

  this.countIdleTime();
  if (this.$closeButton) {
    this.$closeButton.addEventListener('click', this.closeDialog.bind(this));
  }
  this.$module.addEventListener('keydown', this.escClose.bind(this));
  window.addEventListener('focus', this.checkIfShouldHaveTimedOut.bind(this));
  window.addEventListener('storage', this.handleStorageChange.bind(this));

  var signOutLink = document.querySelector('a[href="/logout"]');
  if (signOutLink) {
    signOutLink.addEventListener('click', function () {
      window.localStorage.setItem(this.signOutKey, new Date().toISOString());
    }.bind(this));
  }
};

TimeoutWarning.prototype.handleStorageChange = function (event) {
  if (event.key === this.signOutKey) {
    this.redirect();
  } else if (event.key === this.warningStateKey && event.newValue && !this.isDialogOpen()) {
    // Keep the warning visible in every tab. This is only a UI signal;
    // session validity still comes from the server expiry value.
    this.openDialog(false);
  } else if (event.key === this.sessionExpiryKey && event.newValue) {
    var updatedExpiry = Number(event.newValue);
    if (!updatedExpiry || updatedExpiry <= this.sessionExpiresAt) {
      return;
    }
    this.sessionExpiresAt = updatedExpiry;
    // A different tab may dismiss this warning only after it has persisted a
    // successful renewal and published the new expiry.
    if (this.isDialogOpen()) {
      this.completeRenewal();
    } else {
      this.checkIfShouldHaveTimedOut();
    }
  } else if (event.key === this.lastInteractionKey) {
    if (this.isDialogOpen()) {
      // Activity in another tab is useful only when it results in a
      // confirmed server renewal; closeDialog handles that confirmation.
      this.closeDialog();
    } else {
      this.checkIfShouldHaveTimedOut();
    }
  }
};

TimeoutWarning.prototype.dialogSupported = function () {
  if (typeof HTMLDialogElement === 'function') {
    return true;
  }

  try {
    if (window.dialogPolyfill && typeof window.dialogPolyfill.registerDialog === 'function') {
      window.dialogPolyfill.registerDialog(this.$module);
      return true;
    }
  } catch (error) {
    // Fall through to fallback UI
  }

  if (this.$fallBackElement) {
    this.$fallBackElement.classList.add('govuk-!-display-block');
  }
  return false;
};

TimeoutWarning.prototype.resetIdleTime = function () {
  if (this.isDialogOpen()) {
    return;
  }

  // Keep the existing warning timer until renewal succeeds. If the request
  // fails, the old server-expiry warning remains the safety net.
  clearTimeout(this.extendDebounceId);

  this.extendDebounceId = setTimeout(function () {
    this.extendTimeOnServer(function (response) {
      if (!response || response.extended !== true) return;
      if (response.expiresAt) {
        this.sessionExpiresAt = Number(response.expiresAt);
        if (window.localStorage) window.localStorage.setItem(this.sessionExpiryKey, String(this.sessionExpiresAt));
      }
      this.scheduleWarningFromExpiry();
    }.bind(this));
  }.bind(this), 3000);

  if (window.localStorage) {
    window.localStorage.setItem(this.lastInteractionKey, new Date().toISOString());
  }
};

TimeoutWarning.prototype.scheduleWarningFromExpiry = function () {
  clearTimeout(this.idleTimeoutId);
  var delay = this.sessionExpiresAt
    ? Math.max(0, this.sessionExpiresAt - Date.now() - (this.minutesTimeOutModalVisible * 60000))
    : this.idleMinutesBeforeTimeOut * 60000;
  this.idleTimeoutId = setTimeout(function () {
    if (window.localStorage) this.sessionExpiresAt = Number(window.localStorage.getItem(this.sessionExpiryKey)) || this.sessionExpiresAt;
    this.checkIfShouldHaveTimedOut();
  }.bind(this), delay);
};

TimeoutWarning.prototype.countIdleTime = function () {
  var resetIdleTime = this.resetIdleTime.bind(this);

  ['load', 'mousemove', 'mousedown', 'click', 'scroll', 'keypress', 'keyup', 'touchstart'].forEach(function (eventName) {
    window.addEventListener(eventName, resetIdleTime, {passive: true});
  });

  resetIdleTime();
};

TimeoutWarning.prototype.openDialog = function (broadcast) {
  if (this.isDialogOpen()) {
    return;
  }

  if (broadcast !== false && window.localStorage) {
    window.localStorage.setItem(this.warningStateKey, String(Date.now()));
  }

  clearTimeout(this.extendDebounceId);
  clearTimeout(this.idleTimeoutId);

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
  if (!$countdown || !$accessibleCountdown) {
    return;
  }
  var seconds = this.sessionExpiresAt
    ? Math.max(0, Math.ceil((this.sessionExpiresAt - Date.now()) / 1000))
    : 60 * this.minutesTimeOutModalVisible;
  var minutes = Math.ceil(seconds / 60);
  var timerRunOnce = false;
  var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  $countdown.textContent = minutes + ' minute' + (minutes > 1 ? 's' : '');

  (function runTimer() {
    if ($module.sessionExpiresAt) seconds = Math.max(0, Math.ceil(($module.sessionExpiresAt - Date.now()) / 1000));
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

    var atText = $module.timerText + atMinutesText;
    if (atSecondsText) {
      if (minutesLeft > 0) {
        atText += ' and';
      }
      atText += atSecondsText + '.';
    } else {
      atText += '.';
    }

    if (timerExpired) {
      $countdown.textContent = $module.timerRedirectText;
      $accessibleCountdown.textContent = $module.timerRedirectText;
      setTimeout($module.redirect.bind($module), 1000);
      return;
    }

    seconds--;

    var text = document.createElement('p');
    text.appendChild(document.createTextNode($module.timerText));
    var countdown = document.createElement('span');
    countdown.setAttribute('class', 'countdown');
    countdown.innerHTML = ' ' + minutesText + secondsText + '.';
    text.appendChild(countdown);

    $countdown.innerHTML = '';
    $countdown.appendChild(text);
    if ($module.timerExtraText) {
      var extraText = document.createElement('p');
      extraText.textContent = $module.timerExtraText;
      $countdown.appendChild(extraText);
    }

    if (minutesLeft < 1 && secondsLeft < 20) {
      $accessibleCountdown.setAttribute('aria-live', 'assertive');
    }

    if (!timerRunOnce) {
      timerRunOnce = true;
      setTimeout(function () {
        // Read out extra content once after the modal opens (skipped on iOS VoiceOver).
        $accessibleCountdown.textContent = iOS
          ? atText
          : atText + ' ' + $module.timerExtraText;
      }, 1000);
    } else if (secondsLeft % 15 === 0) {
      $accessibleCountdown.textContent = atText;
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
    this.previousAriaHidden = $content.getAttribute('aria-hidden');
    $content.inert = true;
    $content.setAttribute('aria-hidden', 'true');
  }
};

TimeoutWarning.prototype.removeInertFromPageContent = function () {
  var $content = this.getInertTarget();
  if ($content) {
    $content.inert = false;
    if (this.previousAriaHidden === null) $content.removeAttribute('aria-hidden');
    else $content.setAttribute('aria-hidden', this.previousAriaHidden);
    this.previousAriaHidden = null;
  }
};

TimeoutWarning.prototype.isDialogOpen = function () {
  return Boolean(this.$module.open);
};

TimeoutWarning.prototype.closeDialog = function () {
  if (!this.isDialogOpen()) {
    return;
  }

  this.extendTimeOnServer(function (response) {
    if (!response || response.extended !== true) return;
    if (response.expiresAt) {
      this.sessionExpiresAt = Number(response.expiresAt);
      if (window.localStorage) window.localStorage.setItem(this.sessionExpiryKey, String(this.sessionExpiresAt));
    }
    this.completeRenewal();
  }.bind(this));
};

TimeoutWarning.prototype.completeRenewal = function () {
  document.body.classList.remove(this.overLayClass);
  this.$module.close();
  this.setFocusOnLastFocusedEl();
  this.removeInertFromPageContent();
  this.clearTimers();
  this.scheduleWarningFromExpiry();
  if (window.localStorage) {
    window.localStorage.removeItem(this.warningStateKey);
  }
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

  var timeUserLastInteractedWithPage = new Date(window.localStorage.getItem(this.lastInteractionKey));
  if (Number.isNaN(timeUserLastInteractedWithPage.getTime())) {
    return;
  }

  // A timestamp written by another tab can be slightly ahead of this tab's
  // clock. It must not be treated as elapsed idle time.
  var seconds = Math.max(0, (new Date() - timeUserLastInteractedWithPage) / 1000);
  var expirySeconds = this.sessionExpiresAt ? (this.sessionExpiresAt - Date.now()) / 1000 : (this.idleMinutesBeforeTimeOut + this.minutesTimeOutModalVisible) * 60;
  if (expirySeconds <= 0 || (!this.sessionExpiresAt && seconds > expirySeconds)) {
    this.redirect();
  } else if (expirySeconds <= this.minutesTimeOutModalVisible * 60 || seconds > this.idleMinutesBeforeTimeOut * 60) {
    this.openDialog();
  } else if (this.isDialogOpen()) {
    // Activity in another tab is not proof that the server session was
    // renewed. Keep this warning open until a confirmed expiry is published.
  }
};

TimeoutWarning.prototype.redirect = function () {
  if (this.redirectInFlight) return;
  this.redirectInFlight = true;
  fetch(this.timeOutRedirectUrl, {headers: {Accept: 'application/json'}, credentials: 'same-origin'})
    .then(function (response) {
      if (response.status === 409) {
        this.redirectInFlight = false;
        return;
      }
      window.location.replace(this.timeOutRedirectUrl);
    }.bind(this))
    .catch(function () {
      this.redirectInFlight = false;
    }.bind(this));
};

TimeoutWarning.prototype.extendTimeOnServer = function (onSuccess) {
  if (this.renewalInFlight) {
    if (onSuccess) this.renewalCallbacks.push(onSuccess);
    return;
  }
  this.renewalInFlight = true;
  if (onSuccess) this.renewalCallbacks.push(onSuccess);
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState !== 4) return;
    if (request.status >= 200 && request.status < 300) {
      var response;
      try { response = JSON.parse(request.responseText); } catch (error) { response = null; }
      this.renewalInFlight = false;
      var callbacks = this.renewalCallbacks.splice(0);
      callbacks.forEach(function (callback) { callback(response); });
    } else {
      this.renewalInFlight = false;
      var failedCallbacks = this.renewalCallbacks.splice(0);
      failedCallbacks.forEach(function (callback) { callback(null); });
      this.redirect();
    }
  }.bind(this);
  var failRenewal = function () {
    this.renewalInFlight = false;
    var failedCallbacks = this.renewalCallbacks.splice(0);
    failedCallbacks.forEach(function (callback) { callback(null); });
    this.redirect();
  }.bind(this);
  request.onerror = failRenewal;
  request.ontimeout = failRenewal;
  request.open('POST', this.extendSessionUrl, true);
  if (this.csrfToken) request.setRequestHeader('CSRF-Token', this.csrfToken);
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
