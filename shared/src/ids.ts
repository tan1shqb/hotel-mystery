declare const brand: unique symbol;

/** Nominal string types so a PlayerId can't be passed where a NodeId is expected. */
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type PlayerId = Brand<string, 'PlayerId'>;
export type NodeId = Brand<string, 'NodeId'>;
export type RoomCode = Brand<string, 'RoomCode'>;
export type StationId = Brand<string, 'StationId'>;
export type WardrobeId = Brand<string, 'WardrobeId'>;
