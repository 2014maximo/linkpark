import { useState } from 'react';
import type { Link } from '../types';
import { getFaviconUrl } from '../lib/db';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LinkCardProps {
	link: Link;
	showControls?: boolean;
}

export function LinkCard({ link, showControls = false }: LinkCardProps) {
	const [faviconLoaded, setFaviconLoaded] = useState(false);
	const [faviconError, setFaviconError] = useState(false);
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
			<div {...attributes} {...listeners} className={`absolute top-1 left-1 cursor-grab transition-opacity ${showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
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
				<div className="w-8 h-8 relative">
					{!faviconLoaded && (
						<div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center absolute inset-0">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
								<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
								<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
							</svg>
						</div>
					)}
					{faviconUrl && !faviconError && (
						<img
							src={faviconUrl}
							alt=""
							className="w-8 h-8 rounded absolute inset-0"
							onLoad={() => setFaviconLoaded(true)}
							onError={() => setFaviconError(true)}
						/>
					)}
				</div>
				<span className="text-sm text-center truncate w-full text-gray-100 text-shadow">{link.name}</span>
			</a>
		</div>
	);
}
