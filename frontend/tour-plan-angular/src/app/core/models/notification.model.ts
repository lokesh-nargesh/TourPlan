export interface Notification {
  id?: number;
  userId: number;
  title: string;
  message: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  status?: string;
  createdAt?: string;
}
