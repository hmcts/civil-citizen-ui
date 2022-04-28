import express from 'express';
import { GenericForm } from '../../../../../common/form/models/genericForm';
import { CompanyTelephoneNumber } from '../../../../../common/form/models/mediation/telephone/companyTelephoneNumber';
import { COMPANY_TELEPHONE_NUMBER_URL, CLAIM_TASK_LIST_URL } from '../../../../urls';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';
import {
  getCompanyTelephoneNumberForm, saveCompanyTelephoneNumberData
} from '../../../../../modules/mediation/telephone/companyTelephoneNumberService';
// import { toRegularExpenseForm } from '../../../../../common/utils/expenseAndIncome/regularIncomeExpenseCoverter';


const companyTelephoneNumberController = express.Router();
const companyTelephoneNumberView = 'features/response/mediation/telephone/company-telephone-number';

function renderForm(form: GenericForm<CompanyTelephoneNumber>, res: express.Response, contactPerson?: string) {
  console.log('render', form)
  const alreadyPaid = Object.assign(form);
  alreadyPaid.option = form.model.option;
  res.render(companyTelephoneNumberView, { form: form, contactPerson });
}

companyTelephoneNumberController.get(COMPANY_TELEPHONE_NUMBER_URL, async (req, res) => {
  // console.log('controller--', req.body)
  const contactPerson = 'David'; // should extract from civilclaim
  try {
    const model = await getCompanyTelephoneNumberForm(req.params.id);
    // console.log('controller--', model)
    renderForm(new GenericForm<CompanyTelephoneNumber>(model), res, contactPerson);
  } catch (error) {
    // console.log('500 errr')
    res.status(500).send({ error: error.message });
  }
});

companyTelephoneNumberController.post(COMPANY_TELEPHONE_NUMBER_URL, async (req, res) => {
  const { option, mediationPhoneNumber, mediationContactPerson, mediationPhoneNumberConfirmation} = req.body;
  const companyTelephoneNumber = new CompanyTelephoneNumber(option, mediationPhoneNumber, mediationContactPerson, mediationPhoneNumberConfirmation);
  const form = new GenericForm(companyTelephoneNumber);
  // console.log('posttt', req.body)
  try {
    await form.validate();
    // console.log('post error aftyer validate', form.hasErrors)
    // console.log('post error aftyer validate', form.getErrors())
    if (form.hasErrors()) {
      // console.log('erorr', form.model)
      // console.log('errorfor', form.errorFor('option'))
      renderForm(form, res);
    } else {
      await saveCompanyTelephoneNumberData(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
export default companyTelephoneNumberController;