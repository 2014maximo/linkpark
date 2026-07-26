import { openDB, type IDBPDatabase } from 'idb';
import type { Link, Category } from '../types';

const DB_NAME = 'links-manager-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
	if (!dbPromise) {
		dbPromise = openDB(DB_NAME, DB_VERSION, {
			upgrade(db, oldVersion) {
				if (!db.objectStoreNames.contains('links')) {
					const linkStore = db.createObjectStore('links', { keyPath: 'id' });
					linkStore.createIndex('categoryId', 'categoryId');
					linkStore.createIndex('order', 'order');
				}
				if (!db.objectStoreNames.contains('categories')) {
					const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
					categoryStore.createIndex('order', 'order');
				}
				if (oldVersion < 2) {
					if (!db.objectStoreNames.contains('settings')) {
						db.createObjectStore('settings', { keyPath: 'key' });
					}
				}
			},
		});
	}
	return dbPromise;
}

export async function getAllLinks(): Promise<Link[]> {
	const db = await getDB();
	const links = await db.getAll('links');
	return links.sort((a, b) => a.order - b.order);
}

export async function getLinksByCategory(categoryId: string): Promise<Link[]> {
	const db = await getDB();
	const links = await db.getAllFromIndex('links', 'categoryId', categoryId);
	return links.sort((a, b) => a.order - b.order);
}

export async function addLink(link: Omit<Link, 'id' | 'createdAt'>): Promise<Link> {
	const db = await getDB();
	const newLink: Link = {
		...link,
		id: crypto.randomUUID(),
		createdAt: Date.now(),
	};
	await db.add('links', newLink);
	return newLink;
}

export async function updateLink(link: Link): Promise<void> {
	const db = await getDB();
	await db.put('links', link);
}

export async function deleteLink(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('links', id);
}

export async function getAllCategories(): Promise<Category[]> {
	const db = await getDB();
	const categories = await db.getAll('categories');
	return categories.sort((a, b) => a.order - b.order);
}

export async function addCategory(name: string, order: number): Promise<Category> {
	const db = await getDB();
	const newCategory: Category = {
		id: crypto.randomUUID(),
		name,
		order,
		createdAt: Date.now(),
	};
	await db.add('categories', newCategory);
	return newCategory;
}

export async function updateCategory(category: Category): Promise<void> {
	const db = await getDB();
	await db.put('categories', category);
}

export async function deleteCategory(id: string): Promise<void> {
	const db = await getDB();
	const tx = db.transaction(['categories', 'links'], 'readwrite');
	await tx.objectStore('categories').delete(id);
	const links = await tx.objectStore('links').index('categoryId').getAllKeys(id);
	for (const key of links) {
		await tx.objectStore('links').delete(key);
	}
	await tx.done;
}

export async function reorderLinks(links: Link[]): Promise<void> {
	const db = await getDB();
	const tx = db.transaction('links', 'readwrite');
	for (let i = 0; i < links.length; i++) {
		links[i].order = i;
		await tx.store.put(links[i]);
	}
	await tx.done;
}

export async function reorderCategories(categories: Category[]): Promise<void> {
	const db = await getDB();
	const tx = db.transaction('categories', 'readwrite');
	for (let i = 0; i < categories.length; i++) {
		categories[i].order = i;
		await tx.store.put(categories[i]);
	}
	await tx.done;
}

export function parseLinksFile(content: string): Array<{ url: string; name: string; category: string }> {
	const lines = content.split('\n').filter(line => line.trim());
	const result: Array<{ url: string; name: string; category: string }> = [];

	for (const line of lines) {
		const parts = line.split('|').map(p => p.trim());
		if (parts.length >= 2) {
			const url = parts[0];
			const name = parts[1];
			const category = parts[2] || 'General';
			if (url && name) {
				result.push({ url, name, category });
			}
		}
	}

	return result;
}

export function exportLinksToText(links: Link[], categories: Category[]): string {
	const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
	const lines: string[] = [];

	for (const category of sortedCategories) {
		const categoryLinks = links
			.filter(link => link.categoryId === category.id)
			.sort((a, b) => a.order - b.order);

		if (categoryLinks.length === 0) continue;

		for (const link of categoryLinks) {
			lines.push(`${link.url} | ${link.name} | ${category.name}`);
		}
	}

	return lines.join('\n');
}

export function getFaviconUrl(url: string): string {
	try {
		const domain = new URL(url).hostname;
		return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
	} catch {
		return '';
	}
}

export async function getBackgroundImage(): Promise<string | null> {
	const db = await getDB();
	const result = await db.get('settings', 'backgroundImage');
	return result?.value ?? null;
}

export async function setBackgroundImage(dataUrl: string): Promise<void> {
	const db = await getDB();
	await db.put('settings', { key: 'backgroundImage', value: dataUrl });
}

export async function clearBackgroundImage(): Promise<void> {
	const db = await getDB();
	await db.delete('settings', 'backgroundImage');
}

export async function getTemplate(): Promise<string> {
	const db = await getDB();
	const result = await db.get('settings', 'template');
	return result?.value ?? 'linkpark';
}

export async function setTemplate(template: string): Promise<void> {
	const db = await getDB();
	await db.put('settings', { key: 'template', value: template });
}

export async function clearAllLinks(): Promise<void> {
	const db = await getDB();
	const tx = db.transaction('links', 'readwrite');
	await tx.store.clear();
	await tx.done;
}

export async function clearAllCategoriesAndLinks(): Promise<void> {
	const db = await getDB();
	const tx = db.transaction(['categories', 'links'], 'readwrite');
	await tx.objectStore('categories').clear();
	await tx.objectStore('links').clear();
	await tx.done;
}

export async function clearAllData(): Promise<void> {
	const db = await getDB();
	const tx = db.transaction(['categories', 'links', 'settings'], 'readwrite');
	await tx.objectStore('categories').clear();
	await tx.objectStore('links').clear();
	await tx.objectStore('settings').clear();
	await tx.done;
}
