# n8n-nodes-mishimoto

Community node for the public Mishimoto Fits MCP. One MCP POST helper, six read-only tools. List price only - no stock, MAP, or customer pricing.

Package name: `n8n-nodes-mishimoto`. Publish later as npm user `bwilliamson5509`. This repo is not on npm yet.

## Load in n8n (local, unpublished)

```bash
cd /path/to/n8n-nodes-mishimoto
npm install --ignore-scripts
npm run build
```

`--ignore-scripts` is required on Node 20. `n8n-workflow` still pulls `isolated-vm`, which wants Node 22 for its native compile. Types and `tsc` work without that compile.

A live unauthenticated `tools/call` for `MMINT-CIV-16` was not run from this session. Confirm that against prod only after that class of request is approved.

Then either:

1. **Custom extensions** - start n8n with the built folder:

   ```bash
   N8N_CUSTOM_EXTENSIONS=/path/to/n8n-nodes-mishimoto n8n start
   ```

2. **User nodes folder** (same pattern as `mishimoto-custom-n8n`):

   ```bash
   mkdir -p ~/.n8n/nodes
   cd ~/.n8n/nodes
   npm install /path/to/n8n-nodes-mishimoto
   ```

Restart n8n. Search the node picker for **Mishimoto Fits**. Add a **Mishimoto Fits MCP** credential (URL defaults to production; API key can stay blank).

After npm publish, install from Settings > Community Nodes, then pin `n8n-nodes-mishimoto` in `mishimoto-custom-n8n/Dockerfile` next to the other community packages.

## Credentials

- **MCP URL** defaults to `https://mishimoto.com/fits/mcp` (alias `/mcp`).
- **API key** is optional. Unauthenticated calls work now.
- When Magento keys ship (MMP2-3485 / MMP2-3694), create or revoke them on the B2B developers page. Paste the Bearer secret here. Do not store a raw key anywhere else.

Every request sends `X-Mishi-Client: n8n`.

## Tools

POSTs JSON-RPC `tools/call` and unwraps `result.content[0].text` to the `{ ok, ..., error? }` payload.

| Operation | Required fields |
| --- | --- |
| Get Vehicles For Product | SKU |
| Get Products For Vehicle | Year, Make, Model |
| List Vehicle Options | Field (`year` / `make` / `model` / …) |
| Get Product Details | SKU |
| Search Products | Query |
| Get Related Content | SKU |

## Test

After load, Get Vehicles For Product with `MMINT-CIV-16` should unwrap to `{ ok, vehicles, ... }` (MCP `result.content[0].text`, not the JSON-RPC envelope). Live unauthenticated prod check is still open.
