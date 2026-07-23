import { useState, useEffect } from 'react';
import type { Link, Category } from '../types';
import {
	getAllLinks,
	getAllCategories,
	addLink,
	updateLink,
	deleteLink,
	addCategory,
	updateCategory,
	deleteCategory,
	reorderLinks,
	reorderCategories,
	parseLinksFile,
	exportLinksToText,
	getBackgroundImage,
} from '../lib/db';
import { LinkCard } from './LinkCard';
import { AddLinkModal } from './AddLinkModal';
import { CategoryManager } from './CategoryManager';
import { BackgroundPicker } from './BackgroundPicker';
import { Search, Upload, Download, Plus, FolderPlus, Image, Trash2 } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

export function LinkManager() {
	const [links, setLinks] = useState<Link[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
	const [editingLink, setEditingLink] = useState<Link | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string>('all');

	useEffect(() => {
		loadData();
		getBackgroundImage().then(bg => {
			const bgLayer = document.getElementById('bg-layer');
			if (bgLayer && bg) bgLayer.style.backgroundImage = `url(${bg})`;
		});
	}, []);

	async function loadData() {
		const [linksData, categoriesData] = await Promise.all([getAllLinks(), getAllCategories()]);
		setLinks(linksData);
		setCategories(categoriesData);
	}

	const filteredLinks = links.filter(link => {
		const matchesSearch =
			link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			link.url.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory = selectedCategory === 'all' || link.categoryId === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const linksByCategory = categories.map(category => ({
		category,
		links: filteredLinks.filter(link => link.categoryId === category.id),
	}));

	async function handleAddLink(url: string, name: string, categoryId: string) {
		const maxOrder = links.filter(l => l.categoryId === categoryId).reduce((max, l) => Math.max(max, l.order), -1);
		await addLink({ url, name, categoryId, order: maxOrder + 1 });
		await loadData();
	}

	async function handleUpdateLink(id: string, url: string, name: string, categoryId: string) {
		const link = links.find(l => l.id === id);
		if (link) {
			await updateLink({ ...link, url, name, categoryId });
			await loadData();
		}
	}

	async function handleDeleteLink(id: string) {
		if (confirm('¿Estás seguro de eliminar este link?')) {
			await deleteLink(id);
			await loadData();
		}
	}

	async function handleAddCategory(name: string) {
		const maxOrder = categories.reduce((max, c) => Math.max(max, c.order), -1);
		await addCategory(name, maxOrder + 1);
		await loadData();
	}

	async function handleUpdateCategory(id: string, name: string) {
		const category = categories.find(c => c.id === id);
		if (category) {
			await updateCategory({ ...category, name });
			await loadData();
		}
	}

	async function handleDeleteCategory(id: string) {
		if (confirm('¿Estás seguro de eliminar esta categoría y todos sus links?')) {
			await deleteCategory(id);
			await loadData();
		}
	}

	async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		const content = await file.text();
		const parsedLinks = parseLinksFile(content);

		for (const linkData of parsedLinks) {
			let category = categories.find(c => c.name === linkData.category);
			if (!category) {
				const maxOrder = categories.reduce((max, c) => Math.max(max, c.order), -1);
				category = await addCategory(linkData.category, maxOrder + 1);
			}

			const maxLinkOrder = links
				.filter(l => l.categoryId === category!.id)
				.reduce((max, l) => Math.max(max, l.order), -1);

			await addLink({
				url: linkData.url,
				name: linkData.name,
				categoryId: category.id,
				order: maxLinkOrder + 1,
			});
		}

		await loadData();
		event.target.value = '';
	}

	function handleExport() {
		const text = exportLinksToText(links, categories);
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'links.txt';
		a.click();
		URL.revokeObjectURL(url);
	}

	async function handleDragEndLinks(event: DragEndEvent, categoryId: string) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const categoryLinks = links.filter(l => l.categoryId === categoryId);
		const oldIndex = categoryLinks.findIndex(l => l.id === active.id);
		const newIndex = categoryLinks.findIndex(l => l.id === over.id);
		const newCategoryLinks = arrayMove(categoryLinks, oldIndex, newIndex);

		await reorderLinks(newCategoryLinks);
		await loadData();
	}

	async function handleDragEndCategories(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = categories.findIndex(c => c.id === active.id);
		const newIndex = categories.findIndex(c => c.id === over.id);
		const newCategories = arrayMove(categories, oldIndex, newIndex);

		await reorderCategories(newCategories);
		await loadData();
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<h1 className="text-5xl font-bold shrink-0 title-shadow">LINKPARK</h1>
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
					<input
						type="text"
						placeholder="Buscar links..."
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className="input-field pl-10 w-full"
					/>
				</div>
				<select
					value={selectedCategory}
					onChange={e => setSelectedCategory(e.target.value)}
					className="input-field w-full md:w-64"
				>
					<option value="all">Todas las categorías</option>
					{categories.map(cat => (
						<option key={cat.id} value={cat.id}>
							{cat.name}
						</option>
					))}
				</select>
				<div className="flex gap-2 flex-wrap shrink-0">
					<button onClick={() => setIsBackgroundModalOpen(true)} className="btn-secondary">
						<Image size={18} />
						<span>Fondo</span>
					</button>
					<label className="btn-secondary cursor-pointer">
						<Upload size={18} />
						<span>Importar</span>
						<input type="file" accept=".txt" onChange={handleImport} className="hidden" />
					</label>
					<button onClick={handleExport} className="btn-secondary">
						<Download size={18} />
						<span>Exportar</span>
					</button>
					<button onClick={() => setIsCategoryModalOpen(true)} className="btn-secondary">
						<FolderPlus size={18} />
						<span>Categorías</span>
					</button>
					<button onClick={() => { setEditingLink(null); setIsModalOpen(true); }} className="btn-primary">
						<Plus size={18} />
						<span>Agregar Link</span>
					</button>
				</div>
			</div>

			{categories.length === 0 && (
				<div className="text-center py-12 text-gray-400">
					<p className="text-lg">No hay categorías creadas</p>
					<p className="text-sm mt-2">Comienza creando una categoría o importando links desde un archivo</p>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{linksByCategory
					.filter(({ category }) => selectedCategory === 'all' || category.id === selectedCategory)
					.map(({ category, links: categoryLinks }) => (
					<div key={category.id} className="glass-container rounded-lg p-4 group/container relative">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold text-gray-100 title-shadow">{category.name}</h2>
							<div className="flex gap-1 opacity-0 group-hover/container:opacity-100 transition-opacity">
								<button
									onClick={() => { setEditingLink(null); setSelectedCategory(category.id); setIsModalOpen(true); }}
									className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
									title="Agregar link"
								>
									<Plus size={14} />
								</button>
								<button
									onClick={() => handleDeleteCategory(category.id)}
									className="p-1 text-red-400 hover:text-red-300 transition-colors"
									title="Eliminar categoría"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>
						{categoryLinks.length === 0 ? (
							<p className="text-gray-400 text-sm">No hay links en esta categoría</p>
						) : (
							<DndContext collisionDetection={closestCenter} onDragEnd={e => handleDragEndLinks(e, category.id)}>
								<SortableContext items={categoryLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
										{categoryLinks.map(link => (
											<LinkCard
												key={link.id}
												link={link}
											/>
										))}
									</div>
								</SortableContext>
							</DndContext>
						)}
					</div>
				))}
			</div>

			{isModalOpen && (
				<AddLinkModal
					categories={categories}
					link={editingLink}
					defaultCategoryId={editingLink ? undefined : selectedCategory !== 'all' ? selectedCategory : undefined}
					onClose={() => {
						setIsModalOpen(false);
						setEditingLink(null);
					}}
					onSave={async (url, name, categoryId) => {
						if (editingLink) {
							await handleUpdateLink(editingLink.id, url, name, categoryId);
						} else {
							await handleAddLink(url, name, categoryId);
						}
						setIsModalOpen(false);
						setEditingLink(null);
					}}
				/>
			)}

			{isCategoryModalOpen && (
				<CategoryManager
					categories={categories}
					onClose={() => setIsCategoryModalOpen(false)}
					onAdd={handleAddCategory}
					onUpdate={handleUpdateCategory}
					onDelete={handleDeleteCategory}
				/>
			)}

			{isBackgroundModalOpen && (
				<BackgroundPicker onClose={() => setIsBackgroundModalOpen(false)} />
			)}
		</div>
	);
}
