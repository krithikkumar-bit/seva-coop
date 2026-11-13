import React from "react";
import { Shield, Building2, Cpu, GraduationCap, Users2, Landmark } from "lucide-react";
import { useLang } from "../i18n";

/**
 * "TRUSTED BY FORWARD-THINKING TEAMS"
 * 
 * At the bottom of the hero as requested by the user:
 * "And then at the bottom where the brand logos are, just put in 
 * trusted by forward-thinking teams for now and then we'll edit it later."
 * 
 * To edit or add logos/teams later, simply modify the `TEAMS` array below:
 */
export const TEAMS = [
  {
    id: "campus-guild",
    name: "CAMPUS RESIDENCES GUILD",
    code: "CRG-24",
    icon: GraduationCap,
    desc: "Collegiate Housing",
  },
  {
    id: "metro-civic",
    name: "METRO CIVIC TECH LABS",
    code: "MCTL",
    icon: Cpu,
    desc: "Smart Governance",
  },
  {
    id: "national-skills",
    name: "NATIONAL SKILLS ALLIANCE",
    code: "NSA-IN",
    icon: Landmark,
    desc: "Trade Certification",
  },
  {
    id: "housing-union",
    name: "COMMUNITY HOUSING UNION",
    code: "CHU-IX",
    icon: Building2,
    desc: "Resident Societies",
  },
  {
    id: "ethical-work",
    name: "ETHICAL WORK PROTOCOL",
    code: "EWP",
    icon: Shield,
    desc: "Fair Gig Labor",
  },
  {
    id: "student-network",
    name: "STUDENT GUILD NETWORK",
    code: "SGN",
    icon: Users2,
    desc: "Youth Co-op Union",
  },
];

export default function TrustedTeams({ className = "" }) {
  const { tr } = useLang();
  return (
    <div id="teams" className={`relative w-full border-t border-b border-white/10 bg-stoneblack-surface/50 py-10 px-4 sm:px-6 pointer-events-auto ${className}`}>
      {/* Background Micro Grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid-stoneblack-fine opacity-40" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-emerald-400" />
            <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-slate-300">
              {tr("TRUSTED BY FORWARD-THINKING TEAMS")}
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
            {tr("[ EDITABLE PARTNER NODES · SECURE ENTERPRISE INTEGRATION ]")}
          </p>
        </div>

        {/* Brand / Partner Logos Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TEAMS.map((team) => {
            const Icon = team.icon;
            return (
              <div
                key={team.id}
                className="group relative flex flex-col justify-between border border-white/10 bg-black/40 p-4 transition-all duration-200 hover:border-white/40 hover:bg-white/[0.04]"
              >
                {/* Crosshair Corner Indicators */}
                <div className="absolute top-1.5 left-1.5 h-1 w-1 border-t border-l border-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-1.5 right-1.5 h-1 w-1 border-t border-r border-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-1.5 left-1.5 h-1 w-1 border-b border-l border-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-1.5 right-1.5 h-1 w-1 border-b border-r border-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center justify-between mb-3">
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <span className="font-mono text-[9px] font-bold text-slate-400 group-hover:text-white transition-colors">
                    {team.code}
                  </span>
                </div>

                <div>
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">
                    {team.name}
                  </h4>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 mt-1">
                    {team.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Cooperative Protocol Status Ticker */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4 font-mono text-[10px] tracking-wider text-slate-400 uppercase">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>{tr("SYSTEM OPERATIONAL · 142 VERIFIED COOPERATIVE ARTISANS ACTIVE")}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{tr("DISPATCH LATENCY: 2.4 MINS")}</span>
            <span className="hidden sm:inline">LAT/LONG: 28°38'N 77°13'E</span>
            <span>SIH26089 PROTOCOL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
