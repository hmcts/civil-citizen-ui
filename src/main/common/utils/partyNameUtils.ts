import {Party} from 'models/party';
import {PartyType} from 'models/partyType';

export function getPartyName(party: Party): string {
  if (party?.type == PartyType.INDIVIDUAL) {
    return this.getIndividualPartyName(party);
  } else if (party?.type == PartyType.SOLE_TRADER) {
    return String.raw`${this.getSoeTraderPartyName(party)}`;
  }
  return party?.partyDetails?.partyName;
}

export function getSoeTraderPartyName(party: Party): string {
  const SOLE_TRADER_TRADING_AS_PREFIX = ' T/A ';
  const partyName = this.getIndividualPartyName(party);
  if (party.partyDetails?.soleTraderTradingAs) {
    return `${partyName} ${SOLE_TRADER_TRADING_AS_PREFIX} ${party.partyDetails?.soleTraderTradingAs}` ;
  }
  return partyName;
}
export function getIndividualPartyName(party: Party): string {
  if (party.partyDetails?.title) {
    return `${party.partyDetails?.title} ${party.partyDetails?.firstName} ${party.partyDetails?.lastName}`;
  } else {
    return `${party.partyDetails?.firstName} ${party.partyDetails?.lastName}`;
  }
}
