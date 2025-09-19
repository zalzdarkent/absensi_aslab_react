// RFID Mode Types
export type RfidMode = 'registration' | 'check_in' | 'check_out';

export interface RfidModeResponse {
  mode: RfidMode;
}

export interface RfidModeSetRequest {
  mode: RfidMode;
}

export interface RfidModeSetResponse {
  success: boolean;
  mode: RfidMode;
  message: string;
}