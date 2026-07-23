import type { Link } from '../types';
import { getFaviconUrl } from '../lib/db';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LinkCardProps {
	link: Link;
}

export function LinkCard({ link }: LinkCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: link.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const faviconUrl = getFaviconUrl(link.url);

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="group relative flex flex-col items-center gap-2 p-3"
		>
			<div {...attributes} {...listeners} className="absolute top-1 left-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
					<circle cx="9" cy="5" r="1"/>
					<circle cx="9" cy="12" r="1"/>
					<circle cx="9" cy="19" r="1"/>
					<circle cx="15" cy="5" r="1"/>
					<circle cx="15" cy="12" r="1"/>
					<circle cx="15" cy="19" r="1"/>
				</svg>
			</div>

			<a href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 w-full">
				{faviconUrl ? (
					<img src={faviconUrl} alt="" className="w-8 h-8 rounded" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
				) : (
					<div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-xs">
						{link.name.charAt(0).toUpperCase()}
					</div>
				)}
				<span className="text-sm text-center truncate w-full text-gray-100 text-shadow">{link.name}</span>
			</a>
		</div>
	);
}
