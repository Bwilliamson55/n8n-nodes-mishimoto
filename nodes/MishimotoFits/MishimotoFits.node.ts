import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { compactArgs, fitsToolsCall } from './helpers';

const TOOLS = [
	{
		name: 'Get Vehicles For Product',
		value: 'get_vehicles_for_product',
		description: 'Vehicles that a SKU fits',
		action: 'Get vehicles for a product',
	},
	{
		name: 'Get Products For Vehicle',
		value: 'get_products_for_vehicle',
		description: 'Products that fit a year/make/model',
		action: 'Get products for a vehicle',
	},
	{
		name: 'List Vehicle Options',
		value: 'list_vehicle_options',
		description: 'Valid year/make/model/engine/trim spellings',
		action: 'List vehicle options',
	},
	{
		name: 'Get Product Details',
		value: 'get_product_details',
		description: 'Catalog details for a SKU (list price only)',
		action: 'Get product details',
	},
	{
		name: 'Search Products',
		value: 'search_products',
		description: 'Free-text catalog search',
		action: 'Search products',
	},
	{
		name: 'Get Related Content',
		value: 'get_related_content',
		description: 'Install guides and videos for a SKU',
		action: 'Get related content',
	},
] as const;

export class MishimotoFits implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mishimoto Fits',
		name: 'mishimotoFits',
		icon: 'file:mishimoto.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Call the public Mishimoto Fits MCP (six read-only tools)',
		defaults: { name: 'Mishimoto Fits' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'mishimotoFitsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'Fits MCP', value: 'fits' }],
				default: 'fits',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['fits'] } },
				options: [...TOOLS],
				default: 'get_vehicles_for_product',
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'get_vehicles_for_product',
							'get_product_details',
							'get_related_content',
						],
					},
				},
			},
			{
				displayName: 'Year',
				name: 'year',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: { show: { operation: ['get_products_for_vehicle'] } },
			},
			{
				displayName: 'Make',
				name: 'make',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Subaru',
				displayOptions: { show: { operation: ['get_products_for_vehicle'] } },
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'WRX',
				displayOptions: { show: { operation: ['get_products_for_vehicle'] } },
			},
			{
				displayName: 'Trim',
				name: 'trim',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['get_products_for_vehicle'] } },
			},
			{
				displayName: 'Engine',
				name: 'engine',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['get_products_for_vehicle'] } },
			},
			{
				displayName: 'Submodel',
				name: 'submodel',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['get_products_for_vehicle'] } },
			},
			{
				displayName: 'Field',
				name: 'field',
				type: 'options',
				required: true,
				options: [
					{ name: 'Year', value: 'year' },
					{ name: 'Make', value: 'make' },
					{ name: 'Model', value: 'model' },
					{ name: 'Submodel', value: 'submodel' },
					{ name: 'Body Type', value: 'body_type_name' },
					{ name: 'Engine', value: 'engine' },
					{ name: 'Trim', value: 'trim' },
				],
				default: 'make',
				displayOptions: { show: { operation: ['list_vehicle_options'] } },
			},
			{
				displayName: 'Year',
				name: 'optionYear',
				type: 'number',
				default: 0,
				displayOptions: { show: { operation: ['list_vehicle_options'] } },
			},
			{
				displayName: 'Make',
				name: 'optionMake',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['list_vehicle_options'] } },
			},
			{
				displayName: 'Model',
				name: 'optionModel',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['list_vehicle_options'] } },
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { operation: ['search_products'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 0,
				description: 'Leave 0 to use the MCP default',
				displayOptions: {
					show: {
						operation: [
							'get_vehicles_for_product',
							'get_products_for_vehicle',
							'search_products',
						],
					},
				},
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						operation: ['get_vehicles_for_product', 'get_products_for_vehicle'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const itemCount = Math.max(items.length, 1);

		for (let i = 0; i < itemCount; i++) {
			const operation = this.getNodeParameter('operation', i) as string;
			const args = toolArgs(this, operation, i);
			const response = await fitsToolsCall(this, operation, args);
			const json = (response && typeof response === 'object'
				? response
				: { data: response }) as IDataObject;
			returnData.push({ json, pairedItem: { item: i } });
		}

		return [returnData];
	}
}

function toolArgs(
	ef: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): IDataObject {
	if (operation === 'get_vehicles_for_product') {
		return compactArgs({
			sku: ef.getNodeParameter('sku', itemIndex, '') as string,
			limit: optionalNumber(ef, 'limit', itemIndex),
			offset: optionalNumber(ef, 'offset', itemIndex),
		});
	}
	if (operation === 'get_products_for_vehicle') {
		return compactArgs({
			year: ef.getNodeParameter('year', itemIndex, 0) as number,
			make: ef.getNodeParameter('make', itemIndex, '') as string,
			model: ef.getNodeParameter('model', itemIndex, '') as string,
			trim: ef.getNodeParameter('trim', itemIndex, '') as string,
			engine: ef.getNodeParameter('engine', itemIndex, '') as string,
			submodel: ef.getNodeParameter('submodel', itemIndex, '') as string,
			limit: optionalNumber(ef, 'limit', itemIndex),
			offset: optionalNumber(ef, 'offset', itemIndex),
		});
	}
	if (operation === 'list_vehicle_options') {
		return compactArgs({
			field: ef.getNodeParameter('field', itemIndex, 'make') as string,
			year: optionalNumber(ef, 'optionYear', itemIndex),
			make: ef.getNodeParameter('optionMake', itemIndex, '') as string,
			model: ef.getNodeParameter('optionModel', itemIndex, '') as string,
		});
	}
	if (operation === 'get_product_details' || operation === 'get_related_content') {
		return compactArgs({
			sku: ef.getNodeParameter('sku', itemIndex, '') as string,
		});
	}
	if (operation === 'search_products') {
		return compactArgs({
			query: ef.getNodeParameter('query', itemIndex, '') as string,
			limit: optionalNumber(ef, 'limit', itemIndex),
		});
	}
	return {};
}

function optionalNumber(
	ef: IExecuteFunctions,
	name: string,
	itemIndex: number,
): number | undefined {
	const value = ef.getNodeParameter(name, itemIndex, 0) as number;
	return value ? value : undefined;
}
