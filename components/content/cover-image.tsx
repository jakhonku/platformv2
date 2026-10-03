import Image from "next/image";
import { cn } from "@/lib/utils";

export function CoverImage({ src, alt = "", className }: { src: string; alt?: string; className?: string }) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-muted", className)}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
    </div>
  );
}
