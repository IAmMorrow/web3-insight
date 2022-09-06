import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Transaction } from "ethers";
import { probeContract } from "../../src/contractProber";
import { provider } from "../../src/provider";
import { getTracerFunc } from "../../src/tracer";
import { getPredictedImpactForEvents, getPredictedImpactForTransaction, getTransactionEvents } from "../../src/transaction";
import { PredictedImpact } from "../../src/types/PredictedImpact";
import { DebugTraceCallResult } from "../../src/types/Tracer";

type CheckTransactionParams = {
  transaction: Transaction;
  rawtx: string;
};

type CheckTransactionResult = {
  events: PredictedImpact[];
  balanceChanges: string;
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { transaction } = request.body as CheckTransactionParams;

  try {
    const events = await getTransactionEvents(transaction);
    console.log("EVENTS: ", events)
    const predictedImpacts = await getPredictedImpactForEvents(events);

    return response.status(200).json(predictedImpacts.flat());
  } catch (error) {
    if (error instanceof Error) {
      return response.status(500).send(error);
    }
    return response.status(500);
  }
}
