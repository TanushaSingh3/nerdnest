import Section from "@/components/Section";
import Pill from "@/components/ui/pill";
import GradientText from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ContactSection from "@/components/sections/ContactSection";
import { Cpu, Database, Bot, Workflow, BarChart } from "lucide-react";

export default function TechAutomation() {
  const items = [
    { title: "Custom Software", icon: Cpu, desc: "Full‑stack apps, APIs, integrations, and developer docs." },
    { title: "Data Warehouse", icon: Database, desc: "Modern ELT, governance, lineage, and BI enablement." },
    { title: "AI‑Powered Chatbots", icon: Bot, desc: "User‑centric assistants with secure retrieval and analytics." },
    { title: "Lab Workflow Automation", icon: Workflow, desc: "Scheduling, tracking, and instrument integrations." },
    { title: "Data Analytics & Visualization", icon: BarChart, desc: "Statistical models, dashboards, and storytelling." },
  ];

  return (
    <>
      <Section id="tech-hero" className="pt-20 md:pt-28">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <Pill>Technology & Automation</Pill>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
              <GradientText>AI‑Powered Technical Solutions</GradientText>
            </h2>
            <p className="mt-4 text-slate-600">
              We design scalable platforms, automations, and chatbots that accelerate research and operations — with privacy and compliance built‑in.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-lg hover:from-sky-700 hover:to-emerald-700">
                Book a Discovery Call
              </Button>
              <Button variant="outline" className="border-slate-300">View Case Studies</Button>
            </div>
          </div>
          <div className="relative">
         {/*<div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-br from-sky-100 to-emerald-100 blur-2xl" /> */}   
            <div className="grid gap-4 sm:grid-cols-2">
              {items.slice(0,4).map((o, i) => (
                <Card key={i} className="rounded-2xl border-slate-200 shadow-lg">
                  <CardContent className="flex items-center gap-3 p-6">
                    <o.icon className="h-6 w-6 text-sky-600" />
                    <p className="text-sm font-semibold text-slate-800">{o.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="tech-items">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">What we build</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((o, i) => (
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

      <ContactSection />
    </>
  );
}