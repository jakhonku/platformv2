"use client";

import { Component, Suspense, startTransition, type ReactNode } from "react";
import { ErrorState } from "@/components/layout/error-state";
import { useRouter } from "@/i18n/navigation";

type BoundaryProps = { children: ReactNode; onRetry: () => void };

/** Next.js boshqaruv xatolari (redirect, notFound) oddiy xato emas: ularni yuqoriga qaytarish kerak */
const isControlFlow = (error: unknown): boolean =>
  typeof error === "object" && error !== null && typeof (error as { digest?: unknown }).digest === "string" && (error as { digest: string }).digest.startsWith("NEXT_");

/** Server komponentlardagi xatolarni ham ushlaydi: faqat shu bo'lim xato holatini ko'rsatadi */
class ErrorBoundary extends Component<BoundaryProps, { error: unknown; failed: boolean }> {
  state = { error: null as unknown, failed: false };

  static getDerivedStateFromError(error: unknown) {
    return { error, failed: true };
  }

  retry = () => {
    this.setState({ error: null, failed: false });
    this.props.onRetry();
  };

  render() {
    if (this.state.failed) {
      if (isControlFlow(this.state.error)) throw this.state.error;
      return <ErrorState onRetry={this.retry} />;
    }
    return this.props.children;
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
