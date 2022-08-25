# Get simulated transaction events

Interpret the input TypedMessage, interpretate it and return its predicted impact

**URL** : `/api/check/typedMessage/`

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
  "address": "0x053a031856b23a823b71e032c92b1599ac1cc3f2",
  "typedData": {
    "types": {
      "EIP712Domain": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "version",
          "type": "string"
        },
        {
          "name": "chainId",
          "type": "uint256"
        },
        {
          "name": "verifyingContract",
          "type": "address"
        }
      ],
      "Permit": [
        {
          "name": "owner",
          "type": "address"
        },
        {
          "name": "spender",
          "type": "address"
        },
        {
          "name": "value",
          "type": "uint256"
        },
        {
          "name": "nonce",
          "type": "uint256"
        },
        {
          "name": "deadline",
          "type": "uint256"
        }
      ]
    },
    "primaryType": "Permit",
    "domain": {
      "name": "USDC",
      "version": 1,
      "chainId": 1,
      "verifyingContract": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    },
    "message": {
      "owner": "0x7d5739894da4b0e8ad7073039a4499803b4aa614",
      "spender": "0x7d5739894da4b0e8ad7073039a4499803b4aa614",
      "value": "134320000000",
      "nonce": 1,
      "deadline": "123123123"
    }
  }
}
```

**Result** :

```json
[
  {
    "action": "Permit",
    "amount": "134320000000",
    "contract": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "deadline": "123123123",
    "operator": "0x7d5739894da4b0e8ad7073039a4499803b4aa614",
    "owner": "0x7d5739894da4b0e8ad7073039a4499803b4aa614",
    "type": "ERC20"
  }
]
```

# Supported Predicted Impact Types

```typescript
export type ERC20Permit = {
    type: "ERC20",
    action: "Permit",
    contract: string,
    owner: string,
    operator: string,
    amount: string,
    deadline: string,
}
```
