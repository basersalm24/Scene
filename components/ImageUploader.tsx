import React, { useRef } from 'react';
import { useTranslations } from '../contexts/LanguageContext';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    onImageRemove: () => void;
    uploadedImagePreview: string | null;
    label: string;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const RemoveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onImageRemove, uploadedImagePreview, label }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslations();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the file input
        onImageRemove();
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                {label}
            </label>
            <div
                onClick={handleUploadClick}
                className="relative flex justify-center items-center w-full h-48 bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-indigo-500 transition duration-300 group"
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                />
                {uploadedImagePreview ? (
                    <>
                        <img src={uploadedImagePreview} alt="Uploaded preview" className="h-full w-full object-contain rounded-lg p-2" />
                        <button
                            onClick={handleRemoveClick}
                            className="absolute top-2 right-2 p-1.5 bg-slate-800/70 text-white rounded-full hover:bg-slate-700/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-opacity opacity-0 group-hover:opacity-100 duration-200"
                            aria-label={t('uploader.removeAriaLabel')}
                        >
                            <RemoveIcon />
                        </button>
                    </>
                ) : (
                    <div className="text-center text-slate-500">
                        <UploadIcon />
                        <p>{t('uploader.cta')}</p>
                        <p className="text-xs">{t('uploader.fileTypes')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};