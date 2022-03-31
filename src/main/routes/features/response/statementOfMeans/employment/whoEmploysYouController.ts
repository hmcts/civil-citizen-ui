import * as express from 'express';
import { WHO_EMPLOYS_YOU_URL, CLAIM_TASK_LIST_URL } from '../../../../urls';
// import {getDraftClaimFromStore} from '../../../../modules/draft-store/draftStoreService';
// import {CounterpartyType} from '../../../../common/models/counterpartyType';
// import * as winston from 'winston';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';
// import { Claim } from 'common/models/claim';
// import { getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { getEmployers } from '../../../../../modules/statementOfMeans/employment/employerService';
// import { Employer } from 'common/models/employer';
import { Employers } from '../../../../../common/form/models/statementOfMeans/employment/employers';
// import { CitizenTelephoneNumber } from 'common/form/models/citizenTelephoneNumber';
const whoEmploysYouViewPath = 'features/response/statementOfMeans/employment/who-employs-you';

const router = express.Router();
// const {Logger} = require('@hmcts/nodejs-logging');
// let logger: winston.LoggerInstance = Logger.getLogger('financialDetailsController');

// interface Employer {
//     name: string,
//     job: string
// } 

// const employer: Employer = {name:null, job:null};

// function renderView(employers: Employer[], res: express.Response): void {
//     res.render(whoEmploysYouViewPath, { employers });
// }

router.get(WHO_EMPLOYS_YOU_URL, async (req: express.Request, res: express.Response) => {
    try {
        const employers: Employers = await getEmployers(req.params.id);
        // renderView(employers, res);
        console.log("EMPLOYERS", employers);
        console.log(typeof employers);
        res.render(whoEmploysYouViewPath, { employers });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post(WHO_EMPLOYS_YOU_URL, async (req: express.Request, res: express.Response) => {
    try {
        console.log("POST");
        // TODO: redirect to correct url depending on this screen and the screen before (employed OR employed + self employed)
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default router;

// const getWhoEmploysYouView = async (req: any, res: any) => {
//     try {
//         console.log("GET");
//         res.render(whoEmploysYouViewPath, {});
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// };

// const submitWhoEmploysYou = async (req: any, res: any) => {
//     try {
//         console.log("POST");
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// }

// export { getWhoEmploysYouView, submitWhoEmploysYou }