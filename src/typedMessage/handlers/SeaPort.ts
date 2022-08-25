import { AssetType } from "../../types/Asset";
import { PredictedImpact } from "../../types/PredictedImpact";
import { TypedMessageHandler } from "../TypedMessageHandler";

type SeaPortOrderOffer = {
    type: AssetType,
    contract: string,
    startAmount: string,
    endAmount: string,
}

export type SeaPortOrder = {
    type: "SeaPort",
    action: "Order",
    contract: string,
    offer: SeaPortOrderOffer[],
}

export const handleSeaPort: TypedMessageHandler = (typedMessage) => {
    const predictedImpacts: PredictedImpact[] = [];

    const {
        domain,
        message,
        primaryType,
    } = typedMessage;

    if (primaryType === "OrderComponents" && domain.verifyingContract && domain.chainId) {

    }

    return predictedImpacts;
}
