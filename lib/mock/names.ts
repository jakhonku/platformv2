export const MALE_NAMES = [
  "Jasur", "Dilshod", "Sardor", "Bobur", "Aziz", "Otabek", "Rustam", "Farhod", "Javlon", "Ulugʻbek",
  "Shohruh", "Akmal", "Bekzod", "Zafar", "Nodir", "Anvar", "Sherzod", "Murod", "Temur", "Davron",
  "Eldor", "Husan", "Oybek", "Lazizbek", "Sanjar", "Abbos",
] as const;

export const FEMALE_NAMES = [
  "Malika", "Nilufar", "Dilnoza", "Gulnora", "Zarina", "Madina", "Shahnoza", "Feruza", "Nigora", "Sevara",
  "Lola", "Munisa", "Dildora", "Kamola", "Laylo", "Barno", "Mohira", "Zilola", "Nargiza", "Sitora",
  "Gulbahor", "Odina", "Durdona", "Mavluda", "Shahlo", "Ruxsora",
] as const;

/** Erkaklar shakli; ayollar uchun oxiriga "a" qo'shiladi */
export const SURNAMES = [
  "Karimov", "Rahimov", "Yusupov", "Abdullayev", "Tursunov", "Nazarov", "Ismoilov", "Saidov", "Mirzayev",
  "Qodirov", "Hamidov", "Ergashev", "Sobirov", "Normatov", "Xolmatov", "Toshpoʻlatov", "Aliyev", "Umarov",
  "Rasulov", "Jalilov", "Valiyev", "Sultonov", "Mahmudov", "Orifov", "Hakimov", "Bekmurodov", "Ibragimov",
  "Qosimov", "Zokirov", "Shukurov",
] as const;

export const femaleSurname = (male: string): string => `${male}a`;

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ʻʼ'`]/g, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const phone = (a: number, b: number, c: number, d: number): string => `+998 9${a} ${b} ${c} ${d}`;
