import PaymentOptionType from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {Claim} from '../../../../../main/common/models/claim';
import {translateDraftResponseToCCD} from '../../../../../main/services/translation/response/ccdTranslation';
import {CcdPaymentOption} from '../../../../../main/common/models/ccdResponse/paymentOptionCCD';

describe('translate response to ccd version', ()=> {
  it('should translate payment option to ccd', ()=>{
    //Given
    const claim = new Claim();
    claim.paymentOption = PaymentOptionType.BY_SET_DATE;
    //When
    const ccdResponse = translateDraftResponseToCCD(claim);
    //Then
    expect(ccdResponse.paymentTypeSelection).toBe(CcdPaymentOption.SET_DATE);
  });
});
