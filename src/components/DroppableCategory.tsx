import { useDroppable } from '@dnd-kit/core';

interface DroppableCategoryProps {
	id: string;
	children: React.ReactNode;
	className?: string;
}

export function DroppableCategory({ id, children, className }: DroppableCategoryProps) {
	const { isOver, setNodeRef } = useDroppable({
		id,
	});

	return (
		<div ref={setNodeRef} className={`${className || ''} ${isOver ? 'ring-2 ring-blue-500/50' : ''}`}>
			{children}
		</div>
	);
}
