export type TypeOrArray<T> = T | T[];
export type JsonLiteral = {
  [key: string]:
    | TypeOrArray<JsonLiteral>
    | TypeOrArray<number>
    | TypeOrArray<string>
    | TypeOrArray<boolean>
    | TypeOrArray<null>;
};
export type Json = TypeOrArray<JsonLiteral>;

export interface WatcherEvent {
  type: string;
  name: string;
  sessionId: string;
  path: string;
  timestamp: number;
  properties: JsonLiteral;
  appId: string;
}
