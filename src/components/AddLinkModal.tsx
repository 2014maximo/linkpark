import { useState, useEffect } from 'react';
import type { Link, Category } from '../types';
import { X } from 'lucide-react';

interface AddLinkModalProps {
	categories: Category[];
	link: Link | null;
	defaultCategoryId?: string;
	onClose: () => void;
	onSave: (url: string, name: string, categoryId: string) => Promise<void>;
}

export function AddLinkModal({ categories, link, defaultCategoryId, onClose, onSave }: AddLinkModalProps) {
	const [url, setUrl] = useState('');
	const [name, setName] = useState('');
	const [categoryId, setCategoryId] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (link) {
			setUrl(link.url);
			setName(link.name);
			setCategoryId(link.categoryId);
		} else if (defaultCategoryId) {
			setCategoryId(defaultCategoryId);
		} else if (categories.length > 0) {
			setCategoryId(categories[0].id);
		}
	}, [link, categories, defaultCategoryId]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!url || !name || !categoryId) return;

		setIsSubmitting(true);
		try {
			await onSave(url, name, categoryId);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
			<div className="rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} onClick={e => e.stopPropagation()}>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold title-shadow">{link ? 'Editar Link' : 'Agregar Link'}</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-100">
						<X size={24} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">URL</label>
						<input
							type="url"
							value={url}
							onChange={e => setUrl(e.target.value)}
							placeholder="https://ejemplo.com"
							className="input-field w-full"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Nombre</label>
						<input
							type="text"
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder="Mi sitio favorito"
							className="input-field w-full"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Categoría</label>
						<select
							value={categoryId}
							onChange={e => setCategoryId(e.target.value)}
							className="input-field w-full"
							required
						>
							{categories.map(cat => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>
					</div>

					<div className="flex gap-2 justify-end pt-4">
						<button type="button" onClick={onClose} className="btn-secondary">
							Cancelar
						</button>
						<button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-50">
							{isSubmitting ? 'Guardando...' : link ? 'Actualizar' : 'Agregar'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
