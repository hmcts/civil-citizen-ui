import {Claim} from '../../../../../../../main/common/models/claim';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';
import {
  buildHearingRequirementSection,
} from '../../../../../../../main/services/features/response/checkAnswers/hearingRequirementSection/buildHearingRequirementSection';
import {DirectionQuestionnaire} from '../../../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {Witnesses} from '../../../../../../../main/common/models/directionsQuestionnaire/witnesses/witnesses';
import {OtherWitnesses} from '../../../../../../../main/common/models/directionsQuestionnaire/witnesses/otherWitnesses';
import {OtherWitnessItems} from '../../../../../../../main/common/models/directionsQuestionnaire/witnesses/otherWitnessItems';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const witness1 =  new OtherWitnessItems({
  firstName: 'Joe',
  lastName: 'Doe',
  telephone: '000000000',
  email: 'joe@doe.com',
  details: 'Here is some of details',
});

const witness2 =  new OtherWitnessItems({
  firstName: 'Jane',
  lastName: 'Does',
  telephone: '111111111',
  email: 'jane@does.com',
  details: 'Some details of Jane Does',
});

describe('test hearingRequirementSection', () => {
  it('should display \'no\' when there is no witnesses', () => {
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.witnesses = new Witnesses();
    claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
    claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [];
    claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.NO;

    const summaryRows = buildHearingRequirementSection(claim, '1', 'eng');

    expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
    expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
    expect(summaryRows.summaryList.rows[0].value.html).toEqual(YesNo.NO);
  });

  it('should display \'yes\' when there is 1 witness', () => {
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.witnesses = new Witnesses();
    claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
    claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [witness1];
    claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.YES;

    const summaryRows = buildHearingRequirementSection(claim, '1', 'eng');

    expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
    expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
    expect(summaryRows.summaryList.rows[0].value.html).toEqual(YesNo.YES);
  });

  it('should display \'yes\' and have 2 witnesses', () => {
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.witnesses = new Witnesses();
    claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
    claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [witness1, witness2];
    claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.YES;

    const summaryRows = buildHearingRequirementSection(claim, '1', 'eng');

    expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
    expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
    expect(summaryRows.summaryList.rows[0].value.html).toEqual(YesNo.YES);

    expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WITNESS 1');
    expect(summaryRows.summaryList.rows[1].value.html).toEqual('COMMON.INPUT_LABELS.FIRST_NAME: Joe<br />COMMON.INPUT_LABELS.LAST_NAME: Doe<br />PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS: joe@doe.com<br />PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER: 000000000<br />PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY: Here is some of details');

    expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WITNESS 2');
    expect(summaryRows.summaryList.rows[2].value.html).toEqual('COMMON.INPUT_LABELS.FIRST_NAME: Jane<br />COMMON.INPUT_LABELS.LAST_NAME: Does<br />PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS: jane@does.com<br />PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER: 111111111<br />PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY: Some details of Jane Does');
  });
});
