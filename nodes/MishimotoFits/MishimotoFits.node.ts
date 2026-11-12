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
		name: 'Check Fitment',
		value: 'check_fitment',
		description: 'Whether a SKU fits a year/make/model (yes/no)',
		action: 'Check fitment',
	},
	{
		name: 'Get Product Availability',
		value: 'get_product_availability',
		description: 'In stock or not, with an ETA when there is one',
		action: 'Get product availability',
	},
	{
		name: 'Get Product Details',
		value: 'get_product_details',
		description: 'Catalog details for a SKU (list price only)',
		action: 'Get product details',
	},
	{
		name: 'Get Products For Vehicle',
		value: 'get_products_for_vehicle',
		description: 'Products that fit a year/make/model',
		action: 'Get products for a vehicle',
	},
	{
		name: 'Get Related Content',
		value: 'get_related_content',
		description: 'Install guides and videos for a SKU',
		action: 'Get related content',
	},
	{
		name: 'Get Vehicles For Product',
		value: 'get_vehicles_for_product',
		description: 'Vehicles that a SKU fits',
		action: 'Get vehicles for a product',
	},
	{
		name: 'List Vehicle Options',
		value: 'list_vehicle_options',
		description: 'Valid year/make/model/engine/trim spellings',
		action: 'List vehicle options',
	},
	{
		name: 'Search Products',
		value: 'search_products',
		description: 'Free-text catalog search',
		action: 'Search products',
	},
] as const;

/** Every tool takes the store argument. */
const STORE_OPERATIONS = TOOLS.map((tool) => tool.value);

const SKU_OPERATIONS = [
	'check_fitment',
	'get_product_availability',
	'get_product_details',
	'get_related_content',
	'get_vehicles_for_product',
];

const VEHICLE_OPERATIONS = ['check_fitment', 'get_products_for_vehicle'];

