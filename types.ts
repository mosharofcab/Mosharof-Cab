
export enum DownloadFormat {
  PNG = 'PNG',
  PDF = 'PDF'
}

export interface QRConfig {
  value: string;
  fgColor: string;
  bgColor: string;
  size: number;
  level: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
}

export interface AIResult {
  suggestion: string;
  isSafe: boolean;
}
