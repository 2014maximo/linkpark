import { useState, useEffect, useRef } from 'react';
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
import { CategoryManager } from './CategoryManager';
import { LinksManager } from './LinksManager';
import { BackgroundPicker } from './BackgroundPicker';
import { SortableCategoryContainer } from './SortableCategoryContainer';
import { Search, Upload, Download, FolderPlus, Image, Settings, Trash2 } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';

export function LinkManager() {
	const [links, setLinks] = useState<Link[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [isLinksManagerOpen, setIsLinksManagerOpen] = useState(false);
	const [managingCategoryId, setManagingCategoryId] = useState<string | null>(null);
	const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	async function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const draggedLink = links.find(l => l.id === active.id);
		const draggedCategory = categories.find(c => c.id === active.id);

		if (draggedCategory) {
			const overCategory = categories.find(c => c.id === over.id);
			if (overCategory) {
				const oldIndex = categories.findIndex(c => c.id === draggedCategory.id);
				const newIndex = categories.findIndex(c => c.id === overCategory.id);
				const newCategories = arrayMove(categories, oldIndex, newIndex);
				await reorderCategories(newCategories);
				await loadData();
			}
			return;
		}

		if (!draggedLink) return;

		const targetCategory = categories.find(c => c.id === over.id);
		const overLink = links.find(l => l.id === over.id);

		if (targetCategory) {
			if (draggedLink.categoryId !== targetCategory.id) {
				await updateLink({ ...draggedLink, categoryId: targetCategory.id });
				await loadData();
			}
		} else if (overLink) {
			if (draggedLink.categoryId !== overLink.categoryId) {
				await updateLink({ ...draggedLink, categoryId: overLink.categoryId });
				await loadData();
			} else {
				const categoryLinks = links.filter(l => l.categoryId === draggedLink.categoryId);
				const oldIndex = categoryLinks.findIndex(l => l.id === active.id);
				const newIndex = categoryLinks.findIndex(l => l.id === over.id);
				const newCategoryLinks = arrayMove(categoryLinks, oldIndex, newIndex);
				await reorderLinks(newCategoryLinks);
				await loadData();
			}
		}
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
			<div className="flex items-center gap-4 flex-wrap">
				<h1 className="text-5xl font-bold shrink-0 title-shadow">LINKPARK</h1>
				<button
					onClick={() => setIsSettingsOpen(!isSettingsOpen)}
					className="p-2 text-gray-400 hover:text-gray-100 transition-colors"
					title="Configuración"
				>
					<Settings size={24} />
				</button>
				{isSettingsOpen && (
					<>
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
						<div className="flex gap-2 flex-wrap w-full">
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
						</div>
					</>
				)}
			</div>

			{categories.length === 0 && (
				<div className="text-center py-12 text-gray-400">
					<p className="text-lg">No hay categorías creadas</p>
					<p className="text-sm mt-2">Comienza creando una categoría o importando links desde un archivo</p>
				</div>
			)}

			<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext items={categories.filter(c => selectedCategory === 'all' || c.id === selectedCategory).map(c => c.id)} strategy={rectSortingStrategy}>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{linksByCategory
							.filter(({ category }) => selectedCategory === 'all' || category.id === selectedCategory)
							.map(({ category, links: categoryLinks }) => (
							<SortableCategoryContainer key={category.id} id={category.id} name={category.name} onDeleteCategory={() => handleDeleteCategory(category.id)} onEditCategory={() => { setManagingCategoryId(category.id); setIsLinksManagerOpen(true); }}>
								{categoryLinks.length === 0 ? (
									<p className="text-gray-400 text-sm">No hay links en esta categoría</p>
								) : (
									<SortableContext items={categoryLinks.map(l => l.id)} strategy={rectSortingStrategy}>
										<div className="grid grid-cols-5 gap-3">
											{categoryLinks.map(link => (
												<LinkCard
													key={link.id}
													link={link}
												/>
											))}
										</div>
									</SortableContext>
								)}
							</SortableCategoryContainer>
						))}
					</div>
				</SortableContext>
			</DndContext>

			{isCategoryModalOpen && (
				<CategoryManager
					categories={categories}
					onClose={() => setIsCategoryModalOpen(false)}
					onAdd={handleAddCategory}
					onUpdate={handleUpdateCategory}
					onDelete={handleDeleteCategory}
				/>
			)}

			{isLinksManagerOpen && managingCategoryId && (
				<LinksManager
					links={links.filter(l => l.categoryId === managingCategoryId)}
					category={categories.find(c => c.id === managingCategoryId)!}
					onClose={() => { setIsLinksManagerOpen(false); setManagingCategoryId(null); }}
					onAdd={async (url, name) => {
						await handleAddLink(url, name, managingCategoryId);
					}}
					onUpdate={async (id, url, name) => {
						await handleUpdateLink(id, url, name, managingCategoryId);
					}}
					onDelete={handleDeleteLink}
				/>
			)}

			{isBackgroundModalOpen && (
				<BackgroundPicker onClose={() => setIsBackgroundModalOpen(false)} />
			)}
		</div>
	);
}
