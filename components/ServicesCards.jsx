"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Beaker,
  Cpu,
  Workflow,
  Pencil,
  Wand2,
  LayoutTemplate,
  BookOpen,
  FlaskConical,
  Repeat,
  Network,
  BarChart3,
  Code2,
  Calendar,
  ListChecks,
  Settings,
  ChevronDown,
} from "lucide-react";

<div className="grid gap-4 sm:grid-cols-2">
  {[
    { 
      icon: FileText, 
      title: "Research Papers",
      options: [
        { label: "Drafting", icon: Pencil },
        { label: "Editing", icon: Wand2 },
        { label: "Formatting", icon: LayoutTemplate },
      ],
    },
    { 
      icon: Beaker, 
      title: "Methodology Docs",
      options: [
        { label: "SOPs", icon: BookOpen },
        { label: "Lab Protocols", icon: FlaskConical },
        { label: "Reproducibility", icon: Repeat },
      ],
    },
    { 
      icon: Cpu, 
      title: "Custom Software",
      options: [
        { label: "APIs", icon: Network },
        { label: "Dashboards", icon: BarChart3 },
        { label: "Automation Scripts", icon: Code2 },
      ],
    },
    { 
      icon: Workflow, 
      title: "Lab Automation",
      options: [
        { label: "Scheduling", icon: Calendar },
        { label: "Tracking", icon: ListChecks },
        { label: "Instrument Integrations", icon: Settings },
      ],
    },
  ].map(({ icon, title, options }, i) => {
    const Icon = icon;
    return (
      <div
        key={i}
        className="group rounded-2xl border border-slate-200 shadow-lg transition hover:shadow-xl hover:border-sky-300 bg-white"
      >
        <Card className="rounded-2xl border-0 shadow-none">
          <CardContent className="flex items-center gap-3 p-6">
            <Icon className="h-6 w-6 text-sky-600" />
            <p className="text-sm font-semibold text-slate-800">{title}</p>
          </CardContent>
        </Card>

        {/* Expandable options */}
        <div className="hidden flex-col gap-2 px-6 pb-4 group-hover:flex">
          {options.map((opt, j) => {
            const OptIcon = opt.icon;
            return (
              <div
                key={j}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-gradient-to-r hover:from-sky-50 hover:to-emerald-50 hover:text-sky-700 transition cursor-pointer"
              >
                <OptIcon className="h-4 w-4 text-sky-500" />
                {opt.label}
              </div>
            );
          })}
        </div>
      </div>
    );
  })}
</div>
