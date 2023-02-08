import {Claim} from 'models/claim';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  buildHearingRequirementSection,
} from 'services/features/response/checkAnswers/hearingRequirementSection/buildHearingRequirementSection';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Witnesses} from 'models/directionsQuestionnaire/witnesses/witnesses';
import {OtherWitnesses} from 'models/directionsQuestionnaire/witnesses/otherWitnesses';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';

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
    expect(summaryRows.summaryList.rows[0].value.html).toEqual(YesNoUpperCamelCase.NO);
  });

  it('should display \'yes\' and 1 witness details', () => {
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.witnesses = new Witnesses();
    claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
    claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.YES;
    claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [witness1];

    const summaryRows = buildHearingRequirementSection(claim, '1', 'eng');

    expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
    expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
    expect(summaryRows.summaryList.rows[0].value.html).toEqual(YesNoUpperCamelCase.YES);

    expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WITNESS 1');

    expect(summaryRows.summaryList.rows[2].key.text).toEqual('COMMON.INPUT_LABELS.FIRST_NAME');
    expect(summaryRows.summaryList.rows[2].value.html).toEqual('Joe');

    expect(summaryRows.summaryList.rows[3].key.text).toEqual('COMMON.INPUT_LABELS.LAST_NAME');
    expect(summaryRows.summaryList.rows[3].value.html).toEqual('Doe');

    expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS');
    expect(summaryRows.summaryList.rows[4].value.html).toEqual('joe@doe.com');

    expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER');
    expect(summaryRows.summaryList.rows[5].value.html).toEqual('000000000');

    expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY');
    expect(summaryRows.summaryList.rows[6].value.html).toEqual('Here is some of details');

  });

  it('should display \'yes\' and have 2 witnesses', () => {
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.witnesses = new Witnesses();
    claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
    claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.YES;
    claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [witness1, witness2];

    const summaryRows = buildHearingRequirementSection(claim, '1', 'eng');

    expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
    expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.DO_YOU_HAVE_OTHER_WITNESSES');
    expect(summaryRows.summaryList.rows[0].value.html).toEqual(YesNoUpperCamelCase.YES);
    // Witness 1
    expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WITNESS 1');
    expect(summaryRows.summaryList.rows[2].key.text).toEqual('COMMON.INPUT_LABELS.FIRST_NAME');
    expect(summaryRows.summaryList.rows[2].value.html).toEqual('Joe');
    expect(summaryRows.summaryList.rows[3].key.text).toEqual('COMMON.INPUT_LABELS.LAST_NAME');
    expect(summaryRows.summaryList.rows[3].value.html).toEqual('Doe');
    expect(summaryRows.summaryList.rows[4].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS');
    expect(summaryRows.summaryList.rows[4].value.html).toEqual('joe@doe.com');
    expect(summaryRows.summaryList.rows[5].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER');
    expect(summaryRows.summaryList.rows[5].value.html).toEqual('000000000');
    expect(summaryRows.summaryList.rows[6].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY');
    expect(summaryRows.summaryList.rows[6].value.html).toEqual('Here is some of details');
    // Witness 2
    expect(summaryRows.summaryList.rows[7].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.WITNESS 2');
    expect(summaryRows.summaryList.rows[8].key.text).toEqual('COMMON.INPUT_LABELS.FIRST_NAME');
    expect(summaryRows.summaryList.rows[8].value.html).toEqual('Jane');
    expect(summaryRows.summaryList.rows[9].key.text).toEqual('COMMON.INPUT_LABELS.LAST_NAME');
    expect(summaryRows.summaryList.rows[9].value.html).toEqual('Does');
    expect(summaryRows.summaryList.rows[10].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.EMAIL_ADDRESS');
    expect(summaryRows.summaryList.rows[10].value.html).toEqual('jane@does.com');
    expect(summaryRows.summaryList.rows[11].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.PHONE_NUMBER');
    expect(summaryRows.summaryList.rows[11].value.html).toEqual('111111111');
    expect(summaryRows.summaryList.rows[12].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TELL_US_WHY');
    expect(summaryRows.summaryList.rows[12].value.html).toEqual('Some details of Jane Does');
  });

  it('build hearing requirement for Fast Track Claim when there are no witnesses', () => {
    const claim = new Claim();
    claim.totalClaimAmount = 11000;
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.hearing = new Hearing();
    claim.directionQuestionnaire.hearing = {
      triedToSettle : {
        option: YesNo.YES,
      },
      requestExtra4weeks : {
        option: YesNo.YES,
      },
      considerClaimantDocuments : {
        option: YesNo.YES,
        details: 'Test Doc',
      },
    };
    const summaryRows = buildHearingRequirementSection(claim, '1', 'eng');

    expect(summaryRows.title).toEqual('PAGES.CHECK_YOUR_ANSWER.HEARING_REQUIREMENTS_TITLE');
    expect(summaryRows.summaryList.rows[0].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.TRIED_TO_SETTLE');
    expect(summaryRows.summaryList.rows[0].value.html).toEqual(YesNoUpperCamelCase.YES);
    expect(summaryRows.summaryList.rows[1].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.REQUEST_EXTRA_4WEEKS');
    expect(summaryRows.summaryList.rows[1].value.html).toEqual(YesNoUpperCamelCase.YES);
    expect(summaryRows.summaryList.rows[2].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.CONSIDER_CLAIMANT_DOCUMENT');
    expect(summaryRows.summaryList.rows[2].value.html).toEqual(YesNoUpperCamelCase.YES);
    expect(summaryRows.summaryList.rows[3].key.text).toEqual('PAGES.CHECK_YOUR_ANSWER.GIVE_DOC_DETAILS');
    expect(summaryRows.summaryList.rows[3].value.html).toEqual('Test Doc');
  });
});
