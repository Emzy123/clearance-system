import { motion } from "framer-motion";
import { UploadCloud, Clock, CheckSquare, FileBadge } from "lucide-react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  const steps = [
    {
      icon: <UploadCloud className="text-blue-500" size={32} />,
      title: "1. Submit Documents",
      description: "Log in using your university credentials and upload all required clearance documents directly to the portal."
    },
    {
      icon: <Clock className="text-amber-500" size={32} />,
      title: "2. Departmental Review",
      description: "Your submissions are automatically routed to the respective departments (Library, Bursary, Faculty, etc.) for verification."
    },
    {
      icon: <CheckSquare className="text-emerald-500" size={32} />,
      title: "3. Track Approvals",
      description: "Monitor your progress in real-time. If an issue is found, staff members can leave targeted feedback for you to resolve."
    },
    {
      icon: <FileBadge className="text-indigo-500" size={32} />,
      title: "4. Final Clearance",
      description: "Once all required departments approve your submission, you instantly receive your final digital clearance certificate."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-6 bg-slate-50/50 dark:bg-slate-950/20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Our streamlined process ensures you get your clearance certificate with absolute zero paperwork or physically walking between offices.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line connecting steps */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  idx % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1 w-full" />
                
                <div className="z-10 bg-white dark:bg-slate-900 p-4 rounded-full border border-slate-200 dark:border-slate-700 shadow-md">
                  {step.icon}
                </div>

                <div className={`flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${
                  idx % 2 === 0 ? "md:text-right" : "md:text-left"
                }`}>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Ready to start your clearance?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Log in with your university ID and start resolving your clearance seamlessly today.
            </p>
            <Link
              to="/login"
              className="inline-block rounded-xl bg-brand-primary text-white px-8 py-3 text-base font-semibold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
            >
              Access Portal Now
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
