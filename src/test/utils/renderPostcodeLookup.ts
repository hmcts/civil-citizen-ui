import path from 'path';
import {createInstance} from 'i18next';
import {PartyType} from 'models/partyType';
import {YesNo} from 'common/form/models/yesNo';
import en from '../../main/modules/i18n/locales/en.json';
import cy from '../../main/modules/i18n/locales/cy.json';

const nunjucks = require('nunjucks');
export const postcodePages = [
  {view: 'features/claim/yourDetails/claimant-individual-details.njk', role: 'claimant', types: [PartyType.INDIVIDUAL, PartyType.SOLE_TRADER]},
  {view: 'features/claim/yourDetails/claimant-organisation-details.njk', role: 'claimant', types: [PartyType.COMPANY, PartyType.ORGANISATION]},
  {view: 'features/claim/defendant/defendant-details-individual-or-sole-trader.njk', role: 'defendant', types: [PartyType.INDIVIDUAL, PartyType.SOLE_TRADER]},
  {view: 'features/claim/defendant/defendant-details-company-or-organisation.njk', role: 'defendant', types: [PartyType.COMPANY, PartyType.ORGANISATION]},
  {view: 'features/response/citizenDetails/citizen-details.njk', role: 'response', types: [PartyType.INDIVIDUAL, PartyType.SOLE_TRADER]},
  {view: 'features/response/citizenDetails/citizen-details-company.njk', role: 'response', types: [PartyType.COMPANY, PartyType.ORGANISATION]},
];

export const blankAddress = () => ({addressLine1: '', addressLine2: '', addressLine3: '', city: '', postCode: ''});
export const savedPrimary = () => ({addressLine1: 'Primary house', addressLine2: '12 Main Street', addressLine3: 'Primary locality', city: 'London', postCode: 'SW1A 1AA'});
export const savedCorrespondence = () => ({addressLine1: 'Correspondence house', addressLine2: '34 Other Street', addressLine3: 'Other locality', city: 'Cardiff', postCode: 'CF10 1AA'});

export function postcodeTranslate(language = 'en') {
  const instance = createInstance();
  instance.init({lng: language, fallbackLng: 'en', initImmediate: false, resources: {en: {translation: en}, cy: {translation: cy}}, interpolation: {escapeValue: false}});
  return (key: string, values: Record<string, unknown> = {}) => key ? String(instance.t(key, values)) : '';
}

export function postcodeParty(model: Record<string, unknown> = {}, errors: Record<string, string> = {}) {
  return {
    model: {title: 'Mx', firstName: 'Alex', lastName: 'Example', soleTraderTradingAs: 'Example trading', partyName: 'Example organisation', contactPerson: 'Alex Example',
      primaryAddress: blankAddress(), correspondenceAddress: blankAddress(), provideCorrespondenceAddress: 'yes', postToThisAddress: 'yes', ...model},
    errorFor: (field: string) => errors[field],
    hasErrors: () => Object.keys(errors).length > 0,
    hasFieldError: (field: string) => Object.keys(errors).some(key => key === field || key.startsWith(`${field}[`)),
    getAllErrors: () => Object.entries(errors).map(([property, text]) => ({property, text, href: `#${property}`})),
  };
}

class ShellLoader extends nunjucks.Loader {
  getSource(name: string) {
    if (name.endsWith('claim-details-tpl.njk')) {
      return {src: '<!doctype html><html lang="{{ lang }}"><head><title>Address details</title></head><body><main>{% block content %}{% endblock %}</main></body></html>', path: name, noCache: true};
    }
    return null;
  }
}

function environment(viewsDirectory?: string) {
  const root = path.resolve(__dirname, '../../..');
  const env = new nunjucks.Environment([new ShellLoader(), new nunjucks.FileSystemLoader([viewsDirectory || path.join(root, 'src/main/views'), path.join(root, 'node_modules/govuk-frontend/dist')])], {autoescape: true});
  env.addGlobal('partyType', PartyType);
  env.addGlobal('YesNo', YesNo);
  env.addGlobal('translateErrors', (errors: {text: string; href: string}[], t: (key: string) => string) => errors.map(error => ({...error, text: t(error.text)})));
  return env;
}

export function renderPostcodeBlocks(model: Record<string, unknown> = {}, errors: Record<string, string> = {}, language = 'en', types = ['primaryAddress', 'correspondenceAddress']): string {
  return environment().renderString('<form method="post">{% from "macro/postcode-address-form.njk" import postcodeLookupAndAddressForm %}{% for addressType in types %}{{ postcodeLookupAndAddressForm(t, {party: party, addressType: addressType}) }}{% endfor %}<button type="submit">Save</button></form>', {t: postcodeTranslate(language), party: postcodeParty(model, errors), types});
}

export function renderPostcodePage(view: string, type = PartyType.INDIVIDUAL, model: Record<string, unknown> = {}, errors: Record<string, string> = {}, language = 'en', viewsDirectory?: string): string {
  const party = postcodeParty(model, errors);
  return environment(viewsDirectory).render(view, {t: postcodeTranslate(language), lang: language, csrf: 'fixture-csrf', party, form: party, partyPhone: {model: {}, hasErrors: () => false, getAllErrors: (): unknown[] => []}, type, claimantType: type, defendantType: type, respondent: {type}, carmEnabled: true});
}

// Explicit expected master-format fields, shared by component regressions and
// the independent old-script comparison; these are not calculated by the formatter.
export const postcodeFormattingCases = [
  {name: 'organisation and all building parts', address: {organisationName: ' Organisation ', buildingNumber: ' 12 ', subBuildingName: ' Flat A ', buildingName: ' House ', thoroughfareName: ' Street ', dependentLocality: ' Locality ', postTown: ' Town ', postcode: ' AB1 2CD '}, expected: ['Organisation', '12 Flat A House Street', 'Locality', 'Town', 'AB1 2CD']},
  {name: 'number and street', address: {buildingNumber: 12, thoroughfareName: 'Street', dependentLocality: 'Locality', postTown: 'Town', postcode: 'AB1 2CD'}, expected: ['12 Street', 'Locality', '', 'Town', 'AB1 2CD']},
  {name: 'building name retains number', address: {buildingName: 'House', buildingNumber: '12', thoroughfareName: 'Street', dependentLocality: 'Locality', postTown: 'Town', postcode: 'AB1 2CD'}, expected: ['House', '12 Street', 'Locality', 'Town', 'AB1 2CD']},
  {name: 'sub-building and building', address: {subBuildingName: 'Flat A', buildingName: 'House', buildingNumber: '12', thoroughfareName: 'Street', dependentLocality: 'Locality', postTown: 'Town', postcode: 'AB1 2CD'}, expected: ['Flat A House', '12 Street', 'Locality', 'Town', 'AB1 2CD']},
  {name: 'street only', address: {thoroughfareName: 'Street', dependentLocality: 'Locality', postTown: 'Town', postcode: 'AB1 2CD'}, expected: ['Street', 'Locality', '', 'Town', 'AB1 2CD']},
  {name: 'missing optional fields', address: {buildingName: 'House', postTown: ' Town ', postcode: ' AB1 2CD '}, expected: ['House', '', '', 'Town', 'AB1 2CD']},
  {name: 'sub-building without building name', address: {subBuildingName: 'Flat A', buildingNumber: '12', thoroughfareName: 'Street'}, expected: ['Flat A', '12 Street', '', '', '']},
];
