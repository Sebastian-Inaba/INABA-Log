// src/components/AdminComps/ChildComps/FileUpload.tsx
interface FileUploadProps {
    label: string;
    accept: string;
    onChange: (file: File | null) => void;
    previewUrl?: string | null;
    previewName?: string | null;
}

export function FileUpload({ label, accept, onChange, previewUrl, previewName }: FileUploadProps) {
    return (
        <div>
            <label className="block text-sm font-semibold text-purple-300 mb-1">{label}</label>
            <input
                type="file"
                accept={accept}
                onChange={(e) => onChange(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-purple-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            />
            {previewUrl && <img src={previewUrl} alt="preview" className="mt-2 w-full h-48 object-cover rounded-lg" />}
            {previewName && <p className="text-xs text-purple-400 mt-2">Selected: {previewName}</p>}
        </div>
    );
}
