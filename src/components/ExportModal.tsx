import { useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';

interface ExportModalProps {
	onClose: () => void;
	onConfirm: (filename: string) => void;
	mode: 'export' | 'share';
}

export function ExportModal({ onClose, onConfirm, mode }: ExportModalProps) {
	const [filename, setFilename] = useState('links');

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!filename.trim()) return;
		onConfirm(filename.trim());
	}

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
			<div className="rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} onClick={e => e.stopPropagation()}>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold flex items-center gap-2 title-shadow">
						{mode === 'export' ? <Download size={22} /> : <Share2 size={22} />}
						{mode === 'export' ? 'Exportar links' : 'Compartir links'}
					</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-100">
						<X size={24} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm text-gray-400 mb-2">Nombre del archivo</label>
						<div className="flex items-center gap-2">
							<input
								type="text"
								value={filename}
								onChange={e => setFilename(e.target.value)}
								className="input-field flex-1"
								placeholder="links"
								autoFocus
							/>
							<span className="text-gray-400 text-sm shrink-0">.txt</span>
						</div>
					</div>

					<div className="flex gap-2 justify-end pt-2">
						<button type="button" onClick={onClose} className="btn-secondary">
							Cancelar
						</button>
						<button type="submit" className="btn-primary">
							{mode === 'export' ? 'Exportar' : 'Compartir'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
