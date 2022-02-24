export const AGE_THRESHOLD = 17;

export class AgeEligibilityVerification {
  public static isOverEighteen(dob: Date) {
    return AgeEligibilityVerification.getAge(dob) > AGE_THRESHOLD;
  }

  private static getAge(dob: Date) {
    const today = new Date();
    today.setHours(0, 0, 0);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
      age = age - 1;
    }
    return age;
  }
}
