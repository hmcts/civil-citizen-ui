import {CCDPaymentOption} from './ccdPaymentOption';
import {ClaimUpdate} from '../../models/events/eventDto';
import {CCDRepaymentPlan} from './ccdRepaymentPlan';
import {CCDPayBySetDate} from './ccdPayBySetDate';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {CCDParty} from './ccdParty';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {RespondToClaim} from 'models/ccdResponse/ccdAdmitPartRoute';
import {TimelineUploadTypeSpec} from 'models/ccdResponse/ccdHowToAddTimeline';
import {CCDTimeLineOfEvents} from 'models/ccdResponse/ccdTimeLineOfEvents';
import {CCDEvidence} from 'models/ccdResponse/ccdEvidence';

export interface CCDResponse extends ClaimUpdate {
  respondent1ClaimResponseTypeForSpec: string;
  defenceAdmitPartPaymentTimeRouteRequired?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  respondToClaimAdmitPartLRspec?: CCDPayBySetDate;
  responseClaimMediationSpecRequired?: string;
  specAoSApplicantCorrespondenceAddressRequired?: YesNoUpperCamelCase;
  totalClaimAmount: number;
  respondent1: CCDParty;
  respondent1LiPResponse: CCDRespondentLiPResponse;
  respondToAdmittedClaim: RespondToClaim;
  specDefenceAdmittedRequired: YesNoUpperCamelCase;
  respondToAdmittedClaimOwingAmount: string;
  detailsOfWhyDoesYouDisputeTheClaim: string;
  specClaimResponseTimelineList: TimelineUploadTypeSpec;
  specResponseTimelineOfEvents: CCDTimeLineOfEvents[];
  specResponselistYourEvidenceList: CCDEvidence[];
}
