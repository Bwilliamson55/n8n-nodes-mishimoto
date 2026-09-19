import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MishimotoFitsApi implements ICredentialType {
	name = 'mishimotoFitsApi';
	displayName = 'Mishimoto Fits MCP';
	documentationUrl = 'https://mishimoto.com/fits/mcp';
	properties: INodeProperties[] = [
		{
			displayName: 'MCP URL',
			name: 'mcpUrl',
			type: 'string',
			default: 'https://mishimoto.com/fits/mcp',
			required: true,
			description: 'Public Fits MCP endpoint. Unauthenticated works now.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			description:
				'Optional Bearer key. Leave blank until Magento keys exist. Keys will live on the B2B developers page when MMP2-3485 ships.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Mishi-Client': 'n8n',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.mcpUrl}}',
			url: '',
			method: 'POST',
			headers: {
				Accept: 'application/json, text/event-stream',
				'Content-Type': 'application/json',
				'X-Mishi-Client': 'n8n',
			},
			body: {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/list',
			},
		},
	};
}
