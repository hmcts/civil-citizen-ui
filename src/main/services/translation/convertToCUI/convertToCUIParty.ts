import {CCDParty} from 'models/ccdResponse/ccdParty';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyPhone} from 'models/PartyPhone';
import {Email} from 'models/Email';
import {CitizenDate} from 'form/models/claim/claimant/citizenDate';
import {toCUIAddress} from 'services/translation/convertToCUI/convertToCUIAddress';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {YesNo} from 'form/models/yesNo';

export const toCUIParty = (ccdParty: CCDParty): Party => {
  const cuiParty = new Party();
  cuiParty.partyDetails = new PartyDetails({});
  if (ccdParty?.type === PartyType.INDIVIDUAL) {
    cuiParty.partyDetails.individualFirstName = ccdParty?.individualFirstName ? ccdParty.individualFirstName : undefined;
    cuiParty.partyDetails.individualLastName = ccdParty.individualLastName ? ccdParty?.individualLastName : undefined;
    cuiParty.partyDetails.individualTitle = ccdParty.individualTitle ? ccdParty?.individualTitle : undefined;
    const auxDate = new Date(ccdParty.individualDateOfBirth);
    cuiParty.dateOfBirth = ccdParty?.individualDateOfBirth ? new CitizenDate(auxDate.getDate().toString(), (auxDate.getMonth()+1).toString(), auxDate.getFullYear().toString()) : undefined;
  } else if (ccdParty?.type === PartyType.SOLE_TRADER) {
    cuiParty.partyDetails.individualFirstName = ccdParty.soleTraderFirstName ? ccdParty?.soleTraderFirstName : undefined;
    cuiParty.partyDetails.individualLastName = ccdParty.soleTraderLastName ? ccdParty?.soleTraderLastName : undefined;
    cuiParty.partyDetails.individualTitle = ccdParty.soleTraderTitle ? ccdParty?.soleTraderTitle : undefined;
    const auxDate = new Date(ccdParty.soleTraderDateOfBirth);
    cuiParty.dateOfBirth = ccdParty?.soleTraderDateOfBirth ? new CitizenDate(auxDate.getDate().toString(), (auxDate.getMonth() + 1).toString(), auxDate.getFullYear().toString()) : undefined;
    cuiParty.partyDetails.soleTraderTradingAs = ccdParty.soleTraderTradingAs ? ccdParty?.soleTraderTradingAs : undefined;
  } else if (ccdParty?.type === PartyType.COMPANY) {
    cuiParty.partyDetails.partyName = ccdParty?.partyName ? ccdParty.partyName : undefined;
  } else {
    cuiParty.partyDetails.partyName = ccdParty?.partyName ? ccdParty.partyName : undefined;
  }
  cuiParty.partyPhone = ccdParty?.partyPhone ? new PartyPhone(ccdParty?.partyPhone) : undefined;
  cuiParty.emailAddress = ccdParty?.partyEmail ? new Email(ccdParty?.partyEmail) : undefined;
  cuiParty.type = ccdParty?.type ? ccdParty?.type : undefined;
  cuiParty.partyDetails.primaryAddress = toCUIAddress(ccdParty?.primaryAddress);
  return cuiParty;
};

export const toCUIPartyRespondent = (ccdParty: CCDParty, ccdRespondent1: CCDRespondentLiPResponse): Party => {
  const cuiParty: Party =toCUIParty(ccdParty);
  cuiParty.partyDetails.correspondenceAddress = toCUIAddress(ccdRespondent1?.respondent1LiPCorrespondenceAddress);
  cuiParty.partyDetails.postToThisAddress = cuiParty.partyDetails.correspondenceAddress ? YesNo.YES : YesNo.NO;
  cuiParty.partyDetails.contactPerson = ccdRespondent1?.respondent1LiPContactPerson;
  return cuiParty;
};
