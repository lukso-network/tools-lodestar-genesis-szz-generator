import {IChainForkConfig} from "@lodestar/config";
import {BeaconStateAllForks} from "@lodestar/state-transition";
import {phase0, ssz} from "@lodestar/types";
import type {SecretKey} from "@chainsafe/bls/types";
import {IBeaconDb} from "../../db/index.js";
import {deterministicDeposits, interopDeposits} from "./interop/deposits.js";
import {getInteropState, InteropStateOpts} from "./interop/state.js";
import {DepositTree} from "../../db/repositories/depositDataRoot";

export function initDevState(
  config: IChainForkConfig,
  validatorCount: number,
  interopStateOpts: InteropStateOpts
): {deposits: phase0.Deposit[]; state: BeaconStateAllForks} {
  const deposits = interopDeposits(
    config,
    ssz.phase0.DepositDataRootList.defaultViewDU(),
    validatorCount,
    interopStateOpts
  );
  const state = getInteropState(config, interopStateOpts, deposits);
  return {deposits, state};
}

export function initDeterministicStateFromDepositData(
    config: IChainForkConfig,
    deposits: phase0.Deposit[],
    interopStateOpts: InteropStateOpts,
    fullDepositDataRootList: DepositTree,
): {deposits: phase0.Deposit[]; state: BeaconStateAllForks} {

  const state = getInteropState(config, interopStateOpts, deposits, fullDepositDataRootList);

  return {deposits, state};
}

export async function writeDeposits(db: IBeaconDb, deposits: phase0.Deposit[]): Promise<void> {
  for (let i = 0; i < deposits.length; i++) {
    await Promise.all([
      db.depositEvent.put(i, {
        blockNumber: i,
        index: i,
        depositData: deposits[i].data,
      }),
      db.depositDataRoot.put(i, ssz.phase0.DepositData.hashTreeRoot(deposits[i].data)),
    ]);
  }
}
