import { AssetType } from "../../../types/Asset";

export const OpenSeaOffer = {
    assetType: AssetType,
};

export type Consideration = Offer & {
    recipient: string;
}

export type Offer =
  | ERC1155WithCritteriaOffer
  | ERC1155Offer
  | ERC721WithCritteriaOffer
  | ERC721Offer
  | ERC20Offer
  | NativeOffer;

export type ERC721WithCritteriaOffer = {
  type: AssetType.ERC721;
  criteria: string;
  contract: string;
};

export type ERC1155WithCritteriaOffer = {
  type: AssetType.ERC1155;
  criteria: string;
  contract: string;
  startAmount: string;
  endAmount: string;
};

export type ERC721Offer = {
  type: AssetType.ERC721;
  tokenId: string;
  contract: string;
};

export type ERC1155Offer = {
  type: AssetType.ERC1155;
  tokenId: string;
  contract: string;
  startAmount: string;
  endAmount: string;
};

export type ERC20Offer = {
  type: AssetType.ERC20;
  contract: string;
  startAmount: string;
  endAmount: string;
};

export type NativeOffer = {
  type: AssetType.NATIVE;
  startAmount: string;
  endAmount: string;
};
