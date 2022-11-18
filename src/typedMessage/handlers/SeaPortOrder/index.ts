import { AssetType } from "../../../types/Asset";
import { PotentialImpact } from "../../../types/PotentialImpact";
import { generateEIP712TypeIdentifier } from "../../helpers";
import { TypedMessageHandler } from "../../types";
import { ItemType } from "./constants";
import { Consideration, Offer } from "./types";
import { OfferItem, schemaSeaPortOrder } from "./validation";
import rawType from "./type.json";
import { InternalError } from "../../../types/InternalError";

export type SeaPortOrder = {
  type: "SeaPortOrder";
  contract: string;
  offer: Offer[];
  consideration: Consideration[];
  startTime: string;
  endTime: string;
};

function getOffer(offer: OfferItem): Offer {
    switch (offer.itemType) {
    case ItemType.ERC1155: {
        return {
            type: AssetType.ERC1155,
            contract: offer.token,
            tokenId: offer.identifierOrCriteria,
            startAmount: offer.startAmount,
            endAmount: offer.endAmount,
        };
    }
    case ItemType.ERC1155_WITH_CRITERIA: {
        return {
            type: AssetType.ERC1155,
            contract: offer.token,
            criteria: offer.identifierOrCriteria,
            startAmount: offer.startAmount,
            endAmount: offer.endAmount,
        };
    }
    case ItemType.ERC721: {
        return {
            type: AssetType.ERC721,
            contract: offer.token,
            tokenId: offer.identifierOrCriteria,
        };
    }
    case ItemType.ERC721_WITH_CRITERIA: {
        return {
            type: AssetType.ERC721,
            contract: offer.token,
            criteria: offer.identifierOrCriteria,
        };
    }
    case ItemType.NATIVE: {
        return {
            type: AssetType.NATIVE,
            startAmount: offer.startAmount,
            endAmount: offer.endAmount,
        };
    }
    case ItemType.ERC20: {
        return {
            type: AssetType.ERC20,
            contract: offer.token,
            startAmount: offer.startAmount,
            endAmount: offer.endAmount,
        };
    }
    }
}

export const handleSeaPortOrder: TypedMessageHandler = {
    handler: (typedMessage) => {
        const potentialImpacts: PotentialImpact[] = [];
    
        const { domain, message } = schemaSeaPortOrder.parse(typedMessage);
        
        potentialImpacts.push({
            type: "SeaPortOrder",
            contract: domain.verifyingContract,
            offer: message.offer.map(getOffer),
            consideration: message.consideration.map((consideration) => {
                return {
                    ...getOffer(consideration),
                    recipient: consideration.recipient,
                };
            }),
            startTime: message.startTime,
            endTime: message.endTime,
        });
        return potentialImpacts;
    },
    identifier: generateEIP712TypeIdentifier(rawType),
    name: "SeaPortOrder"
};
