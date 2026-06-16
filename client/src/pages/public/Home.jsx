import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Shield, Zap, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    {
      icon: <Zap className="text-amber-500" size={26} />,
      title: "Fast & Paperless",
      description: "Say goodbye to long queues and physical forms. Initiate and complete your clearance entirely online.",
      color: "border-amber-500/20 dark:border-amber-500/10 hover:shadow-amber-500/10"
    },
    {
      icon: <CheckCircle className="text-emerald-500" size={26} />,
      title: "Real-time Tracking",
      description: "Stay updated with immediate status syncs, system push notifications, and automated stage progress checks.",
      color: "border-emerald-500/20 dark:border-emerald-500/10 hover:shadow-emerald-500/10"
    },
    {
      icon: <Shield className="text-indigo-500" size={26} />,
      title: "Secure & Transparent",
      description: "Your academic documents and files are stored securely with verified digital signatures and full audit transparency.",
      color: "border-indigo-500/20 dark:border-indigo-500/10 hover:shadow-indigo-500/10"
    }
  ];

  const stats = [
    { value: "24h", label: "Average clearance time", icon: <Clock className="text-emerald-500" size={20} /> },
    { value: "99.8%", label: "Satisfaction rate", icon: <Sparkles className="text-amber-500" size={20} /> },
    { value: "10k+", label: "Cleared Students", icon: <CheckCircle2 className="text-indigo-500" size={20} /> }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between overflow-hidden relative">
      {/* Background Decorative Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -z-20 dark:bg-brand-primary/5 animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-brand-secondary/15 rounded-full blur-3xl -z-20 dark:bg-brand-secondary/5" />

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-16 md:pt-32 md:pb-20 max-w-7xl mx-auto w-full">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-xs font-semibold text-slate-800 dark:text-slate-200 mb-6 shadow-sm">
              <Sparkles size={14} className="text-brand-secondary animate-pulse" />
              CUSTECH Clearance Portal
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 font-display">
              Streamline Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary">
                Student Clearance
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
              Confluence University of Science and Technology Student Clearance Management System. Track your sequential clearance progress, upload necessary documents for each stage, and complete your graduation requirements online.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
              <Link
                to="/login"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-brand-primary hover:bg-brand-primary/95 text-white px-8 py-4 text-base font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-primary/20 w-full sm:w-auto"
              >
                Access Portal
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/how-it-works"
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm px-8 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all hover:-translate-y-0.5 w-full sm:w-auto"
              >
                Learn How It Works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="px-6 py-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-5 rounded-2xl border border-slate-100 dark:border-slate-900/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md flex items-center gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition-colors shadow-sm"
            >
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 flex-shrink-0">
                {stat.icon}
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 w-full bg-slate-50/50 dark:bg-slate-950/30 backdrop-blur-sm border-t border-slate-200/50 dark:border-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 + 0.3 }}
                className={`p-6 rounded-2xl bg-white dark:bg-slate-900/80 border ${feature.color} shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800/40">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-display">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
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
