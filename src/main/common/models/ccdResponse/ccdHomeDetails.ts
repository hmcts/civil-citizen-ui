export interface CCDHomeDetails {
  type?: CCDHomeType,
  typeOtherDetails?: string,
}

export enum CCDHomeType{
  OWNED_HOME = 'OWNED_HOME',
  JOINTLY_OWNED_HOME = 'JOINTLY_OWNED_HOME',
  PRIVATE_RENTAL = 'PRIVATE_RENTAL',
  ASSOCIATION_HOME = 'ASSOCIATION_HOME',
  OTHER = 'OTHER',
}
