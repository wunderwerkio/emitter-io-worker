// Main thread messages.
export interface StartMessage {
  type: 'start';
  payload: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
  };
}

export interface SubscribeMessage {
  type: 'subscribe';
  payload: {
    key: string;
    channel: string;
  };
}

export interface UnsubscribeMessage {
  type: 'unsubscribe';
  payload: {
    key: string;
    channel: string;
  };
}

export interface KeygenMessage {
  type: 'keygen';
  payload: {
    key: string;
    channel: string;
    permissions: string;
    ttl: number;
  };
}

export interface PublishMessage {
  type: 'publish';
  payload: {
    key: string;
    channel: string;
    message: string;
    me?: boolean;
    ttl?: number;
  };
}

export interface MeMessage {
  type: 'me';
}

export interface PresenceMessage {
  type: 'presence';
  payload: {
    key: string;
    channel: string;
    status?: boolean;
    changes?: boolean;
  };
}

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

export interface ErrorMessage {
  type: 'error';
  payload: {
    error: unknown;
  };
}

export interface EmitterMessage {
  type: 'message';
  payload: {
    channel: string;
    message: string;
  };
}

export type Message =
  | StartMessage
  | SubscribeMessage
  | UnsubscribeMessage
  | KeygenMessage
  | PublishMessage
  | MeMessage
  | PresenceMessage
  | ConnectMessage
  | DisconnectMessage
  | OfflineMessage
  | ErrorMessage
  | EmitterMessage;
