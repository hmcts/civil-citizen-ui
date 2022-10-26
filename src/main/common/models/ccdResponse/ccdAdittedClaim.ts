export interface AdmittedClaim {
    howMuchWasPaid?: string,
    howWasThisAmountPaid?: string, // TODO: expect enum "CREDIT_CARD", ...?
    howWasThisAmountPaidOther?: string,
    whenWasThisAmountPaid?: string,
}
