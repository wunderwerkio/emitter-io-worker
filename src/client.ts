import { KeygenMessage, MeMessage, Message, PresenceMessage, PublishMessage, StartMessage, SubscribeMessage, UnsubscribeMessage } from "./types";

export * from './types';

type ConnectListener = () => void;
type DisconnectListener = () => void;
type OfflineListener = () => void;
type ErrorListener = (error: unknown) => void;
type MessageListener = (payload: { channel: string; message: string; }) => void;

class EmitterWorker {
  protected worker: Worker;

  protected connectListeners: ConnectListener[] = [];
  protected disconnectListeners: DisconnectListener[] = [];
  protected offlineListeners: OfflineListener[] = [];
  protected errorListeners: ErrorListener[] = [];
  protected messageListeners: MessageListener[] = [];

  constructor(scriptUrl: string) {
    this.worker = new Worker(scriptUrl);

    this.listen();
  }

  public connect(host: string, port: number, secure: boolean, username?: string) {
    this.worker.postMessage({
      type: 'start',
      payload: {
        host,
        port,
        secure,
        username,
      }
    } as StartMessage)
  }

  public on(type: 'connect', listener: ConnectListener): void;
  public on(type: 'disconnect', listener: DisconnectListener): void;
  public on(type: 'offline', listener: OfflineListener): void;
  public on(type: 'error', listener: ErrorListener): void;
  public on(type: 'message', listener: MessageListener): void;
  public on(type: any, listener: Function): void {
    switch (type) {
      case 'connect':
        this.connectListeners.push(listener as ConnectListener);
        break;
      case 'disconnect':
        this.disconnectListeners.push(listener as DisconnectListener);
        break;
      case 'offline':
        this.offlineListeners.push(listener as OfflineListener);
        break;
      case 'error':
        this.errorListeners.push(listener as ErrorListener);
        break;
      case 'message':
        this.messageListeners.push(listener as MessageListener);
        break;
    }
  }

  public off(type: 'connect', listener: ConnectListener): void;
  public off(type: 'disconnect', listener: DisconnectListener): void;
  public off(type: 'offline', listener: OfflineListener): void;
  public off(type: 'error', listener: ErrorListener): void;
  public off(type: 'message', listener: MessageListener): void;
  public off(type: string, listener: Function): void {
    switch (type) {
      case 'connect':
        this.connectListeners = this.connectListeners.filter(l => l !== listener);
        break;
      case 'disconnect':
        this.disconnectListeners = this.disconnectListeners.filter(l => l !== listener);
        break;
      case 'offline':
        this.offlineListeners = this.offlineListeners.filter(l => l !== listener);
        break;
      case 'error':
        this.errorListeners = this.errorListeners.filter(l => l !== listener);
        break;
      case 'message':
        this.messageListeners = this.messageListeners.filter(l => l !== listener);
        break;
    }
  }

  public subscribe(key: string, channel: string) {
    this.worker.postMessage({
      type: 'subscribe',
      payload: {
        key,
        channel,
      },
    } as SubscribeMessage);
  }

  public unsubscribe(key: string, channel: string) {
    this.worker.postMessage({
      type: 'unsubscribe',
      payload: {
        key,
        channel,
      },
    } as UnsubscribeMessage);
  }

  public keygen(key: string, channel: string, permissions: string, ttl: number) {
    this.worker.postMessage({
      type: 'keygen',
      payload: {
        key,
        channel,
        permissions,
        ttl,
      },
    } as KeygenMessage);
  }

  public publish(key: string, channel: string, message: string, me?: boolean, ttl?: number) {
    this.worker.postMessage({
      type: 'publish',
      payload: {
        key,
        channel,
        message,
        me,
        ttl,
      },
    } as PublishMessage);
  }

  public me() {
    this.worker.postMessage({
      type: 'me',
    } as MeMessage);
  }

  public presence(key: string, channel: string, status?: boolean, changes?: boolean) {
    this.worker.postMessage({
      type: 'presence',
      payload: {
        key,
        channel,
        status,
        changes,
      }
    } as PresenceMessage);
  }

  protected listen()  {
    this.worker.addEventListener('message', message => {
      const data = message.data as Message;

      switch (data.type) {
        case 'connect':
          for (const listener of this.connectListeners) {
            listener();
          }
          break;

        case 'disconnect':
          for (const listener of this.disconnectListeners) {
            listener();
          }
          break;

        case 'offline':
          for (const listener of this.offlineListeners) {
            listener();
          }
          break;

        case 'error':
          for (const listener of this.errorListeners) {
            listener(data.payload);
          }
          break;

        case 'message':
          for (const listener of this.messageListeners) {
            listener(data.payload);
          }
          break;
      }
    })
  }
}

export default EmitterWorker;
