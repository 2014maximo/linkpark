import type { Link } from '../types';
import { getFaviconUrl } from '../lib/db';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LinkCardProps {
	link: Link;
	onEdit: () => void;
	onDelete: () => void;
}

export function LinkCard({ link, onEdit, onDelete }: LinkCardProps) {
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
			className="group relative bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition-colors"
		>
			<div {...attributes} {...listeners} className="absolute top-1 left-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
				<GripVertical size={14} className="text-gray-400" />
			</div>

			<div className="flex flex-col items-center gap-2">
				<a href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 w-full">
					{faviconUrl ? (
						<img src={faviconUrl} alt="" className="w-8 h-8 rounded" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
					) : (
						<div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-xs">
							{link.name.charAt(0).toUpperCase()}
						</div>
					)}
					<span className="text-sm text-center truncate w-full text-gray-100">{link.name}</span>
				</a>
			</div>

			<div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<button onClick={onEdit} className="p-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors" title="Editar">
					<Edit2 size={12} />
				</button>
				<button onClick={onDelete} className="p-1 bg-red-600 hover:bg-red-700 rounded transition-colors" title="Eliminar">
					<Trash2 size={12} />
				</button>
			</div>
		</div>
	);
}
