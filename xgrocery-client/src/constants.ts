// Em dev (vite na 5178, backend na 8062) → URL absoluta na rede local.
// Em prod (build atrás de reverse proxy / Cloudflare Tunnel) → relativo,
// usando o mesmo hostname da página (sem CORS, mesma origem).
export const API_URL = import.meta.env.DEV
  ? `http://${window.location.hostname}:8062`
  : "";

export const FAMILY_NAMES = ["Marcus Vinícius", "Marilane", "Aline", "Lívia"];

export const USER_COLORS: Record<string, string> = {
  "Marcus Vinícius": "#f97316",
  Marilane: "#fb7185",
  Aline: "#a3e635",
  Lívia: "#fbbf24",
};

export const USER_INITIALS: Record<string, string> = {
  "Marcus Vinícius": "MV",
  Marilane: "M",
  Aline: "A",
  Lívia: "L",
};

export function colorForUser(name: string): string {
  return USER_COLORS[name] || "#94a3b8";
}

export function initialFor(name: string): string {
  return USER_INITIALS[name] || name.charAt(0).toUpperCase();
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0];
}

// Utilitário de busca (porte do mockData do protótipo).
// ̀-ͯ: combining diacritical marks (após NFD).
export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "");
}
