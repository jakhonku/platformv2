export function AuthHeading({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-1.5">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
      {text && <p className="break-words text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
