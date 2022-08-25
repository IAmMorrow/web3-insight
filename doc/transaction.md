# Get simulated transaction events

Simulate the input transaction using a geth node, using a custom tracer to extract the events and then format them in a standardized way.

This endpoint will return the events of the following contract standards:
- ERC20
- ERC721
- ERC1155

**URL** : `/api/check/transaction/`

**Method** : `POST`

**Auth required** : NO

**Permissions required** : None

**Data constraints** : `{}`

## Success Responses

**Condition** : User's transaction is valid

**Code** : `200 OK`

**Params** :

```json
{
   "transaction" : {
      "chainId" : 1,
      "data" : "0x0b86a4c1000000000000000000000000cafe001067cdef266afb7eb5a286dcfd277f3de500000000000000000000000000000000000000000000007b117ff125b3a0e4d50000000000000000000000000000000000000000000000000000000002b8b01d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000004de5458ae80894a0924ac763c034977e330c565f1687000000000000000000004de406da0fd433c1a5d7a4faa01111c044910a184553",
      "from" : "0x053a031856b23a823b71e032c92b1599ac1cc3f2",
      "gas" : "0x65cba",
      "maxFeePerGas" : "0x218711a00",
      "maxPriorityFeePerGas" : "0x218711a00",
      "nonce" : "0x199",
      "to" : "0xdef171fe48cf0115b1d80b88dc8eab59176fee57",
      "value" : "0x"
   }
}
```

**Result** :

```json
[
   {
      "contract" : "0xcafe001067cdef266afb7eb5a286dcfd277f3de5",
      "event" : "Transfer",
      "from" : "0x053A031856b23A823b71e032C92b1599Ac1cc3F2",
      "to" : "0x458ae80894A0924Ac763C034977e330c565F1687",
      "type" : "ERC20"
   },
   {
      "contract" : "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "event" : "Transfer",
      "from" : "0x458ae80894A0924Ac763C034977e330c565F1687",
      "to" : "0x06da0fd433C1A5d7a4faa01111c044910A184553",
      "type" : "ERC20"
   },
   {
      "contract" : "0xdac17f958d2ee523a2206206994597c13d831ec7",
      "event" : "Transfer",
      "from" : "0x06da0fd433C1A5d7a4faa01111c044910A184553",
      "to" : "0x053A031856b23A823b71e032C92b1599Ac1cc3F2",
      "type" : "ERC20"
   }
]
```

# Supported Predicted Impact Types

```typescript
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
```