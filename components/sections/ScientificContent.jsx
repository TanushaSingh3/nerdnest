"use client";

import Section from "@/components/Section";
import Pill from "@/components/ui/pill";
import GradientText from "@/components/ui/gradient-text";
import PlagiarismDashboardCard from "@/components/PlagiarismDashboardCard";
import AIResearchToolsCompact from "@/components/AIResearchToolsCompact";
import ContactSection from "@/components/sections/ContactSection";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Lucide icons
import { 
  FileText, 
  ClipboardCheck, 
  BookOpenText, 
  FlaskConical, 
  ShieldCheck, 
  Workflow, 
  Sparkles 
} from "lucide-react";

  export default function ScientificContent() {
    const offerings = [
      { title: "Research Papers", icon: FileText, desc: "End‑to‑end manuscript drafting, editing, and formatting." },
      { title: "Scientific Reports", icon: ClipboardCheck, desc: "Clear reporting of experiments and results for teams & boards." },
      { title: "Book Chapters", icon: BookOpenText, desc: "Scholarly chapters with rigorous review and references." },
      { title: "Methodology Documentation", icon: FlaskConical, desc: "SOPs and methods with reproducibility and FAIR principles." },
      { title: "Peer Review", icon: ShieldCheck, desc: "Pre‑submission critique and journal readiness checks." },
      { title: "Technical Manuals", icon: Workflow, desc: "Developer & lab manuals, quick‑start guides, and FAQs." },
      { title: "Grant Proposals", icon: Sparkles, desc: "Winning narratives with measurable impact and budgets." },
    ];
  
    return (
      <>
        <Section id="sci-hero" className="pt-20 md:pt-28">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <Pill>Scientific Content Services</Pill>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
                <GradientText>Publication‑ready Scientific Content</GradientText>
              </h2>
              <p className="mt-4 text-slate-600">
                From hypothesis to submission, we craft precise, persuasive, and compliant scientific content that accelerates publication and funding.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-lg hover:from-sky-700 hover:to-emerald-700">
                  Start a Project
                </Button>
                <Button variant="outline" className="border-slate-300">Download Brochure</Button>
              </div>
            </div>
            <div className="relative">
             {/*<div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-br from-sky-100 to-emerald-100 blur-2xl" /> */} 
              <PlagiarismDashboardCard />
            </div>
          </div>
        </Section>
  
        <Section id="offerings">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">Offerings</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((o, i) => (
              <Card key={i} className="rounded-2xl border-slate-200 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl">
                <CardContent className="p-6">
                  <o.icon className="h-6 w-6 text-sky-600" />
                  <p className="mt-4 text-base font-semibold text-slate-900">{o.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{o.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
  
        <AIResearchToolsCompact />
  
        <ContactSection />
      </>
    );
  }