const {clickButton} = require('../commons/clickButton');
const {buttonType} = require("../commons/buttonVariables");
const I = actor();

class CaseProgressionSteps {
  start() {
    I.amOnPage('/case-progression/upload-your-documents');

    clickButton(buttonType.SAVE_AND_CONTINUE);
  }
}

module.exports = new CaseProgressionSteps();
