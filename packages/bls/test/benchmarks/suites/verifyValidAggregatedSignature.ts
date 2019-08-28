import {BenchSuite} from "@chainsafe/benchmark-utils";
import {aggregateSignatures, verifyMultiple} from "../../../src";


// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace global {
  export let domain: Buffer;
  export let messages: Buffer[];
  export let signature: Buffer;
  export let publicKeys: Buffer[];
  export let verify: Function;
}

// @ts-ignore
global.require = require;

global.domain = Buffer.alloc(8);
global.verify = verifyMultiple;

export function verifyValidAggregatedSignature(dir: string): BenchSuite {

  // Set the function test
  const FUNCTION_NAME = "verifyValidAggregatedSignature"; // PLEASE FILL THIS OUT

  const verifyValidAggregatedSignature = function (): void {
    console.log(global.verify(global.publicKeys, global.messages, global.signature, global.domain));
  };

  return {
    testFunctions: [verifyValidAggregatedSignature],
    setup: function() {
      const {Keypair, aggregateSignatures} = require("../../../src");
      const {sha256} = require('js-sha256');
      const signatures = [];
      global.publicKeys = [];
      const message = Buffer.from(sha256.arrayBuffer(Math.random().toString(36)));
      for(let i = 0; i < 128; i++) {
        const keypair = Keypair.generate();
        global.publicKeys.push(keypair.publicKey.toBytesCompressed());
        signatures.push(keypair.privateKey.signMessage(Buffer.from(message), global.domain).toBytesCompressed());
      }
      global.messages = global.publicKeys.map(() => message);
      global.signature = aggregateSignatures(signatures);
      global.publicKeys.map(() => message);
    },
    file: dir + FUNCTION_NAME + ".txt",
    // profile: true,
    name: FUNCTION_NAME,
  };
}