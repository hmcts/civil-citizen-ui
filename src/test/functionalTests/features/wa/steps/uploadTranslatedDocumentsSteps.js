const WABaseSteps = require('./waBaseSteps');
const config = require('../../../../config')

class UploadTranslatedDocumentsSteps extends WABaseSteps{
    async runWAApiTest(api, caseNumber) {
        await this._runWAApiTest(api, config.caseWorker, caseNumber);
    }
}

module.exports = new UploadTranslatedDocumentsSteps();