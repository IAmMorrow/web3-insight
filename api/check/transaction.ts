import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Transaction } from "ethers";
import { probeContract } from "../../src/contractProber";
import { provider } from "../../src/provider";
import { getTracerFunc } from "../../src/tracer";
import { getPredictedImpactForTransaction } from "../../src/transaction";
import { DebugTraceCallResult } from "../../src/types/Tracer";

type CheckTransactionParams = {
  transaction: Transaction;
  rawtx: string;
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { transaction } = request.body as CheckTransactionParams;

  try {
    const events = (await provider.send("debug_traceCall", [
      {
        from: transaction.from,
        to: transaction.to,
        data: transaction.data,
      },
      "latest",
      {
        tracer: getTracerFunc(),
      },
    ])) as DebugTraceCallResult[];

    const predictedImpacts = await Promise.all(
      events.map(async (event) => {
        const contractType = await probeContract(event.contract, provider);

        return getPredictedImpactForTransaction(contractType, event);
      })
    );

    return response.status(200).json(predictedImpacts.flat());
  } catch (error) {
    if (error instanceof Error) {
      return response.status(500).send(error.message);
    }
    return response.status(500);
  }
}
