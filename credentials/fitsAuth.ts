import type {
	ICredentialDataDecryptedObject,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

export const DEFAULT_MCP_URL = 'https://mishimoto.com/fits/mcp';
export const MISHI_CLIENT_HEADER = 'n8n';

export function normalizeMcpUrl(value: unknown): string {
	const url = String(value || DEFAULT_MCP_URL)
		.trim()
		.replace(/\/$/, '');
	return url || DEFAULT_MCP_URL;
}

export function bearerToken(value: unknown): string {
	return String(value || '')
		.trim()
		.replace(/^bearer\s+/i, '');
}

/**
 * Shared header/URL builder for credential tests and the one MCP POST helper.
 * Lives next to the credential so that bundle never imports NodeApiError.
 */
export function applyFitsAuth(
	credentials: ICredentialDataDecryptedObject,
	requestOptions: IHttpRequestOptions,
): IHttpRequestOptions {
	const headers: IDataObject = {
		...((requestOptions.headers as IDataObject) || {}),
		Accept: 'application/json, text/event-stream',
		'Content-Type': 'application/json',
		'X-Mishi-Client': MISHI_CLIENT_HEADER,
	};
	const apiKey = bearerToken(credentials.apiKey);
	if (apiKey) {
		headers.Authorization = `Bearer ${apiKey}`;
	}

	requestOptions.headers = headers;
	requestOptions.baseURL = normalizeMcpUrl(credentials.mcpUrl);
	if (!requestOptions.url) {
		requestOptions.url = '';
	}
	return requestOptions;
}
