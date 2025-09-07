"use client";

import { motion } from "framer-motion";
import Section from "@/components/Section";
import ContactSection from "@/components/sections/ContactSection";
import Badge from "@/components/ui/badge";
import Pill from "@/components/ui/pill";
import GradientText from "@/components/ui/gradient-text";

// UI
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Icons
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
  Settings 
} from "lucide-react";

import { Mail, ShieldCheck, Send,  Sparkles, Database } from "lucide-react";
import ServicesCards from "../ServicesCards";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <Section id="hero" className="pt-10 md:pt-10">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Pill>NerdNest Solutions</Pill>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              <GradientText>Precision in Word. Power in Code.</GradientText>
            </h1>
            <p className="mt-5 text-slate-600 md:text-lg">
              We blend deep scientific expertise with cutting-edge engineering to
              craft publication-ready content and build AI-powered systems that scale.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-lg hover:from-sky-700 hover:to-emerald-700">
                Explore Scientific Services
              </Button>
              <Button
                variant="outline"
                className="border-slate-300 bg-white/70 backdrop-blur"
              >
                View Technology & Automation
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
              <Badge>Peer-review ready</Badge>
              <Badge>AI-assisted</Badge>
              <Badge>Secure by design</Badge>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-br from-sky-100 to-emerald-100 blur-2xl" />
            
            <div className="grid gap-4 sm:grid-cols-2">
  {[
    { 
      icon: FileText, 
      title: "Research Papers",
      options: ["Drafting", "Editing", "Formatting"] 
    },
    { 
      icon: Beaker, 
      title: "Methodology Docs",
      options: ["SOPs", "Lab Protocols", "Reproducibility"] 
    },
    { 
      icon: Cpu, 
      title: "Custom Software",
      options: ["APIs", "Dashboards", "Automation Scripts"] 
    },
    { 
      icon: Workflow, 
      title: "Lab Automation",
      options: ["Scheduling", "Tracking", "Instrument Integrations"] 
    },
  ].map(({ icon, title, options }, i) => {
    const Icon = icon;
    return (
      <Card
        key={i}
        className="group relative rounded-2xl border-slate-200 shadow-lg transition hover:shadow-xl hover:border-sky-300 overflow-hidden"
      >
        <CardContent className="flex flex-col gap-3 p-6">
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-sky-600" />
            <p className="text-sm font-semibold text-slate-800">{title}</p>
          </div>

          {/* Sub-options inside card */}
          <div className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-40">
            <div className="mt-3 flex flex-col gap-2">
              {options.map((opt, j) => (
                <button
                  key={j}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-gradient-to-r hover:from-sky-50 hover:to-emerald-50 hover:text-sky-700 transition"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  })}
</div>





          </motion.div>
        </div>
      </Section>

      {/* ABOUT SECTION */}
      <Section id="about">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            About Us
          </h2>
          <p className="mx-auto mt-4 text-slate-600">
            NerdNest Solutions is an interdisciplinary studio delivering
            high-impact scientific content and AI-powered technology. From
            manuscripts and grant proposals to chatbots and data platforms, our
            team of PhDs and engineers ship outcomes that are rigorous, reliable,
            and ready for real-world deployment.
          </p>
        </motion.div>
      </Section>

      {/* WHY SECTION */}
      <Section id="why">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Why NerdNest Solutions
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Science-backed",
                desc: "Domain experts across life sciences, engineering, and data.",
                icon: Beaker,
              },
              {
                title: "Tech-driven",
                desc: "Modern stacks, automation, and responsible AI by default.",
                icon: Cpu,
              },
              {
                title: "Quality first",
                desc: "Peer-review mindset and robust QA on every deliverable.",
                icon: ShieldCheck,
              },
              {
                title: "Faster to publish",
                desc: "Structured workflows that cut cycles and revisions.",
                icon: Sparkles,
              },
              {
                title: "Data you can trust",
                desc: "Governed pipelines, reproducible analysis, clean dashboards.",
                icon: Database,
              },
              {
                title: "End-to-end",
                desc: "From idea to implementation — content and code under one roof.",
                icon: Workflow,
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <Card
                  key={i}
                  className="rounded-2xl border-slate-200 shadow-md transition hover:shadow-xl"
                >
                  <CardContent className="p-6">
                    <Icon className="h-6 w-6 text-sky-600" />
                    <p className="mt-4 text-base font-semibold text-slate-900">
                      {f.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      </Section>

            {/* TEAM SECTION 
            <Section id="team">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-center">
            Meet the Team
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Our team brings together scientists, engineers, and designers who
            are passionate about solving complex problems at the intersection of
            research and technology.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
               {
                name: "Adil Khan",
                role: "Founder",
                img: "/team/adil_d.png",
              },
              {
                name: "Tanusha Singh",
                role: "Tech Lead",
                img: "/team/tanusha.png", 
              },             
              {
                name: "Saket",
                role: "Full-Stack Developer · Integrations",
                img: "/team/saket.png",
              }
            ].map((m, i) => (
              <Card
                key={i}
                className="rounded-2xl border-slate-200 shadow-md transition hover:shadow-xl"
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <img
                    src={m.img}
                    alt={m.name}
                    className="h-24 w-24 rounded-full object-cover shadow-md "
                  />
                  <p className="mt-4 text-lg font-semibold text-slate-900">
                    {m.name}
                  </p>
                  <p className="text-sm text-slate-600">{m.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </Section>*/}


      {/* CONTACT SECTION */}
      <ContactSection />
    </>
  );
}
