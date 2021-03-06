import { Codec, createCodec } from "../common.ts";

export const bool: Codec<boolean> = createCodec({
  _metadata: null,
  _staticSize: 1,
  _encode(buffer, value) {
    buffer.array[buffer.index++] = +value;
  },
  _decode(buffer) {
    return !!buffer.array[buffer.index++]!;
  },
});
