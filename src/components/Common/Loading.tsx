/**
 * Loading — full-page loading indicator used while family-graph.json is fetched.
 */
interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Loading…' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center h-full text-gray-500 gap-2">
      <span className="animate-spin text-xl">⏳</span>
      <span>{message}</span>
    </div>
  );
}
