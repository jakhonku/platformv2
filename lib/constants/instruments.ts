import type { Instrument, InstrumentFamily } from "../../types/reference.ts";

const i = (id: string, family: InstrumentFamily, uz: string, ru: string, en: string): Instrument => ({
  id,
  family,
  name: { uz, ru, en },
});

export const INSTRUMENTS: readonly Instrument[] = [
  // Simfonik
  i("violin", "symphonic", "Skripka", "Скрипка", "Violin"),
  i("viola", "symphonic", "Alt (viola)", "Альт", "Viola"),
  i("cello", "symphonic", "Violonchel", "Виолончель", "Cello"),
  i("double-bass", "symphonic", "Kontrabas", "Контрабас", "Double bass"),
  i("flute", "symphonic", "Fleyta", "Флейта", "Flute"),
  i("oboe", "symphonic", "Goboy", "Гобой", "Oboe"),
  i("clarinet", "symphonic", "Klarnet", "Кларнет", "Clarinet"),
  i("bassoon", "symphonic", "Fagot", "Фагот", "Bassoon"),
  i("french-horn", "symphonic", "Valtorna", "Валторна", "French horn"),
  i("trumpet", "symphonic", "Truba", "Труба", "Trumpet"),
  i("trombone", "symphonic", "Trombon", "Тромбон", "Trombone"),
  i("tuba", "symphonic", "Tuba", "Туба", "Tuba"),
  i("harp", "symphonic", "Arfa", "Арфа", "Harp"),
  // Klavishli
  i("piano", "keyboard", "Fortepiano", "Фортепиано", "Piano"),
  i("organ", "keyboard", "Organ", "Орган", "Organ"),
  i("accordion", "keyboard", "Akkordeon", "Аккордеон", "Accordion"),
  i("synthesizer", "keyboard", "Sintezator", "Синтезатор", "Synthesizer"),
  // Zarbli
  i("timpani", "percussion", "Litavra", "Литавры", "Timpani"),
  i("snare-drum", "percussion", "Kichik baraban", "Малый барабан", "Snare drum"),
  i("xylophone", "percussion", "Ksilofon", "Ксилофон", "Xylophone"),
  i("drum-kit", "percussion", "Baraban toʻplami", "Ударная установка", "Drum kit"),
  // Xalq cholgʻulari
  i("dutar", "folk", "Dutor", "Дутар", "Dutar"),
  i("tanbur", "folk", "Tanbur", "Тамбур", "Tanbur"),
  i("doira", "folk", "Doira", "Дойра", "Doira"),
  i("rubab", "folk", "Rubob", "Рубаб", "Rubab"),
  i("nay", "folk", "Nay", "Най", "Nay"),
  i("gijjak", "folk", "Gʻijjak", "Гиджак", "Ghijjak"),
  i("chang", "folk", "Chang", "Чанг", "Chang"),
  i("surnay", "folk", "Surnay", "Сурнай", "Surnay"),
  i("karnay", "folk", "Karnay", "Карнай", "Karnay"),
  // Jazz
  i("saxophone", "jazz", "Saksofon", "Саксофон", "Saxophone"),
  i("electric-guitar", "jazz", "Elektrogitara", "Электрогитара", "Electric guitar"),
  i("bass-guitar", "jazz", "Bas-gitara", "Бас-гитара", "Bass guitar"),
  i("jazz-piano", "jazz", "Jazz fortepianosi", "Джазовое фортепиано", "Jazz piano"),
];

export const instrumentById = (id: string): Instrument | undefined => INSTRUMENTS.find((x) => x.id === id);
