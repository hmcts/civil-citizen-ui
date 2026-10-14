// Adapted from the fork's native DOM/fetch rewrite. Each macro-rendered block
// owns its requests and results; master's address-line formatting is preserved.
const ROOT = '.postcode-container[data-module="cui-postcode-lookup"]';
const FIELD_NAMES = ['addressLine1', 'addressLine2', 'addressLine3', 'city', 'postCode'];
const boundRoots = new WeakSet();

function formatAddress(address) {
  const value = item => (item || '').toString().trim();
  const organisation = value(address.organisationName);
  const number = value(address.buildingNumber);
  const subBuilding = value(address.subBuildingName);
  const building = value(address.buildingName);
  const street = value(address.thoroughfareName);
  const locality = value(address.dependentLocality);
  let line1;
  let line2;
  let line3 = '';
  if (organisation) {
    line1 = organisation;
    line2 = [number, subBuilding, building, street].filter(Boolean).join(' ');
    line3 = locality;
  } else if (number && !subBuilding && !building) {
    line1 = [number, street].filter(Boolean).join(' ');
    line2 = locality;
  } else {
    line1 = [subBuilding, building].filter(Boolean).join(' ');
    if (line1) {
      line2 = [number, street].filter(Boolean).join(' ');
      line3 = locality;
    } else {
      line1 = street;
      line2 = locality;
    }
  }
  return [line1, line2, line3, value(address.postTown), value(address.postcode)];
}

function validAddresses(data) {
  if (!Array.isArray(data?.addresses) || !data.addresses.length || data.valid === false) throw new Error('No usable postcode results');
  const results = new Map();
  for (const address of data.addresses) {
    const identifier = address?.udprn ?? address?.uprn;
    const id = ['string', 'number'].includes(typeof identifier) ? String(identifier).trim() : '';
    if (!id || results.has(id) || typeof address.formattedAddress !== 'string' || !address.formattedAddress.trim()) throw new Error('Invalid postcode result');
    for (const name of ['organisationName', 'buildingNumber', 'subBuildingName', 'buildingName', 'thoroughfareName', 'dependentLocality', 'postTown', 'postcode']) {
      if (address[name] != null && !['string', 'number'].includes(typeof address[name])) throw new Error('Invalid address field');
    }
    results.set(id, address);
  }
  return results;
}

/** Enhance complete address blocks once; incomplete/unsupported blocks retain manual entry. */
export function initPostcodeLookup(scope = document) {
  if (typeof fetch !== 'function' || typeof AbortController !== 'function') return;
  const roots = [...scope.querySelectorAll(ROOT)];
  if (scope.matches?.(ROOT)) roots.unshift(scope);
  roots.forEach(bindRoot);
}

