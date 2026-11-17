/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { IPaginatedResponse, IQueryParams } from "../types/query.types";

type SortOrder = "asc" | "desc";

export type QueryBuilderOptions = {
	searchableFields?: string[];
	filterableFields?: string[];
	sortableFields?: string[];
	defaultSortBy?: string;
	defaultOrder?: SortOrder;
	defaultLimit?: number;
	maxLimit?: number;
};

type PrismaDelegate<T> = {
	findMany: (args: any) => Promise<T[]>;
	count: (args: any) => Promise<number>;
};

export class PrismaQueryBuilder<T> {
	private whereClause: Record<string, unknown> = {};

	private orderByClause: Record<string, SortOrder>[] = [];

	private page = 1;
	private limit = 10;
	private skip = 0;

	constructor(
		private readonly query: IQueryParams,
		private readonly options: QueryBuilderOptions = {},
	) {}

	search(fields: string[] = this.options.searchableFields ?? []): this {
		const searchTerm = this.query.search?.trim();

		if (!searchTerm || fields.length === 0) {
			return this;
		}

		this.whereClause.OR = fields.map((field) => ({
			[field]: {
				contains: searchTerm,
				mode: "insensitive",
			},
		}));

		return this;
	}

	filter(allowedFields: string[] = this.options.filterableFields ?? []): this {
		const filters: Record<string, string> = {};

		for (const key of allowedFields) {
			const value = this.query[key];

			if (typeof value !== "string" || value.trim() === "") {
				continue;
			}

			filters[key] = value.trim();
		}

		this.whereClause = {
			...this.whereClause,
			...filters,
		};

		return this;
	}

	sort(
		allowedFields: string[] = this.options.sortableFields ?? [],
		defaultSortBy = this.options.defaultSortBy ?? "createdAt",
		defaultOrder: SortOrder = this.options.defaultOrder ?? "desc",
	): this {
		const requestedSort = this.query.sortBy;
		const fallbackSort =
			allowedFields.length > 0 && !allowedFields.includes(defaultSortBy)
				? allowedFields[0]
				: defaultSortBy;

		const sortBy =
			requestedSort && allowedFields.includes(requestedSort)
				? requestedSort
				: fallbackSort;

		const requestedOrder = this.query.sortOrder?.toLowerCase();

		const sortOrder: SortOrder =
			requestedOrder === "asc" || requestedOrder === "desc"
				? requestedOrder
				: defaultOrder;

		this.orderByClause = [{ [sortBy]: sortOrder }, { id: "asc" }];

		return this;
	}

	paginate(
		defaultLimit = this.options.defaultLimit ?? 10,
		maxLimit = this.options.maxLimit ?? 100,
	): this {
		const requestedPage = Number(this.query.page);
		const requestedLimit = Number(this.query.limit);
		const safeDefaultLimit =
			Number.isSafeInteger(defaultLimit) && defaultLimit > 0
				? defaultLimit
				: 10;
		const safeMaxLimit =
			Number.isSafeInteger(maxLimit) && maxLimit > 0
				? Math.max(maxLimit, safeDefaultLimit)
				: 100;

		this.page =
			Number.isSafeInteger(requestedPage) && requestedPage > 0
				? requestedPage
				: 1;

		this.limit =
			Number.isSafeInteger(requestedLimit) && requestedLimit > 0
				? Math.min(requestedLimit, safeMaxLimit)
				: safeDefaultLimit;

		this.skip = (this.page - 1) * this.limit;

		return this;
	}

	getWhere(): Record<string, unknown> {
		return this.whereClause;
	}

	buildPrismaArgs() {
		return {
			where: this.whereClause,
			orderBy: this.orderByClause,
			skip: this.skip,
			take: this.limit,
		};
	}

	async execute(
		modelDelegate: PrismaDelegate<T>,
		options?: {
			where?: Record<string, any>;
			select?: Record<string, any>;
			include?: Record<string, any>;
			omit?: Record<string, any>;
		},
	): Promise<IPaginatedResponse<T>> {
		const where = options?.where
			? { AND: [this.whereClause, options.where] }
			: this.whereClause;
		const prismaArgs = {
			...this.buildPrismaArgs(),
			where,
			...options,
		};
		prismaArgs.where = where;

		const [data, total] = await Promise.all([
			modelDelegate.findMany(prismaArgs),
			modelDelegate.count({
				where,
			}),
		]);

		const totalPages = Math.ceil(total / this.limit);

		return {
			data,
			meta: {
				page: this.page,
				limit: this.limit,
				total,
				totalPages,
				hasNextPage: this.page < totalPages,
				hasPrevPage: this.page > 1,
			},
		};
	}
}
