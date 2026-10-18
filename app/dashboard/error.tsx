"use client";

import ErrorView from "../_components/ErrorView";

// error ในหน้า dashboard จะยังเห็นแถบเมนูด้านบน
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView error={error} reset={reset} />;
}
