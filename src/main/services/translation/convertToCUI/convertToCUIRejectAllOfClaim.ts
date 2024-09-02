import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIRejectAllOfClaimType} from 'services/translation/convertToCUI/convertToCUIRejectAllOfClaimType';
import {WhyDoYouDisagree} from 'form/models/admission/partialAdmission/whyDoYouDisagree';
import {toCUIRespondToClaim} from 'services/translation/convertToCUI/convertToCUIRespondToClaim';
import {Defence} from 'form/models/defence';
import {toCUIResponseTimelineOfEvents} from 'services/translation/convertToCUI/convertToCUIPartialAdmission';

export const toCUIRejectAllOfClaim = (ccdClaim: CCDClaim): RejectAllOfClaim => {
  const whyDoYouDisagree = new WhyDoYouDisagree(ccdClaim?.detailsOfWhyDoesYouDisputeTheClaim);
  const defence = new Defence(ccdClaim?.detailsOfWhyDoesYouDisputeTheClaim);
  const timeline = toCUIResponseTimelineOfEvents(ccdClaim?.specResponseTimelineOfEvents, ccdClaim?.respondent1LiPResponse?.timelineComment);

  return new RejectAllOfClaim(toCUIRejectAllOfClaimType(ccdClaim?.defenceRouteRequired),
    toCUIRespondToClaim(ccdClaim?.respondToClaim), whyDoYouDisagree, defence, timeline);
};
