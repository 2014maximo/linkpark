export interface Link {
	id: string;
	url: string;
	name: string;
	categoryId: string;
	order: number;
	createdAt: number;
	faviconUrl?: string;
}

export interface Category {
	id: string;
	name: string;
	order: number;
	createdAt: number;
}

export interface LinkData {
	url: string;
	name: string;
	category: string;
}
