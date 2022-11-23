import {Claim} from '../.common/models/claim';
import {
  DirectionQuestionnaire,
} from '../.common/models/directionsQuestionnaire/directionQuestionnaire';
import {YesNo} from '../.common/form/models/yesNo';
import {Experts} from '../.common/models/directionsQuestionnaire/experts/experts';
import {
  buildExportReportSection,
} from '../../../../../../../main/services/features/response/checkAnswers/hearingRequirementsSection/hearingExportsReportBuilderSection';
import {
  ExpertReportDetails,
} from '../.common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {
  ReportDetail,
} from '../.common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
import {
  ExpertCanStillExamine,
} from '../.common/models/directionsQuestionnaire/experts/expertCanStillExamine';
import {GenericYesNo} from '../.common/form/models/genericYesNo';
import {ExpertDetailsList} from '../.common/models/directionsQuestionnaire/experts/expertDetailsList';
import {ExpertDetails} from '../.common/models/directionsQuestionnaire/experts/expertDetails';

jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('test buildExportReportSection', ()=>{
  it('should display Yes when claim has report written by an export', ()=>{
    //Given
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.experts = new Experts();
    claim.directionQuestionnaire.experts.expertReportDetails = new ExpertReportDetails();
    claim.directionQuestionnaire.experts.expertReportDetails.option = YesNo.YES;
    claim.directionQuestionnaire.experts.expertReportDetails.reportDetails = [new ReportDetail()];
    //When
    const summaryRows = buildExportReportSection(claim, '1', 'eng');
    //Then
    expect(summaryRows[0].key.text).toEqual('PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE');
    expect(summaryRows[0].value.html).toEqual('COMMON.VARIATION_2.YES');
  });
  it('should display No when claim has report written by an export and have two rows', ()=>{
    //Given
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.experts = new Experts();
    claim.directionQuestionnaire.experts.expertReportDetails = new ExpertReportDetails();
    claim.directionQuestionnaire.experts.expertReportDetails.option = YesNo.NO;
    //When
    const summaryRows = buildExportReportSection(claim, '1', 'eng');
    //Then
    expect(summaryRows[0].key.text).toEqual('PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE');
    expect(summaryRows[0].value.html).toEqual('COMMON.VARIATION_2.NO');
  });
  it('should display yes when claim has something to examine', ()=> {
    //Given
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.experts = new Experts();
    claim.directionQuestionnaire.experts.expertReportDetails = new ExpertReportDetails();
    claim.directionQuestionnaire.experts.expertReportDetails.option = YesNo.NO;
    claim.directionQuestionnaire.experts.expertCanStillExamine = new ExpertCanStillExamine(YesNo.YES, 'something');
    //When
    const summaryRows = buildExportReportSection(claim, '1', 'eng');
    //Then
    expect(summaryRows[2].key.text).toEqual('PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE');
    expect(summaryRows[2].value.html).toEqual('COMMON.VARIATION.YES');
  });
  it('should display no when claim has something to examine', ()=> {
    //Given
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.experts = new Experts();
    claim.directionQuestionnaire.experts.expertReportDetails = new ExpertReportDetails();
    claim.directionQuestionnaire.experts.expertReportDetails.option = YesNo.NO;
    claim.directionQuestionnaire.experts.expertCanStillExamine = new ExpertCanStillExamine(YesNo.NO, 'something');
    //When
    const summaryRows = buildExportReportSection(claim, '1', 'eng');
    //Then
    expect(summaryRows[2].key.text).toEqual('PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE');
    expect(summaryRows[2].value.html).toEqual('COMMON.VARIATION.NO');
  });
  it('should display yes when claim has permission to use expert', ()=> {
    //Given
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.experts = new Experts();
    claim.directionQuestionnaire.experts.expertReportDetails = new ExpertReportDetails();
    claim.directionQuestionnaire.experts.expertReportDetails.option = YesNo.NO;
    claim.directionQuestionnaire.experts.expertCanStillExamine = new ExpertCanStillExamine(YesNo.YES, 'something');
    claim.directionQuestionnaire.experts.permissionForExpert = new GenericYesNo(YesNo.YES);
    //When
    const summaryRows = buildExportReportSection(claim, '1', 'eng');
    //Then
    expect(summaryRows[1].key.text).toEqual('PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE');
    expect(summaryRows[1].value.html).toEqual('COMMON.VARIATION.YES');
  });
  it('should display no when claim has no permission to use expert', ()=> {
    //Given
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.experts = new Experts();
    claim.directionQuestionnaire.experts.expertReportDetails = new ExpertReportDetails();
    claim.directionQuestionnaire.experts.expertReportDetails.option = YesNo.NO;
    claim.directionQuestionnaire.experts.expertCanStillExamine = new ExpertCanStillExamine(YesNo.YES, 'something');
    claim.directionQuestionnaire.experts.permissionForExpert = new GenericYesNo(YesNo.NO);
    //When
    const summaryRows = buildExportReportSection(claim, '1', 'eng');
    //Then
    expect(summaryRows[1].key.text).toEqual('PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE');
    expect(summaryRows[1].value.html).toEqual('COMMON.VARIATION.NO');
  });
  it('should display rows of expert reports when claim has expert reports', () =>{
    //Given
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.experts = new Experts();
    claim.directionQuestionnaire.experts.expertReportDetails = new ExpertReportDetails(YesNo.YES,
      [new ReportDetail('John Smith', '2021', '1', '1')]);

    //When
    const summaryRows = buildExportReportSection(claim, '1', 'eng');
    //Then
    expect(summaryRows.length).toEqual(2);
    expect(summaryRows[1].key.text).toEqual('PAGES.EXPERT_REPORT_DETAILS.REPORT_TEXT 1');
    expect(summaryRows[1].value.html).toContain('PAGES.EXPERT_REPORT_DETAILS.EXPERT_NAME : John Smith <br>');
    expect(summaryRows[1].value.html).toContain('PAGES.EXPERT_REPORT_DETAILS.DATE_OF_REPORT : 1 January 2021');
  });
  it('should display details of what to examine and rows of expert details when claim has evidence still to examine', ()=> {
    //Given
    const claim = new Claim();
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.experts = new Experts();
    claim.directionQuestionnaire.experts.expertReportDetails = new ExpertReportDetails();
    claim.directionQuestionnaire.experts.expertReportDetails.option = YesNo.NO;
    claim.directionQuestionnaire.experts.expertCanStillExamine = new ExpertCanStillExamine(YesNo.YES, 'something');
    claim.directionQuestionnaire.experts.permissionForExpert = new GenericYesNo(YesNo.YES);
    claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList([new ExpertDetails('John', 'Smith', 'email', 60098, 'reason', 'expert', 1000)]);
    //When
    const summaryRows = buildExportReportSection(claim, '1', 'eng');
    //Then
    expect(summaryRows.length).toEqual(12);
    expect(summaryRows[0].key.text).toEqual('PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE');
    expect(summaryRows[0].value.html).toEqual('COMMON.VARIATION_2.NO');
    expect(summaryRows[1].key.text).toEqual('PAGES.PERMISSION_FOR_EXPERT.PAGE_TITLE');
    expect(summaryRows[1].value.html).toEqual('COMMON.VARIATION.YES');
    expect(summaryRows[2].key.text).toEqual('PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.TITLE');
    expect(summaryRows[2].value.html).toEqual('COMMON.VARIATION.YES');
    expect(summaryRows[3].key.text).toEqual('PAGES.DEFENDANT_EXPERT_CAN_STILL_EXAMINE.EXAMINE');
    expect(summaryRows[3].value.html).toEqual('something');
    expect(summaryRows[4].key.text).toEqual('PAGES.EXPERT_DETAILS.SECTION_TITLE 1');
    expect(summaryRows[5].key.text).toEqual('PAGES.EXPERT_DETAILS.FIRST_NAME_OPTIONAL');
    expect(summaryRows[5].value.html).toEqual('John');
    expect(summaryRows[6].key.text).toEqual('PAGES.EXPERT_DETAILS.LAST_NAME_OPTIONAL');
    expect(summaryRows[6].value.html).toEqual('Smith');
    expect(summaryRows[7].key.text).toEqual('PAGES.EXPERT_DETAILS.EMAIL_ADDRESS_OPTIONAL');
    expect(summaryRows[7].value.html).toEqual('email');
    expect(summaryRows[8].key.text).toEqual('PAGES.EXPERT_DETAILS.PHONE_OPTIONAL');
    expect(summaryRows[8].value.html).toEqual('60098');
    expect(summaryRows[9].key.text).toEqual('PAGES.EXPERT_DETAILS.FIELD_OF_EXPERTISE');
    expect(summaryRows[9].value.html).toEqual('expert');
    expect(summaryRows[10].key.text).toEqual('PAGES.EXPERT_DETAILS.TELL_US_WHY_NEED_EXPERT');
    expect(summaryRows[10].value.html).toEqual('reason');
    expect(summaryRows[11].key.text).toEqual('PAGES.EXPERT_DETAILS.COST_OPTIONAL');
    expect(summaryRows[11].value.html).toEqual('1000');
  });
});
