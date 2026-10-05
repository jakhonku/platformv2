import Image from "next/image";

/**
 * Bosh sahifa foni: kunduzi yorug' orkestr surati, kechasi festival surati.
 * Chap tomondan mavzu rangidagi qoplama matn o'qilishini ta'minlaydi.
 */
export function HeroBackground() {
  return (
    <>
      <Image
        src="/media/hero-day.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[50%_72%] dark:hidden"
      />
      <Image
        src="/media/hero-night.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 hidden object-cover object-[50%_55%] dark:block"
      />
      <div aria-hidden className="hero-veil absolute inset-0 -z-10" />
    </>
  );
}
