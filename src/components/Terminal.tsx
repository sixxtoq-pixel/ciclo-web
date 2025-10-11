"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { db, ensureAnonAuth, firebaseEnabled } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const OPTIONS = ["<ACCEDER ARCHIVOS>", "<REINICIAR SISTEMA>", "<MENSAJES>"] as const;

type UserDoc = {
  cursor?: number;
  subtitle?: string;
};

export default function Terminal() {
  const [cursor, setCursor] = useState<number>(0);
  const [subtitle, setSubtitle] = useState<string>("Abriendo registros...");
  const [uid, setUid] = useState<string | null>(null);

  // Carga estado
  useEffect(() => {
    (async () => {
      if (firebaseEnabled) {
        const id = await ensureAnonAuth();
        setUid(id);
        if (id && db) {
          const snap = await getDoc(doc(db, "users", id));
          const data: UserDoc | undefined = snap.exists()
            ? (snap.data() as UserDoc)
            : undefined;
          if (typeof data?.cursor === "number") setCursor(data.cursor);
          if (typeof data?.subtitle === "string") setSubtitle(data.subtitle);
        }
      } else if (typeof window !== "undefined") {
        const raw = localStorage.getItem("cicloState");
        if (raw) {
          try {
            const s = JSON.parse(raw) as Required<UserDoc>;
            if (typeof s.cursor === "number") setCursor(s.cursor);
            if (typeof s.subtitle === "string") setSubtitle(s.subtitle);
          } catch { /* ignore */ }
        }
      }
    })();
  }, []);

  const persist = useCallback(
    async (next: { cursor: number; subtitle: string }) => {
      if (firebaseEnabled && uid && db) {
        await setDoc(doc(db, "users", uid), next, { merge: true });
      } else if (typeof window !== "undefined") {
        localStorage.setItem("cicloState", JSON.stringify(next));
      }
    },
    [uid]
  );

  const activate = useCallback(() => {
    let msg = subtitle;
    if (cursor === 0) msg = "Abriendo registros...";
    if (cursor === 1) msg = "Reiniciando el sistema.";
    if (cursor === 2) msg = "Tienes mensajes sin leer.";
    setSubtitle(msg);
    void persist({ cursor, subtitle: msg });
  }, [cursor, subtitle, persist]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") setCursor((p) => (p + OPTIONS.length - 1) % OPTIONS.length);
      if (e.key === "ArrowDown") setCursor((p) => (p + 1) % OPTIONS.length);
      if (e.key === "Enter") activate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activate]); // <— ya incluimos activate

  const rendered = useMemo(
    () => (
      <div className="space-y-2">
        {OPTIONS.map((opt, i) => (
          <div key={opt} className="text-2xl">
            <span className="pr-2">{i === cursor ? ">" : "\u00A0"}</span>
            {opt}
          </div>
        ))}
      </div>
    ),
    [cursor]
  );

  return (
  <main className="w-full">
    <div className="crt crt-flicker w-[min(95vw,800px)] border border-green-900/40 p-8 md:p-10 rounded-xl bg-[#00140F]/80 shadow-[0_0_60px_rgba(0,255,170,.12)_inset] font-mono">
      <div className="text-5xl md:text-6xl mb-2">CICLO 9</div>
      <div className="text-2xl mb-8 opacity-90">{subtitle}</div>
      <div className="text-right text-xl mb-10 opacity-90 leading-tight">
        EL USUARIO<br/>SOY YO
      </div>
      {rendered}
      <div className="mt-10 text-xs opacity-70">↑/↓ navegar — Enter confirmar</div>
    </div>
  </main>
);

}
