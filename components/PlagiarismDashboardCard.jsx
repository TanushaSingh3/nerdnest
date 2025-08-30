import { Card, CardContent } from "@/components/ui/card";
import Badge  from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function PlagiarismDashboardCard() {
  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-lg">
      <CardContent className="p-0">
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 to-emerald-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            <p className="text-sm font-semibold text-slate-800">Originality Dashboard</p>
          </div>
          <Badge>Preview</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Plagiarism</p>
            <p className="mt-1 text-3xl font-bold text-sky-700">5.8%</p>
            <p className="mt-1 text-xs text-slate-500">Low similarity — Good to submit</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">AI Probability</p>
            <p className="mt-1 text-3xl font-bold text-emerald-700">12%</p>
            <p className="mt-1 text-xs text-slate-500">Likely human-authored</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Citations Suggested</p>
            <p className="mt-1 text-3xl font-bold text-slate-800">3</p>
            <p className="mt-1 text-xs text-slate-500">APA · IEEE · Vancouver</p>
          </div>

          <div className="col-span-1 md:col-span-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-600">Highlighted Passages</p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
                <li>
                  “The catalytic efficiency increased by <span className="font-semibold">28%</span> (possible citation).”
                </li>
                <li>
                  “We employed a <span className="font-semibold">double-blind protocol</span> to mitigate observer bias.”
                </li>
                <li>
                  “Results corroborate with <span className="font-semibold">Smith et al., 2023</span> findings.”
                </li>
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full border-slate-200">
                  Download PDF
                </Button>
                <Button className="rounded-full bg-gradient-to-r from-sky-600 to-emerald-600 text-white hover:from-sky-700 hover:to-emerald-700">
                  Re-run Check
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
