import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface SortableCategoryContainerProps {
	id: string;
	name: string;
	children: React.ReactNode;
	onDeleteCategory: () => void;
	onEditCategory: () => void;
}

export function SortableCategoryContainer({ id, name, children, onDeleteCategory, onEditCategory }: SortableCategoryContainerProps) {
	const {
		attributes,
		listeners,
		setNodeRef: setSortableNodeRef,
		transform,
		isDragging,
	} = useSortable({
		id,
	});

	const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
		id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition: 'transform linear',
		opacity: isDragging ? 0.5 : 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	};

	const setRefs = (node: HTMLElement | null) => {
		setSortableNodeRef(node);
		setDroppableNodeRef(node);
	};

	return (
		<div
			ref={setRefs}
			className={`group/container relative rounded-lg p-4 ${
				isOver ? 'ring-2 ring-blue-500/50' : ''
			}`}
			style={style}
		>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<div {...attributes} {...listeners} className="cursor-grab opacity-0 group-hover/container:opacity-100 transition-opacity">
						<GripVertical size={18} className="text-gray-400" />
					</div>
					<h2 className="text-[26px] font-semibold text-gray-100 title-shadow">{name}</h2>
				</div>
				<div className="flex gap-1 opacity-0 group-hover/container:opacity-100 transition-opacity">
					<button
						onClick={onEditCategory}
						className="p-1.5 text-yellow-400 hover:text-yellow-300 transition-colors"
						title="Gestionar links"
					>
						<Plus size={18} />
					</button>
					<button
						onClick={onDeleteCategory}
						className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
						title="Eliminar categoría"
					>
						<Trash2 size={18} />
					</button>
				</div>
			</div>
			{children}
		</div>
	);
}
