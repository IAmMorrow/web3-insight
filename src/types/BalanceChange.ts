import { AssetType } from "./Asset"

export type ERC20BalanceChange = {
    type: AssetType.ERC20,
    address: string,
    contract: string,
    delta: string,
}

export type NativeBalanceChange = {
    type: AssetType.NATIVE,
    address: string,
    delta: string,    
}

export type ERC721BalanceChange = {
    type: AssetType.ERC721,
    address: string,
    contract: string,
    received: string[],
    sent: string[],
}

export type ERC1155BalanceChange = {
    address: string,
    contract: string,
    type: AssetType.ERC1155,
    amounts: {
        id: string,
        delta: string,
    }[]
}

export type BalanceChange =
| ERC20BalanceChange
| NativeBalanceChange
| ERC721BalanceChange
| ERC1155BalanceChange