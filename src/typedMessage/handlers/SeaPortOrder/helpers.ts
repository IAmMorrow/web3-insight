import { AssetType } from "../../../types/Asset";
import * as SeaPort from "./constants";

const itemTypeToAssetType: Record<SeaPort.ItemType, AssetType> = {
    [SeaPort.ItemType.NATIVE]: AssetType.NATIVE,
    [SeaPort.ItemType.ERC20]: AssetType.ERC20,
    [SeaPort.ItemType.ERC721]: AssetType.ERC721,
    [SeaPort.ItemType.ERC1155]: AssetType.ERC1155,
    [SeaPort.ItemType.ERC721_WITH_CRITERIA]: AssetType.ERC721,
    [SeaPort.ItemType.ERC1155_WITH_CRITERIA]: AssetType.ERC1155,
};

export function getAssetTypeForItemType(itemType: SeaPort.ItemType): AssetType {
    return itemTypeToAssetType[itemType];
}
