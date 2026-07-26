import { X, Check, Palette } from 'lucide-react';

interface TemplateModalProps {
	onClose: () => void;
	currentTemplate: string;
	onSelect: (template: string) => void;
}

export function TemplateModal({ onClose, currentTemplate, onSelect }: TemplateModalProps) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
			<div className="rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} onClick={e => e.stopPropagation()}>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold flex items-center gap-2 title-shadow">
						<Palette size={22} />
						Templates
					</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-100">
						<X size={24} />
					</button>
				</div>

				<div className="space-y-3">
					<button
						onClick={() => onSelect('linkpark')}
						className={`w-full rounded-lg p-4 text-left transition-all border-2 ${
							currentTemplate === 'linkpark'
								? 'border-blue-500 bg-blue-500/10'
								: 'border-white/10 hover:border-white/30'
						}`}
						style={{ backgroundColor: currentTemplate === 'linkpark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}
					>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Six Caps', sans-serif" }}>
									LinkPark Theme
								</h3>
								<p className="text-sm text-gray-400 mb-2" style={{ fontFamily: "'Open Sans Condensed', sans-serif" }}>
									Estilo original con Six Caps y Open Sans Condensed
								</p>
								<div className="rounded p-2 text-xs" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', fontFamily: "'Open Sans Condensed', sans-serif" }}>
									Preview de categoría
								</div>
							</div>
							{currentTemplate === 'linkpark' && (
								<span className="bg-blue-500 rounded-full p-1">
									<Check size={14} className="text-white" />
								</span>
							)}
						</div>
					</button>

					<button
						onClick={() => onSelect('visualtext')}
						className={`w-full rounded-lg p-4 text-left transition-all border-2 ${
							currentTemplate === 'visualtext'
								? 'border-blue-500 bg-blue-500/10'
								: 'border-white/10 hover:border-white/30'
						}`}
						style={{ backgroundColor: currentTemplate === 'visualtext' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.15)' }}
					>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 700 }}>
									Visual Text
								</h3>
								<p className="text-sm text-gray-400 mb-2" style={{ fontFamily: "'Open Sans', sans-serif" }}>
									Open Sans con mayor contraste y legibilidad
								</p>
								<div className="rounded p-2 text-xs" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', fontFamily: "'Open Sans', sans-serif" }}>
									Preview de categoría
								</div>
							</div>
							{currentTemplate === 'visualtext' && (
								<span className="bg-blue-500 rounded-full p-1">
									<Check size={14} className="text-white" />
								</span>
							)}
						</div>
					</button>
				</div>
			</div>
		</div>
	);
}
