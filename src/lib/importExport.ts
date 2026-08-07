import type { Link, Category } from '../types';

export function parseLinksFile(content: string): Array<{ url: string; name: string; category: string; faviconUrl?: string }> {
	const lines = content.split('\n').filter(line => line.trim());
	const result: Array<{ url: string; name: string; category: string; faviconUrl?: string }> = [];

	for (const line of lines) {
		const parts = line.split('|').map(p => p.trim());
		if (parts.length >= 2) {
			const url = parts[0];
			const name = parts[1];
			const category = parts[2] || 'General';
			const faviconUrl = parts.length >= 4 && parts[3] ? parts[3] : undefined;
			if (url && name) {
				result.push({ url, name, category, faviconUrl });
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
			if (link.faviconUrl) {
				lines.push(`${link.url} | ${link.name} | ${category.name} | ${link.faviconUrl}`);
			} else {
				lines.push(`${link.url} | ${link.name} | ${category.name}`);
			}
		}
	}

	return lines.join('\n');
}
