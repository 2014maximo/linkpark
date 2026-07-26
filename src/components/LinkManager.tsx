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
	clearBackgroundImage,
	clearAllLinks,
	clearAllCategoriesAndLinks,
	clearAllData,
} from '../lib/db';
import { useIsMobile } from '../lib/useIsMobile';
import { LinkCard } from './LinkCard';
import { CategoryManager } from './CategoryManager';
import { LinksManager } from './LinksManager';
import { BackgroundPicker } from './BackgroundPicker';
import { SortableCategoryContainer } from './SortableCategoryContainer';
import { DuplicateModal } from './DuplicateModal';
import { ExportModal } from './ExportModal';
import { Search, Upload, Download, FolderPlus, Image, Settings, Trash2, Share2 } from 'lucide-react';
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
	const [isExportModalOpen, setIsExportModalOpen] = useState(false);
	const [exportMode, setExportMode] = useState<'export' | 'share'>('export');
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [duplicateConflict, setDuplicateConflict] = useState<{
		incomingName: string;
		incomingUrl: string;
		incomingCategory: string;
		existingLink: Link;
		existingCategoryName: string;
		matchType: 'name' | 'url';
		resolve: ((action: 'skip' | 'replace' | 'add') => void) | null;
	} | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const isMobile = useIsMobile();

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

		const categoryMap = new Map<string, Category>();
		for (const cat of categories) {
			categoryMap.set(cat.name.toLowerCase(), cat);
		}

		const currentLinks = [...links];
		const currentCategories = [...categories];

		function askUser(
			incomingName: string,
			incomingUrl: string,
			incomingCategory: string,
			existingLink: Link,
			existingCategoryName: string,
			matchType: 'name' | 'url'
		): Promise<'skip' | 'replace' | 'add'> {
			return new Promise(resolve => {
				setDuplicateConflict({
					incomingName,
					incomingUrl,
					incomingCategory,
					existingLink,
					existingCategoryName,
					matchType,
					resolve,
				});
			});
		}

		for (const linkData of parsedLinks) {
			const categoryKey = linkData.category.toLowerCase();
			let category = categoryMap.get(categoryKey);

			if (!category) {
				const maxOrder = currentCategories.reduce((max, c) => Math.max(max, c.order), -1);
				category = await addCategory(linkData.category, maxOrder + 1);
				categoryMap.set(categoryKey, category);
				currentCategories.push(category);
			}

			const exactDuplicate = currentLinks.find(
				l => l.name.toLowerCase() === linkData.name.toLowerCase() && l.url.toLowerCase() === linkData.url.toLowerCase()
			);
			if (exactDuplicate) {
				continue;
			}

			const nameConflict = currentLinks.find(l => l.name.toLowerCase() === linkData.name.toLowerCase());
			const urlConflict = currentLinks.find(l => l.url.toLowerCase() === linkData.url.toLowerCase());
			const conflict = nameConflict || urlConflict;

			if (conflict) {
				const matchType = nameConflict ? 'name' : 'url';
				const conflictCategory = currentCategories.find(c => c.id === conflict.categoryId);
				const action = await askUser(
					linkData.name,
					linkData.url,
					linkData.category,
					conflict,
					conflictCategory?.name || 'General',
					matchType
				);

				if (action === 'skip') {
					continue;
				} else if (action === 'replace') {
					await updateLink({
						...conflict,
						url: linkData.url,
						name: linkData.name,
						categoryId: category.id,
					});
					const idx = currentLinks.findIndex(l => l.id === conflict.id);
					if (idx !== -1) {
						currentLinks[idx] = { ...conflict, url: linkData.url, name: linkData.name, categoryId: category.id };
					}
				} else {
					const maxLinkOrder = currentLinks
						.filter(l => l.categoryId === category!.id)
						.reduce((max, l) => Math.max(max, l.order), -1);
					const newLink = await addLink({
						url: linkData.url,
						name: linkData.name,
						categoryId: category.id,
						order: maxLinkOrder + 1,
					});
					currentLinks.push(newLink);
				}
			} else {
				const maxLinkOrder = currentLinks
					.filter(l => l.categoryId === category!.id)
					.reduce((max, l) => Math.max(max, l.order), -1);
				const newLink = await addLink({
					url: linkData.url,
					name: linkData.name,
					categoryId: category.id,
					order: maxLinkOrder + 1,
				});
				currentLinks.push(newLink);
			}
		}

		setDuplicateConflict(null);
		await loadData();
		event.target.value = '';
	}

	function handleExport(filename: string) {
		const text = exportLinksToText(links, categories);
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${filename}.txt`;
		a.click();
		URL.revokeObjectURL(url);
		setIsExportModalOpen(false);
	}

	async function handleShare(filename: string) {
		const text = exportLinksToText(links, categories);
		const file = new File([text], `${filename}.txt`, { type: 'text/plain' });
		try {
			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				await navigator.share({ files: [file], title: 'Mis Links' });
			} else {
				handleExport(filename);
			}
		} catch {
			handleExport(filename);
		}
		setIsExportModalOpen(false);
	}

	async function handleClearAll() {
		if (confirm('¿Estás seguro de borrar TODO? Se eliminarán todos los links, categorías y el fondo.')) {
			await clearAllData();
			const bgLayer = document.getElementById('bg-layer');
			if (bgLayer) bgLayer.style.backgroundImage = '';
			setIsDeleteMenuOpen(false);
			await loadData();
		}
	}

	async function handleClearLinksOnly() {
		if (confirm('¿Estás seguro de borrar solo los links? Las categorías se mantendrán.')) {
			await clearAllLinks();
			setIsDeleteMenuOpen(false);
			await loadData();
		}
	}

	async function handleClearCategoriesWithLinks() {
		if (confirm('¿Estás seguro de borrar las categorías y todos sus links?')) {
			await clearAllCategoriesAndLinks();
			setIsDeleteMenuOpen(false);
			await loadData();
		}
	}

	async function handleClearBackground() {
		await clearBackgroundImage();
		const bgLayer = document.getElementById('bg-layer');
		if (bgLayer) bgLayer.style.backgroundImage = '';
		setIsDeleteMenuOpen(false);
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
							{isMobile ? (
								<button onClick={() => { setExportMode('share'); setIsExportModalOpen(true); }} className="btn-secondary">
									<Share2 size={18} />
									<span>Compartir</span>
								</button>
							) : (
								<button onClick={() => { setExportMode('export'); setIsExportModalOpen(true); }} className="btn-secondary">
									<Download size={18} />
									<span>Exportar</span>
								</button>
							)}
							<button onClick={() => setIsCategoryModalOpen(true)} className="btn-secondary">
								<FolderPlus size={18} />
								<span>Categorías</span>
							</button>
							<div className="relative">
								<button onClick={() => setIsDeleteMenuOpen(!isDeleteMenuOpen)} className="btn-secondary">
									<Trash2 size={18} />
									<span>Borrar</span>
								</button>
								{isDeleteMenuOpen && (
									<div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
										<button
											onClick={handleClearAll}
											className="w-full text-left px-4 py-3 text-gray-200 hover:bg-white/10 transition-colors rounded-t-lg border-b border-white/10"
										>
											<div className="font-medium">Borrar todo</div>
											<div className="text-xs text-gray-400">Links, categorías y fondo</div>
										</button>
										<button
											onClick={handleClearLinksOnly}
											className="w-full text-left px-4 py-3 text-gray-200 hover:bg-white/10 transition-colors border-b border-white/10"
										>
											<div className="font-medium">Borrar solo links</div>
											<div className="text-xs text-gray-400">Mantener categorías</div>
										</button>
										<button
											onClick={handleClearCategoriesWithLinks}
											className="w-full text-left px-4 py-3 text-gray-200 hover:bg-white/10 transition-colors border-b border-white/10"
										>
											<div className="font-medium">Borrar categorías con links</div>
											<div className="text-xs text-gray-400">Eliminar todo el contenido</div>
										</button>
										<button
											onClick={handleClearBackground}
											className="w-full text-left px-4 py-3 text-gray-200 hover:bg-white/10 transition-colors rounded-b-lg"
										>
											<div className="font-medium">Borrar fondo</div>
											<div className="text-xs text-gray-400">Restablecer fondo</div>
										</button>
									</div>
								)}
							</div>
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
							<SortableCategoryContainer key={category.id} id={category.id} name={category.name} onDeleteCategory={() => handleDeleteCategory(category.id)} onEditCategory={() => { setManagingCategoryId(category.id); setIsLinksManagerOpen(true); }} showControls={isMobile && isSettingsOpen}>
								{categoryLinks.length === 0 ? (
									<p className="text-gray-400 text-sm">No hay links en esta categoría</p>
								) : (
									<SortableContext items={categoryLinks.map(l => l.id)} strategy={rectSortingStrategy}>
										<div className="grid grid-cols-3 md:grid-cols-5 gap-3">
											{categoryLinks.map(link => (
												<LinkCard
													key={link.id}
													link={link}
													showControls={isMobile && isSettingsOpen}
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

			{isExportModalOpen && (
				<ExportModal
					mode={exportMode}
					onClose={() => setIsExportModalOpen(false)}
					onConfirm={exportMode === 'export' ? handleExport : handleShare}
				/>
			)}

			{duplicateConflict && (
				<DuplicateModal
					incomingName={duplicateConflict.incomingName}
					incomingUrl={duplicateConflict.incomingUrl}
					incomingCategory={duplicateConflict.incomingCategory}
					existingName={duplicateConflict.existingLink.name}
					existingUrl={duplicateConflict.existingLink.url}
					existingCategory={duplicateConflict.existingCategoryName}
					matchType={duplicateConflict.matchType}
					onSkip={() => {
						duplicateConflict.resolve?.('skip');
						setDuplicateConflict(null);
					}}
					onReplace={() => {
						duplicateConflict.resolve?.('replace');
						setDuplicateConflict(null);
					}}
					onAddAnyway={() => {
						duplicateConflict.resolve?.('add');
						setDuplicateConflict(null);
					}}
				/>
			)}
		</div>
	);
}
