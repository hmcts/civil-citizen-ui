export interface AhrefButtonComponent {
  text?: string;
  href?: string;
  style?: string;
}

export interface ComponentDetailItems {
  title?: string;
  subtitle?: string;
  content?: string[];
  button?: AhrefButtonComponent;
  formattedValues?: string[];
  hasDivider?: boolean ;
}