function bindRoot(root) {
  if (boundRoots.has(root)) return;
  const lookup = root.querySelector('[data-postcode-lookup]');
  const postcode = root.querySelector('.postcode-val');
  const postcodeGroup = postcode?.closest('.govuk-form-group');
  const findButton = root.querySelector('[data-postcode-find]');
  const resultsContainer = root.querySelector('[data-postcode-results]');
  const select = root.querySelector('.addressList');
  const manualControl = root.querySelector('[data-postcode-manual-control]');
  const manualLink = root.querySelector('[data-postcode-manual]');
  const fieldsContainer = root.querySelector('.address-form');
  const error = root.querySelector('[data-postcode-error]');
  if (![lookup, postcode, postcodeGroup, findButton, resultsContainer, select, manualControl, manualLink, fieldsContainer, error].every(element => element && element.closest(ROOT) === root)) return;
  const fields = FIELD_NAMES.map(name => fieldsContainer.querySelector(`input[name="${name}"]`));
  if (!fields.every(field => field && field.closest(ROOT) === root) || !select.options[0]) return;
  boundRoots.add(root);
  const document = root.ownerDocument;
  const placeholder = select.options[0].textContent;
  const initialInputError = postcode.classList.contains('govuk-input--error');
  const initialGroupError = postcodeGroup.classList.contains('govuk-form-group--error');
  let results = new Map();
  let sequence = 0;
  let observedPostcode = postcode.value.trim();
  let controller;
  const keepFieldsVisible = fields.some(field => field.value.trim()) || root.dataset.addressErrors === 'true' || !!fieldsContainer.querySelector('.govuk-error-message, .govuk-form-group--error');

  const visibility = (element, visible) => {
    element.hidden = !visible;
    element.setAttribute('aria-hidden', String(!visible));
  };
  const showFields = () => {
    visibility(fieldsContainer, true);
    visibility(manualControl, false);
    manualLink.setAttribute('aria-expanded', 'true');
  };
  const showError = show => {
    // GOV.UK's error-message display rule overrides the native hidden attribute.
    error.classList.toggle('govuk-!-display-none', !show);
    visibility(error, show);
    const references = (postcode.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== error.id);
    if (show) references.push(error.id);
    if (references.length) postcode.setAttribute('aria-describedby', references.join(' '));
    else postcode.removeAttribute('aria-describedby');
    postcode.classList.toggle('govuk-input--error', show || initialInputError);
    postcodeGroup.classList.toggle('govuk-form-group--error', show || initialGroupError);
  };
  const resetOptions = count => {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = count === undefined ? placeholder : `${count} ${placeholder}`;
    select.replaceChildren(option);
  };
  const clearResults = () => {
    results = new Map();
    resetOptions();
    visibility(resultsContainer, false);
    findButton.setAttribute('aria-expanded', 'false');
  };
  const invalidate = () => {
    sequence++;
    controller?.abort();
    controller = undefined;
    findButton.removeAttribute('aria-busy');
    clearResults();
  };
  const search = async () => {
    invalidate();
    showError(false);
    const request = sequence;
    const searchedPostcode = postcode.value.trim();
    observedPostcode = searchedPostcode;
    if (!searchedPostcode) {
      showError(true);
      return;
    }
    controller = new AbortController();
    findButton.setAttribute('aria-busy', 'true');
    const current = () => request === sequence && postcode.value.trim() === searchedPostcode;
    try {
      const response = await fetch(`/postcode-lookup?postcode=${encodeURIComponent(searchedPostcode)}`, {
        method: 'GET', credentials: 'same-origin', headers: {Accept: 'application/json'}, signal: controller.signal,
      });
      if (!current()) return;
      if (!response.ok) throw new Error('Postcode lookup failed');
      const data = await response.json();
      if (!current()) return;
      results = validAddresses(data);
      resetOptions(results.size);
      results.forEach((address, id) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = address.formattedAddress;
        select.appendChild(option);
      });
      visibility(resultsContainer, true);
      findButton.setAttribute('aria-expanded', 'true');
      // A late response must not take focus from another block or manual editing.
      if (document.activeElement === postcode || document.activeElement === findButton) select.focus();
    } catch (failure) {
      if (current() && failure?.name !== 'AbortError') showError(true);
    } finally {
      if (request === sequence) {
        findButton.removeAttribute('aria-busy');
        controller = undefined;
      }
    }
  };
  findButton.addEventListener('click', event => {
    event.preventDefault();
    search();
  });
  postcode.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      search();
    }
  });
  const postcodeChanged = () => {
    const value = postcode.value.trim();
    // Focusing results commits a native change event for the just-searched
    // input. Invalidate only an actual postcode change, not that focus change.
    if (value === observedPostcode) return;
    observedPostcode = value;
    invalidate();
    showError(false);
  };
  postcode.addEventListener('input', postcodeChanged);
  postcode.addEventListener('change', postcodeChanged);
  manualLink.addEventListener('click', event => {
    event.preventDefault();
    invalidate();
    showError(false);
    showFields();
    fields[0].focus();
  });
  fieldsContainer.addEventListener('input', () => {
    invalidate();
    showFields();
  });
  select.addEventListener('change', () => {
    const address = results.get(select.value);
    if (!address) return;
    formatAddress(address).forEach((value, index) => { fields[index].value = value; });
    showFields();
    // Keep focus on the select so keyboard users can continue comparing options.
  });
  clearResults();
  visibility(lookup, true);
  visibility(fieldsContainer, keepFieldsVisible);
  visibility(manualControl, !keepFieldsVisible);
  manualLink.setAttribute('aria-expanded', String(keepFieldsVisible));
}
