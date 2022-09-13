import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Transaction } from "ethers";
import { probeContract } from "../../../src/contractProber";
import { provider } from "../../../src/provider";
import { getTracerFunc } from "../../../src/tracer";
import { generateBalanceChanges, getPredictedImpactForEvents, getPredictedImpactForTransaction, getTransactionEvents } from "../../../src/transaction";
import { BalanceChange } from "../../../src/types/BalanceChange";
import { PredictedImpact } from "../../../src/types/PredictedImpact";
import { DebugTraceCallResult } from "../../../src/types/Tracer";

type CheckTransactionParams = {
  transaction: Transaction;
  rawtx: string;
};

type CheckTransactionResult = {
  events: PredictedImpact[];
  balanceChanges: BalanceChange[];
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { transaction } = request.body as CheckTransactionParams;

  try {
    const events = await getTransactionEvents(transaction);
    console.log("Event count: ", events.length)
    const predictedImpacts = await getPredictedImpactForEvents(events);

    const balanceChanges = generateBalanceChanges(transaction, predictedImpacts);

    const result: CheckTransactionResult = {
      events: predictedImpacts.flat(),
      balanceChanges,
    }

    return response.status(200).json(result);
  } catch (error) {
    console.error(error)
    if (error instanceof Error) {
      return response.status(500).send(error);
    }
    return response.status(500);
  }
}
