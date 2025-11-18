export type Mode = 'chat' | 'image' | 'code';

export interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64 encoded
  };
  // For UI rendering of file attachments that are not images
  fileName?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: Part[];
}