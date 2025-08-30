import PlagiarismDashboardCard from "@/components/PlagiarismDashboardCard";

export default function AIResearchToolsFull() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center">AI Research Tools</h2>
      <p className="mt-4 text-center text-slate-600">
        Explore AI-powered tools for plagiarism detection, literature review, and data visualization.
      </p>
      <div className="mt-8 flex justify-center">
        <PlagiarismDashboardCard />
      </div>
    </section>
  );
}
