export * from '../../../shared/types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface LocalDeviceSettings {
  audioInputId?: string;
  audioOutputId?: string;
  videoInputId?: string;
  noiseSuppression: boolean;
  echoCancellation: boolean;
}
