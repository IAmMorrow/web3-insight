import { BigNumber } from "ethers";
import { ContractType } from "../../types/ContractType";
import { TracerCall } from "../../types/Tracer";

export type NativeTransfer = {
  standard: ContractType.NATIVE,
  type: "Transfer",
  from: string,
  to: string,
  amount: string,
}

export type NativePredictedImpact = NativeTransfer;

export const handleNATIVE = (call: TracerCall) => {
  const predictedImpacts: NativePredictedImpact[] = [];

  const value = BigNumber.from(call.value);

  if (!value.isZero()) {
    predictedImpacts.push({
      standard: ContractType.NATIVE,
      type: "Transfer",
      from: call.from.toLowerCase(),
      to: call.to.toLowerCase(),
      amount: value.toString(),
    })
  }

  return predictedImpacts;
};

export type NATIVEBalanceChange = {
  [ownerAddress: string]: BigNumber
}

export const computeNATIVEBalanceChange = (state: NATIVEBalanceChange = {}, predictedImpact: NativePredictedImpact) => {
  if (!state[predictedImpact.from]) {
    state[predictedImpact.from] = BigNumber.from(0);
  }
  state[predictedImpact.from] = state[predictedImpact.from].sub(predictedImpact.amount)

  if (!state[predictedImpact.to]) {
    state[predictedImpact.to] = BigNumber.from(0);
  }
  state[predictedImpact.to] = state[predictedImpact.to].add(predictedImpact.amount)

  return state;
}
