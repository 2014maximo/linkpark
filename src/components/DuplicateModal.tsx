import { X } from 'lucide-react';

interface DuplicateModalProps {
	incomingName: string;
	incomingUrl: string;
	incomingCategory: string;
	existingName: string;
	existingUrl: string;
	existingCategory: string;
	matchType: 'name' | 'url';
	onSkip: () => void;
	onReplace: () => void;
	onAddAnyway: () => void;
}

export function DuplicateModal({
	incomingName,
	incomingUrl,
	incomingCategory,
	existingName,
	existingUrl,
	existingCategory,
	matchType,
	onSkip,
	onReplace,
	onAddAnyway,
}: DuplicateModalProps) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="rounded-lg p-6 w-full max-w-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold title-shadow">Link duplicado encontrado</h2>
				</div>

				<div className="mb-4 p-3 rounded bg-yellow-500/10 border border-yellow-500/30">
					<p className="text-yellow-200 text-sm">
						El link entrante coincide con uno existente por <strong>{matchType === 'name' ? 'nombre' : 'URL'}</strong>
					</p>
				</div>

				<div className="space-y-4 mb-6">
					<div className="p-3 rounded bg-blue-500/10 border border-blue-500/30">
						<h3 className="text-blue-300 font-medium mb-2">Link existente:</h3>
						<p className="text-sm text-gray-200"><strong>Nombre:</strong> {existingName}</p>
						<p className="text-sm text-gray-200"><strong>URL:</strong> {existingUrl}</p>
						<p className="text-sm text-gray-200"><strong>Categoría:</strong> {existingCategory}</p>
					</div>

					<div className="p-3 rounded bg-green-500/10 border border-green-500/30">
						<h3 className="text-green-300 font-medium mb-2">Link a importar:</h3>
						<p className="text-sm text-gray-200"><strong>Nombre:</strong> {incomingName}</p>
						<p className="text-sm text-gray-200"><strong>URL:</strong> {incomingUrl}</p>
						<p className="text-sm text-gray-200"><strong>Categoría:</strong> {incomingCategory}</p>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<button
						onClick={onSkip}
						className="btn-secondary justify-center"
					>
						Saltar (mantener existente)
					</button>
					<button
						onClick={onReplace}
						className="btn-secondary justify-center"
					>
						Reemplazar existente
					</button>
					<button
						onClick={onAddAnyway}
						className="btn-secondary justify-center"
					>
						Agregar de todos modos
					</button>
				</div>
			</div>
		</div>
	);
}
