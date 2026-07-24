import { useState, useEffect } from 'react';
import type { Link, Category } from '../types';
import { X, Edit2, Trash2, Plus } from 'lucide-react';

interface LinksManagerProps {
	links: Link[];
	category: Category;
	onClose: () => void;
	onAdd: (url: string, name: string) => Promise<void>;
	onUpdate: (id: string, url: string, name: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
}

export function LinksManager({ links, category, onClose, onAdd, onUpdate, onDelete }: LinksManagerProps) {
	const [newLinkUrl, setNewLinkUrl] = useState('');
	const [newLinkName, setNewLinkName] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingUrl, setEditingUrl] = useState('');
	const [editingName, setEditingName] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (editingId === null) {
			setNewLinkUrl('');
			setNewLinkName('');
		}
	}, [editingId]);

	async function handleAdd(e: React.FormEvent) {
		e.preventDefault();
		if (!newLinkUrl.trim() || !newLinkName.trim()) return;

		setIsSubmitting(true);
		try {
			await onAdd(newLinkUrl.trim(), newLinkName.trim());
			setNewLinkUrl('');
			setNewLinkName('');
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleUpdate(id: string) {
		if (!editingUrl.trim() || !editingName.trim()) return;

		setIsSubmitting(true);
		try {
			await onUpdate(id, editingUrl.trim(), editingName.trim());
			setEditingId(null);
			setEditingUrl('');
			setEditingName('');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
			<div className="rounded-lg p-6 w-full max-w-2xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} onClick={e => e.stopPropagation()}>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold title-shadow">Gestionar Links de {category.name}</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-100">
						<X size={24} />
					</button>
				</div>

				<form onSubmit={handleAdd} className="flex gap-2 mb-4">
					<input
						type="url"
						value={newLinkUrl}
						onChange={e => setNewLinkUrl(e.target.value)}
						placeholder="URL"
						className="input-field flex-1"
						required
					/>
					<input
						type="text"
						value={newLinkName}
						onChange={e => setNewLinkName(e.target.value)}
						placeholder="Nombre"
						className="input-field flex-1"
						required
					/>
					<button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-50">
						<Plus size={18} />
					</button>
				</form>

				<div className="space-y-2 max-h-96 overflow-y-auto">
					{links.length === 0 ? (
						<p className="text-gray-400 text-center py-4">No hay links en esta categoría</p>
					) : (
						links.map(link => (
							<div key={link.id} className="flex items-center gap-2 glass-container rounded p-2">
								{editingId === link.id ? (
									<>
										<input
											type="url"
											value={editingUrl}
											onChange={e => setEditingUrl(e.target.value)}
											className="input-field flex-1"
											placeholder="URL"
											autoFocus
										/>
										<input
											type="text"
											value={editingName}
											onChange={e => setEditingName(e.target.value)}
											className="input-field flex-1"
											placeholder="Nombre"
										/>
										<button
											onClick={() => handleUpdate(link.id)}
											disabled={isSubmitting}
											className="p-1 text-green-400 hover:text-green-300 transition-colors"
										>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M20 6 9 17l-5-5"/>
											</svg>
										</button>
										<button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-300 transition-colors">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M18 6 6 18M6 6l12 12"/>
											</svg>
										</button>
									</>
								) : (
									<>
										<div className="flex-1 min-w-0">
											<div className="font-medium truncate">{link.name}</div>
											<div className="text-xs text-gray-400 truncate">{link.url}</div>
										</div>
										<button
											onClick={() => {
												setEditingId(link.id);
												setEditingUrl(link.url);
												setEditingName(link.name);
											}}
											className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
										>
											<Edit2 size={14} />
										</button>
										<button
											onClick={() => onDelete(link.id)}
											className="p-1 text-red-400 hover:text-red-300 transition-colors"
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
