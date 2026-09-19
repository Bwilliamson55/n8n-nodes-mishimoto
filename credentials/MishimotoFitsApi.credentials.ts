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

	displayName = 'Mishimoto Fits MCP API (US-only for now)';

	documentationUrl = 'https://mishimoto.com/fits/mcp';

	properties: INodeProperties[] = [
		{
			displayName: 'MCP URL',
			name: 'mcpUrl',
			type: 'string',
			default: DEFAULT_MCP_URL,
			required: true,
			description:
				'Public Fits MCP endpoint (POST /fits/mcp, alias /mcp). US catalog and US fitment only for now — no store or region argument. Unauthenticated calls work now.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			description:
				'Optional Bearer key (mm_live_…). Leave blank until Magento keys exist. Keys will live on the B2B developers page when MMP2-3485 ships.',
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
