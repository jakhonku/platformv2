export type ReviewKind = "profile" | "organization" | "collective";

export type ReviewCallOutcome = "reached" | "no_answer" | "wrong_number" | "callback";

export type ReviewCall = {
  id: string;
  at: string;
  byId: string;
  outcome: ReviewCallOutcome;
  note: string;
};

/** Arizani ko`rib chiqish holati: mas`ul, tekshiruv belgilari va qo`ng`iroqlar jurnali */
export type ReviewState = {
  assigneeId?: string;
  assignedAt?: string;
  checklist: { documents: boolean; phone: boolean };
  calls: ReviewCall[];
};
