import {Claim} from "models/claim";
import {ClaimDetails} from "form/models/claim/details/claimDetails";
import {BreathingSpace} from "models/breathingSpace";
import {DebtRespiteOptionType} from "models/breathingSpace/debtRespiteOptionType";
import {translateBreathSpaceToCCD} from "services/translation/breathingSpace/ccdTranslation";

describe('Translate breathing space to ccd version', ()=>{

  it('should  translate  reference number to CCD', () => {
    // Given
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.breathingSpace = new BreathingSpace();
    claim.claimDetails.breathingSpace = {
      debtRespiteReferenceNumber:{
        referenceNumber: undefined
      },
      debtRespiteOption:{
        type: undefined
      },
      debtRespiteStartDate:{
        date: undefined
      },
      debtRespiteEndDate:{
        date: undefined
      }
    }

    // When
    const ccdBreathingSpaceOption = translateBreathSpaceToCCD(claim.claimDetails.breathingSpace);
    console.log(ccdBreathingSpaceOption);
    // Then
    expect(ccdBreathingSpaceOption).not.toBeUndefined();
    expect(ccdBreathingSpaceOption.breathingSpaceEnterInfo.enter.type).toBeUndefined();
    expect(ccdBreathingSpaceOption.breathingSpaceEnterInfo.enter.reference).toBeUndefined();
    expect(ccdBreathingSpaceOption.breathingSpaceEnterInfo.enter.start).toBeUndefined();
    expect(ccdBreathingSpaceOption.breathingSpaceEnterInfo.enter.expectedEnd).toBeUndefined();
  });

  it('should translate type option to CCD',  () => {
    //Given
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.breathingSpace = new BreathingSpace();
    claim.claimDetails.breathingSpace = {
      debtRespiteReferenceNumber:{
        referenceNumber: undefined
      },
      debtRespiteOption: {
        type:DebtRespiteOptionType.MENTAL_HEALTH
      },
      debtRespiteStartDate:{
        date: undefined
      },
      debtRespiteEndDate:{
        date: undefined
      }
    }
    // When
    const ccdBreathingSpaceOption = translateBreathSpaceToCCD(claim.claimDetails.breathingSpace)
    expect(ccdBreathingSpaceOption.breathingSpaceEnterInfo.enter.type).toBe("MENTAL_HEALTH");

  });

  it('should  translate  reference number to CCD', () => {
    // Given
    const claim = new Claim();
    claim.claimDetails = new ClaimDetails();
    claim.claimDetails.breathingSpace = new BreathingSpace();
    claim.claimDetails.breathingSpace = {
      debtRespiteReferenceNumber:{
        referenceNumber: "2255566"
      },
      debtRespiteOption:{
        type: DebtRespiteOptionType.STANDARD
      },
      debtRespiteStartDate:{
        date: new Date("2022-12-03")
      },
      debtRespiteEndDate:{
        date: new Date("2023-01-03")
      }
    }
    // When
    const ccdBreathingSpaceOption = translateBreathSpaceToCCD(claim.claimDetails.breathingSpace);

    // Then
    expect(ccdBreathingSpaceOption.breathingSpaceEnterInfo.enter).not.toBeUndefined();
    expect(ccdBreathingSpaceOption.breathingSpaceEnterInfo.enter.reference).toBe("2255576");
    expect(ccdBreathingSpaceOption.breathingSpaceEnterInfo.enter.type).toBe("STANDARD");
    expect(ccdBreathingSpaceOption.breathingSpaceEnterInfo.enter.start).toBe("2022-11-03T00:00:00.000Z");
    expect(ccdBreathingSpaceOption.breathingSpaceEnterInfo.enter.expectedEnd).toBe("2023-1-03T00:00:00.000Z");





  });

  it('should  translate start date to CCD', () => {

  });

  it('should translate end date to CCD', () => {

  });
})