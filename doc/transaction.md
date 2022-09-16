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
- includeEvents: boolean
- includeContracts: boolean
- transaction: Transaction

```json
{
	"includeEvents": true,
	"includeContracts": true,
	"transaction": {
		"chainId": 1,
		"from": "0x053a031856b23a823b71e032c92b1599ac1cc3f2",
		"to": "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
		"value": "0xb1a2bc2ec500000",
		"data": "0x5ae401dc0000000000000000000000000000000000000000000000000000000063243ffb00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c5990000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000053a031856b23a823b71e032c92b1599ac1cc3f20000000000000000000000000000000000000000000000000b1a2bc2ec50000000000000000000000000000000000000000000000000000000000000004ae049000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
		"gas": "0x377d0",
		"maxFeePerGas": "0x2540be400",
		"maxPriorityFeePerGas": "0x2540be400",
		"nonce": "0x19b"
	}
}
```

**Result** :

```json
{
  "success": true,
  "gasUsed": "123162",
  "balanceChanges": [
    {
      "type": "NATIVE",
      "address": "0x053a031856b23a823b71e032c92b1599ac1cc3f2",
      "delta": "-800000000000000000"
    },
    {
      "type": "NATIVE",
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "delta": "800000000000000000"
    },
    {
      "type": "ERC20",
      "address": "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
      "contract": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      "delta": "-5888498"
    },
    {
      "type": "ERC20",
      "address": "0x053a031856b23a823b71e032c92b1599ac1cc3f2",
      "contract": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      "delta": "5888498"
    },
    {
      "type": "ERC20",
      "address": "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
      "contract": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "delta": "-800000000000000000"
    },
    {
      "type": "ERC20",
      "address": "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
      "contract": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "delta": "800000000000000000"
    }
  ],
  "events": [
    {
      "standard": "ERC20",
      "contract": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      "type": "Transfer",
      "from": "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
      "to": "0x053a031856b23a823b71e032c92b1599ac1cc3f2",
      "amount": "5888498"
    },
    {
      "standard": "ERC20",
      "contract": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "type": "Transfer",
      "from": "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
      "to": "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
      "amount": "800000000000000000"
    },
    {
      "standard": "NATIVE",
      "type": "Transfer",
      "from": "0x053a031856b23a823b71e032c92b1599ac1cc3f2",
      "to": "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
      "amount": "800000000000000000"
    },
    {
      "standard": "NATIVE",
      "type": "Transfer",
      "from": "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
      "to": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "amount": "800000000000000000"
    }
  ],
  "contracts": [
    {
      "type": "ERC20",
      "address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      "symbol": "WBTC",
      "name": "Wrapped BTC",
      "decimals": 8
    },
    {
      "type": "ERC20",
      "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "symbol": "WETH",
      "name": "Wrapped Ether",
      "decimals": 18
    },
    {
      "type": "UNKNOWN",
      "address": "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed"
    }
  ]
}
```

# Supported Predicted Impact Types

```typescript
export type ERC20Transfer = {
    standard: "ERC20",
    contract: string,
    type: "Transfer",
    from: string,
    to: string,
    amount: string,
}

export type ERC20Approval = {
    standard: "ERC20",
    contract: string,
    type: "Approval",
    owner: string,
    operator: string,
    amount: string,
}

export type ERC721Transfer = {
    standard: "ERC721",
    contract: string,
    type: "Transfer",
    from: string,
    to: string,
    tokenId: string,
}

export type ERC721Approval = {
    standard: "ERC721",
    contract: string,
    type: "Approval",
    owner: string,
    operator: string,
    tokenId: string,
}

export type ERC721ApprovalForAll = {
    standard: "ERC721",
    contract: string,
    type: "ApprovalForAll",
    owner: string,
    operator: string,
    approved: boolean,
}

export type ERC1155ApprovalForAll = {
    standard: "ERC1155",
    contract: string,
    type: "ApprovalForAll",
    owner: string,
    operator: string,
    approved: boolean,
}

export type ERC1155TransferBatch = {
    standard: "ERC1155",
    contract: string,
    type: "TransferBatch",
    operator: string,
    from: string,
    to: string,
    ids: string[],
    amounts: string[]
}

export type ERC1155TransferSingle = {
    standard: "ERC1155",
    contract: string,
    type: "TransferSingle",
    operator: string,
    from: string,
    to: string,
    id: string,
    amount: string
}
```