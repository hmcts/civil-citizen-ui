import {GenericForm} from 'common/form/models/genericForm';
import {YesNo} from 'common/form/models/yesNo';
import {CaseState} from 'common/form/models/claimDetails';
import {Claim} from 'common/models/claim';
import {PartyType} from 'common/models/partyType';
import {Party} from 'common/models/party';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {OtherWitnesses} from 'common/models/directionsQuestionnaire/witnesses/otherWitnesses';
import {OtherWitnessItems} from 'common/models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {ExpertDetails} from 'common/models/directionsQuestionnaire/experts/expertDetails';
import {ExpertDetailsList} from 'common/models/directionsQuestionnaire/experts/expertDetailsList';
import {Support, SupportRequired, SupportRequiredList} from 'common/models/directionsQuestionnaire/supportRequired';
import {generateExpertAndWitnessList, NameListType} from 'services/features/directionsQuestionnaire/supportRequiredService';
import {formControlsEnvironment, formControlTranslate} from './renderFormControls';

export const dqRepeatedPages = {
  witnesses: 'features/directionsQuestionnaire/witnesses/otherWitnesses/other-witnesses.njk',
  experts: 'features/directionsQuestionnaire/experts/expert-details.njk',
  support: 'features/directionsQuestionnaire/support-required-list.njk',
};
export type DqEditor = keyof typeof dqRepeatedPages;
export const witnessRow = (index = 0) => new OtherWitnessItems({firstName: `Witness${index}`, lastName: 'Example', email: `w${index}@example.test`, telephone: '07700900123', details: `Saved event ${index}`});
export const expertRow = (index = 0) => new ExpertDetails(`Expert${index}`, 'Example', `e${index}@example.test`, undefined, `Saved reason ${index}`, `Specialism ${index}`, 25 + index);
export const supportRow = (index = 0) => new SupportRequired({fullName: index % 2 ? 'Expert0 Example' : 'Witness0 Example', disabledAccess: new Support('disabledAccess', true), languageInterpreter: new Support('languageInterpreter', true, `Language ${index}`), signLanguageInterpreter: new Support('signLanguageInterpreter', false, ''), otherSupport: new Support('otherSupport', true, `Support ${index}`)});

export function dqClaim(claimant = false) {
  const claim = new Claim();
  claim.applicant1 = Object.assign(new Party(), {type: PartyType.INDIVIDUAL, partyDetails: {firstName: 'Claimant', lastName: 'Citizen'}});
  claim.respondent1 = Object.assign(new Party(), {type: PartyType.INDIVIDUAL, partyDetails: {firstName: 'Defendant', lastName: 'Citizen'}});
  const dq = new DirectionQuestionnaire();
  dq.witnesses = {otherWitnesses: new OtherWitnesses(YesNo.YES, [witnessRow()])};
  dq.experts = {expertDetailsList: new ExpertDetailsList([expertRow()])};
  if (claimant) {
    claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.directionQuestionnaire = dq;
  } else claim.directionQuestionnaire = dq;
  return claim;
}

export type DqModel = OtherWitnesses | ExpertDetailsList | SupportRequiredList;
export function dqForm(editor: DqEditor, count = 2, invalid = false) {
  const rows = Array.from({length: count}, (_, index) => editor === 'witnesses' ? witnessRow(index) : editor === 'experts' ? expertRow(index) : supportRow(index));
  if (invalid && count) {
    if (editor === 'support') (rows[0] as SupportRequired).languageInterpreter.content = '';
    else rows[0].firstName = '';
  }
  const model: DqModel = editor === 'witnesses' ? new OtherWitnesses(YesNo.YES, rows as OtherWitnessItems[]) : editor === 'experts' ? new ExpertDetailsList(rows as ExpertDetails[]) : new SupportRequiredList(YesNo.YES, rows as SupportRequired[]);
  const form = new GenericForm(model);
  if (invalid) form.validateSync();
  return form;
}

export function renderDqRepeatedPage(editor: DqEditor, options: {language?: string; count?: number; invalid?: boolean; claimant?: boolean; carm?: boolean; form?: GenericForm<DqModel>; peopleLists?: NameListType[][]; viewsDirectory?: string} = {}) {
  const {language = 'en', count = 2, invalid = false, claimant = false, carm = true, viewsDirectory} = options;
  const form = options.form || dqForm(editor, count, invalid);
  const names = generateExpertAndWitnessList(dqClaim(claimant), language);
  const support = form.model as SupportRequiredList;
  const selected = support.items?.map(row => row.fullName) || [];
  const peopleLists = options.peopleLists || (support.items === undefined ? [''] : selected).map(value => names.map(name => ({...name, selected: value?.replace(/ /g, '') === name.value.replace(/ /g, '')})));
  return formControlsEnvironment(viewsDirectory).render(dqRepeatedPages[editor], {t: formControlTranslate(language), lang: language, form, peopleLists, isDefendant: !claimant, carmEnabled: carm, csrf: 'fixture-csrf', pageTitle: editor === 'witnesses' ? 'PAGES.OTHER_WITNESSES.TITLE' : editor === 'experts' ? 'PAGES.EXPERT_DETAILS.PAGE_TITLE' : 'PAGES.SUPPORT_REQUIRED.PAGE_TITLE'});
}
