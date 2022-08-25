# Get simulated transaction events

This endpoint prober the contract given in parameter and return metadatas if it implement one of the following standards:
- ERC20
- ERC721
- ERC1155

**URL** : `/api/prober/`

**Method** : `GET`

**Auth required** : NO

**Permissions required** : None

**Cache** : 24 hours

**Data constraints** : `{}`

## Success Responses

**Condition** : User's transaction is valid

**Code** : `200 OK`

**Query Params** :

```json
{
  "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
}
```

**Result** :

```json
{
   "type" : "ERC20",
   "name" : "USD Coin",
   "symbol" : "USDC",
   "decimals" : 6
}
```

# Supported Probing Types

```typescript
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
```
