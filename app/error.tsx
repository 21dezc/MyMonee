"use client";

import ErrorView from "./_components/ErrorView";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView error={error} reset={reset} fullScreen />;
}
