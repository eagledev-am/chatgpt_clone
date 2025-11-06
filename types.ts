
export type Mode = 'chat' | 'image';

export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: string;
}
