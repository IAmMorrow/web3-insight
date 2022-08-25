import { ethers } from "ethers";

export const provider = new ethers.providers.JsonRpcProvider(
    {
      url: "http://eth.fullnodes.vault.ovh.stg.ldg-tech.com/",
      headers: {
        Authorization: `Basic ${process.env.NODE_AUTH}`,
      },
    },
    "homestead"
  );
