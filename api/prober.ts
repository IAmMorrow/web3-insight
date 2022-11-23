import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { explorerProber } from "../src/contractProber/explorerProber";

const schemaContractProberParams = z.object({
    addresses: z.array(z.string()),
});

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    if (request.method === "OPTIONS") {
        return response.status(200).json({
            body: "OK",
        });
    }

    response.setHeader("Cache-Control", "s-maxage=86400");

    try {
        const safeParseResult = schemaContractProberParams.safeParse(request.body);

        if (!safeParseResult.success) {
            throw new Error(`Invalid params: ${safeParseResult.error.message}`);
        }

        const { addresses } = safeParseResult.data;
        const results = await explorerProber(addresses);

        return response.status(200).json(results);
    } catch (error) {
        if (error instanceof Error) {
            return response.status(500).send(error.message);
        }
        return response.status(500);
    }
}
