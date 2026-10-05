import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicTabBar } from "@/components/layout/public-tab-bar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="aurora flex min-h-dvh flex-col">
      <PublicHeader />
      <div className="flex-1 pb-24 lg:pb-0">{children}</div>
      <PublicFooter />
      <PublicTabBar />
    </div>
  );
}
