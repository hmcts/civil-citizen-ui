import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {Experts} from 'models/directionsQuestionnaire/experts/experts';
import {toCCDExpert} from 'services/translation/response/convertToCCDExpert';
import {CCDExpert, CCDExportReportSent} from 'models/ccdResponse/ccdExpert';
import {YesNo, YesNoNotReceived, YesNoUpperCamelCase} from 'form/models/yesNo';
import {ExpertDetails} from 'models/directionsQuestionnaire/experts/expertDetails';
import {GenericYesNo} from 'form/models/genericYesNo';
import { convertToPence } from 'services/translation/claim/moneyConversation';

const mockExpertDetail: ExpertDetails = new ExpertDetails('Joe', 'smith', 'jeo.smith@gmail.com', 12345678 , 'help', 'ExpertInField1', 10000);

describe('translate DQ expert details to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();
  claim.directionQuestionnaire.experts = new Experts();
  claim.totalClaimAmount = 1500;

  it('should return undefined if data doesnt exist', () => {

    //Given
    const expected: CCDExpert ={
      expertRequired: undefined,
      expertReportsSent: undefined,
      jointExpertSuitable: undefined,
      details: undefined,
    };

    //When
    const dqExpertDetails = toCCDExpert(claim);
    //then
    expect(dqExpertDetails).toEqual(expected);
  });

  it('should return data when it exist', () => {

    //Given
    claim.directionQuestionnaire.experts ={
      expertRequired: true,
      expertCanStillExamine: {
        option: YesNo.YES,
        details: 'photo evidence',
      },
      expertDetailsList:{
        items : [mockExpertDetail],
      },
      sentExpertReports:{
        option:YesNoNotReceived.NOT_RECEIVED,
      },
      sharedExpert: new GenericYesNo(YesNo.YES),
    };

    const expected: CCDExpert ={
      expertRequired: YesNoUpperCamelCase.YES,
      details: [{
        value: {
          name: mockExpertDetail.firstName+' '+mockExpertDetail.lastName,
          firstName: mockExpertDetail.firstName,
          lastName: mockExpertDetail.lastName,
          phoneNumber: String(mockExpertDetail.phoneNumber),
          emailAddress: mockExpertDetail.emailAddress,
          whyRequired: mockExpertDetail.whyNeedExpert,
          fieldOfExpertise: mockExpertDetail.fieldOfExpertise,
          estimatedCost: convertToPence(mockExpertDetail.estimatedCost),
        },
      }],
      expertReportsSent: CCDExportReportSent.NOT_OBTAINED,
      jointExpertSuitable: YesNoUpperCamelCase.YES,

    };
    //When
    const dqExpertDetails = toCCDExpert(claim);
    //then
    expect(dqExpertDetails).toEqual(expected);
  });
});
