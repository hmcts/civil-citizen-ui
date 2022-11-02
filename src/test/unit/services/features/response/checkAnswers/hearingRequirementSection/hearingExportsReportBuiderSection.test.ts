import {Claim} from '../../../../../../../main/common/models/claim';
import {DirectionQuestionnaire} from '../../../../../../../main/common/models/directionsQuestionnaire/directionQuestionnaire';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';
import {Experts} from '../../../../../../../main/common/models/directionsQuestionnaire/experts/experts';
import {
  buildExportReportSection,
} from '../../../../../../../main/services/features/response/checkAnswers/hearingRequirementsSection/hearingExportsReportBuilderSection';
import {ExpertReportDetails} from '../../../../../../../main/common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {ReportDetail} from '../../../../../../../main/common/models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';

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
    const summryRows = buildExportReportSection(claim, '1', 'eng');
    //Then
    expect(summryRows[0].value.text).toEqual('COMMON.VARIATION_2.YES');
  });
});
