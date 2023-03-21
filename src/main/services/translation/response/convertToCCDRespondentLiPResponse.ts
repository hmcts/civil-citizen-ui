import {Claim} from 'models/claim';
import {toCCDResponseLiPFinancialDetails} from 'services/translation/response/convertToCCDResponseLiPFinancialDetails';
import {toCCDMediation} from 'services/translation/response/convertToCCDMediation';
import {CCDRespondentLiPResponse, CCDRespondentResponseLanguage} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';

export const toCCDRespondentLiPResponse = (claim: Claim): CCDRespondentLiPResponse => {
  return {
    respondent1LiPFinancialDetails : toCCDResponseLiPFinancialDetails(claim.statementOfMeans),
    respondent1MediationLiPResponse: toCCDMediation(claim.mediation),
    respondent1ResponseLanguage: toCCDRespondentResponseLanguage(claim.claimBilingualLanguagePreference),
  };
};

function toCCDRespondentResponseLanguage(language: ClaimBilingualLanguagePreference) {
  switch(language) {
    case ClaimBilingualLanguagePreference.ENGLISH :
      return CCDRespondentResponseLanguage.ENGLISH;
    case ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH:
      return CCDRespondentResponseLanguage.BOTH;
    default: return undefined;
  }
}
