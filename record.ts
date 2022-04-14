import { Codec, Native } from "./common.ts";

export type Field<
  Key extends PropertyKey = PropertyKey,
  ValueCodec extends Codec = Codec,
> = [Key, ValueCodec];

export type Fields<T extends any[]> = T extends [] ? []
  : T extends [infer E, ...infer Rest] ? [[PropertyKey, Codec<E>], ...Fields<Rest>]
  : never;

export type NativeRecord<Fields extends Field[]> = Fields extends [] ? {}
  : Fields extends [Field<infer K, infer V>, ...infer Rest]
    ? { [_ in K]: Native<V> } & (Rest extends Field[] ? NativeRecord<Rest> : {})
  : never;

export class Record<
  Fields extends Field<EntryKey, EntryValueCodec>[],
  EntryKey extends PropertyKey = Fields[number][0],
  EntryValueCodec extends Codec = Fields[number][1],
> extends Codec<NativeRecord<Fields>> {
  constructor(...fields: Fields) {
    super(
      (value) => {
        return fields.reduce<number>((len, [key, fieldEncoder]) => {
          return len + fieldEncoder._s((value as any)[key]);
        }, 0);
      },
      (cursor, value) => {
        fields.forEach(([key, fieldEncoder]) => {
          fieldEncoder._e(cursor, (value as any)[key]);
        });
      },
      (cursor) => {
        return fields.reduce<Partial<NativeRecord<Fields>>>((acc, [key, fieldCodec]) => {
          return {
            ...acc,
            [key]: fieldCodec._d(cursor),
          };
        }, {}) as NativeRecord<Fields>;
      },
    );
  }
}
export const record = <
  Fields extends Field<EntryKey, EntryValueCodec>[],
  EntryKey extends PropertyKey,
  EntryValueCodec extends Codec,
>(...fields: Fields): Record<Fields> => {
  return new Record(...fields);
};
