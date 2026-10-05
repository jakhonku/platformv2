export type DataErrorCode = "not_found" | "duplicate" | "closed" | "invalid" | "forbidden";

/** Backend ulanganda HTTP 403 / 404 / 409 / 410 / 422 javoblariga mos keladi */
export class DataError extends Error {
  code: DataErrorCode;

  constructor(code: DataErrorCode, message?: string) {
    super(message ?? code);
    this.name = "DataError";
    this.code = code;
  }
}
