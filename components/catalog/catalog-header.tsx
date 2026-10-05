export function CatalogHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-2 pt-4 sm:pt-8">
      <h1 className="text-4xl text-balance sm:text-5xl">{title}</h1>
      {description && <p className="max-w-2xl text-lg text-foreground/60">{description}</p>}
    </div>
  );
}
