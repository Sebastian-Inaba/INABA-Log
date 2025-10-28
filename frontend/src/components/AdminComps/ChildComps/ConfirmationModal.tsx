// src/components/AdminComps/ChildComps/ConfirmationModal.tsx
import type { ContentType } from '../../../types';

interface ConfirmationModalProps {
    type: ContentType;
    loading: boolean;
    disabled?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function ConfirmationModal({
    type,
    loading,
    disabled,
    onCancel,
    onConfirm,
}: ConfirmationModalProps) {
    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-70" />
            <div className="relative z-80 bg-neutral-800 border border-purple-700 p-6 rounded-lg w-full max-w-md">
                <h4 className="font-bold text-lg text-purple-300 mb-3">
                    Confirm Action
                </h4>
                <p className="text-neutral-300 mb-4">
                    Are you sure you want to{' '}
                    {type === 'post'
                        ? 'update/create post'
                        : 'update/create deep dive'}
                    ?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading || disabled}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
