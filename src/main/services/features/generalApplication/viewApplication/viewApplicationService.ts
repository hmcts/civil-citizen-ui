import {
  addApplicationStatus,
  addApplicationTypesAndDescriptionRows,
  addApplicationTypesRows,
  addDocumentUploadRow,
  addHearingArrangementsRows,
  addHearingContactDetailsRows,
  addHearingSupportRows,
  addInformOtherPartiesRow,
  addOrderJudgeRows,
  addOtherPartiesAgreedRow,
  addRequestingReasonRows,
  addUnavailableDatesRows,
} from './addViewApplicationRows';
import {SummaryRow} from 'models/summaryList/summaryList';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {AppRequest} from 'models/AppRequest';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import { buildResponseSummaries } from './addViewApplicationResponseRows';

export type ViewApplicationSummaries = {
  summaryRows: SummaryRow[],
  responseSummaries?: SummaryRow[],
}

const buildApplicationSections = (application: ApplicationResponse, lang: string ): SummaryRow[] => {
  return [
    ...addApplicationStatus(application, lang),
    ...addApplicationTypesRows(application, lang),
    ...addOtherPartiesAgreedRow(application, lang),
    ...addInformOtherPartiesRow(application, lang),
    ...addOrderJudgeRows(application, lang),
    ...addRequestingReasonRows(application, lang),
    ...addDocumentUploadRow(application, lang),
    ...addHearingArrangementsRows(application, lang),
    ...addHearingContactDetailsRows(application, lang),
    ...addUnavailableDatesRows(application, lang),
    ...addHearingSupportRows(application, lang),
  ];
};

const buildViewApplicationToRespondentSections = (application: ApplicationResponse, lang: string): SummaryRow[] => {
  return [
    ...addApplicationTypesAndDescriptionRows(application, lang),
    ...addOtherPartiesAgreedRow(application, lang),
    ...addInformOtherPartiesRow(application, lang),
    ...addOrderJudgeRows(application, lang),
    ...addRequestingReasonRows(application, lang),
    ...addDocumentUploadRow(application, lang),
    ...addHearingArrangementsRows(application, lang),
    ...addHearingContactDetailsRows(application, lang),
    ...addUnavailableDatesRows(application, lang),
    ...addHearingSupportRows(application, lang),
  ];
};

export const getApplicationSections = async (req: AppRequest, applicationId: string, lang?: string): Promise<ViewApplicationSummaries> => {
  const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
  const claim = await getClaimById(req.params.id, req, true);
  return toggleViewApplicationBuilderBasedOnUserAndApplicant(claim, applicationResponse) 
    ? { summaryRows: buildApplicationSections(applicationResponse, lang),
      responseSummaries: buildResponseSummaries(applicationResponse.case_data, lang) } 
    : { summaryRows: buildViewApplicationToRespondentSections(applicationResponse, lang) };
};

const toggleViewApplicationBuilderBasedOnUserAndApplicant = (claim: Claim, application: ApplicationResponse) : boolean => {
  return ((claim.isClaimant() && application.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.YES)
    || (!claim.isClaimant() && application.case_data.parentClaimantIsApplicant === YesNoUpperCamelCase.NO));
};
