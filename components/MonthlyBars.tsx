// Histogramme mensuel en SVG, rendu côté serveur (aucune librairie).
// Une seule série par graphique : pas de légende, le titre dit ce qui est
// tracé. Survol d'une colonne = valeur exacte (info-bulle).

type Point = { libelle: string; valeur: number };

function niceMax(max: number) {
  if (max <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(max));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

const fmt = (v: number) => v.toLocaleString("fr-FR");

export default function MonthlyBars({
  titre,
  points,
  unite = "",
  entier = false,
}: {
  titre: string;
  points: Point[];
  unite?: string;
  entier?: boolean; // graduations entières (nombres d'articles)
}) {
  const W = 560;
  const H = 200;
  const m = { top: 12, right: 8, bottom: 30, left: 64 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;
  let max = niceMax(Math.max(...points.map((p) => p.valeur), 0));
  if (entier && max < 2) max = 2;
  const ticks = [0, max / 2, max].filter((t) => !entier || Number.isInteger(t));
  const slot = iw / points.length;
  const bw = Math.min(24, slot * 0.6);
  const y = (v: number) => m.top + ih - (v / max) * ih;

  return (
    <figure className="card">
      <figcaption className="text-sm font-medium text-gray-900">{titre}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label={titre}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.left} x2={W - m.right} y1={y(t)} y2={y(t)} stroke="#f0f1f4" strokeWidth={1} />
            <text x={m.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={13} fill="#6b7280">
              {fmt(t)}
              {unite}
            </text>
          </g>
        ))}
        {points.map((p, i) => {
          const cx = m.left + slot * i + slot / 2;
          const x = cx - bw / 2;
          const top = y(p.valeur);
          const h = m.top + ih - top;
          const r = Math.min(4, h);
          return (
            <g key={p.libelle} className="group">
              {/* zone de survol plus large que la colonne */}
              <rect x={m.left + slot * i} y={m.top} width={slot} height={ih} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${m.top + ih} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${m.top + ih} Z`}
                  fill="#3457d5"
                  className="transition-opacity group-hover:opacity-80"
                />
              )}
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={12} fill="#6b7280">
                {p.libelle.replace(/\.? \d{4}$/, "")}
              </text>
              <g className="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100">
                <rect
                  x={Math.min(Math.max(cx - 62, 0), W - 124)}
                  y={Math.max(top - 30, 0)}
                  width={124}
                  height={22}
                  rx={4}
                  fill="#1a1a2e"
                />
                <text
                  x={Math.min(Math.max(cx, 62), W - 62)}
                  y={Math.max(top - 30, 0) + 15}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#fff"
                >
                  {p.libelle} : {fmt(p.valeur)}
                  {unite}
                </text>
              </g>
            </g>
          );
        })}
        <line x1={m.left} x2={W - m.right} y1={m.top + ih} y2={m.top + ih} stroke="#d1d5db" strokeWidth={1} />
      </svg>
    </figure>
  );
}
