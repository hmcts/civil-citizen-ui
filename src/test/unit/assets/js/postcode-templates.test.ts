import {PartyDetails} from 'common/form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {postcodePages, renderPostcodePage, savedPrimary, savedCorrespondence, postcodeTranslate} from '../../../utils/renderPostcodeLookup';

const {JSDOM} = require('jsdom');
const {initPostcodeLookup} = require('../../../../main/assets/js/postcode-lookup');
const fieldNames = ['addressLine1', 'addressLine2', 'addressLine3', 'city', 'postCode'];
let dom: InstanceType<typeof JSDOM>;
let previous: Record<string, unknown>;
const globals = global as unknown as Record<string, unknown>;
function install(html: string): Document {
  dom = new JSDOM(html, {url:'http://localhost/'});
  globals.window = dom.window;globals.document = dom.window.document;globals.fetch = jest.fn();
  return dom.window.document;
}
function associations(document: Document) {
  const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  document.querySelectorAll('[for], [aria-describedby], [aria-controls], [aria-labelledby]').forEach(element => {
    for (const attr of ['for','aria-describedby','aria-controls','aria-labelledby']) (element.getAttribute(attr)||'').split(/\s+/).filter(Boolean).forEach(id => expect(document.getElementById(id)).not.toBeNull());
  });
  document.querySelectorAll('.govuk-error-summary a').forEach(link => expect(document.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull());
}
function payload(document: Document) {
  const data = new dom.window.FormData(document.querySelector('form'));
  const result: Record<string, string | string[]> = {};
  data.forEach((value: string, key: string) => {
    const previous = result[key];
    result[key] = previous === undefined ? value : Array.isArray(previous) ? [...previous, value] : [previous,value];
  });
  return result;
}

beforeEach(() => {previous = Object.fromEntries(['window','document','fetch'].map(name => [name,globals[name]]));});
afterEach(() => {
  dom?.window.close();
  Object.entries(previous).forEach(([name,value]) => {if(value===undefined)delete globals[name];else globals[name]=value;});
});

const cases = postcodePages.flatMap(page => page.types.flatMap(type => ['en','cy'].map(language => ({...page,type,language}))));
describe('all six real postcode callers and party variants', () => {
  it.each(cases)('$view / $type / $language preserves manual fields, ordering and submission before and after enhancement', ({view,role,type,language}) => {
    const model = {primaryAddress:savedPrimary(),correspondenceAddress:savedCorrespondence(),postToThisAddress:'yes',provideCorrespondenceAddress:'yes'};
    const document = install(renderPostcodePage(view,type,model,{},language));
    const roots = [...document.querySelectorAll<HTMLElement>('.postcode-container')];
    expect(roots).toHaveLength(role==='claimant'?2:1);
    roots.forEach(root => {
      expect(root.querySelector<HTMLElement>('.address-form')!.hidden).toBe(false);
      for(const selector of ['[data-postcode-lookup]','[data-postcode-results]','[data-postcode-manual-control]']) expect(root.querySelector<HTMLElement>(selector)!.hidden).toBe(true);
      expect(root.querySelector<HTMLButtonElement>('[data-postcode-find]')!.type).toBe('button');
      expect(root.querySelector('[data-postcode-manual]')!.textContent).toContain(postcodeTranslate(language)('COMMON.POSTCODE.MANUAL_ADDRESS'));
    });
    const addressInputs = [...document.querySelectorAll<HTMLInputElement>('input')].filter(input=>fieldNames.includes(input.name));
    expect(addressInputs.map(input=>input.name)).toEqual(role==='defendant'?fieldNames:[...fieldNames,...fieldNames]);
    expect(addressInputs.map(input=>input.id)).toEqual((role==='defendant'?['primaryAddress']:['primaryAddress','correspondenceAddress']).flatMap(prefix=>fieldNames.map(name=>`${prefix}[${name}]`)));
    expect(addressInputs.every(input=>!input.disabled)).toBe(true);
    const before = payload(document);initPostcodeLookup(document);expect(globals.fetch).not.toHaveBeenCalled();expect(payload(document)).toEqual(before);associations(document);
    const party = new PartyDetails(before as Record<string,string>);
    expect(party.primaryAddress).toEqual(savedPrimary());
    if(role!=='defendant')expect(party.correspondenceAddress).toEqual(savedCorrespondence());
    expect(document.querySelector('form')!.method).toBe('post');
    const save = [...document.querySelectorAll<HTMLButtonElement>('button[type="submit"]')].find(button=>button.textContent!.includes(postcodeTranslate(language)('COMMON.BUTTONS.SAVE_AND_CONTINUE')));
    expect(save).toBeDefined();
  });

  it.each(postcodePages.filter(page=>page.role!=='defendant'))('$view preserves correspondence radio state and separate address blocks', ({view,types,role}) => {
    const checkedModel={provideCorrespondenceAddress:'yes',postToThisAddress:'yes'};
    const document=install(renderPostcodePage(view,types[0],checkedModel));const name=role==='claimant'?'provideCorrespondenceAddress':'postToThisAddress';
    expect(document.querySelector<HTMLInputElement>(`input[name="${name}"][value="yes"]`)!.checked).toBe(true);
    const conditional=document.querySelector('.govuk-radios__conditional')!;expect(conditional.querySelector('[id="correspondenceAddresspostcodeAddress"]')).not.toBeNull();
    expect(document.querySelectorAll('[id="primaryAddress[addressLine1]"]')).toHaveLength(1);expect(document.querySelectorAll('[id="correspondenceAddress[addressLine1]"]')).toHaveLength(1);associations(document);
  });

  it.each(['en','cy'])('keeps inline address errors and error summary links while revealing errored manual fields (%s)', language => {
    const view=postcodePages[0].view;
    const document=install(renderPostcodePage(view,PartyType.INDIVIDUAL,{}, {'primaryAddress[addressLine1]':'ERRORS.VALID_ADDRESS_LINE_1','correspondenceAddress[city]':'ERRORS.VALID_CITY'},language));
    const before=[...document.querySelectorAll('.address-form .govuk-error-message')].map(error=>error.outerHTML);
    expect(before).toHaveLength(2);initPostcodeLookup(document);document.querySelectorAll<HTMLElement>('.address-form').forEach(fields=>expect(fields.hidden).toBe(false));
    expect([...document.querySelectorAll('.address-form .govuk-error-message')].map(error=>error.outerHTML)).toEqual(before);associations(document);
  });
});
