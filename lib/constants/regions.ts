import type { Region } from "../../types/reference.ts";

const r = (id: string, uz: string, ru: string, en: string, cities: string[]): Region => ({
  id,
  name: { uz, ru, en },
  cities,
});

export const REGIONS: readonly Region[] = [
  r("karakalpakstan", "Qoraqalpogʻiston Respublikasi", "Республика Каракалпакстан", "Republic of Karakalpakstan", ["Nukus", "Moʻynoq", "Xoʻjayli"]),
  r("andijan", "Andijon viloyati", "Андижанская область", "Andijan Region", ["Andijon", "Asaka", "Xonobod"]),
  r("bukhara", "Buxoro viloyati", "Бухарская область", "Bukhara Region", ["Buxoro", "Kogon", "Gʻijduvon"]),
  r("fergana", "Fargʻona viloyati", "Ферганская область", "Fergana Region", ["Fargʻona", "Margʻilon", "Qoʻqon"]),
  r("jizzakh", "Jizzax viloyati", "Джизакская область", "Jizzakh Region", ["Jizzax", "Gʻallaorol", "Zomin"]),
  r("khorezm", "Xorazm viloyati", "Хорезмская область", "Khorezm Region", ["Urganch", "Xiva", "Shovot"]),
  r("namangan", "Namangan viloyati", "Наманганская область", "Namangan Region", ["Namangan", "Chust", "Pop"]),
  r("navoi", "Navoiy viloyati", "Навоийская область", "Navoi Region", ["Navoiy", "Zarafshon", "Uchquduq"]),
  r("kashkadarya", "Qashqadaryo viloyati", "Кашкадарьинская область", "Kashkadarya Region", ["Qarshi", "Shahrisabz", "Gʻuzor"]),
  r("samarkand", "Samarqand viloyati", "Самаркандская область", "Samarkand Region", ["Samarqand", "Kattaqoʻrgʻon", "Urgut"]),
  r("syrdarya", "Sirdaryo viloyati", "Сырдарьинская область", "Syrdarya Region", ["Guliston", "Yangiyer", "Shirin"]),
  r("surkhandarya", "Surxondaryo viloyati", "Сурхандарьинская область", "Surkhandarya Region", ["Termiz", "Denov", "Boysun"]),
  r("tashkent-region", "Toshkent viloyati", "Ташкентская область", "Tashkent Region", ["Nurafshon", "Chirchiq", "Angren"]),
  r("tashkent-city", "Toshkent shahri", "город Ташкент", "Tashkent City", ["Toshkent"]),
];

export const regionById = (id: string): Region | undefined => REGIONS.find((x) => x.id === id);
