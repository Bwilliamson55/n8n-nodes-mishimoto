import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

import { applyFitsAuth, DEFAULT_MCP_URL } from './fitsAuth';

export class MishimotoFitsApi implements ICredentialType {
	name = 'mishimotoFitsApi';

	displayName = 'Mishimoto Fits MCP API';

	documentationUrl = 'https://mishimoto.com/fits/mcp';

	properties: INodeProperties[] = [
		{
			displayName: 'MCP URL',
			name: 'mcpUrl',
			type: 'string',
			default: DEFAULT_MCP_URL,
			required: true,
			description:
				'Public Fits MCP endpoint (POST /fits/mcp, alias /mcp). Pick the store on each operation, not here.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			description:
				'Bearer key (mm_live_…) from the Mishimoto B2B developers page. Optional for catalog and fitment, required for Get Order Tracking. A key also gets a higher rate limit.',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		return applyFitsAuth(credentials, requestOptions);
	}

	test: ICredentialTestRequest = {
		request: {
			url: '',
			method: 'POST',
			headers: {
				Accept: 'application/json, text/event-stream',
				'Content-Type': 'application/json',
			},
			body: {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/list',
			},
		},
	};
}
