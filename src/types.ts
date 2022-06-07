// Payloads.
export interface EmitterMessagePayload {
  channel: string;
  message: string;
}

export interface ErrorPayload {
  error: unknown;
}

export interface MePayload {
  id: string;
}

export interface KeygenSucessPayload {
  status: number;
  key: string;
  channel: string;
}

export interface KeygenErrorPayload {
  status: number;
  message: string;
}

export type KeygenPayload = KeygenSucessPayload | KeygenErrorPayload;

export interface PresenceStatusPayload {
  channel: string;
  event: 'status';
  time: number;
  who: [
    {
      id: string;
      username: string;
    }
  ];
}

export interface PresenceUpdatePayload {
  channel: string;
  event: 'subscribe' | 'unsubscribe';
  time: number;
  who: {
    id: string;
    username: string;
  };
}

export type PresencePayload = PresenceStatusPayload | PresenceUpdatePayload;

// Requests.
export interface StartRequest {
  type: 'start';
  payload: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
  };
}

export interface SubscribeRequest {
  type: 'subscribe';
  payload: {
    key: string;
    channel: string;
  };
}

export interface UnsubscribeRequest {
  type: 'unsubscribe';
  payload: {
    key: string;
    channel: string;
  };
}

export interface KeygenRequest {
  type: 'keygen';
  payload: {
    key: string;
    channel: string;
    permissions: string;
    ttl: number;
  };
}

export interface PublishRequest {
  type: 'publish';
  payload: {
    key: string;
    channel: string;
    message: string;
    me?: boolean;
    ttl?: number;
  };
}

export interface MeRequest {
  type: 'me';
}

export interface PresenceRequest {
  type: 'presence';
  payload: {
    key: string;
    channel: string;
    status?: boolean;
    changes?: boolean;
  };
}

export type EmitterRequest =
  | StartRequest
  | SubscribeRequest
  | UnsubscribeRequest
  | KeygenRequest
  | PublishRequest
  | MeRequest
  | PresenceRequest;

// Client messages.
export interface ConnectMessage {
  type: 'connect';
}

export interface DisconnectMessage {
  type: 'disconnect';
}

export interface OfflineMessage {
  type: 'offline';
}

export interface PresenceStatusMessage {
  type: 'presence';
  payload: PresenceStatusPayload;
}

export interface PresenceUpdateMessage {
  type: 'presence';
  payload: PresenceUpdatePayload;
}

export type PresenceMessage = PresenceStatusMessage | PresenceUpdateMessage;

export interface KeygenErrorMessage {
  type: 'keygen';
  payload: KeygenErrorPayload;
}

export interface KeygenSuccessMessage {
  type: 'keygen';
  payload: KeygenSucessPayload;
}

export type KeygenMessage = KeygenSuccessMessage | KeygenErrorMessage;

export interface MeMessage {
  type: 'me';
  payload: MePayload;
}

export interface ErrorMessage {
  type: 'error';
  payload: ErrorPayload;
}

export interface EmitterMessage {
  type: 'message';
  payload: EmitterMessagePayload;
}

export type Message =
  | ConnectMessage
  | DisconnectMessage
  | OfflineMessage
  | PresenceMessage
  | MeMessage
  | KeygenMessage
  | ErrorMessage
  | EmitterMessage;
