import type { Category, CategoryKind } from "../../types/reference.ts";

const c = (id: string, kind: CategoryKind, uz: string, ru: string, en: string): Category => ({
  id,
  kind,
  name: { uz, ru, en },
});

export const CATEGORIES: readonly Category[] = [
  // Iqtidor yoʻnalishlari
  c("orchestral", "talent", "Orkestr musiqasi", "Оркестровая музыка", "Orchestral music"),
  c("choral", "talent", "Xor sanʼati", "Хоровое искусство", "Choral art"),
  c("folk", "talent", "Xalq musiqasi", "Народная музыка", "Folk music"),
  c("jazz", "talent", "Jazz", "Джаз", "Jazz"),
  c("opera", "talent", "Opera", "Опера", "Opera"),
  c("composition", "talent", "Kompozitorlik", "Композиция", "Composition"),
  c("conducting", "talent", "Dirijyorlik", "Дирижирование", "Conducting"),
  // Yangilik turkumlari
  c("announcements", "news", "Eʼlonlar", "Объявления", "Announcements"),
  c("interviews", "news", "Intervyular", "Интервью", "Interviews"),
  c("concerts", "news", "Konsertlar", "Концерты", "Concerts"),
  c("education", "news", "Taʼlim", "Образование", "Education"),
  c("achievements", "news", "Yutuqlar", "Достижения", "Achievements"),
  // Tadbir turlari
  c("competition", "event", "Tanlov", "Конкурс", "Competition"),
  c("festival", "event", "Festival", "Фестиваль", "Festival"),
  c("masterclass", "event", "Mahorat darsi", "Мастер-класс", "Master class"),
  c("premiere", "event", "Premyera", "Премьера", "Premiere"),
];

export const categoryById = (id: string): Category | undefined => CATEGORIES.find((x) => x.id === id);