export class MishimotoFits implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mishimoto Fits',
		name: 'mishimotoFits',
		icon: 'file:mishimoto.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Read-only Mishimoto fitment, catalog, and availability (Fits MCP)',
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
				displayName: 'Store',
				name: 'store',
				type: 'options',
				options: [
					{ name: 'US (Default)', value: 'default' },
					{ name: 'UK', value: 'mishiuk_english' },
				],
				default: 'default',
				description:
					'Store view for catalog, prices, and fitment region. US uses non-gb fitment; UK uses gb fitment.',
				displayOptions: { show: { operation: STORE_OPERATIONS } },
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'MMINT-CIV-16',
				description: 'Mishimoto product SKU',
				displayOptions: { show: { operation: SKU_OPERATIONS } },
			},
			{
				displayName: 'Year',
				name: 'year',
				type: 'number',
				default: 2019,
				required: true,
				description: 'Vehicle model year',
				typeOptions: { minValue: 1900 },
				displayOptions: { show: { operation: VEHICLE_OPERATIONS } },
			},
			{
				displayName: 'Make',
				name: 'make',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Subaru',
				description: 'Vehicle make. Use List Vehicle Options for the exact spelling.',
				displayOptions: { show: { operation: VEHICLE_OPERATIONS } },
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'WRX',
				description: 'Vehicle model. Use List Vehicle Options for the exact spelling.',
				displayOptions: { show: { operation: VEHICLE_OPERATIONS } },
			},
			{
				displayName: 'Trim',
				name: 'trim',
				type: 'string',
				default: '',
				description:
					'Optional vehicle trim. Get Products For Vehicle falls back to year/make/model when it matches nothing; Check Fitment does not.',
				displayOptions: { show: { operation: VEHICLE_OPERATIONS } },
			},
			{
				displayName: 'Engine',
				name: 'engine',
				type: 'string',
				default: '',
				description:
					'Optional engine designation. Get Products For Vehicle falls back to year/make/model when it matches nothing; Check Fitment does not.',
				displayOptions: { show: { operation: VEHICLE_OPERATIONS } },
			},
			{
				displayName: 'Submodel',
				name: 'submodel',
				type: 'string',
				default: '',
				description: 'Optional vehicle submodel',
				displayOptions: { show: { operation: VEHICLE_OPERATIONS } },
			},
			{
				displayName: 'Field',
				name: 'field',
				type: 'options',
				required: true,
				description: 'Which vehicle field to list valid values for',
				options: [
					{ name: 'Body Type', value: 'body_type_name' },
					{ name: 'Engine', value: 'engine' },
					{ name: 'Make', value: 'make' },
					{ name: 'Model', value: 'model' },
					{ name: 'Submodel', value: 'submodel' },
					{ name: 'Trim', value: 'trim' },
					{ name: 'Year', value: 'year' },
				],
				default: 'make',
				displayOptions: { show: { operation: ['list_vehicle_options'] } },
			},
			{
				displayName: 'Year',
				name: 'optionYear',
				type: 'number',
				default: 0,
				description: 'Optional model year filter. Leave 0 to omit.',
				displayOptions: { show: { operation: ['list_vehicle_options'] } },
			},
			{
				displayName: 'Make',
				name: 'optionMake',
				type: 'string',
				default: '',
				description: 'Optional make filter',
				displayOptions: { show: { operation: ['list_vehicle_options'] } },
			},
			{
				displayName: 'Model',
				name: 'optionModel',
				type: 'string',
				default: '',
				description: 'Optional model filter',
				displayOptions: { show: { operation: ['list_vehicle_options'] } },
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'cold air intake',
				description: 'Free-text catalog search',
				displayOptions: { show: { operation: ['search_products'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Max number of results to return',
				typeOptions: { minValue: 1 },
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
				description: 'Rows to skip for pagination',
				typeOptions: { minValue: 0 },
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
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const args = toolArgs(this, operation, i);
				const response = await fitsToolsCall(this, operation, args);
				const json = (
					response && typeof response === 'object' ? response : { data: response }
				) as IDataObject;
				returnData.push({ json, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					const message = error instanceof Error ? error.message : String(error);
					returnData.push({
						json: { error: message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

function toolArgs(ef: IExecuteFunctions, operation: string, itemIndex: number): IDataObject {
	// US is the server default, so 'default' is sent as no store at all.
	const storeValue = ef.getNodeParameter('store', itemIndex, 'default') as string;
	const store = storeValue === 'default' ? undefined : storeValue;

	if (operation === 'get_vehicles_for_product') {
		return compactArgs({
			sku: ef.getNodeParameter('sku', itemIndex, '') as string,
			limit: optionalNumber(ef, 'limit', itemIndex),
			offset: optionalNumber(ef, 'offset', itemIndex),
			store,
		});
	}
	if (operation === 'get_products_for_vehicle' || operation === 'check_fitment') {
		const vehicle = compactArgs({
			year: ef.getNodeParameter('year', itemIndex, 2019) as number,
			make: ef.getNodeParameter('make', itemIndex, '') as string,
			model: ef.getNodeParameter('model', itemIndex, '') as string,
			trim: ef.getNodeParameter('trim', itemIndex, '') as string,
			engine: ef.getNodeParameter('engine', itemIndex, '') as string,
			submodel: ef.getNodeParameter('submodel', itemIndex, '') as string,
			store,
		});
		if (operation === 'check_fitment') {
			return { sku: ef.getNodeParameter('sku', itemIndex, '') as string, ...vehicle };
		}
		return compactArgs({
			...vehicle,
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
			store,
		});
	}
	if (
		operation === 'get_product_details' ||
		operation === 'get_related_content' ||
		operation === 'get_product_availability'
	) {
		return compactArgs({
			sku: ef.getNodeParameter('sku', itemIndex, '') as string,
			store,
		});
	}
	if (operation === 'search_products') {
		return compactArgs({
			query: ef.getNodeParameter('query', itemIndex, '') as string,
			limit: optionalNumber(ef, 'limit', itemIndex),
			store,
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
