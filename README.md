# n8n-nodes-mishimoto

Community node for the public Mishimoto Fits MCP. One MCP POST helper, six read-only tools. List price only - no stock, MAP, or customer pricing.

## Install (local)

```bash
npm install
npm run build
```

Then point n8n at this folder as a community node (`N8N_CUSTOM_EXTENSIONS` or a local `npm link`). Do not expect this package on npm until MMP2-3698 is published.

## Credentials

- **MCP URL** defaults to `https://mishimoto.com/fits/mcp`
- **API key** is optional. Unauthenticated calls work now.
- When Magento keys ship (MMP2-3485 / MMP2-3694), create or revoke them on the B2B developers page. Paste the Bearer secret here. Do not store a raw key anywhere else.

Every request sends `X-Mishi-Client: n8n`.

## Tools

| Operation | Required fields |
| --- | --- |
| Get Vehicles For Product | SKU |
| Get Products For Vehicle | Year, Make, Model |
| List Vehicle Options | Field (`year` / `make` / `model` / …) |
| Get Product Details | SKU |
| Search Products | Query |
| Get Related Content | SKU |

## Test

A local community-node install should return vehicles for `MMINT-CIV-16`.
