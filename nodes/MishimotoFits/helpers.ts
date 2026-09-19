import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestOptions,
} from 'n8n-workflow';

const DEFAULT_MCP_URL = 'https://mishimoto.com/fits/mcp';

export async function resolveFitsCredentials(
	ef: IExecuteFunctions,
): Promise<{ mcpUrl: string; apiKey: string }> {
	const credentials = await ef.getCredentials('mishimotoFitsApi');
	const mcpUrl = String(credentials.mcpUrl || DEFAULT_MCP_URL).replace(/\/$/, '');
	const apiKey = String(credentials.apiKey || '').trim();
	return { mcpUrl, apiKey };
}

/**
 * One MCP POST helper. Tools are parameter maps, not extra HTTP clients.
 */
export async function fitsMcpRequest(
	ef: IExecuteFunctions,
	method: string,
	params?: IDataObject,
): Promise<IDataObject> {
	const { mcpUrl, apiKey } = await resolveFitsCredentials(ef);
	const headers: IDataObject = {
		Accept: 'application/json, text/event-stream',
		'Content-Type': 'application/json',
		'X-Mishi-Client': 'n8n',
	};
	if (apiKey) {
		headers.Authorization = `Bearer ${apiKey.replace(/^bearer\s+/i, '')}`;
	}

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: mcpUrl,
		headers,
		body: {
			jsonrpc: '2.0',
			id: Date.now(),
			method,
			...(params ? { params } : {}),
		},
		json: true,
	};

	return (await ef.helpers.httpRequest(options)) as IDataObject;
}

export async function fitsToolsCall(
	ef: IExecuteFunctions,
	name: string,
	args: IDataObject,
): Promise<IDataObject> {
	return fitsMcpRequest(ef, 'tools/call', { name, arguments: args });
}

export function compactArgs(args: IDataObject): IDataObject {
	const out: IDataObject = {};
	for (const [key, value] of Object.entries(args)) {
		if (value === undefined || value === null || value === '') continue;
		out[key] = value;
	}
	return out;
}
