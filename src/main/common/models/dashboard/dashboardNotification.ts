export class DashboardNotification {
  id: string;
  titleEn: string;
  titleCy: string;
  descriptionEn: string;
  descriptionCy: string;

  constructor(id: string, titleEn: string, titleCy:string, descriptionEn: string, descriptionCy: string) {
    this.id = id;
    this.titleEn = titleEn;
    this.titleCy = titleCy;
    this.descriptionEn = descriptionEn;
    this.descriptionCy = descriptionCy;
  }
}
