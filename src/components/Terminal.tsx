"use client";
import { useEffect, useMemo, useState } from "react";
import { db, ensureAnonAuth, firebaseEnabled } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const OPTIONS = ["<ACCEDER ARCHIVOS>", "<REINICIAR SISTEMA>", "<MENSAJES>"] as const;

export default function Terminal() {
  const [cursor, setCursor] = useState(0);
  const [subtitle, setSubtitle] = useState("RECUERDO...");
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (firebaseEnabled) {
        const id = await ensureAnonAuth();
        setUid(id);
        if (id) {
          const snap = await getDoc(doc(db, "users", id));
          const data = snap.exists() ? (snap.data() as any) : null;
          if (data?.cursor != null) setCursor(data.cursor);
          if (data?.subtitle) setSubtitle(data.subtitle);
        }
      } else {
        const raw = localStorage.getItem("cicloState");
        if (raw) { try { const s = JSON.parse(raw); setCursor(s.cursor ?? 0); setSubtitle(s.subtitle ?? "RECUERDO..."); } catch {} }
      }
    })();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") setCursor(p => (p + OPTIONS.length - 1) % OPTIONS.length);
      if (e.key === "ArrowDown") setCursor(p => (p + 1) % OPTIONS.length);
      if (e.key === "Enter") activate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor]);

  async function persist(next:{cursor:number; subtitle:string}) {
    if (firebaseEnabled && uid) await setDoc(doc(db, "users", uid), next, { merge:true });
    else localStorage.setItem("cicloState", JSON.stringify(next));
  }

  function activate() {
    let msg = subtitle;
    if (cursor === 0) msg = "Abriendo registros...";
    if (cursor === 1) msg = "Reiniciando el sistema.";
    if (cursor === 2) msg = "Tienes mensajes sin leer.";
    setSubtitle(msg);
    persist({ cursor, subtitle: msg });
  }

  const rendered = useMemo(() => (
    <div className="space-y-2">
      {OPTIONS.map((opt, i) => (
        <div key={opt} className="text-2xl">
          <span className="pr-2">{i === cursor ? ">" : "\u00A0"}</span>{opt}
        </div>
      ))}
    </div>
  ), [cursor]);

  return (
    <main className="h-dvh w-full grid place-items-center bg-black text-green-200">
      <div className="crt crt-flicker w-[min(95vw,640px)] border border-green-900/40 p-6 rounded-xl bg-[#00140F]/80 shadow-[0_0_60px_rgba(0,255,170,.12)_inset] font-mono">
        <div className="text-5xl md:text-6xl mb-1">CICLO 9</div>
        <div className="text-2xl mb-6 opacity-90">{subtitle}</div>
        <div className="text-right text-xl mb-8 opacity-90 leading-tight">EL USUARIO<br/>SOY YO</div>
        {rendered}
        <div className="mt-8 text-xs opacity-70">↑/↓ navegar — Enter confirmar</div>
      </div>
    </main>
  );
}
