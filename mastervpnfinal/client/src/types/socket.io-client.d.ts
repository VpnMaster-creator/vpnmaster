declare module 'socket.io-client' {
  function io(url: string, opts?: any): Socket;
  
  interface Socket {
    on(event: string, callback: Function): Socket;
    emit(event: string, ...args: any[]): Socket;
    connect(): void;
    disconnect(): void;
  }
  
  export = io;
}