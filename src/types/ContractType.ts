export enum ContractType {
    NATIVE = "NATIVE",
    ERC721 = "ERC721",
    ERC20 = "ERC20",
    ERC1155 = "ERC1155",
    UNKNOWN = "UNKNOWN"
}

export type ERC20MetaData = {
    type: ContractType.ERC20,
    address: string,
    symbol: string,
    name: string,
    decimals: number,
}

export type ERC721MetaData = {
    type: ContractType.ERC721,
    address: string,
    symbol: string,
    name: string,
}

export type ERC1155MetaData = {
    type: ContractType.ERC1155,
    address: string,
}

export type UnknownMetaData = {
    type: ContractType.UNKNOWN,
    address: string,
}

export type ContractMetadata = 
| ERC20MetaData
| ERC721MetaData
| ERC1155MetaData
| UnknownMetaData