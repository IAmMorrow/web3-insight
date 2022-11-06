import { z } from "zod";
import { matchAddresses } from "../../../helpers";
import * as SeaPort from "./constants";

export const schemaItemType = z.nativeEnum(SeaPort.ItemType);

export const schemaOfferItem = z.object({
  itemType: schemaItemType,
  token: z.string(),
  identifierOrCriteria: z.string(),
  startAmount: z.string(),
  endAmount: z.string(),
});

export type OfferItem = z.infer<typeof schemaOfferItem>;

export const schemaConsideration = z.object({
  itemType: schemaItemType,
  token: z.string(),
  identifierOrCriteria: z.string(),
  startAmount: z.string(),
  endAmount: z.string(),
  recipient: z.string(),
});

export const schemaOrderComponents = z.object({
  offerer: z.string(),
  zone: z.string(),
  offer: z.array(schemaOfferItem),
  consideration: z.array(schemaConsideration),
  orderType: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  zoneHash: z.string(),
  salt: z.string(),
  conduitKey: z.literal(SeaPort.OPENSEA_CONDUIT_KEY),
  counter: z.string(),
});

export const schemaSeaPortOrder = z.object({
  primaryType: z.literal("OrderComponents"),
  domain: z.object({
    name: z.literal(SeaPort.SEAPORT_CONTRACT_NAME),
    version: z.literal(SeaPort.SEAPORT_CONTRACT_VERSION),
    chainId: z.string(),
    verifyingContract: z
      .string()
      .refine((verifyingContract) =>
        matchAddresses(verifyingContract, SeaPort.CROSS_CHAIN_SEAPORT_ADDRESS)
      ),
  }),
  message: schemaOrderComponents,
});
