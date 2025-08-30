"use client";

import Section from "@/components/Section";
import PlagiarismDashboardCard from "@/components/PlagiarismDashboardCard";

import { Card, CardContent } from "@/components/ui/card";
import { Bot, ShieldCheck } from "lucide-react";

export default function AIResearchToolsCompact() {
    return (
      <Section id="ai-tools">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">AI‑Powered Modules</h3>
            <p className="mt-3 text-slate-600">
              Integrate quality checks into your writing flow. Our tools provide grammar fixes, citation suggestions, plagiarism detection, and originality insights — similar to Turnitin‑style previews.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card className="rounded-2xl border-slate-200 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-sky-600" />
                    <p className="text-sm font-semibold text-slate-800">AI BOT · Proofreading Assistant</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Chat‑style grammar & citation recommendations.</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-200 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-sky-600" />
                    <p className="text-sm font-semibold text-slate-800">Dashboard · Plagiarism & AI Check</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Upload drafts, get similarity %, originality, and citations.</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-br from-sky-100 to-emerald-100 blur-2xl" />
            <PlagiarismDashboardCard />
          </div>
        </div>
      </Section>
    );
  }
  