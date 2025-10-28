// src/components/AdminComps/ChildComps/StatusMessages.tsx
interface StatusMessagesProps {
    status: { error: string | null; success: string | null };
}

export function StatusMessages({ status }: StatusMessagesProps) {
    return (
        <div className="mt-6">
            {status.error && (
                <div className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
                    {status.error}
                </div>
            )}
            {status.success && (
                <div className="p-3 bg-green-900 border border-green-700 text-green-200 rounded-lg">
                    {status.success}
                </div>
            )}
        </div>
    );
}
