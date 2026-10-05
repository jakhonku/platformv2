export function AuthHeading({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mb-7 flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h1>
      {text && <p className="break-words text-sm text-foreground/60">{text}</p>}
    </div>
  );
}
