import type { IDataObject, IExecuteFunctions, IHttpRequestOptions, JsonObject } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

/**
 * MCP tools/call wraps the WebMCP `{ ok, ..., error? }` payload in
 * `result.content[0].text`. n8n items should get that object, not the envelope.
 *
 * Shape is from Mishimoto_Fits MCP-SERVER.md / Server.php / ToolCatalog:
 *   request: { jsonrpc, id, method, params? }
 *   success: { jsonrpc, id, result }
 *   rpc error: { jsonrpc, id, error: { code, message } }
 *   tools/call result: { content: [{ type: "text", text: "<json>" }], isError? }
 */
export function unwrapMcpResponse(response: IDataObject): IDataObject {
	const rpcError = response.error;
	if (rpcError && typeof rpcError === 'object') {
		const err = rpcError as IDataObject;
		const code = err.code ?? 'unknown';
		const message = err.message || 'MCP JSON-RPC error';
		throw new Error(`MCP error ${code}: ${message}`);
	}

	const result = response.result;
	if (!result || typeof result !== 'object' || Array.isArray(result)) {
		return response;
	}

	const resultObj = result as IDataObject;
	const content = resultObj.content;
	if (Array.isArray(content) && content[0] && typeof content[0] === 'object') {
		const text = (content[0] as IDataObject).text;
		if (typeof text === 'string') {
			try {
				return JSON.parse(text) as IDataObject;
			} catch {
				return { text };
			}
		}
	}

	return resultObj;
}

/**
 * One MCP POST helper. Tools are parameter maps, not extra HTTP clients.
 */
export async function fitsMcpRequest(
	ef: IExecuteFunctions,
	method: string,
	params?: IDataObject,
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method: 'POST',
		url: '',
		json: true,
		body: {
			jsonrpc: '2.0',
			id: Date.now(),
			method,
			...(params ? { params } : {}),
		},
	};

	let response: IDataObject;
	try {
		response = (await ef.helpers.httpRequestWithAuthentication.call(
			ef,
			'mishimotoFitsApi',
			options,
		)) as IDataObject;
	} catch (error) {
		throw new NodeApiError(ef.getNode(), error as JsonObject);
	}

	try {
		return unwrapMcpResponse(response);
	} catch (error) {
		throw new NodeOperationError(
			ef.getNode(),
			error instanceof Error ? error.message : String(error),
		);
	}
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
