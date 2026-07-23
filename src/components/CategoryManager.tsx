import { useState } from 'react';
import type { Category } from '../types';
import { X, Edit2, Trash2, Plus } from 'lucide-react';

interface CategoryManagerProps {
	categories: Category[];
	onClose: () => void;
	onAdd: (name: string) => Promise<void>;
	onUpdate: (id: string, name: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
}

export function CategoryManager({ categories, onClose, onAdd, onUpdate, onDelete }: CategoryManagerProps) {
	const [newCategoryName, setNewCategoryName] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingName, setEditingName] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleAdd(e: React.FormEvent) {
		e.preventDefault();
		if (!newCategoryName.trim()) return;

		setIsSubmitting(true);
		try {
			await onAdd(newCategoryName.trim());
			setNewCategoryName('');
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleUpdate(id: string) {
		if (!editingName.trim()) return;

		setIsSubmitting(true);
		try {
			await onUpdate(id, editingName.trim());
			setEditingId(null);
			setEditingName('');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
			<div className="glass-container rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold">Gestionar Categorías</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-100">
						<X size={24} />
					</button>
				</div>

				<form onSubmit={handleAdd} className="flex gap-2 mb-4">
					<input
						type="text"
						value={newCategoryName}
						onChange={e => setNewCategoryName(e.target.value)}
						placeholder="Nueva categoría"
						className="input-field flex-1"
					/>
					<button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-50">
						<Plus size={18} />
					</button>
				</form>

				<div className="space-y-2 max-h-96 overflow-y-auto">
					{categories.length === 0 ? (
						<p className="text-gray-400 text-center py-4">No hay categorías</p>
					) : (
						categories.map(category => (
							<div key={category.id} className="flex items-center gap-2 glass-container rounded p-2">
								{editingId === category.id ? (
									<>
										<input
											type="text"
											value={editingName}
											onChange={e => setEditingName(e.target.value)}
											className="input-field flex-1"
											autoFocus
										/>
										<button
											onClick={() => handleUpdate(category.id)}
											disabled={isSubmitting}
											className="p-1 bg-green-600 hover:bg-green-700 rounded"
										>
											Guardar
										</button>
										<button onClick={() => setEditingId(null)} className="p-1 bg-gray-600 hover:bg-gray-500 rounded">
											Cancelar
										</button>
									</>
								) : (
									<>
										<span className="flex-1">{category.name}</span>
										<button
											onClick={() => {
												setEditingId(category.id);
												setEditingName(category.name);
											}}
											className="p-1 bg-blue-600 hover:bg-blue-700 rounded"
										>
											<Edit2 size={14} />
										</button>
										<button
											onClick={() => onDelete(category.id)}
											className="p-1 bg-red-600 hover:bg-red-700 rounded"
										>
											<Trash2 size={14} />
										</button>
									</>
								)}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
