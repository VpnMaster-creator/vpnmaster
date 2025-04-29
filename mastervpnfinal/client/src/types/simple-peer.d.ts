declare module 'simple-peer' {
  interface SimplePeerOptions {
    initiator?: boolean;
    trickle?: boolean;
    stream?: MediaStream;
    objectMode?: boolean;
    sdpTransform?: (sdp: string) => string;
    config?: RTCConfiguration;
    channelConfig?: RTCDataChannelInit;
    wrtc?: any;
  }

  interface Instance {
    signal(data: any): void;
    send(data: any): void;
    on(event: string, callback: Function): void;
    destroy(): void;
  }

  function SimplePeer(opts?: SimplePeerOptions): Instance;
  export = SimplePeer;
}