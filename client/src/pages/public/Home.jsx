import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    {
      icon: <Zap className="text-amber-500" size={24} />,
      title: "Fast & Paperless",
      description: "Say goodbye to long queues and massive paperwork. Process your clearance from anywhere."
    },
    {
      icon: <CheckCircle className="text-emerald-500" size={24} />,
      title: "Real-time Tracking",
      description: "Get instant updates on the status of your clearance across all required departments."
    },
    {
      icon: <Shield className="text-indigo-500" size={24} />,
      title: "Secure & Transparent",
      description: "Your documents and data are securely handled, with full transparency into every approval."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center">
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/10 via-brand-bg to-transparent dark:from-brand-primary/5 dark:via-slate-950 dark:to-transparent" />
        
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Streamline Your <span className="text-brand-primary bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-indigo-600">University Clearance</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              A fully digitized, paperless clearance experience. Submit your requirements, track approvals in real-time, and get your final certificate without the hassle.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="group flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white px-8 py-4 text-base font-semibold hover:bg-brand-primary/90 transition-all hover:-translate-y-1 w-full sm:w-auto shadow-lg shadow-brand-primary/20"
              >
                Access Portal
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/how-it-works"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-8 py-4 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:-translate-y-1 w-full sm:w-auto"
              >
                Learn How It Works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 + 0.2 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
