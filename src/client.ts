import {
  EmitterMessagePayload,
  ErrorPayload,
  KeygenPayload,
  KeygenRequest,
  MePayload,
  MeRequest,
  Message,
  PingRequest,
  PresencePayload,
  PresenceRequest,
  PublishRequest,
  StartRequest,
  SubscribeRequest,
  UnsubscribeRequest,
} from './types';

export interface ListenerArgsMap {
  connect: unknown;
  disconnect: unknown;
  message: EmitterMessagePayload;
  offline: unknown;
  error: ErrorPayload;
  keygen: KeygenPayload;
  presence: PresencePayload;
  me: MePayload;
}

export * from './types';

class EmitterWorker {
  protected worker: Worker;

  protected listeners: { [key: string]: Function[] } = {};

  protected unansweredPings = 0;

  constructor(scriptUrl: string) {
    this.worker = new Worker(scriptUrl);

    this.listen();
  }

  public connect(host: string, port: number, secure: boolean, username?: string) {
    (window as any)._worker = this.worker;
    this.worker.postMessage({
      type: 'start',
      payload: {
        host,
        port,
        secure,
        username,
      },
    } as StartRequest);

    // Call disconnect listeners if worker is terminated or does not respond.
    const interval = setInterval(() => {
      this.worker.postMessage({
        type: 'ping',
      } as PingRequest);

      this.unansweredPings++;

      if (this.unansweredPings > 5) {
        clearInterval(interval);
        this.worker.terminate();

        const listeners = this.listeners['disconnect'];
        if (listeners) {
          for (const listener of listeners) {
            listener();
          }
        }
      }
    }, 1000);
  }

  public on<K extends keyof ListenerArgsMap>(type: K, listener: (args: ListenerArgsMap[K]) => void) {
    const key = type as string;

    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }

    if (!this.listeners[key].includes(listener)) {
      this.listeners[key].push(listener);
    }
  }

  public off<K extends keyof ListenerArgsMap>(type: K, listener: (args: ListenerArgsMap[K]) => void) {
    const key = type as string;

    if (!this.listeners[key]) return;

    this.listeners[key] = this.listeners[key].filter((l) => l !== listener);
  }

  public subscribe(key: string, channel: string) {
    this.worker.postMessage({
      type: 'subscribe',
      payload: {
        key,
        channel,
      },
    } as SubscribeRequest);
  }

  public unsubscribe(key: string, channel: string) {
    this.worker.postMessage({
      type: 'unsubscribe',
      payload: {
        key,
        channel,
      },
    } as UnsubscribeRequest);
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
    } as KeygenRequest);
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
    } as PublishRequest);
  }

  public me() {
    this.worker.postMessage({
      type: 'me',
    } as MeRequest);
  }

  public presence(key: string, channel: string, status?: boolean, changes?: boolean) {
    this.worker.postMessage({
      type: 'presence',
      payload: {
        key,
        channel,
        status,
        changes,
      },
    } as PresenceRequest);
  }

  protected listen() {
    this.worker.addEventListener('message', (message) => {
      const data = message.data as Message;

      if (data.type === 'pong') {
        this.unansweredPings = 0;
        return;
      }

      let args;
      switch (data.type) {
        case 'message':
        case 'keygen':
        case 'me':
        case 'presence':
        case 'error':
          args = data.payload;
      }

      const listeners = this.listeners[data.type];
      if (listeners) {
        for (const listener of listeners) {
          listener(args);
        }
      }
    });
  }
}

export default EmitterWorker;
