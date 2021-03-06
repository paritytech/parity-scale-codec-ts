import { Codec, createCodec } from "../common.ts";
import { compact } from "../compact/codec.ts";
import { tuple } from "../mod.ts";

export function iterable<T, I extends Iterable<T>>(
  { $el, calcLength, rehydrate }: {
    $el: Codec<T>;
    calcLength: (iterable: I) => number;
    rehydrate: (iterable: Iterable<T>) => I;
  },
): Codec<I> {
  return createCodec({
    _metadata: [iterable, { $el, calcLength, rehydrate }],
    _staticSize: compact._staticSize,
    _encode(buffer, value) {
      const length = calcLength(value);
      compact._encode(buffer, length);
      buffer.pushAlloc(length * $el._staticSize);
      let i = 0;
      for (const el of value) {
        $el._encode(buffer, el);
        i++;
      }
      if (i !== length) throw new Error("Incorrect length returned by calcLength");
      buffer.popAlloc();
    },
    _decode(buffer) {
      const length = compact._decode(buffer);
      let done = false;
      const value = rehydrate(function*() {
        for (let i = 0; i < length; i++) {
          yield $el._decode(buffer);
        }
        done = true;
      }());
      if (!done) throw new Error("Iterable passed to rehydrate must be immediately exhausted");
      return value;
    },
  });
}

export function set<T>($el: Codec<T>) {
  return iterable<T, Set<T>>({
    $el,
    calcLength: (set) => set.size,
    rehydrate: (values) => new Set(values),
  });
}

export function map<K, V>($key: Codec<K>, $value: Codec<V>) {
  return iterable<[K, V], Map<K, V>>({
    $el: tuple($key, $value),
    calcLength: (map) => map.size,
    rehydrate: (values) => new Map(values),
  });
}
