"use client";

import { Component, Suspense, startTransition, type ReactNode } from "react";
import { ErrorState } from "@/components/layout/error-state";
import { useRouter } from "@/i18n/navigation";

type BoundaryProps = { children: ReactNode; onRetry: () => void };

/** Server komponentlardagi xatolarni ham ushlaydi: faqat shu bo'lim xato holatini ko'rsatadi */
class ErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  retry = () => {
    this.setState({ failed: false });
    this.props.onRetry();
  };

  render() {
    return this.state.failed ? <ErrorState onRetry={this.retry} /> : this.props.children;
  }
}

export function SectionBoundary({ fallback, children }: { fallback: ReactNode; children: ReactNode }) {
  const router = useRouter();
  return (
    <ErrorBoundary onRetry={() => startTransition(() => router.refresh())}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
