export class CourtNameExtractor {
  static extractCourtName(location: string): string {
    const courtName = location.split('-', 1);
    return courtName[0].trim();
  }
}
