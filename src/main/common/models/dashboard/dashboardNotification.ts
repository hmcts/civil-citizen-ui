export class DashboardNotification {
  titleEn: string;
  titleCy: string;
  descriptionEn: string;
  descriptionCy: string;

  constructor(descriptionEn: string,descriptionCy: string) {
    this.descriptionEn = descriptionEn;
    this.descriptionCy = descriptionCy;
  }
}
