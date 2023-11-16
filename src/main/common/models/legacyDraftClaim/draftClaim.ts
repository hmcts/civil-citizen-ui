import {DashboardClaimantItem} from '../dashboard/dashboardItem';

export interface OcmcDraftData {
  data: DraftOcmcClaim[]
}

export interface DraftOcmcClaim {
  id?: string;
  document?: DraftClaimDetails;
}

export interface DraftClaimDetails {
  claimant?: OcmcParty;
  defendant?: OcmcParty;
}

export interface OcmcParty {
  partyDetails?: PartyDetails;
}

export interface PartyDetails {
  name: string;
}

export function draftOcmcClaimToDashboardItem(ocmcClaim?: DraftOcmcClaim): DashboardClaimantItem | undefined {
  if (ocmcClaim?.id && ocmcClaim?.document) {
    const draftClaim = new DashboardClaimantItem();
    draftClaim.claimId = 'draft';
    draftClaim.draft = true;
    draftClaim.ocmc = true;
    draftClaim.claimNumber = 'PAGES.DASHBOARD.DRAFT_CLAIM_NUMBER';
    draftClaim.claimantName = ocmcClaim.document.claimant?.partyDetails?.name;
    draftClaim.defendantName = ocmcClaim.document.defendant?.partyDetails?.name;
    return draftClaim;
  }
  return undefined;
}
