import { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Image } from 'lucide-react';
import { getBackgroundImage, setBackgroundImage, clearBackgroundImage } from '../lib/db';

interface BackgroundPickerProps {
	onClose: () => void;
}

export function BackgroundPicker({ onClose }: BackgroundPickerProps) {
	const [currentBg, setCurrentBg] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		getBackgroundImage().then(setCurrentBg);
	}, []);

	useEffect(() => {
		const bgLayer = document.getElementById('bg-layer');
		if (bgLayer) {
			const img = preview || currentBg;
			bgLayer.style.backgroundImage = img ? `url(${img})` : '';
		}
	}, [preview, currentBg]);

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			setPreview(result);
		};
		reader.readAsDataURL(file);
	}

	async function handleSave() {
		if (preview) {
			await setBackgroundImage(preview);
			setCurrentBg(preview);
			setPreview(null);
		}
	}

	async function handleRemove() {
		await clearBackgroundImage();
		setCurrentBg(null);
		setPreview(null);
		const bgLayer = document.getElementById('bg-layer');
		if (bgLayer) bgLayer.style.backgroundImage = '';
	}

	function handleCancel() {
		setPreview(null);
		if (fileInputRef.current) fileInputRef.current.value = '';
		const bgLayer = document.getElementById('bg-layer');
		if (bgLayer) {
			bgLayer.style.backgroundImage = currentBg ? `url(${currentBg})` : '';
		}
		onClose();
	}

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCancel}>
			<div className="rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} onClick={e => e.stopPropagation()}>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold flex items-center gap-2">
						<Image size={22} />
						Imagen de fondo
					</h2>
					<button onClick={handleCancel} className="text-gray-400 hover:text-gray-100">
						<X size={24} />
					</button>
				</div>

				<div className="space-y-4">
					<div className="w-full h-40 bg-gray-900 rounded-lg border border-gray-600 bg-cover bg-center bg-no-repeat flex items-center justify-center"
						style={{ backgroundImage: preview || currentBg ? `url(${preview || currentBg})` : undefined }}
					>
						{!preview && !currentBg && (
							<span className="text-gray-500 text-sm">Sin imagen de fondo</span>
						)}
					</div>

					<label className="btn-secondary cursor-pointer justify-center w-full">
						<Upload size={18} />
						<span>Seleccionar imagen</span>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="hidden"
						/>
					</label>

					<div className="flex gap-2 justify-end pt-2">
						{currentBg && (
							<button onClick={handleRemove} className="btn-secondary !text-red-400">
								<Trash2 size={18} />
								<span>Quitar fondo</span>
							</button>
						)}
						{preview && (
							<button onClick={handleSave} className="btn-primary">
								Guardar
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
