export function getFaviconUrl(url: string): string {
	try {
		const domain = new URL(url).hostname;
		return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
	} catch {
		return '';
	}
}
