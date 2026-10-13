import { useState } from 'react';
import type { Link, Category } from '../types';
import { getFaviconUrl } from '../lib/favicon';
import { Edit2 } from 'lucide-react';

interface LinkTableProps {
	links: Link[];
	categories: Category[];
	isVisualText?: boolean;
	onEdit: (link: Link) => void;
	onFaviconLoaded?: (linkId: string, faviconUrl: string) => void;
}

export function LinkTable({ links, categories, isVisualText = false, onEdit, onFaviconLoaded }: LinkTableProps) {
	const categoryOrder = new Map(categories.map((c, index) => [c.id, index]));
	const categoryNames = new Map(categories.map(c => [c.id, c.name]));
	const sortedLinks = [...links].sort(
		(a, b) => (categoryOrder.get(a.categoryId) ?? 0) - (categoryOrder.get(b.categoryId) ?? 0) || a.order - b.order
	);

	return (
		<div className="w-full rounded-lg p-4" style={{ backgroundColor: isVisualText ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.5)' }}>
			{sortedLinks.length === 0 ? (
				<p className="text-gray-400 text-sm">No hay links para mostrar</p>
			) : (
				<table className="w-full table-fixed text-left text-sm">
					<thead>
						<tr className="border-b border-white/10 text-gray-400">
							<th className="w-12 px-3 py-2 font-medium"></th>
							<th className="w-[18%] px-3 py-2 font-medium">Nombre</th>
							<th className="w-[14%] px-3 py-2 font-medium">Categoría</th>
							<th className="px-3 py-2 font-medium">Descripción</th>
							<th className="w-[26%] px-3 py-2 font-medium">URL</th>
							<th className="w-12 px-3 py-2 font-medium"></th>
						</tr>
					</thead>
					<tbody>
						{sortedLinks.map(link => (
							<LinkTableRow
								key={link.id}
								link={link}
								categoryName={categoryNames.get(link.categoryId) ?? ''}
								onEdit={onEdit}
								onFaviconLoaded={onFaviconLoaded}
							/>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}

interface LinkTableRowProps {
	link: Link;
	categoryName: string;
	onEdit: (link: Link) => void;
	onFaviconLoaded?: (linkId: string, faviconUrl: string) => void;
}

function LinkTableRow({ link, categoryName, onEdit, onFaviconLoaded }: LinkTableRowProps) {
	const [faviconLoaded, setFaviconLoaded] = useState(false);
	const [faviconError, setFaviconError] = useState(false);

	const faviconUrl = link.faviconUrl || getFaviconUrl(link.url);

	function handleFaviconLoad() {
		setFaviconLoaded(true);
		if (!link.faviconUrl && faviconUrl && onFaviconLoaded) {
			onFaviconLoaded(link.id, faviconUrl);
		}
	}

	return (
		<tr className="border-b border-white/5 last:border-b-0 hover:bg-white/10 transition-colors">
			<td className="px-3 py-2">
				<div className="w-5 h-5 relative">
					{!faviconLoaded && (
						<div className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center absolute inset-0">
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
								<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
								<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
							</svg>
						</div>
					)}
					{faviconUrl && !faviconError && (
						<img
							src={faviconUrl}
							alt=""
							className="w-5 h-5 rounded absolute inset-0"
							onLoad={handleFaviconLoad}
							onError={() => setFaviconError(true)}
						/>
					)}
				</div>
			</td>
			<td className="px-3 py-2 truncate">
				<a href={link.url} target="_blank" rel="noopener noreferrer" title={link.name} className="text-gray-100 hover:underline">
					{link.name}
				</a>
			</td>
			<td className="px-3 py-2 truncate text-gray-300" title={categoryName}>{categoryName}</td>
			<td className="px-3 py-2 truncate text-gray-300" title={link.description}>{link.description}</td>
			<td className="px-3 py-2 truncate">
				<a href={link.url} target="_blank" rel="noopener noreferrer" title={link.url} className="text-gray-400 hover:underline">
					{link.url}
				</a>
			</td>
			<td className="px-3 py-2">
				<button onClick={() => onEdit(link)} className="p-1 text-blue-400 hover:text-blue-300 transition-colors" title="Editar link">
					<Edit2 size={14} />
				</button>
			</td>
		</tr>
	);
}
