import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: ReactNode;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: string;
  suffix?: ReactNode;
  error?: string;
}

export function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  helperText,
  required,
  multiline,
  rows = 3,
  type = 'text',
  suffix,
  error
}: FormFieldProps) {
  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium uppercase tracking-wide text-text-muted">
        {label}
        {required && <span className="text-primary">*</span>}
      </label>
      <div className="relative flex w-full items-center">
        <InputComponent
          id={id}
          value={value}
          onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          rows={multiline ? rows : undefined}
          className={clsx(
            'w-full rounded-md border border-border bg-input-bg px-3 py-3 text-sm text-text-base shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
            multiline && 'resize-none',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-100'
          )}
          required={required}
          spellCheck={false}
          autoComplete="off"
          {...(!multiline ? { type } : {})}
        />
        {suffix ? <div className="absolute inset-y-0 right-2 flex items-center">{suffix}</div> : null}
      </div>
      <div className="text-xs text-text-muted">
        {error ? <span className="text-red-500">{error}</span> : helperText}
      </div>
    </div>
  );
}
