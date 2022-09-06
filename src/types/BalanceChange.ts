export type ERC20BalanceChange = {
    address: string,
    type: "ERC20",
    contract: string,
    delta: string,
}

export type NativeBalanceChange = {
    address: string,
    type: "NATIVE",
    delta: string,    
}

export type ERC721BalanceChange = {
    address: string,
    type: "ERC721",
    in: string[],
    out: string[],
}

export type BalanceChange =
| ERC20BalanceChange
| NativeBalanceChange
| ERC721BalanceChange
