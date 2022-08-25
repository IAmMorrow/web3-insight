export enum ContractType {
    ERC721 = "ERC721",
    ERC20 = "ERC20",
    ERC1155 = "ERC1155",
    UNKNOWN = "UNKNOWN"
}

export type ERC20MetaData = {
    type: ContractType.ERC20,
    symbol: string,
    name: string,
    decimals: number,
}

export type ERC721MetaData = {
    type: ContractType.ERC721,
    symbol: string,
    name: string,
}

export type ERC1155MetaData = {
    type: ContractType.ERC1155,
}

export type UnknownMetaData = {
    type: ContractType.UNKNOWN,
}

export type ContractMetadata = 
| ERC20MetaData
| ERC721MetaData
| ERC1155MetaData
| UnknownMetaData