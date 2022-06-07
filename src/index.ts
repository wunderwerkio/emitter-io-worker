import * as emitter from 'emitter-io';
import {
  ConnectMessage,
  DisconnectMessage,
  Message,
  StartMessage,
  SubscribeMessage,
  UnsubscribeMessage,
  OfflineMessage,
  ErrorMessage,
  EmitterMessage,
  KeygenMessage,
  PublishMessage,
  PresenceMessage,
} from './types';

export * from './types';

let client: emitter.Emitter | null = null;

const sendBack = (message: Message) => {
  self.postMessage(message);
};

const onStart = (message: StartMessage) => {
  const { host, port, secure, uid } = message.payload;

  if (!client) {
    client = emitter.connect({
      host,
      port,
      secure,
      username: uid,
    });

    client.on('connect', () => {
      sendBack({
        type: 'connect',
      } as ConnectMessage);
    });

    client.on('disconnect', () => {
      sendBack({
        type: 'disconnect',
      } as DisconnectMessage);
    });

    client.on('offline', () => {
      sendBack({
        type: 'offline',
      } as OfflineMessage);
    });

    client.on('error', (error) => {
      sendBack({
        type: 'error',
        payload: {
          error,
        },
      } as ErrorMessage);
    });

    client.on('message', (message: emitter.EmitterMessage) => {
      sendBack({
        type: 'message',
        payload: {
          channel: message.channel,
          message: message.asString(),
        },
      } as EmitterMessage);
    });
  }
};

const onSubscribe = (message: SubscribeMessage) => {
  if (!client) {
    console.error('Cannot subscribe to channel: not connected!');
    return;
  }

  const { key, channel } = message.payload;

  client.subscribe({
    key,
    channel,
  });
};

const onUnsubscribe = (message: UnsubscribeMessage) => {
  if (!client) {
    console.error('Cannot unsubscribe from channel: not connected!');
    return;
  }

  const { key, channel } = message.payload;

  client.unsubscribe({
    key,
    channel,
  });
};

const onKeygen = (message: KeygenMessage) => {
  if (!client) {
    console.error('Cannot generate key: not connected!');
    return;
  }

  const { key, channel, permissions, ttl } = message.payload;

  client.keygen({
    key,
    channel,
    type: permissions,
    ttl,
  });
};

const onPublish = (message: PublishMessage) => {
  if (!client) {
    console.error('Cannot publish: not connected!');
    return;
  }

  const { key, channel, message: messageToSend, me, ttl } = message.payload;

  client.publish({
    key,
    channel,
    message: messageToSend,
    me,
    ttl,
  });
};

const onMe = () => {
  if (!client) {
    console.error('Cannot request connection info: not connected!');
    return;
  }

  client.me();
};

const onPresence = (message: PresenceMessage) => {
  if (!client) {
    console.error('Cannot request presence information: not connected!');
    return;
  }

  const { key, channel, status, changes } = message.payload;

  client.presence({
    key,
    channel,
    status,
    changes,
  });
};

self.addEventListener('message', (msg: MessageEvent) => {
  const data = msg.data as Message;

  switch (data.type) {
    case 'start':
      onStart(data);
      break;

    case 'subscribe':
      onSubscribe(data);
      break;

    case 'unsubscribe':
      onUnsubscribe(data);
      break;

    case 'keygen':
      onKeygen(data);
      break;

    case 'publish':
      onPublish(data);
      break;

    case 'me':
      onMe();
      break;

    case 'presence':
      onPresence(data);
      break;

    default:
      console.warn('EmitterWorker: Unknown message type', data.type);
      break;
  }
});
