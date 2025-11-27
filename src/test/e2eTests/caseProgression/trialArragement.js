const {clickButton} = require('../commons/clickButton');
const {buttonType} = require('../commons/buttonVariables');
const {seeInTitle} = require('../commons/seeInTitle');
const {seeBackLink} = require('../commons/seeBackLink');
const {yesAndNoCheckBoxOptionValue} = require('../commons/eligibleVariables');
const {seeBreadcrumbs} = require('../commons/seeBreadcrumbs');
const I = actor();

class TrialArragement {
  start(claimId) {
    I.amOnPage(`case/${claimId}/case-progression/finalise-trial-arrangements`);
    seeInTitle('Finalise your trial arrangements');
    seeBreadcrumbs();
    I.see('Hearing', 'span.govuk-caption-l');
    I.see('Finalise your trial arrangements', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0003', 'h2.govuk-body-l');
    I.see('Claim amount: £15,000', 'h2.govuk-body-l');
    I.seeElement('div.govuk-warning-text');
    I.seeElement('//strong[contains(., "You have until 30 May 2023 to provide this information.")]');

    I.see('You should finalise your trial arrangements to ensure the court has the necessary information for the trial to proceed in a suitable way.', 'p.govuk-body');

    I.see('Is the case ready for trial?', 'h2.govuk-heading-m');
    I.see('We are asking you to confirm the case is ready for the trial. This means you have taken all the action required of you in the', 'p.govuk-body');
    I.see('directions order', 'a.govuk-link');
    I.see('that you have received.', 'p.govuk-body');
    I.see('If your case is not ready and you do not think it will be ready by the deadline for finalising your trial arrangements, you may wish to postpone or adjourn the trial. To do this, you will need to make an application to the court.', 'p.govuk-body');

    I.seeElement('div.govuk-inset-text');
    I.seeElement('//strong[contains(., "If you need to make an application, you must complete and submit your trial arrangements first.")]');
    I.see('You should only make an application once this has been completed. There will be a link to make an application once you have finalised your trial arrangements.', 'p.govuk-body');
    I.see('If you make an application, please note the trial will go ahead as planned until the application is reviewed by a judge and an order made changing the date of the trial.', 'p.govuk-body');

    I.see('Trial adjustments and duration', 'h2.govuk-heading-m');
    I.see('You will be asked to specify if there are any changes to the support or adjustments you previously specified in your', 'p.govuk-body');
    I.see(' directions questionnaire', 'a.govuk-link');
    I.see('You should review this to identify if your circumstances have changed.', 'p.govuk-body');

    I.see('We will remind you of the time allocated for the trial. If you feel less time is needed, you can specify why in the \'other information\' box.', 'p.govuk-body');
    I.see('If you feel that more time will be required, you will need to liaise with the other party and make an application to the court.', 'p.govuk-body');
    I.see('If you need to make an application, you must complete and submit your trial arrangements first. You should only make an application once this has been completed.', 'p.govuk-body');

    I.see('Other information', 'h2.govuk-heading-m');
    I.see('You will be given the opportunity to provide any other information relevant to the trial, for example if any party is only available at a specific time.', 'p.govuk-body');

    I.see('Cancel', 'a.govuk-link');
    clickButton(buttonType.START_NOW);

  }

  isCaseReady() {
    I.seeInCurrentUrl('/case-progression/finalise-trial-arrangements/is-case-ready');

    seeInTitle('Finalise your trial arrangements');
    seeBackLink();
    I.see('Hearing', 'span.govuk-caption-l');
    I.see('Finalise your trial arrangements', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0003', 'h2.govuk-body-l');
    I.see('Claim amount: £15,000', 'h2.govuk-body-l');

    I.see('Is the case ready for trial?', 'h2.govuk-heading-m');
    I.see('You are reminded that this information will be shared with all other parties', 'p.govuk-body');

    I.checkOption(`#${yesAndNoCheckBoxOptionValue.YES}`);

    I.see('Cancel', 'a.govuk-link');
    clickButton(buttonType.CONTINUE);
  }

  hasAnythingChanged() {
    I.seeInCurrentUrl('/case-progression/finalise-trial-arrangements/has-anything-changed');
    //TODO will be fix with CIV-13605
    //seeInTitle('Finalise your trial arrangements');
    seeBackLink();
    I.see('Hearing', 'span.govuk-caption-l');

    I.see('Finalise your trial arrangements', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0003', 'h2.govuk-body-l');
    I.see('Claim amount: £15,000', 'h2.govuk-body-l');

    I.see('Has anything changed to the support or adjustments you wish the court and the judge to consider for you, or a witness who will give evidence on your behalf?', 'h2.govuk-heading-m');
    I.see('You can check your previous answers in the', 'p.govuk-body');
    I.see('directions questionnaire', 'a.govuk-link');

    I.checkOption(`#${yesAndNoCheckBoxOptionValue.YES}`);

    I.see('What support do you, experts or witnesses need?', 'label.govuk-label--s');
    I.see('For example, a witness requires a courtroom with step-free access.', 'div.govuk-hint');
    I.fillField('#textArea','Automation Test execution of Trial arrangements');

    I.see('Cancel', 'a.govuk-link');
    clickButton(buttonType.CONTINUE);
  }

  hearingDurationOtherInfo() {
    I.seeInCurrentUrl('/case-progression/finalise-trial-arrangements/hearing-duration-other-info');
    seeInTitle('Finalise your trial arrangements');
    seeBackLink();
    I.see('Hearing', 'span.govuk-caption-l');

    I.see('Finalise your trial arrangements', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0003', 'h2.govuk-body-l');
    I.see('Claim amount: £15,000', 'h2.govuk-body-l');

    I.see('Trial duration', 'h2.govuk-heading-m');
    I.see('The trial duration originally allocated is ', 'p.govuk-body');
    I.see('1 hour', 'span.govuk-body');
    I.see('If you require less time please set out your reasons in the \'Other information\' box below.', 'p.govuk-body');

    I.seeElement('div.govuk-inset-text');
    I.see('If you think you will need more time for the trial, you will need to liaise with the other party and make an application to the court.', 'span.govuk-body');
    I.see('The time allocated for the trial will not be increased until an application is received, the fee paid, and an order made.', 'div.govuk-inset-text');

    I.see('Is there anything else the court needs to know (optional)?', 'span.govuk-body');
    I.see('For example, a witness needs to leave the court by 3pm due to caring responsibilities.', 'div.govuk-hint');
    I.fillField('#otherInformation','Automation Test execution of Trial arrangements');

    I.see('Cancel', 'a.govuk-link');
    clickButton(buttonType.CONTINUE);
  }

  checkYourAnswers() {
    I.seeInCurrentUrl('/case-progression/finalise-trial-arrangements/check-trial-arrangements');

    seeInTitle('Check your answers');
    seeBackLink();
    I.see('Hearing', 'span.govuk-caption-l');
    I.see('Check your answers', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0003', 'h2.govuk-body-l');
    I.see('Claim amount: £15,000', 'h2.govuk-body-l');

    I.see('Is the case ready for trial?', 'dt.govuk-summary-list__key');
    I.see('Yes', 'dd.govuk-summary-list__value');
    I.see('Change', 'dd.govuk-summary-list__actions');

    I.see('Are there any changes to support with access needs or vulnerability for anyone attending a court hearing?', 'dt.govuk-summary-list__key');
    I.see('Yes', 'dd.govuk-summary-list__value');
    I.see('Automation Test execution of Trial arrangements', 'dd.govuk-summary-list__value');
    I.see('Change', 'dd.govuk-summary-list__actions');

    I.see('Other information', 'dt.govuk-summary-list__key');
    I.see('Automation Test execution of Trial arrangements', 'dd.govuk-summary-list__value');
    I.see('Change', 'dd.govuk-summary-list__actions');

    clickButton(buttonType.SUBMIT);
    I.seeInCurrentUrl('/case-progression/finalise-trial-arrangements/confirmation');
  }

}

module.exports = new TrialArragement();
