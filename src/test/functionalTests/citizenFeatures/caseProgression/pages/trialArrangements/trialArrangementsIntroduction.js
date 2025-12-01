const ContactUs = require('../../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();
let language = 'en';

const content = {
  buttons: {
    startNow: {
      en: 'Start now',
      cy: 'Dechrau nawr',
    },
  },
  heading: {
    title: {
      en: 'Finalise your trial arrangements',
      cy: 'Cwblhau trefniadau eich treial',
    },
    number: {
      en: 'Case number',
      cy: 'Rhif yr achos',
    },
    amount: {
      en: 'Claim amount',
      cy: 'Swm yr hawliad',
    },
    until: {
      en: 'You have until',
      cy: 'Mae gennych tan',
    },
    provideInfo: {
      en: 'to provide this information.',
      cy: 'i ddarparu’r wybodaeth hon',
    },
    youShould: {
      en: 'You should finalise your trial arrangements to ensure the court has the necessary information for the trial',
      cy: 'Dylech gwblhau trefniadau eich treial i sicrhau bod gan y llys yr wybodaeth angenrheidiol er mwyn i’r treial',
    },
    proceed: {
      en: 'to proceed in a suitable way.',
      cy: 'fynd rhagddo mewn ffordd addas.',
    },
  },
  isCaseReady: {
    title: {
      en: 'Is the case ready for trial?',
      cy: 'A yw’r achos yn barod ar gyfer treial?',
    },
    askConfirmation: {
      en: 'We are asking you to confirm the case is ready for the trial.',
      cy: 'Rydym yn gofyn i chi gadarnhau bod yr achos yn barod ar gyfer y treial.',
    },
    actionTaken: {
      en: 'This means you have taken all the action required of you in the',
      cy: 'Mae hyn yn golygu eich bod wedi cymryd yr holl gamau sy’n ofynnol ohonoch yn y ',
    },
    directionsOrder: {
      en: 'directions order',
      cy: 'gorchymyn cyfarwyddiadau',
    },
    received: {
      en: 'that you have received.',
      cy: 'a gawsoch.',
    },
    ifNotReady: {
      en: 'If your case is not ready and you do not think it will be ready by the deadline for finalising your trial arrangements,',
      cy: 'Os nad yw eich achos yn barod ac nad ydych yn credu y bydd yn barod erbyn y dyddiad terfyn ar gyfer cwblhau trefniadau eich treial,',
    },
    toPostpone: {
      en: 'you may wish to postpone or adjourn the trial. To do this, you will need to make an application to the court.',
      cy: 'efallai y byddwch am ohirio\'r treial. I wneud hyn, bydd angen i chi wneud cais i’r llys.',
    },
    makeApplication: {
      en: 'If you need to make an application, you must complete and submit your trial arrangements first.',
      cy: 'Os oes angen i chi wneud cais, rhaid i chi gwblhau a chyflwyno trefniadau eich treial yn gyntaf.',
    },
    onceCompleted: {
      en: 'You should only make an application once this has been completed.',
      cy: 'Dim ond unwaith y bydd hyn wedi’i wneud y dylech wneud cais.',
    },
    applicationLink: {
      en: 'There will be a link to make an application once you have finalised your trial arrangements.',
      cy: 'Bydd dolen i wneud cais yn ymddangos unwaith y byddwch wedi cwblhau trefniadau eich treial.',
    },
    applicationReviewed: {
      en: 'If you make an application, please note the trial will go ahead as planned until the application is reviewed by a judge and an order made changing the date of the trial.',
      cy: 'Os byddwch yn gwneud cais, nodwch y bydd y treial yn mynd yn ei flaen fel y cynlluniwyd nes bydd y cais yn cael ei adolygu gan farnwr a bod gorchymyn wedi ei wneud yn newid dyddiad y treial.',
    },
  },
  duration: {
    title: {
      en: 'Trial adjustments and duration',
      cy: 'Addasiadau a hyd y treial',
    },
    specifyChange: {
      en: 'You will be asked to specify if there are any changes to the support or adjustments you previously specified in your',
      cy: 'Gofynnir i chi nodi a oes unrhyw newidiadau i’r cymorth neu’r addasiadau a nodwyd gennych yn flaenorol yn eich',
    },
    directionsQuestionnaire: {
      en: 'directions questionnaire',
      cy: 'holiadur cyfarwyddiadau.',
    },
    ShouldReview: {
      en: 'You should review this to identify if your circumstances have changed.',
      cy: 'Dylech adolygu hyn i weld a yw eich amgylchiadau wedi newid.',
    },
    timeAllocated: {
      en: 'We will remind you of the time allocated for the trial. If you feel less time is needed, you can specify why in the \'other information\' box.',
      cy: 'Byddwn yn eich atgoffa o’r amser a neilltuwyd ar gyfer y treial. Os ydych yn teimlo nad oes angen cymaint â hynny o amser, gallwch nodi pam yn y blwch \'gwybodaeth arall\'.',
    },
    moreRequired: {
      en: 'If you feel that more time will be required, you will need to liaise with the other party and make an application to the court.',
      cy: 'Os ydych yn teimlo bod arnoch angen mwy o amser, bydd angen i chi gysylltu â’r parti arall a gwneud cais i’r llys.',
    },
    makeApplication: {
      en: 'If you need to make an application, you must complete and submit your trial arrangements first.',
      cy: 'Os ydych angen gwneud cais, rhaid i chi gwblhau a chyflwyno trefniadau eich treial yn gyntaf.',
    },
    uponCompletion: {
      en: 'You should only make an application once this has been completed.',
      cy: 'Dim ond unwaith y bydd hyn wedi’i wneud y dylech wneud cais.',
    },
  },
  other: {
    title: {
      en: 'Other information',
      cy: 'Gwybodaeth arall',
    },
    text: {
      en: 'You will be given the opportunity to provide any other information relevant to the trial, for example if any party is only available at a specific time.',
      cy: 'Byddwch yn cael cyfle i ddarparu unrhyw wybodaeth arall sy’n berthnasol i’r treial, er enghraifft os yw unrhyw barti ar gael ar amser penodol yn unig.',
    },
  },
};

class TrialArrangementsIntroduction {

  checkPageFullyLoaded () {
    I.waitForElement(`//a[contains(.,'${content.buttons.startNow[language]}')]`);
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  verifyPageContent(caseNumber, claimAmount, deadline, languageChosen = 'en') {
    language = languageChosen;
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails(deadline);
    this.verifyCaseNumberClaimAmount(caseNumber, claimAmount);
    this.verifyIsTheCaseReadyForTrialSectionContent();
    this.verifyTrialAdjustmentsAndDurationSectionContent();
    this.verifyOtherSectionContent();
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Home', '//li[@class=\'govuk-breadcrumbs__list-item\']');
    I.see('Finalise your trial arrangements', '//li[@class=\'govuk-breadcrumbs__list-item\']');
  }

  verifyCaseNumberClaimAmount(caseNumber, claimAmount) {
    I.see('Case number: ' + caseNumber, 'h2');
    I.see('Claim amount: ' + claimAmount, 'h2');
  }

  verifyHeadingDetails(deadline) {
    I.see(content.heading.title[language], 'h1');
    I.see(content.heading.number[language]);
    I.see(content.heading.amount[language]);
    I.see(content.heading.until[language]);
    I.see(deadline);
    I.see(content.heading.provideInfo[language]);
    I.see(content.heading.youShould[language]);
    I.see(content.heading.proceed[language]);
  }

  verifyIsTheCaseReadyForTrialSectionContent() {
    I.see(content.isCaseReady.title[language],'h2');
    I.see(content.isCaseReady.askConfirmation[language]);
    I.see(content.isCaseReady.actionTaken[language]);
    I.seeElement(`//a[.='${content.isCaseReady.directionsOrder[language]}']`);
    I.see(content.isCaseReady.received[language]);

    I.see(content.isCaseReady.ifNotReady[language]);
    I.see(content.isCaseReady.toPostpone[language]);
    I.see(content.isCaseReady.makeApplication[language]);
    I.see(content.isCaseReady.onceCompleted[language]);
    I.see(content.isCaseReady.applicationLink[language]);
    I.see(content.isCaseReady.applicationReviewed[language]);
  }

  verifyTrialAdjustmentsAndDurationSectionContent() {
    I.see(content.duration.title[language],'h2');
    I.see(content.duration.specifyChange[language]);
    I.seeElement(`//a[.='${content.duration.directionsQuestionnaire[language]}']`);
    I.see(content.duration.ShouldReview[language]);
    I.see(content.duration.timeAllocated[language]);
    I.see(content.duration.moreRequired[language]);
    I.see(content.duration.makeApplication[language]);
    I.see(content.duration.uponCompletion[language]);
  }

  verifyOtherSectionContent() {
    I.see(content.other.title[language],'h2');
    I.see(content.other.text[language]);
  }
}

module.exports = TrialArrangementsIntroduction;
