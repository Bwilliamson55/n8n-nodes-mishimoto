# n8n-nodes-mishimoto

<p align="left"><img src="nodes/MishimotoFits/mishimoto.png" alt="Mishimoto" width="96" height="96"></p>

An n8n community node for the public [Mishimoto Fits MCP](https://mishimoto.com/fits/mcp). One node, nine read-only tools for fitment, catalog, stock status, and order tracking.

This community node exists at the behest of Mishimoto. Mishimoto may require that it be taken down at any time. It is unofficial unless Mishimoto designates otherwise, is provided without warranty, and is not a substitute for a contract. It is not endorsed by Adobe or n8n.

**Store.** Catalog and fitment operations have a **Store** field: US (default), UK (`mishiuk_english`), or Borne (`borne_store_view`). US uses non-UK fitment and UK uses UK fitment. The hostname and API key never pick the store.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

Prices are catalog list prices only, with no MAP or customer-specific pricing. Availability is in stock or not, with an ETA when there is one, never a quantity.

## Installation

Install from **Settings → Community Nodes** in n8n, or with npm:

```bash
npm install n8n-nodes-mishimoto
```

See the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) for more detail.

Restart n8n and search the node picker for **Mishimoto Fits**.

## Operations

Each operation is one MCP `tools/call`. The node POSTs JSON-RPC to `https://mishimoto.com/fits/mcp` and returns the unwrapped `{ ok, ..., error? }` payload.

| Operation | MCP tool | Required fields | Store |
| --- | --- | --- | --- |
| Check Fitment | `check_fitment` | SKU, Year, Make, Model | yes |
| Get Order Tracking | `get_order_tracking` | Tracking number, or Email and Order number. **API key required** | no |
| Get Product Availability | `get_product_availability` | SKU | yes |
| Get Product Details | `get_product_details` | SKU | yes |
| Get Products For Vehicle | `get_products_for_vehicle` | Year, Make, Model | yes |
| Get Related Content | `get_related_content` | SKU | yes |
| Get Vehicles For Product | `get_vehicles_for_product` | SKU | yes |
| List Vehicle Options | `list_vehicle_options` | Field (`year`, `make`, `model`, `engine`, `trim`, …) | yes |
| Search Products | `search_products` | Query | yes |

Use **List Vehicle Options** for exact year/make/model/engine/trim spellings before **Get Products For Vehicle**. Trim, engine, and submodel are optional. On **Get Products For Vehicle** they fall back to year/make/model when nothing matches. On **Check Fitment** they don't: a trim or engine that doesn't match returns `fits: false`.

An unknown order or tracking number returns `ok: false`.

## Credentials

Create a **Mishimoto Fits MCP API** credential.

- **MCP URL** defaults to production: `https://mishimoto.com/fits/mcp`
- **API key** (`mm_live_…`) comes from the Mishimoto B2B developers page. It's optional for catalog and fitment, and required for **Get Order Tracking**. A key also gets a higher rate limit. The node sends it as `Authorization: Bearer …`

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
