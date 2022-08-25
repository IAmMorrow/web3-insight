# ledger-insight

Serverless based REST API that allow to:

- Simulate an Ethereum transaction and get all ERC721, ERC20 and ERC1155 events
- Probe a contract to get its type and metadatas (ERC20, ERC721 & ERC1155)
- Analyse an EIP712 signature and get a digest of what potential side effects it could have on the user account

## Hosting

The API is currently hosted at https://ledger-insight.vercel.app/

## Open Endpoints

* [Simulate an Ethereum transaction](doc/transaction.md) : `POST /api/check/transaction/`
* [Probe an address](doc/prober.md) : `GET /api/prober/`
* [Analyse a EIP712 typed message](doc/typedMessage.md) : `POST /api/check/typedMessage/`

## Development

This API is made using Vercel technologies. All routes are using a filesystem based declaration type and are available in the `/api/` directory.

To run the API locally, `pnpm run start:dev`

With the watcher on: `pnpm run watch:dev`

## Deployement

Pushing on the Main branch automatically deploy the API in production. 
