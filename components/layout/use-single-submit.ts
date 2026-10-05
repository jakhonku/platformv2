"use client";

import { useRef } from "react";

/**
 * Forma yuborilayotgan paytda takroriy yuborishni o'tkazib yuboradi. `isSubmitting` render'dan keyin
 * yangilanadi, shuning uchun tez ikki bosish uchun sinxron ref kerak. `preventDefault` har doim chaqiriladi.
 */
export function useSingleSubmit(onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>) {
  const sending = useRef(false);
  return (e: React.FormEvent<HTMLFormElement>) => {
    if (sending.current) {
      e.preventDefault();
      return;
    }
    sending.current = true;
    void onSubmit(e).finally(() => {
      sending.current = false;
    });
  };
}
