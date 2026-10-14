import axios from 'axios';
import {readFileSync} from 'fs';
import {lookupByPostcodeAndDataSet} from 'modules/ordnance-survey-key/ordnanceSurveyKeyService';
import {MOCK_API_RESPONSE} from '../../../utils/mocks/ordnanceSurvey/osMocks';
import {blankAddress, savedPrimary, savedCorrespondence, renderPostcodeBlocks, postcodeFormattingCases, postcodeTranslate} from '../../../utils/renderPostcodeLookup';

const {JSDOM} = require('jsdom');
const {initPostcodeLookup} = require('../../../../main/assets/js/postcode-lookup');
let dom: InstanceType<typeof JSDOM>;
let previous: Record<string, unknown>;
let fetchMock: jest.Mock;
let pending: {resolve: (value: unknown) => void; reject: (value: unknown) => void}[];
const globalObject = global as unknown as Record<string, unknown>;
const fieldNames = ['addressLine1', 'addressLine2', 'addressLine3', 'city', 'postCode'];
const response = (addresses: unknown[]) => ({ok: true, json: async () => ({addresses, valid: true})});
const address = (id = '123', extra: Record<string, unknown> = {}) => ({udprn: id, uprn: `UPRN-${id}`, formattedAddress: `Address ${id}`, buildingNumber: '12', thoroughfareName: 'Street', postTown: 'Town', postcode: 'AB1 2CD', ...extra});
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

function install(model: Record<string, unknown> = {}, errors: Record<string, string> = {}, language = 'en') {
  dom = new JSDOM(renderPostcodeBlocks(model, errors, language), {url: 'http://localhost/'});
  globalObject.window = dom.window;
  globalObject.document = dom.window.document;
  return dom.window.document as Document;
}
function root(index = 0): HTMLElement {return dom.window.document.querySelectorAll('.postcode-container')[index];}
function input(block = root()): HTMLInputElement {return block.querySelector('.postcode-val') as HTMLInputElement;}
function select(block = root()): HTMLSelectElement {return block.querySelector('.addressList') as HTMLSelectElement;}
function fields(block = root()): HTMLInputElement[] {return fieldNames.map(name => block.querySelector(`.address-form input[name="${name}"]`) as HTMLInputElement);}
function values(block = root()) {return fields(block).map(field => field.value);}
function start(block = root(), postcode = 'AB1 2CD') {
  input(block).value = postcode;
  const button = block.querySelector('[data-postcode-find]') as HTMLButtonElement;
  button.focus();
  button.click();
}
function choose(id: string, block = root()) {
  select(block).value = id;
  select(block).dispatchEvent(new dom.window.Event('change', {bubbles: true}));
}
function manual(block = root()) {(block.querySelector('[data-postcode-manual]') as HTMLAnchorElement).click();}
function deferred() {
  let resolve!: (value: unknown) => void;
  let reject!: (value: unknown) => void;
  const promise = new Promise((yes, no) => {resolve = yes; reject = no;});
  const task = {resolve, reject}; pending.push(task); fetchMock.mockReturnValueOnce(promise);return task;
}

beforeEach(() => {
  previous = Object.fromEntries(['window', 'document', 'fetch'].map(name => [name, globalObject[name]]));
  pending = [];
  fetchMock = jest.fn().mockResolvedValue(response([address()]));
  globalObject.fetch = fetchMock;
});
afterEach(async () => {
  pending.forEach(task => task.resolve({ok: false}));
  await flush();
  dom?.window.close();
  Object.entries(previous).forEach(([name, value]) => {if (value === undefined) delete globalObject[name]; else globalObject[name] = value;});
  jest.restoreAllMocks();
});

