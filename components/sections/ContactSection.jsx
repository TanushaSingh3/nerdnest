"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Section from "@/components/Section";
import { Mail, ShieldCheck, Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbxESLJAbel7Y1ryH3mFu8cwdAQLKIWdME19Fb28hhD8_1ZhZYVBHig8Nm_REBg1B-fC/exec", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setStatus("");
      } else {
        setStatus("❌ Something went wrong.");
      }
    } catch (error) {
      setStatus("⚠️ Error connecting to server.");
    }
  };

  return (
    <Section id="contact">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Side */}
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            Contact Us
          </h3>
          <p className="mt-3 text-slate-600">
            Tell us about your project. We typically respond within one business day.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-600" /> hello@nerdnest.solutions
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Confidential & under NDA by default
            </div>
          </div>
        </div>

        {/* Right Side */}
        <Card className="rounded-2xl border-slate-200 shadow-lg">
          <CardContent className="p-6 flex justify-center items-center min-h-[300px]">
            {!submitted ? (
              <form className="grid gap-3 w-full" onSubmit={handleSubmit}>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-600">Full Name</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-600">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-600">How can we help?</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Briefly describe your needs…"
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white hover:from-sky-700 hover:to-emerald-700"
                  >
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </div>
                {status && <p className="mt-2 text-sm text-slate-600">{status}</p>}
              </form>
            ) : (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex flex-col items-center text-center"
              >
                <CheckCircle2 className="h-20 w-20 text-emerald-600" />
                <p className="mt-4 text-lg font-semibold text-slate-800">
                  Thank you! Your message has been sent.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
