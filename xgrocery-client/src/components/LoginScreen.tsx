import { useState } from "react";
import { FAMILY_NAMES, colorForUser, initialFor } from "../constants";

interface Props {
  onLogin: (name: string) => Promise<void>;
}

export function LoginScreen({ onLogin }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(name: string) {
    if (submitting) return;
    setSelected(name);
    setSubmitting(true);
    setError(null);
    try {
      await onLogin(name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao entrar");
      setSelected(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-10"
      style={{
        color: "#e8e8e8",
        backgroundColor: "#0a0a0a",
        backgroundImage:
          "radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0a 60%)",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🛒</div>
          <h1
            className="text-3xl font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(to right, #39ff14, #66bb6a, #a8e063)",
            }}
          >
            Lista de Compras
          </h1>
          <p className="text-slate-400 text-sm mt-2">Quem está aí?</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FAMILY_NAMES.map((name) => {
            const color = colorForUser(name);
            const isSel = selected === name;
            return (
              <button
                key={name}
                onClick={() => submit(name)}
                disabled={submitting}
                className="flex flex-col items-center gap-2 rounded-2xl py-5 px-2 border-2 transition-all disabled:opacity-60"
                style={{
                  backgroundColor: isSel ? `${color}25` : `${color}10`,
                  borderColor: isSel ? color : "transparent",
                  transform: isSel ? "scale(1.02)" : "scale(1)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
                  style={{ backgroundColor: color }}
                >
                  {initialFor(name)}
                </div>
                <span className="text-sm font-medium text-slate-100">
                  {name}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 text-sm text-rose-400 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
