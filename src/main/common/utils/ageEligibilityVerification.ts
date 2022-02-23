export const AGE_THRESHOLD = 17;
export class AgeEligibilityVerification {
  public static isOverEighteen(dob: Date) {
    return AgeEligibilityVerification.getAge(dob) > AGE_THRESHOLD;
  }

  private static getAge(dob: Date){
    const timeDiff = Math.abs(Date.now() - dob.getTime());
    return Math.floor((timeDiff / (1000 * 3600 * 24))/365.25);
  }
}
