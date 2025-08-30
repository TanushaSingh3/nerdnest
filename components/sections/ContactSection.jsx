"use client";

import Section from "@/components/Section";
import { Mail, ShieldCheck, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";


export default function ContactSection() {
    return (
     <Section id="contact">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">Contact Us</h3>
            <p className="mt-3 text-slate-600">
              Tell us about your project. We typically respond within one business day.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-sky-600" /> hello@nerdnest.solutions</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Confidential & under NDA by default</div>
            </div>
          </div>
          <Card className="rounded-2xl border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <form className="grid gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-600">Full Name</label>
                  <Input placeholder="Your name" />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-600">Email</label>
                  <Input type="email" placeholder="you@company.com" />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-600">How can we help?</label>
                  <Textarea placeholder="Briefly describe your needs…" className="min-h-[120px]" />
                </div>
                <div className="flex justify-end">
                  <Button className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white hover:from-sky-700 hover:to-emerald-700">
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Section>
    );
  }
  