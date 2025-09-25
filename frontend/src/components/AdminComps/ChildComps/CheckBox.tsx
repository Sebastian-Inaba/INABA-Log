// src/components/AdminComps/ChildComps/CheckBox.tsx
interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function Checkbox ({ label, checked, onChange }: CheckboxProps) {
    return (
        <div className="flex items-center">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label className="ml-2 block text-sm text-purple-300">{label}</label>
        </div>
    )
};
