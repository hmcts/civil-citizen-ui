import { DashboardDefendantItem } from './dashboardItem';

export interface DashboardDefendantResponse {
    claims: DashboardDefendantItem[]
    totalPages: number
}