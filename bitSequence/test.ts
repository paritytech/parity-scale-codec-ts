import { assertEquals } from "std/testing/asserts.ts";
import * as $ from "../mod.ts";
import { testCodec } from "../test-util.ts";

Deno.test("BitSequence", () => {
  const sequence = new $.BitSequence(100);
  for (let i = 0; i < 100; i++) {
    sequence[i] = Math.sqrt(i) === (Math.sqrt(i) | 0);
  }
  assertEquals(sequence[0], true);
  assertEquals(sequence[12], false);
  assertEquals(sequence[49], true);
  assertEquals(sequence[-1], undefined);
  assertEquals(sequence[1.5], undefined);
  assertEquals(sequence[121], undefined);
});

testCodec("bitSequence", $.bitSequence, [
  $.BitSequence.from([]),
  $.BitSequence.from([0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1]),
]);