describe('preserving master address formatting through actual macro fields', () => {
  it.each(postcodeFormattingCases)('$name', async ({address: details, expected}) => {
    const document = install();initPostcodeLookup(document);
    fetchMock.mockResolvedValueOnce(response([{udprn: '123', uprn: 'UPRN-123', formattedAddress: 'Formatting fixture', ...details}]));
    start();await flush();choose('123');expect(values()).toEqual(expected);
  });

  it('uses current DPA/LPI service outputs and UPRN identifier fallback', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({data: {results: MOCK_API_RESPONSE}});
    const data = await lookupByPostcodeAndDataSet('W1J 7NT');
    expect(data.addresses.every(item => item.country === 'England' || item.country === 'Wales')).toBe(true);
    const document = install();initPostcodeLookup(document);fetchMock.mockResolvedValueOnce(response(data.addresses));start();await flush();
    const museum = data.addresses.find(item => item.organisationName === 'THE WELLINGTON MUSEUM')!;
    choose(museum.udprn!);expect(values()).toEqual(['THE WELLINGTON MUSEUM', '149 PICCADILLY', '', 'LONDON', 'W1J 7NT']);
    const range = data.addresses.find(item => item.uprn === '400000000001')!;
    expect(range.udprn).toBe(range.uprn);choose(range.udprn!);
    expect(values()).toEqual(['FLAT A RANGE HOUSE', '10-12 TEST STREET', '', 'LONDON', 'W1J 7NT']);
    fetchMock.mockResolvedValueOnce(response([address('fallback', {udprn: undefined, uprn: 'UPRN-only'})]));start();await flush();choose('UPRN-only');expect(values()[0]).toBe('12 Street');
  });

  it('fills named fields and clears obsolete optional lines only on an intentional selection', async () => {
    const document = install({primaryAddress: savedPrimary()});
    const other = document.createElement('input');other.type = 'hidden';other.name = 'savedReference';other.value = 'keep';root().querySelector('.address-form')!.prepend(other);
    initPostcodeLookup(document);start();await flush();expect(values()).toEqual(Object.values(savedPrimary()));choose('123');
    expect(values()).toEqual(['12 Street', '', '', 'Town', 'AB1 2CD']);expect(other.value).toBe('keep');
  });
});

