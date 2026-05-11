import { useState } from "react";
import { FAMILY_NAMES, colorForUser, initialFor } from "../constants";

interface Props {
  onLogin: (name: string, password: string) => Promise<void>;
}

export function LoginScreen({ onLogin }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!selected || !password || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onLogin(selected, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao entrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{ backgroundColor: "#0a0a0a", color: "#e8e8e8" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🛒</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-lime-400 bg-clip-text text-transparent">
            Lista de Compras
          </h1>
          <p className="text-slate-400 text-sm mt-2">Quem está aí?</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {FAMILY_NAMES.map((name) => {
            const color = colorForUser(name);
            const isSel = selected === name;
            return (
              <button
                key={name}
                onClick={() => setSelected(name)}
                className="flex flex-col items-center gap-2 rounded-2xl py-5 px-2 border-2 transition-all"
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

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />

        {error && (
          <p className="mt-3 text-sm text-rose-400 text-center">{error}</p>
        )}

        <button
          onClick={submit}
          disabled={!selected || !password || submitting}
          className="mt-4 w-full bg-orange-500 hover:bg-orange-400 disabled:bg-slate-800 disabled:text-slate-500 transition-colors font-semibold rounded-xl py-3 text-slate-950"
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}
