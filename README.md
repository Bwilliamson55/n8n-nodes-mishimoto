# n8n-nodes-mishimoto

An n8n community node for the public [Mishimoto Fits MCP](https://mishimoto.com/fits/mcp). One node, six read-only fitment and catalog tools.

**US-only for now.** This is the US catalog and US fitment data. There is no store or region argument, and the production hostname does not make this a multi-store API. UK fitments are not included.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

Prices are catalog list prices only. The node does not return stock, MAP, or customer-specific pricing.

## Installation

Install from **Settings → Community Nodes** in n8n, or with npm:

```bash
npm install n8n-nodes-mishimoto
```

See the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) for more detail.

Restart n8n and search the node picker for **Mishimoto Fits**.

## Operations

Each operation is one MCP `tools/call`. The node POSTs JSON-RPC to `https://mishimoto.com/fits/mcp` and returns the unwrapped `{ ok, ..., error? }` payload.

| Operation | MCP tool | Required fields |
| --- | --- | --- |
| Get Vehicles For Product | `get_vehicles_for_product` | SKU |
| Get Products For Vehicle | `get_products_for_vehicle` | Year, Make, Model |
| List Vehicle Options | `list_vehicle_options` | Field (`year`, `make`, `model`, `engine`, `trim`, …) |
| Get Product Details | `get_product_details` | SKU |
| Search Products | `search_products` | Query |
| Get Related Content | `get_related_content` | SKU |

Use **List Vehicle Options** for exact year/make/model/engine/trim spellings before **Get Products For Vehicle**. Trim, engine, and submodel are optional on that operation. If they yield no matches, results fall back to year/make/model.

## Credentials

Create a **Mishimoto Fits MCP API** credential.

- **MCP URL** defaults to production: `https://mishimoto.com/fits/mcp`
- **API key** is optional. Leave it blank for anonymous access. If you have a key (`mm_live_…`), the node sends `Authorization: Bearer …`

## Local development

```bash
git clone https://github.com/Bwilliamson55/n8n-nodes-mishimoto.git
cd n8n-nodes-mishimoto
npm install
npm run build
```

Then load the built package into a local n8n:

```bash
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes
npm install /path/to/n8n-nodes-mishimoto
```

Or start n8n with `N8N_CUSTOM_EXTENSIONS` pointed at the built folder. Restart n8n after install or rebuild.

## License

[MIT](LICENSE.md)
