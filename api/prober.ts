import type { VercelRequest, VercelResponse } from "@vercel/node";
import { _TypedDataEncoder } from "@ethersproject/hash";
import { getContractMetadata, probeContract } from "../src/contractProber";
import { provider } from "../src/provider";

type ContractProberParams = {
  address: string;
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method === "OPTIONS") {
    return response.status(200).json({
      body: "OK",
    });
  }
  const { address } = request.query as ContractProberParams;
  response.setHeader("Cache-Control", "s-maxage=86400");

  try {
    const contractType = await probeContract(address, provider);
    const contractMetaData = await getContractMetadata(
      address,
      contractType,
      provider
    );

    return response.status(200).json(contractMetaData);
  } catch (error) {
    if (error instanceof Error) {
      return response.status(500).send(error.message);
    }
    return response.status(500);
  }
}
