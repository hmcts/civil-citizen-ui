import {Claim} from '../../../../main/common/models/claim';
import {
  InterestClaimFromType,
  InterestClaimOptions,
  InterestClaimUntilType,
  SameRateInterestType,
} from '../../../../main/common/form/models/claimDetails';
import {StatementOfMeans} from '../../../../main/common/models/statementOfMeans';
import {Disability} from '../../../../main/common/form/models/statementOfMeans/disability';
import {YesNo} from '../../../../main/common/form/models/yesNo';
import {SevereDisability} from '../../../../main/common/form/models/statementOfMeans/severeDisability';
import {PartnerDisability} from '../../../../main/common/form/models/statementOfMeans/partner/partnerDisability';
import {Cohabiting} from '../../../../main/common/form/models/statementOfMeans/partner/cohabiting';
import {ChildrenDisability} from '../../../../main/common/form/models/statementOfMeans/dependants/childrenDisability';
import {Dependants} from '../../../../main/common/form/models/statementOfMeans/dependants/dependants';
import civilClaimResponseApplicantCompany from '../../../utils/mocks/civilClaimResponseApplicantCompanyMock.json';
import civilClaimResponseApplicantIndividual from '../../../utils/mocks/civilClaimResponseApplicanIndividualMock.json';
import {ResponseType} from '../../../../main/common/form/models/responseType';
import {CounterpartyType} from '../../../../main/common/models/counterpartyType';
import {PartialAdmission} from '../../../../main/common/models/partialAdmission';
import {Respondent} from '../../../../main/common/models/respondent';
import {HowMuchDoYouOwe} from '../../../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PaymentIntention} from '../../../../main/common/form/models/admission/partialAdmission/paymentIntention';
import PaymentOptionType from '../../../../main/common/form/models/admission/paymentOption/paymentOptionType';

describe('Claim isInterestClaimUntilSubmitDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestClaimUntilSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimUntil = InterestClaimUntilType.UNTIL_CLAIM_SUBMIT_DATE;
    //When
    const result = claim.isInterestClaimUntilSubmitDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimUntil = InterestClaimUntilType.UNTIL_SETTLED_OR_JUDGEMENT_MADE;
    //When
    const result = claim.isInterestClaimUntilSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
});
describe('Claim isInterestFromClaimSubmitDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isInterestFromASpecificDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimFrom = InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE;
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isInterestClaimOptionsSameRateInterest', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interestClaimOptions = InterestClaimOptions.SAME_RATE_INTEREST;
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interestClaimOptions = InterestClaimOptions.BREAK_DOWN_INTEREST;
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isSameRateTypeEightPercent', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.sameRateInterestSelection = {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC};
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.sameRateInterestSelection = {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE};
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isDefendantDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty disability', () => {
    //Given
    claim.statementOfMeans.disability = new Disability();
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.disability.option = YesNo.NO;
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.disability.option = YesNo.YES;
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeTruthy;
  });
});

describe('Claim isDefendantSeverlyDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isDefendantSeverelyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isDefendantSeverelyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty severe disability', () => {
    //Given
    claim.statementOfMeans.severeDisability = new SevereDisability();
    //When
    const result = claim.isDefendantSeverelyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.severeDisability.option = YesNo.NO;
    //When
    const result = claim.isDefendantSeverelyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.severeDisability.option = YesNo.YES;
    //When
    const result = claim.isDefendantSeverelyDisabled();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Claim isPartnerDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty partrner disability', () => {
    //Given
    claim.statementOfMeans.partnerDisability = new PartnerDisability();
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.partnerDisability.option = YesNo.NO;
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty cohabiting ', () => {
    //Given
    claim.statementOfMeans.cohabiting = new Cohabiting();
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with no partner ', () => {
    //Given
    claim.statementOfMeans.cohabiting.option = YesNo.NO;
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with not disabled partner', () => {
    //Given
    claim.statementOfMeans.partnerDisability.option = YesNo.NO;
    claim.statementOfMeans.cohabiting.option = YesNo.YES;
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.partnerDisability.option = YesNo.YES;
    claim.statementOfMeans.cohabiting.option = YesNo.YES;
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Claim isChildrenDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty partrner disability', () => {
    //Given
    claim.statementOfMeans.childrenDisability = new ChildrenDisability();
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with undefined option', () => {
    //Given
    claim.statementOfMeans.childrenDisability.option = undefined;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.childrenDisability.option = YesNo.NO;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty Dependants', () => {
    //Given
    claim.statementOfMeans.dependants = new Dependants();
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with declared is undefined ', () => {
    //Given
    claim.statementOfMeans.dependants.declared = undefined;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with no children ', () => {
    //Given
    claim.statementOfMeans.dependants.declared =false;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with not disabled children ', () => {
    //Given
    claim.statementOfMeans.dependants.declared = true;
    claim.statementOfMeans.childrenDisability.option = YesNo.NO;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.childrenDisability.option = YesNo.YES;
    claim.statementOfMeans.dependants.declared = true;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeTruthy();
  });
});


