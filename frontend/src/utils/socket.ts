import { EventEmitter } from "events";

export enum SocketEventNames {
  ALL_PLAYERS = "allPlayers",
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  GAME_FINISHED = "gameFinished",
  PLAYER_JOINED = "playerJoined",
  SCORE_UPDATE = "scoreUpdate",
  START_GAME = "startGame",
  START_GAME_COUNTDOWN = "startGameCountdown",
}

// Use REACT_APP_SOCKET_URL or ws:/localhost:8080 as the SOCKET_BASE
const SOCKET_BASE =
  import.meta.env.REACT_APP_SOCKET_URL || "ws:/localhost:8080";

/**
 * Socket is a wrapper around the WebSocket API that provides a simple event-based interface.
 * It allows you to listen for events and emit messages.
 */
export default class Socket {
  protected webSocket: WebSocket;
  protected eventEmitter: EventEmitter;

  /**
   * Create a new Socket instance.
   * @param url - The URL of the websocket server.
   * @example
   * const socket = new Socket("ws://localhost:8080");
   * socket.on('connect', () => console.log("Connected to server"));
   * socket.on('disconnect', () => console.log("Disconnected from server"));
   * socket.on('message', (data) => console.log("Received message: ", data));
   * socket.emit('message', "Hello server!");
   * socket.off('message');
   * socket.close();
   */
  constructor(url: string) {
    this.webSocket = new WebSocket(`${SOCKET_BASE}${url}`);
    this.eventEmitter = new EventEmitter();

    this.webSocket.onmessage = this.message.bind(this);
    this.webSocket.onopen = this.open.bind(this);
    this.webSocket.onclose = this.close.bind(this);
    this.webSocket.onerror = this.error.bind(this);
  }

  // on adds a function as an event consumer/listener.
  on<T>(name: SocketEventNames, fn: (data: T) => void) {
    this.eventEmitter.on(name, fn);
  }

  // off removes a function as an event consumer/listener.
  off(name: SocketEventNames, fn: () => void) {
    this.eventEmitter.removeListener(name, fn);
  }

  // close closes the websocket connection.
  closeConnection() {
    this.webSocket.close();
  }

  // open handles a connection to a websocket.
  private open() {
    this.eventEmitter.emit("connect");
  }

  // close to handles a disconnection from a websocket.
  private close() {
    this.eventEmitter.emit("disconnect");
  }

  // error handles an error on a websocket.
  private error(error: Event) {
    console.info("Socket error: ", error);
  }

  emit(eventType: SocketEventNames, id: string, data: any) {
    this.webSocket.send(
      JSON.stringify({ type: eventType, id, content: JSON.stringify(data) })
    );
  }

  // emit sends a message on a websocket.
  private message(event: MessageEvent<any>) {
    try {
      const message = JSON.parse(event.data);
      const data = JSON.parse(message.content || {});
      this.eventEmitter.emit(message.type, data);
    } catch (err) {
      this.eventEmitter.emit("error", err);
      console.log(Date().toString() + ": ", err);
    }
  }
}
