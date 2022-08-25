import { BigNumber } from "ethers"
import { SeaPortOrder } from "../typedMessage/handlers/SeaPort"

export type ERC20Transfer = {
    type: "ERC20",
    contract: string,
    event: "Transfer",
    from: string,
    to: string,
    amount: string,
}

export type ERC20Approval = {
    type: "ERC20",
    contract: string,
    event: "Approval",
    owner: string,
    operator: string,
    amount: string,
}

export type ERC721Transfer = {
    type: "ERC721",
    contract: string,
    event: "Transfer",
    from: string,
    to: string,
    tokenId: string,
}

export type ERC721Approval = {
    type: "ERC721",
    contract: string,
    event: "Approval",
    owner: string,
    operator: string,
    tokenId: string,
}

export type ERC721ApprovalForAll = {
    type: "ERC721",
    contract: string,
    event: "ApprovalForAll",
    owner: string,
    operator: string,
    approved: boolean,
}

export type ERC1155ApprovalForAll = {
    type: "ERC1155",
    contract: string,
    event: "ApprovalForAll",
    owner: string,
    operator: string,
    approved: boolean,
}

export type ERC1155TransferBatch = {
    type: "ERC1155",
    contract: string,
    event: "TransferBatch",
    operator: string,
    from: string,
    to: string,
    ids: string[],
    amounts: string[]
}

export type ERC1155TransferSingle = {
    type: "ERC1155",
    contract: string,
    event: "TransferSingle",
    operator: string,
    from: string,
    to: string,
    id: string,
    amount: string
}

export type ERC20Permit = {
    type: "ERC20",
    action: "Permit",
    contract: string,
    owner: string,
    operator: string,
    amount: string,
    deadline: string,
}

export type PredictedImpact =
| ERC20Transfer
| ERC20Approval
| ERC721Transfer
| ERC721Approval
| ERC721ApprovalForAll
| ERC1155ApprovalForAll
| ERC1155TransferBatch
| ERC1155TransferSingle
| ERC20Permit
| SeaPortOrder
