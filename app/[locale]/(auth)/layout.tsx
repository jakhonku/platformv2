import { Brand } from "@/components/layout/brand";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="aurora flex min-h-dvh flex-col">
      <header className="px-3 pt-3 sm:px-6">
        <div className="glass-strong mx-auto flex h-14 w-full max-w-7xl items-center justify-between rounded-full px-3 sm:px-4">
          <Brand />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-3 py-8">
        <div className="glass-strong w-full max-w-md rounded-[2rem] p-6 sm:p-9">{children}</div>
      </main>
    </div>
  );
}