describe('independent progressive enhancement', () => {
  it.each(['en', 'cy'])('enhances blank roots once without a request, with translated controls (%s)', language => {
    const document = install({}, {}, language);initPostcodeLookup(document);initPostcodeLookup(document);initPostcodeLookup(root());
    expect(fetchMock).not.toHaveBeenCalled();expect(root().querySelector<HTMLElement>('.address-form')!.hidden).toBe(true);
    expect(root().querySelector<HTMLElement>('[data-postcode-lookup]')!.hidden).toBe(false);expect(root().querySelector<HTMLElement>('[data-postcode-results]')!.hidden).toBe(true);
    expect(select().options[0].textContent).toBe(postcodeTranslate(language)('COMMON.POSTCODE.ADDRESSES_FOUND'));
    start();expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('ignores incomplete and unsupported roots, preserving usable manual fields', () => {
    const document = install();root().querySelector('[data-postcode-find]')!.remove();initPostcodeLookup(document);
    expect(root().querySelector<HTMLElement>('.address-form')!.hidden).toBe(false);expect(root().querySelector<HTMLElement>('[data-postcode-lookup]')!.hidden).toBe(true);
    dom.window.close();install();delete globalObject.fetch;initPostcodeLookup(root(1));expect(root(1).querySelector<HTMLElement>('.address-form')!.hidden).toBe(false);
  });

  it('leaves manual entry usable if the lookup input lacks its owned form group', () => {
    install();const group = input().closest('.govuk-form-group')!;group.replaceWith(...group.childNodes);
    initPostcodeLookup(root());expect(root().querySelector<HTMLElement>('.address-form')!.hidden).toBe(false);
    expect(root().querySelector<HTMLElement>('[data-postcode-lookup]')!.hidden).toBe(true);expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retains saved values, inline server errors, summary targets and existing postcode references', async () => {
    const document = install({primaryAddress: savedPrimary()}, {'primaryAddress[addressLine1]': 'ERRORS.VALID_ADDRESS_LINE_1'});
    const summary = document.createElement('div');summary.className = 'govuk-error-summary';summary.innerHTML = '<a href="#primaryAddress[addressLine1]">Server error</a>';document.body.prepend(summary);
    const hint = document.createElement('div');hint.id = 'existing-postcode-hint';root().prepend(hint);input().setAttribute('aria-describedby',hint.id);input().classList.add('govuk-input--error');
    const before = document.querySelector('.address-form .govuk-error-message')!.outerHTML;
    initPostcodeLookup(document);expect(root().querySelector<HTMLElement>('.address-form')!.hidden).toBe(false);expect(values()).toEqual(Object.values(savedPrimary()));
    fetchMock.mockRejectedValueOnce(new Error('Failed'));start();await flush();
    const error = root().querySelector('[data-postcode-error]') as HTMLElement;expect(error.hidden).toBe(false);expect(input().getAttribute('aria-describedby')).toBe(`${hint.id} ${error.id}`);
    start();await flush();expect(error.hidden).toBe(true);expect(input().getAttribute('aria-describedby')).toBe(hint.id);expect(input().classList.contains('govuk-input--error')).toBe(true);
    expect(document.querySelector('.address-form .govuk-error-message')!.outerHTML).toBe(before);expect(summary.querySelector('a')!.getAttribute('href')).toBe('#primaryAddress[addressLine1]');expect(values()).toEqual(Object.values(savedPrimary()));
  });

  it('handles two simultaneous lookups without mixing results, fields or focus', async () => {
    const document = install({primaryAddress: savedPrimary(), correspondenceAddress: savedCorrespondence()});initPostcodeLookup(document);const first = deferred();const second = deferred();start(root(), 'AA1 1AA');start(root(1),'BB1 1BB');
    second.resolve(response([address('second', {buildingNumber: '34'})]));await flush();expect(document.activeElement).toBe(select(root(1)));
    first.resolve(response([address('first')]));await flush();expect(document.activeElement).toBe(select(root(1)));
    expect([...select().options].map(option => option.value)).toEqual(['','first']);expect([...select(root(1)).options].map(option => option.value)).toEqual(['','second']);
    expect(values()).toEqual(Object.values(savedPrimary()));expect(values(root(1))).toEqual(Object.values(savedCorrespondence()));
    choose('first');choose('second',root(1));expect(values()[0]).toBe('12 Street');expect(values(root(1))[0]).toBe('34 Street');
  });

  it('leaves address values unchanged for placeholder and unknown selections', async () => {
    const document = install({primaryAddress:savedPrimary()});initPostcodeLookup(document);start();await flush();choose('');
    const unknown = document.createElement('option');unknown.value = 'unknown';select().append(unknown);choose('unknown');expect(values()).toEqual(Object.values(savedPrimary()));
  });

  it('invalidates old results immediately and uses only current results after repeated searches', async () => {
    const document = install();initPostcodeLookup(document);fetchMock.mockResolvedValueOnce(response([address('old')]));start();await flush();
    const request = deferred();start();expect(root().querySelector<HTMLElement>('[data-postcode-results]')!.hidden).toBe(true);expect(select().options).toHaveLength(1);
    request.resolve(response([address('new',{buildingNumber:'34'})]));await flush();choose('old');expect(values()).toEqual(Object.values(blankAddress()));choose('new');expect(values()[0]).toBe('34 Street');
    expect(select().options[0].textContent).toBe(`1 ${postcodeTranslate()('COMMON.POSTCODE.ADDRESSES_FOUND')}`);
  });

  it('builds safe labels and a stable translated count from the original placeholder', async () => {
    const document = install({}, {}, 'cy');initPostcodeLookup(document);fetchMock.mockResolvedValueOnce(response([address('one',{formattedAddress:'<img src=x onerror=alert(1)>'}),address('two')]));start();await flush();
    expect(select().options[1].textContent).toBe('<img src=x onerror=alert(1)>');expect(select().querySelector('img')).toBeNull();expect(select().options[0].textContent).toBe(`2 ${postcodeTranslate('cy')('COMMON.POSTCODE.ADDRESSES_FOUND')}`);
    start();await flush();expect(select().options[0].textContent).toBe(`1 ${postcodeTranslate('cy')('COMMON.POSTCODE.ADDRESSES_FOUND')}`);
  });
});

describe('late responses and recoverable errors', () => {
  it.each(['en', 'cy'])('only displays lookup errors after failure with GOV.UK styles (%s)', async language => {
    const document = install({}, {}, language);
    const style = document.createElement('style');
    style.textContent = readFileSync(require.resolve('govuk-frontend/dist/govuk/govuk-frontend.min.css'), 'utf8');
    document.head.append(style);
    const error = root().querySelector<HTMLElement>('[data-postcode-error]')!;
    const otherError = root(1).querySelector<HTMLElement>('[data-postcode-error]')!;
    const display = (element: HTMLElement) => dom.window.getComputedStyle(element).display;

    expect(display(error)).toBe('none');
    initPostcodeLookup(document);
    expect(display(error)).toBe('none');

    fetchMock.mockRejectedValueOnce(new Error('Failed'));
    start();
    await flush();
    expect(display(error)).toBe('block');
    expect(error.hidden).toBe(false);
    expect(error.getAttribute('aria-hidden')).toBe('false');
    expect(input().getAttribute('aria-describedby')).toBe(error.id);
    expect(display(otherError)).toBe('none');

    start();
    expect(display(error)).toBe('none');
    await flush();
    expect(select().options).toHaveLength(2);
    expect(display(error)).toBe('none');
    expect(error.hidden).toBe(true);
    expect(error.getAttribute('aria-hidden')).toBe('true');
    expect(input().getAttribute('aria-describedby')).toBeNull();

    fetchMock.mockRejectedValueOnce(new Error('Failed again'));
    start();
    await flush();
    expect(display(error)).toBe('block');
    manual();
    expect(display(error)).toBe('none');
    expect(root().querySelector<HTMLElement>('.address-form')!.hidden).toBe(false);
  });

  it.each(['success','failure','invalid JSON'])('ignores an older %s after a newer search', async outcome => {
    const document = install();initPostcodeLookup(document);const first = deferred();const second = deferred();start(root(),'AA1 1AA');start(root(),'BB1 1BB');
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);second.resolve(response([address('new')]));await flush();
    if(outcome === 'failure')first.reject(new Error('Late failure'));
    else if(outcome === 'invalid JSON')first.resolve({ok:true,json:async()=>{throw new Error('Malformed');}});
    else first.resolve(response([address('old')]));
    await flush();expect([...select().options].map(option=>option.value)).toEqual(['','new']);expect(root().querySelector<HTMLElement>('[data-postcode-error]')!.hidden).toBe(true);expect(root().querySelector('[data-postcode-find]')!.getAttribute('aria-busy')).toBeNull();
  });

  it.each(['input','change','programmatic'])('ignores results for a changed postcode (%s)', async event => {
    const document = install();initPostcodeLookup(document);const request=deferred();start();input().value='XY1 2ZZ';if(event!=='programmatic')input().dispatchEvent(new dom.window.Event(event,{bubbles:true}));
    request.resolve(response([address()]));await flush();expect(select().options).toHaveLength(1);expect(root().querySelector<HTMLElement>('[data-postcode-error]')!.hidden).toBe(true);expect(root().querySelector('[data-postcode-find]')!.getAttribute('aria-busy')).toBeNull();
  });

  it.each(['success','failure'])('manual entry prevents a late %s from interrupting editing', async outcome => {
    const document = install();initPostcodeLookup(document);const request=deferred();start();manual();expect(document.activeElement).toBe(fields()[0]);fields()[0].value='Manual house';fields()[0].dispatchEvent(new dom.window.Event('input',{bubbles:true}));
    if(outcome==='success')request.resolve(response([address()]));else request.reject(new Error('Late error'));await flush();
    expect(values()[0]).toBe('Manual house');expect(root().querySelector<HTMLElement>('.address-form')!.hidden).toBe(false);expect(document.activeElement).toBe(fields()[0]);expect(root().querySelector<HTMLElement>('[data-postcode-error]')!.hidden).toBe(true);
  });

  it('preserves active manual editing during a request and never hides it on a later search', async () => {
    const document = install({primaryAddress:savedPrimary()});initPostcodeLookup(document);const request=deferred();start();fields()[0].focus();fields()[0].value='Edited house';fields()[0].dispatchEvent(new dom.window.Event('input',{bubbles:true}));request.resolve(response([address()]));await flush();expect(document.activeElement).toBe(fields()[0]);expect(values()[0]).toBe('Edited house');expect(select().options).toHaveLength(1);
    start();await flush();expect(root().querySelector<HTMLElement>('.address-form')!.hidden).toBe(false);expect(values()[0]).toBe('Edited house');
  });

  it.each([{name:'HTTP error',value:{ok:false,json:async()=>({})}}, {name:'empty results',value:response([])}, {name:'invalid JSON',value:{ok:true,json:async()=>{throw new Error('Invalid JSON');}}}, {name:'missing addresses',value:{ok:true,json:async()=>({})}}, {name:'malformed record',value:response([null])}, {name:'missing identifier',value:response([{formattedAddress:'Text'}])}, {name:'duplicate identifiers',value:response([address(),address()])}, {name:'invalid field',value:response([address('123',{buildingName:{invalid:true}})])}])('preserves values and permits recovery after $name', async ({value}) => {
    const document = install({primaryAddress:savedPrimary()});initPostcodeLookup(document);fetchMock.mockResolvedValueOnce(value);start();await flush();expect(values()).toEqual(Object.values(savedPrimary()));expect(root().querySelector<HTMLElement>('[data-postcode-error]')!.hidden).toBe(false);expect(root().querySelector<HTMLElement>('[data-postcode-results]')!.hidden).toBe(true);
    start();await flush();expect(root().querySelector<HTMLElement>('[data-postcode-error]')!.hidden).toBe(true);choose('123');expect(values()[0]).toBe('12 Street');
  });

  it('encodes the existing same-origin contract and intercepts Enter only in the postcode input', async () => {
    const document=install();initPostcodeLookup(document);input().value=' AB1 +2CD ';
    const enter=new dom.window.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});input().dispatchEvent(enter);await flush();expect(enter.defaultPrevented).toBe(true);expect(fetchMock.mock.calls[0][0]).toBe('/postcode-lookup?postcode=AB1%20%2B2CD');expect(fetchMock.mock.calls[0][1]).toMatchObject({method:'GET',credentials:'same-origin',headers:{Accept:'application/json'}});
    manual();const fieldEnter=new dom.window.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});fields()[0].dispatchEvent(fieldEnter);expect(fieldEnter.defaultPrevented).toBe(false);expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retains results when moving focus commits the unchanged postcode value', async () => {
    const document = install();initPostcodeLookup(document);start();await flush();
    // Browsers emit change when the edited postcode loses focus to results.
    input().dispatchEvent(new dom.window.Event('change', {bubbles: true}));
    expect(select().options).toHaveLength(2);expect(root().querySelector<HTMLElement>('[data-postcode-results]')!.hidden).toBe(false);
    choose('123');expect(values()[0]).toBe('12 Street');expect(document.activeElement).toBe(select());
  });

  it('keeps keyboard selection focus on results and does not show aborted request errors', async () => {
    const document=install();initPostcodeLookup(document);start();await flush();select().focus();choose('123');expect(document.activeElement).toBe(select());
    fetchMock.mockRejectedValueOnce(Object.assign(new Error('Aborted'),{name:'AbortError'}));start();await flush();expect(root().querySelector<HTMLElement>('[data-postcode-error]')!.hidden).toBe(true);
  });
});
