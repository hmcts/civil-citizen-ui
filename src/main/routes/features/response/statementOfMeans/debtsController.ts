import * as express from 'express';
import { t } from 'i18next';
import { CITIZEN_DEBTS_OVERVIEW_URL } from '../../../urls';
const router = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('debtsController');

router.get(CITIZEN_DEBTS_OVERVIEW_URL, async (req: express.Request, res: express.Response) => {
    logger.info("GET debts overview", t("hello"))

    // dummy data
    const debts ={
  mortgage: { amount: '11111', schedule: 'twoWeeks' },
  rent: { amount: '2222222', schedule: 'week' },
  councilTax: { amount: '333333' }
    }
    console.log("GET-->", debts.mortgage.amount)

    const debtsViewPath = 'features/response/statementOfMeans/debts';

    res.render(debtsViewPath, {debts : debts, box : Object.keys(debts)});




});

interface DebtDetails  {
    amount?: number;
    schedule?:string
}

interface Debts { 
    mortgage?: DebtDetails;
    rent?: DebtDetails;
    couincilTax?:DebtDetails
}

type Debt = "mortgage" | "rent" | "couincilTax";


router.post(CITIZEN_DEBTS_OVERVIEW_URL, async (req: express.Request, res: express.Response) => {
    logger.info("POST debts overview", req.body)

    const converted: Debts = {}
    req.body.debts.forEach((debt: Debt) => {
        converted[debt] = {}
        Object.keys(req.body).forEach(key => {
            if (key !== "debts" && key.includes(debt)) {
                if (key.includes("amount")) {
                    converted[debt].amount = req.body[key]
                }
                if (key.includes("schedule")) {
                    converted[debt].schedule = req.body[key]  
      }
    }
  })
})

console.log(converted)

    const debtsViewPath = 'features/response/statementOfMeans/debts';

    res.render(debtsViewPath);




});

export default router;
