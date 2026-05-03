const AVATARS = {
  knight: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* helmet */}
      <rect x="4" y="1" width="8" height="1" fill="#94a3b8"/>
      <rect x="3" y="2" width="10" height="4" fill="#cbd5e1"/>
      <rect x="3" y="2" width="10" height="1" fill="#94a3b8"/>
      <rect x="5" y="3" width="6" height="2" fill="#1e293b"/>
      <rect x="3" y="6" width="10" height="1" fill="#94a3b8"/>
      {/* face */}
      <rect x="4" y="7" width="8" height="3" fill="#fde68a"/>
      <rect x="5" y="8" width="2" height="1" fill="#1e293b"/>
      <rect x="9" y="8" width="2" height="1" fill="#1e293b"/>
      <rect x="6" y="9" width="4" height="1" fill="#f59e0b"/>
      {/* body */}
      <rect x="3" y="10" width="10" height="5" fill="#cbd5e1"/>
      <rect x="3" y="10" width="10" height="1" fill="#94a3b8"/>
      <rect x="6" y="11" width="4" height="3" fill="#94a3b8"/>
      {/* arms */}
      <rect x="1" y="10" width="2" height="4" fill="#94a3b8"/>
      <rect x="13" y="10" width="2" height="4" fill="#94a3b8"/>
      {/* sword */}
      <rect x="14" y="6" width="1" height="5" fill="#e2e8f0"/>
      <rect x="13" y="9" width="3" height="1" fill="#f59e0b"/>
    </svg>
  ),

  wizard: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* hat */}
      <rect x="7" y="0" width="2" height="1" fill="#7c3aed"/>
      <rect x="6" y="1" width="4" height="1" fill="#7c3aed"/>
      <rect x="5" y="2" width="6" height="1" fill="#7c3aed"/>
      <rect x="4" y="3" width="8" height="1" fill="#7c3aed"/>
      <rect x="3" y="4" width="10" height="2" fill="#6d28d9"/>
      {/* star on hat */}
      <rect x="7" y="2" width="1" height="1" fill="#fbbf24"/>
      {/* face */}
      <rect x="4" y="6" width="8" height="4" fill="#fde68a"/>
      <rect x="5" y="7" width="2" height="1" fill="#1e293b"/>
      <rect x="9" y="7" width="2" height="1" fill="#1e293b"/>
      <rect x="6" y="8" width="1" height="1" fill="#f59e0b"/>
      <rect x="9" y="8" width="1" height="1" fill="#f59e0b"/>
      {/* beard */}
      <rect x="5" y="9" width="6" height="1" fill="#e2e8f0"/>
      <rect x="4" y="10" width="8" height="1" fill="#e2e8f0"/>
      {/* body/robe */}
      <rect x="3" y="11" width="10" height="5" fill="#7c3aed"/>
      <rect x="5" y="11" width="6" height="1" fill="#6d28d9"/>
      {/* staff */}
      <rect x="1" y="5" width="1" height="9" fill="#92400e"/>
      <rect x="0" y="4" width="3" height="2" fill="#a78bfa"/>
      <rect x="1" y="3" width="1" height="1" fill="#c4b5fd"/>
    </svg>
  ),

  archer: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* hood */}
      <rect x="4" y="1" width="8" height="5" fill="#15803d"/>
      <rect x="3" y="3" width="10" height="3" fill="#166534"/>
      {/* face */}
      <rect x="4" y="6" width="8" height="4" fill="#fde68a"/>
      <rect x="5" y="7" width="2" height="1" fill="#1e293b"/>
      <rect x="9" y="7" width="2" height="1" fill="#1e293b"/>
      <rect x="6" y="9" width="4" height="1" fill="#f59e0b"/>
      {/* body */}
      <rect x="3" y="10" width="10" height="6" fill="#15803d"/>
      <rect x="5" y="10" width="6" height="1" fill="#166534"/>
      {/* quiver */}
      <rect x="12" y="9" width="2" height="5" fill="#92400e"/>
      <rect x="12" y="8" width="1" height="1" fill="#fbbf24"/>
      <rect x="13" y="8" width="1" height="1" fill="#fbbf24"/>
      {/* bow */}
      <rect x="1" y="5" width="1" height="7" fill="#92400e"/>
      <rect x="2" y="4" width="1" height="1" fill="#92400e"/>
      <rect x="2" y="11" width="1" height="1" fill="#92400e"/>
    </svg>
  ),

  skull: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* skull head */}
      <rect x="3" y="2" width="10" height="8" fill="#e2e8f0"/>
      <rect x="2" y="4" width="12" height="6" fill="#e2e8f0"/>
      <rect x="3" y="1" width="10" height="1" fill="#cbd5e1"/>
      {/* eyes */}
      <rect x="4" y="5" width="3" height="3" fill="#1e293b"/>
      <rect x="9" y="5" width="3" height="3" fill="#1e293b"/>
      <rect x="5" y="5" width="1" height="1" fill="#4f46e5"/>
      <rect x="10" y="5" width="1" height="1" fill="#4f46e5"/>
      {/* nose */}
      <rect x="7" y="7" width="2" height="2" fill="#94a3b8"/>
      {/* teeth */}
      <rect x="3" y="10" width="10" height="2" fill="#e2e8f0"/>
      <rect x="4" y="10" width="1" height="2" fill="#1e293b"/>
      <rect x="6" y="10" width="1" height="2" fill="#1e293b"/>
      <rect x="8" y="10" width="1" height="2" fill="#1e293b"/>
      <rect x="10" y="10" width="1" height="2" fill="#1e293b"/>
      {/* body */}
      <rect x="4" y="12" width="8" height="4" fill="#334155"/>
      <rect x="3" y="13" width="2" height="3" fill="#334155"/>
      <rect x="11" y="13" width="2" height="3" fill="#334155"/>
    </svg>
  ),

  robot: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* antenna */}
      <rect x="7" y="0" width="2" height="2" fill="#64748b"/>
      <rect x="7" y="0" width="2" height="1" fill="#22d3ee"/>
      {/* head */}
      <rect x="3" y="2" width="10" height="7" fill="#475569"/>
      <rect x="3" y="2" width="10" height="1" fill="#64748b"/>
      {/* eyes */}
      <rect x="4" y="4" width="3" height="2" fill="#22d3ee"/>
      <rect x="9" y="4" width="3" height="2" fill="#22d3ee"/>
      <rect x="5" y="4" width="1" height="1" fill="#0891b2"/>
      <rect x="10" y="4" width="1" height="1" fill="#0891b2"/>
      {/* mouth */}
      <rect x="4" y="7" width="8" height="1" fill="#334155"/>
      <rect x="5" y="7" width="1" height="1" fill="#22d3ee"/>
      <rect x="7" y="7" width="1" height="1" fill="#22d3ee"/>
      <rect x="9" y="7" width="1" height="1" fill="#22d3ee"/>
      {/* body */}
      <rect x="3" y="9" width="10" height="7" fill="#475569"/>
      <rect x="5" y="10" width="6" height="4" fill="#334155"/>
      <rect x="6" y="11" width="4" height="2" fill="#22d3ee"/>
      {/* arms */}
      <rect x="1" y="9" width="2" height="5" fill="#475569"/>
      <rect x="13" y="9" width="2" height="5" fill="#475569"/>
    </svg>
  ),

  fox: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* ears */}
      <rect x="2" y="1" width="3" height="3" fill="#ea580c"/>
      <rect x="11" y="1" width="3" height="3" fill="#ea580c"/>
      <rect x="3" y="2" width="1" height="1" fill="#fca5a5"/>
      <rect x="12" y="2" width="1" height="1" fill="#fca5a5"/>
      {/* head */}
      <rect x="3" y="3" width="10" height="7" fill="#ea580c"/>
      <rect x="2" y="5" width="12" height="5" fill="#ea580c"/>
      {/* face white */}
      <rect x="5" y="6" width="6" height="4" fill="#fef3c7"/>
      {/* eyes */}
      <rect x="4" y="5" width="2" height="2" fill="#1e293b"/>
      <rect x="10" y="5" width="2" height="2" fill="#1e293b"/>
      <rect x="5" y="5" width="1" height="1" fill="#fbbf24"/>
      <rect x="11" y="5" width="1" height="1" fill="#fbbf24"/>
      {/* nose */}
      <rect x="7" y="8" width="2" height="1" fill="#1e293b"/>
      {/* mouth */}
      <rect x="6" y="9" width="1" height="1" fill="#1e293b"/>
      <rect x="9" y="9" width="1" height="1" fill="#1e293b"/>
      {/* body */}
      <rect x="4" y="10" width="8" height="6" fill="#ea580c"/>
      <rect x="5" y="10" width="6" height="2" fill="#fef3c7"/>
      {/* tail hint */}
      <rect x="13" y="11" width="2" height="3" fill="#ea580c"/>
      <rect x="14" y="13" width="1" height="1" fill="#fef3c7"/>
    </svg>
  ),

  panda: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* ears */}
      <rect x="2" y="1" width="3" height="3" fill="#1e293b"/>
      <rect x="11" y="1" width="3" height="3" fill="#1e293b"/>
      {/* head */}
      <rect x="3" y="3" width="10" height="7" fill="#f8fafc"/>
      <rect x="2" y="5" width="12" height="5" fill="#f8fafc"/>
      {/* eye patches */}
      <rect x="3" y="4" width="4" height="3" fill="#1e293b"/>
      <rect x="9" y="4" width="4" height="3" fill="#1e293b"/>
      {/* eyes */}
      <rect x="4" y="5" width="2" height="2" fill="#f8fafc"/>
      <rect x="10" y="5" width="2" height="2" fill="#f8fafc"/>
      <rect x="5" y="5" width="1" height="1" fill="#1e293b"/>
      <rect x="11" y="5" width="1" height="1" fill="#1e293b"/>
      {/* nose */}
      <rect x="7" y="7" width="2" height="1" fill="#1e293b"/>
      {/* mouth */}
      <rect x="6" y="8" width="4" height="1" fill="#94a3b8"/>
      <rect x="6" y="9" width="1" height="1" fill="#1e293b"/>
      <rect x="9" y="9" width="1" height="1" fill="#1e293b"/>
      {/* body */}
      <rect x="4" y="10" width="8" height="6" fill="#f8fafc"/>
      <rect x="3" y="11" width="2" height="4" fill="#1e293b"/>
      <rect x="11" y="11" width="2" height="4" fill="#1e293b"/>
    </svg>
  ),

  king: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* crown */}
      <rect x="3" y="1" width="10" height="1" fill="#fbbf24"/>
      <rect x="3" y="2" width="2" height="2" fill="#fbbf24"/>
      <rect x="7" y="2" width="2" height="2" fill="#fbbf24"/>
      <rect x="11" y="2" width="2" height="2" fill="#fbbf24"/>
      <rect x="3" y="4" width="10" height="2" fill="#fbbf24"/>
      {/* jewels */}
      <rect x="4" y="2" width="1" height="1" fill="#ef4444"/>
      <rect x="8" y="2" width="1" height="1" fill="#3b82f6"/>
      <rect x="12" y="2" width="1" height="1" fill="#ef4444"/>
      {/* face */}
      <rect x="4" y="6" width="8" height="4" fill="#fde68a"/>
      <rect x="5" y="7" width="2" height="1" fill="#1e293b"/>
      <rect x="9" y="7" width="2" height="1" fill="#1e293b"/>
      <rect x="6" y="9" width="4" height="1" fill="#f59e0b"/>
      {/* cape/body */}
      <rect x="3" y="10" width="10" height="6" fill="#dc2626"/>
      <rect x="5" y="10" width="6" height="1" fill="#b91c1c"/>
      <rect x="6" y="11" width="4" height="4" fill="#fbbf24"/>
      {/* fur trim */}
      <rect x="3" y="10" width="10" height="1" fill="#f8fafc"/>
    </svg>
  ),

  flame: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* flame top */}
      <rect x="7" y="0" width="2" height="2" fill="#fbbf24"/>
      <rect x="5" y="1" width="2" height="2" fill="#f97316"/>
      <rect x="9" y="1" width="2" height="2" fill="#f97316"/>
      <rect x="4" y="2" width="2" height="3" fill="#ef4444"/>
      <rect x="10" y="2" width="2" height="3" fill="#ef4444"/>
      <rect x="6" y="2" width="4" height="2" fill="#fbbf24"/>
      {/* head/body flame */}
      <rect x="3" y="4" width="10" height="8" fill="#f97316"/>
      <rect x="4" y="4" width="8" height="2" fill="#fbbf24"/>
      {/* eyes */}
      <rect x="4" y="6" width="3" height="2" fill="#1e293b"/>
      <rect x="9" y="6" width="3" height="2" fill="#1e293b"/>
      <rect x="5" y="6" width="1" height="1" fill="#fbbf24"/>
      <rect x="10" y="6" width="1" height="1" fill="#fbbf24"/>
      {/* mouth */}
      <rect x="5" y="9" width="6" height="1" fill="#1e293b"/>
      <rect x="6" y="10" width="4" height="1" fill="#dc2626"/>
      {/* base */}
      <rect x="4" y="12" width="8" height="4" fill="#ef4444"/>
      <rect x="3" y="13" width="2" height="3" fill="#f97316"/>
      <rect x="11" y="13" width="2" height="3" fill="#f97316"/>
    </svg>
  ),

  thunder: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* bolt on head */}
      <rect x="8" y="0" width="3" height="1" fill="#fbbf24"/>
      <rect x="7" y="1" width="3" height="1" fill="#fbbf24"/>
      <rect x="8" y="2" width="3" height="1" fill="#fbbf24"/>
      <rect x="7" y="3" width="3" height="1" fill="#fbbf24"/>
      {/* head */}
      <rect x="3" y="3" width="10" height="7" fill="#1d4ed8"/>
      <rect x="2" y="5" width="12" height="5" fill="#1d4ed8"/>
      {/* eyes - glowing */}
      <rect x="4" y="5" width="3" height="2" fill="#fbbf24"/>
      <rect x="9" y="5" width="3" height="2" fill="#fbbf24"/>
      <rect x="5" y="5" width="1" height="1" fill="#fff"/>
      <rect x="10" y="5" width="1" height="1" fill="#fff"/>
      {/* mouth */}
      <rect x="5" y="8" width="6" height="1" fill="#93c5fd"/>
      {/* body */}
      <rect x="3" y="10" width="10" height="6" fill="#1d4ed8"/>
      {/* lightning on body */}
      <rect x="8" y="11" width="2" height="1" fill="#fbbf24"/>
      <rect x="7" y="12" width="2" height="1" fill="#fbbf24"/>
      <rect x="8" y="13" width="2" height="1" fill="#fbbf24"/>
      {/* arms */}
      <rect x="1" y="10" width="2" height="4" fill="#1d4ed8"/>
      <rect x="13" y="10" width="2" height="4" fill="#1d4ed8"/>
    </svg>
  ),

  moon: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* crescent on head */}
      <rect x="9" y="0" width="4" height="4" fill="#818cf8"/>
      <rect x="10" y="1" width="3" height="2" fill="#1e1b4b"/>
      {/* head */}
      <rect x="3" y="3" width="10" height="7" fill="#312e81"/>
      <rect x="2" y="5" width="12" height="5" fill="#312e81"/>
      {/* stars */}
      <rect x="4" y="4" width="1" height="1" fill="#e0e7ff"/>
      <rect x="11" y="6" width="1" height="1" fill="#e0e7ff"/>
      {/* eyes */}
      <rect x="4" y="6" width="3" height="2" fill="#818cf8"/>
      <rect x="9" y="6" width="3" height="2" fill="#818cf8"/>
      <rect x="5" y="6" width="1" height="1" fill="#c7d2fe"/>
      <rect x="10" y="6" width="1" height="1" fill="#c7d2fe"/>
      {/* mouth */}
      <rect x="6" y="8" width="4" height="1" fill="#6366f1"/>
      {/* body/robe */}
      <rect x="3" y="10" width="10" height="6" fill="#312e81"/>
      <rect x="4" y="10" width="8" height="1" fill="#4338ca"/>
      {/* stars on robe */}
      <rect x="5" y="12" width="1" height="1" fill="#818cf8"/>
      <rect x="9" y="13" width="1" height="1" fill="#818cf8"/>
      <rect x="7" y="11" width="1" height="1" fill="#c7d2fe"/>
    </svg>
  ),

  jester: (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* hat left */}
      <rect x="2" y="0" width="5" height="4" fill="#dc2626"/>
      <rect x="2" y="0" width="1" height="1" fill="#fbbf24"/>
      {/* hat right */}
      <rect x="9" y="0" width="5" height="4" fill="#7c3aed"/>
      <rect x="13" y="0" width="1" height="1" fill="#fbbf24"/>
      {/* hat base */}
      <rect x="3" y="4" width="10" height="2" fill="#1e293b"/>
      {/* face */}
      <rect x="3" y="5" width="10" height="5" fill="#fde68a"/>
      {/* eyes */}
      <rect x="4" y="6" width="2" height="2" fill="#1e293b"/>
      <rect x="10" y="6" width="2" height="2" fill="#1e293b"/>
      <rect x="5" y="6" width="1" height="1" fill="#dc2626"/>
      <rect x="11" y="6" width="1" height="1" fill="#7c3aed"/>
      {/* smile */}
      <rect x="5" y="8" width="1" height="1" fill="#1e293b"/>
      <rect x="10" y="8" width="1" height="1" fill="#1e293b"/>
      <rect x="6" y="9" width="4" height="1" fill="#1e293b"/>
      {/* body - split color */}
      <rect x="3" y="10" width="5" height="6" fill="#dc2626"/>
      <rect x="8" y="10" width="5" height="6" fill="#7c3aed"/>
      <rect x="1" y="10" width="2" height="4" fill="#7c3aed"/>
      <rect x="13" y="10" width="2" height="4" fill="#dc2626"/>
    </svg>
  ),
};

export const AVATAR_LIST = Object.keys(AVATARS);

export const AVATAR_NAMES = {
  knight: "Knight", wizard: "Wizard", archer: "Archer",
  skull: "Skull", robot: "Robot", fox: "Fox",
  panda: "Panda", king: "King", flame: "Flame",
  thunder: "Thunder", moon: "Moon", jester: "Jester",
};

export default function Avatar({ id = "knight", size = 40 }) {
  const avatar = AVATARS[id] || AVATARS.knight;
  return (
    <div
      style={{ width: size, height: size, imageRendering: "pixelated" }}
      className="rounded-lg overflow-hidden flex-shrink-0"
    >
      {avatar}
    </div>
  );
}