import { ethers } from "ethers";

const url = process.env.NODE_URL as string;

export const provider = new ethers.providers.JsonRpcProvider(
    {
        url,
        headers: {
            Authorization: `Basic ${process.env.NODE_AUTH}`,
        },
    },
    "homestead"
);
