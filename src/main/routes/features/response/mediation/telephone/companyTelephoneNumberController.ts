import express from 'express';
import { GenericForm } from '../../../../../common/form/models/genericForm';
import { CompanyTelephoneNumber } from '../../../../../common/form/models/mediation/telephone/companyTelephoneNumber';
import { COMPANY_TELEPHONE_NUMBER_URL, CLAIM_TASK_LIST_URL } from '../../../../urls';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';
import {
  getCompanyTelephoneNumberData, saveCompanyTelephoneNumberData,
} from '../../../../../modules/mediation/telephone/companyTelephoneNumberService';

const companyTelephoneNumberController = express.Router();
const companyTelephoneNumberView = 'features/response/mediation/telephone/company-telephone-number';

function renderForm(form: GenericForm<CompanyTelephoneNumber>, res: express.Response, contactPerson?: string) {
  const companyTelephoneNumber = Object.assign(form);
  companyTelephoneNumber.option = form.model.option;
  res.render(companyTelephoneNumberView, { form: form, contactPerson });
}

companyTelephoneNumberController.get(COMPANY_TELEPHONE_NUMBER_URL, async (req, res) => {
  try {
    
    const response = await getCompanyTelephoneNumberData(req.params.id);
    const [contactPerson, telephoneNumberData] = response;
    const form = new GenericForm(telephoneNumberData);
    renderForm(form, res, contactPerson);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

companyTelephoneNumberController.post(COMPANY_TELEPHONE_NUMBER_URL, async (req, res) => {
  const { option, mediationContactPerson, mediationPhoneNumber, mediationPhoneNumberConfirmation, contactPerson } = req.body;
  
  const companyTelephoneNumber = new CompanyTelephoneNumber(option, mediationPhoneNumber, mediationContactPerson, mediationPhoneNumberConfirmation);
  const form = new GenericForm(companyTelephoneNumber);
  try {
    await form.validate();
    if (form.hasErrors()) {
      renderForm(form, res, contactPerson);
    } else {
      await saveCompanyTelephoneNumberData(req.params.id, form.model);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
export default companyTelephoneNumberController;
