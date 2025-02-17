'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Something went wrong!</h2>
            <button
              onClick={() => reset()}
              className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
} 