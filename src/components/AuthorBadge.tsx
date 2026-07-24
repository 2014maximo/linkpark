import { useState } from 'react';

const baseUrl = import.meta.env.BASE_URL;

export function AuthorBadge() {
	const [showAvatar, setShowAvatar] = useState(false);

	return (
		<div className="fixed bottom-4 right-4 flex items-center gap-2 z-50">
			{showAvatar && (
				<img
					src={`${baseUrl}/author.png`}
					alt="Author"
					className="w-14 h-14 rounded-full border-2 border-white/20 shadow-lg"
				/>
			)}
			<button
				onClick={() => setShowAvatar(!showAvatar)}
				className="opacity-50 hover:opacity-100 transition-opacity"
			>
				<img
					src={`${baseUrl}/firma5.png`}
					alt="Signature"
					className="h-16 w-auto"
				/>
			</button>
		</div>
	);
}
