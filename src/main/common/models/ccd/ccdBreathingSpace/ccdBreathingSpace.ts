export interface ccdBreathingSpace {
  event?: string,
  eventDescription?: string,
  expectedEnd?: string,
  reference?: string,
  start?: string,
  type?: LiftType,
}

enum LiftType {
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  STANDARD = 'STANDARD',
}
