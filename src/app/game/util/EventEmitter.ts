import mitt, { Emitter, EventType } from "mitt";

export abstract class EventEmitter<Events extends Record<EventType, unknown>> {
  protected emitter: Emitter<Events> = mitt();

  public on(type: keyof Events, handler: any) {
    // TODO: 型
    this.emitter.on(type, handler);
  }
}
