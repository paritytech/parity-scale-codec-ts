import { createCodec } from "../common.ts";

/**
 * `Dummy`'s decoder returns a hard-coded JS value and DOES NOT encode or decode from any bytes.
 * @param value The native value corresponding to the generically-supplied codec
 * @returns A dummy codec with the patched signature of `E`
 */
export function dummy<T>(value: T) {
  return createCodec({
    _staticSize: 0,
    _encode() {},
    _decode() {
      return value;
    },
  });
}
