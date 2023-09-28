import { DashboardClaimantItem, DashboardDefendantItem } from './dashboardItem';

export interface DashboardDefendantResponse {
    claims: DashboardDefendantItem[]
    totalPages: number
}

export interface DashboardClaimantResponse {
    claims: DashboardClaimantItem[]
    totalPages: number
}