describe('Claim get claimant and defendant names by type', () => {
  const claimCompany =  Object.assign(new Claim(), JSON.parse(JSON.stringify(civilClaimResponseApplicantCompany)).case_data);
  const claimIndividual =  Object.assign(new Claim(), JSON.parse(JSON.stringify(civilClaimResponseApplicantIndividual)).case_data);
  it('should return claimantName for INDIVIDUAL', () => {
    //When
    const result = claimIndividual.getClaimantName();
    //Then
    expect(result).toBe('Mr. Jan Clark');
  });
  it('should return defendantName for INDIVIDUAL', () => {
    //When
    const result = claimIndividual.getDefendantName();
    //Then
    expect(result).toBe('Mr. Joe Doe');
  });
  it('should return claimantName for COMPANY', () => {
    //When
    const result = claimCompany.getClaimantName();
    //Then
    expect(result).toBe('Version 1');
  });
  it('should return defendantName for COMPANY', () => {
    //When
    const result = claimCompany.getDefendantName();
    //Then
    expect(result).toBe('Google');
  });
});

describe('Claim isFullAdmission', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false without respondent details', () => {
    //Given
    claim.respondent1 = new Respondent();
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with partial admission', () => {
    //Given
    claim.respondent1 = {responseType: ResponseType.PART_ADMISSION, primaryAddress: {}, type: CounterpartyType.INDIVIDUAL};
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with full rejection', () => {
    //Given
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return true with full admission', () => {
    //Given
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim isPartialAdmission', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false without respondent details', () => {
    //Given
    claim.respondent1 = new Respondent();
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with full admission', () => {
    //Given
    claim.respondent1 = {responseType: ResponseType.FULL_ADMISSION, primaryAddress: {}, type: CounterpartyType.INDIVIDUAL};
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with full rejection', () => {
    //Given
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return true with part admission', () => {
    //Given
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim isFullAdmissionPaymentOptionExists', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isFullAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty payment option', () => {
    //Given
    claim.paymentOption = undefined;
    //When
    const result = claim.isFullAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return true with payment option', () => {
    //Given
    claim.paymentOption = PaymentOptionType.INSTALMENTS;
    //When
    const result = claim.isFullAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim isPartialAdmissionPaymentOptionExists', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty partial admission', () => {
    //Given
    claim.partialAdmission = new PartialAdmission();
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty payment intention', () => {
    //Given
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with part admit empty payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = undefined;
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return true with payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim partialAdmissionPaymentAmount', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return false with empty partial admission', () => {
    //Given
    claim.partialAdmission = new PartialAdmission();
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return false with part admit empty HowMuchDoYouOwe', () => {
    //Given
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return existing amount', () => {
    //Given
    claim.partialAdmission.howMuchDoYouOwe.amount = 55;
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toEqual(55);
  });
});

describe('Documents', () => {
  const emptyDocumentDetails = {
    document_url: '',
    document_binary_url: '',
    document_filename: '',
  };
  const documentDetails = {
    document_url: 'http://dm-store:8080/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c',
    document_filename: 'timeline-event-summary.pdf',
    document_binary_url: 'http://dm-store:8080/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c/binary',
  };

  describe('extractDocumentId', () => {
    const claim = new Claim();
    it('should return undefined with empty claim', () => {
      //When
      const result = claim.extractDocumentId();
      //Then
      expect(result).toBeUndefined;
    });
    it('should return undefined with empty document details', () => {
      //Given
      claim.specClaimTemplateDocumentFiles = emptyDocumentDetails;
      //When
      const result = claim.extractDocumentId();
      //Then
      expect(result).toBeUndefined;
    });
    it('should return document id with existing document details  ', () => {
      //Given
      claim.specClaimTemplateDocumentFiles = documentDetails;
      //When
      const result = claim.extractDocumentId();
      //Then
      expect(result).toBe('74bf213e-72dd-4908-9e08-72fefaed9c5c');
    });
  });

  describe('generatePdfFileName', () => {
    const claim = new Claim();
    it('should return only case reference number with empty document details', () => {
      // Given
      claim.legacyCaseReference = '000MC009';
      claim.specClaimTemplateDocumentFiles = emptyDocumentDetails;
      //When
      const result = claim.generatePdfFileName();
      //Then
      expect(result).toContain('000MC009');
    });
    it('should return file name with case number and declared file name', () => {
      // Given
      claim.specClaimTemplateDocumentFiles = documentDetails;
      //When
      const result = claim.generatePdfFileName();
      //Then
      expect(result).toBe('000MC009-timeline-event-summary.pdf');
    });
  });
});

