export default function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-3 border-amber-200 border-t-amber-700 rounded-full animate-spin`} />
      {text && <p className="text-stone-500 text-sm">{text}</p>}
    </div>
  );
}
