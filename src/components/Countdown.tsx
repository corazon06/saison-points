"use client";

import { useEffect, useState } from "react";

function getRemaining(target: Date) {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return null;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex aspect-square min-w-0 flex-1 max-w-[76px] flex-col items-center justify-center rounded-xl bg-royal shadow-sm">
      <span className="font-mono text-sm font-extrabold tabular-nums text-white sm:text-lg">
        {pad(value)}
      </span>
      <span className="text-[7px] font-semibold uppercase tracking-wide text-sky sm:text-[9px]">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return <span className="shrink-0 text-base font-bold text-coral sm:text-xl">:</span>;
}

export function Countdown({ target }: { target: string }) {
  const targetDate = new Date(target);
  // Pas de calcul basé sur Date.now() avant le montage côté client : évite un
  // mismatch d'hydratation, le serveur et le client ne rendant pas au même instant.
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining>>(null);

  useEffect(() => {
    setMounted(true);
    setRemaining(getRemaining(targetDate));
    const interval = setInterval(() => setRemaining(getRemaining(targetDate)), 1_000);
    return () => clearInterval(interval);
  }, [target]);

  if (!mounted) {
    return (
      <div className="flex w-full max-w-xs items-center justify-center gap-1.5 opacity-0 sm:max-w-sm">
        <TimeBox value={0} label="J" />
        <Separator />
        <TimeBox value={0} label="H" />
        <Separator />
        <TimeBox value={0} label="M" />
        <Separator />
        <TimeBox value={0} label="S" />
      </div>
    );
  }

  if (!remaining) {
    return <p className="text-sm font-semibold text-coral">Saison terminée</p>;
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-coral">Fin de saison dans</p>
      <div className="flex w-full max-w-xs items-center justify-center gap-1.5 sm:max-w-sm">
        <TimeBox value={remaining.days} label="J" />
        <Separator />
        <TimeBox value={remaining.hours} label="H" />
        <Separator />
        <TimeBox value={remaining.minutes} label="M" />
        <Separator />
        <TimeBox value={remaining.seconds} label="S" />
      </div>
    </div>
  );
}
