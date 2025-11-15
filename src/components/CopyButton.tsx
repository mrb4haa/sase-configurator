import { useState } from 'react';
import { clsx } from 'clsx';

interface CopyButtonProps {
  value: string;
  label?: string;
  variant?: 'primary' | 'ghost';
  className?: string;
}

export function CopyButton({ value, label = 'Copy', variant = 'ghost', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={clsx(
        'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary'
          ? 'border-transparent bg-primary text-white hover:bg-[#c81d24]'
          : 'border-border bg-transparent text-text-base hover:bg-hover-bg',
        className
      )}
    >
      <span className="leading-none">{copied ? 'Copied' : label}</span>
    </button>
  );
}
