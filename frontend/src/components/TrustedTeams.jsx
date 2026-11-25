import React from "react";
import { Shield, Building2, Cpu, GraduationCap, Users2, Landmark } from "lucide-react";
import { useLang } from "../i18n";

export const TEAMS = [
  { id: "campus-guild", name: "Campus Guilds", icon: GraduationCap, desc: "Hostel & Housing" },
  { id: "metro-civic", name: "Metro Civic Labs", icon: Cpu, desc: "Smart City Tech" },
  { id: "national-skills", name: "National Skills", icon: Landmark, desc: "Trade Verified" },
  { id: "housing-union", name: "Resident Societies", icon: Building2, desc: "RWA Network" },
  { id: "ethical-work", name: "Ethical Gig Union", icon: Shield, desc: "Fair Pay Charter" },
  { id: "student-network", name: "Youth Co-op Forum", icon: Users2, desc: "Community Trust" },
];

export default function TrustedTeams({ className = "" }) {
  const { tr } = useLang();
  return (
    <section id="teams" className={`relative w-full border-y border-neutral-200 bg-neutral-50/80 py-10 px-4 sm:px-6 ${className}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {tr("Trusted by residential societies & cooperative guilds")}
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {tr("Background-checked local workforce")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TEAMS.map((team) => {
            const Icon = team.icon;
            return (
              <div
                key={team.id}
                className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 mb-3">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">{team.name}</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{team.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
