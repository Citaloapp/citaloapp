import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900',
        'placeholder:text-gray-400 text-sm resize-none',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      rows={3}
      {...props}
    />
  );
}
