import { AssetType } from "../../types/Asset";
import { PotentialImpact } from "../../types/PotentialImpact";
import { TypedMessageHandler } from "../TypedMessageHandler";

type SeaPortOrderOffer = {
    type: AssetType,
    contract: string,
    startAmount: string,
    endAmount: string,
}

export type SeaPortOrder = {
    standard: "SeaPort",
    type: "Order",
    contract: string,
    offer: SeaPortOrderOffer[],
}

export const handleSeaPort: TypedMessageHandler = (typedMessage) => {
    const potentialImpacts: PotentialImpact[] = [];

    const {
        domain,
        message,
        primaryType,
    } = typedMessage;

    if (primaryType === "OrderComponents" && domain.verifyingContract && domain.chainId) {

    }

    return potentialImpacts;
}
