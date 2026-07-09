import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  Sparkles,
  Users,
  BarChart3,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Menu,
  X,
  Star,
  ChevronRight,
  Layers,
  GitBranch,
  Bell,
  Target,
  Cpu,
  LineChart,
  MessageSquare,
  Globe,
  Rocket,
  Play,
  Pause,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Task Assignment",
    description:
      "Gemini AI intelligently scores and assigns tasks based on team members' skills, availability, workload, and time capacity — ensuring the right person gets the right task.",
    gradient: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
  },
  {
    icon: Sparkles,
    title: "Smart Task Generation",
    description:
      "Describe your project once, and our AI generates 6-12 detailed technical tasks with realistic estimates, required skills, and priority levels automatically.",
    gradient: "from-purple-500 to-pink-500",
    shadow: "shadow-purple-500/20",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description:
      "Stay updated with instant Socket.io-powered notifications for task assignments, completions, delays, and team updates — no page refresh needed.",
    gradient: "from-orange-500 to-red-500",
    shadow: "shadow-orange-500/20",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics & Reports",
    description:
      "Comprehensive dashboards with interactive charts, team performance metrics, project status tracking, and monthly trend analysis to make data-driven decisions.",
    gradient: "from-green-500 to-emerald-500",
    shadow: "shadow-green-500/20",
  },
  {
    icon: Users,
    title: "Role-Based Collaboration",
    description:
      "Granular access control with Admin, Team Lead, and Member roles. Each role has tailored views and permissions for secure, focused collaboration.",
    gradient: "from-indigo-500 to-purple-500",
    shadow: "shadow-indigo-500/20",
  },
  {
    icon: Clock,
    title: "Automated Delay Detection",
    description:
      "Cron-based monitoring automatically detects overdue tasks, sends delay notifications, and keeps project timelines on track without manual oversight.",
    gradient: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-500/20",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Create Your Organization",
    description:
      "Register as an admin, set up your organization, and invite team members with specific roles and skill profiles.",
    icon: Globe,
  },
  {
    step: "02",
    title: "Define Projects & Tasks",
    description:
      "Create projects with descriptions and deadlines. Let AI generate detailed tasks or define them manually with required skills and priorities.",
    icon: Layers,
  },
  {
    step: "03",
    title: "AI Auto-Assigns Tasks",
    description:
      "Our scoring engine evaluates every team member's skills, availability, and capacity to assign tasks to the best-fit person automatically.",
    icon: Cpu,
  },
  {
    step: "04",
    title: "Track & Collaborate",
    description:
      "Team members confirm, work on, and complete tasks with real-time progress tracking, work logs, and instant notifications.",
    icon: LineChart,
  },
  {
    step: "05",
    title: "Analyze & Optimize",
    description:
      "View detailed analytics, team reports, and project insights. Identify bottlenecks and optimize resource allocation continuously.",
    icon: Target,
  },
];

const stats = [
  { value: "10x", label: "Faster Task Assignment" },
  { value: "99%", label: "AI Match Accuracy" },
  { value: "24/7", label: "Real-Time Monitoring" },
  { value: "100%", label: "Role-Based Security" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Engineering Manager",
    company: "TechFlow Inc.",
    content:
      "MentorMind transformed how we manage projects. The AI assignment alone saved us 15 hours per week of manual task delegation.",
    rating: 5,
    avatar: "SC",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Marcus Johnson",
    role: "Team Lead",
    company: "DataSync Labs",
    content:
      "The real-time notifications and delay detection are game-changers. We've reduced project delays by 40% since switching to MentorMind.",
    rating: 5,
    avatar: "MJ",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Priya Patel",
    role: "CTO",
    company: "CloudBase Solutions",
    content:
      "The analytics dashboard gives us unprecedented visibility into team performance. Capacity planning has never been easier.",
    rating: 5,
    avatar: "PP",
    color: "from-green-500 to-emerald-500",
  },
];

const faqs = [
  {
    q: "How does the AI task assignment work?",
    a: "Our AI scoring engine evaluates team members across four weighted factors: skill match (40%), time capacity (25%), low workload (20%), and availability (15%). The highest-scoring member with matching skills gets assigned automatically.",
  },
  {
    q: "Can I customize the AI-generated tasks?",
    a: "Absolutely! AI-generated tasks are fully editable. You can modify titles, descriptions, priorities, deadlines, and reassign tasks manually at any time.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use JWT-based authentication with role-based access control. All passwords are hashed with bcrypt, and your data is stored securely in MongoDB.",
  },
  {
    q: "What roles are available?",
    a: "MentorMind supports three roles: Admin (full access), Team Lead (project and task management), and Member (task execution and self-assignment).",
  },
  {
    q: "Does it integrate with other tools?",
    a: "Currently, MentorMind is a standalone platform. We're planning API integrations with Slack, Jira, and GitHub for future releases.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 10 team members",
      "5 active projects",
      "AI task generation",
      "Basic analytics",
      "Email notifications",
    ],
    cta: "Get Started",
    popular: false,
    gradient: "from-gray-500 to-gray-600",
  },
  {
    name: "Professional",
    price: "₹0",
    period: "/month",
    description: "For growing teams that need more power",
    features: [
      "Up to 50 team members",
      "Unlimited projects",
      "AI auto-assignment",
      "Advanced analytics & reports",
      "Real-time notifications",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
    gradient: "from-blue-500 to-purple-500",
  },
  {
    name: "Enterprise",
    price: "₹0",
    period: "/month",
    description: "For large organizations with complex needs",
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "Custom AI model tuning",
      "API access & webhooks",
      "SSO & SAML integration",
      "Dedicated account manager",
      "99.9% uptime SLA",
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-purple-500 to-pink-500",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* ===== NAVBAR ===== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src="/MentorMind_Logo.png" alt="MentorMind 3.0" className="h-11 w-auto" />
              <span className="text-xl font-bold">
                <span className="text-white">Mentor</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Mind
                </span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    scrollToSection(item.toLowerCase().replace(/\s+/g, "-"))
                  }
                  className="text-sm text-slate-300 hover:text-white transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all group-hover:w-full" />
                </button>
              ))}
              <Link
                to="/login"
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    scrollToSection(item.toLowerCase().replace(/\s+/g, "-"))
                  }
                  className="block w-full text-left px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {item}
                </button>
              ))}
              <hr className="border-white/5" />
              <Link
                to="/login"
                className="block px-4 py-2.5 text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2.5 text-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Gradient orbs */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-purple-500/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-[96px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Project Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="text-white">Manage Projects with</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  AI Intelligence
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed">
                MentorMind leverages Google Gemini AI to automatically generate,
                assign, and track tasks — transforming how your team
                collaborates and delivers projects.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-sm transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-semibold text-sm transition-all hover:bg-white/5"
                >
                  <Play className="w-4 h-4" />
                  See How It Works
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {["SC", "MJ", "PP", "RK"].map((initials, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-gradient-to-br ${
                        [
                          "from-blue-400 to-cyan-400",
                          "from-purple-400 to-pink-400",
                          "from-green-400 to-emerald-400",
                          "from-orange-400 to-red-400",
                        ][i]
                      } flex items-center justify-center text-[10px] font-bold text-white`}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-400">
                  <span className="text-white font-semibold">500+</span> teams
                  already onboard
                </div>
              </div>
            </div>

            {/* Right: Hero visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main card */}
                <div className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <img src="/MentorMind_Logo.png" alt="MentorMind 3.0" className="h-10 w-auto rounded-lg" />
                      <div>
                        <div className="text-sm font-semibold text-white">
                          Project Alpha
                        </div>
                        <div className="text-xs text-slate-400">
                          AI-Powered Dashboard
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: "Tasks", value: "24", color: "text-blue-400" },
                      {
                        label: "Completed",
                        value: "18",
                        color: "text-green-400",
                      },
                      {
                        label: "In Progress",
                        value: "6",
                        color: "text-purple-400",
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-white/5 p-3 text-center"
                      >
                        <div
                          className={`text-xl font-bold ${stat.color}`}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs text-slate-400">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Assignment card */}
                  <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Cpu className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="text-sm font-medium text-white">
                        AI Auto-Assignment
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        {
                          name: "Sarah Chen",
                          skill: "95%",
                          workload: "72%",
                          score: "88%",
                        },
                        {
                          name: "Marcus J.",
                          skill: "82%",
                          workload: "45%",
                          score: "76%",
                        },
                      ].map((member, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2"
                        >
                          <span className="text-slate-300">{member.name}</span>
                          <div className="flex gap-3">
                            <span className="text-blue-400">
                              S:{member.skill}
                            </span>
                            <span className="text-purple-400">
                              W:{member.workload}
                            </span>
                            <span className="text-green-400 font-semibold">
                              {member.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Project Progress</span>
                      <span>75%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-500/30 float-y">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30 float-x">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
          <span className="text-xs">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-slate-600 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-slate-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ===== STATS BANNER ===== */}
      <section className="relative py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Everything you need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                manage projects
              </span>{" "}
              smarter
            </h2>
            <p className="text-lg text-slate-400">
              From AI-powered task generation to real-time analytics, MentorMind
              provides all the tools your team needs to deliver projects on
              time, every time.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm p-6 hover:bg-slate-900/60 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Gradient border on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${feature.gradient} blur-xl -z-10`}
                />

                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg ${feature.shadow}`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        id="how-it-works"
        className="relative py-24 lg:py-32 bg-slate-900/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
              <Rocket className="w-4 h-4" />
              <span>How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              From setup to delivery in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                5 simple steps
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Get your team up and running in minutes. MentorMind handles the
              complexity so you can focus on what matters.
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 hidden md:block" />

            <div className="space-y-12">
              {howItWorks.map((step, i) => (
                <div key={i} className="relative md:flex gap-8 items-start group">
                  {/* Step number */}
                  <div className="hidden md:flex shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center shadow-xl shadow-blue-500/20 z-10 group-hover:scale-110 transition-transform">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-slate-900/60 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Step {step.step}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6">
              <MessageSquare className="w-4 h-4" />
              <span>Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Loved by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                teams worldwide
              </span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm p-8 md:p-10">
              {/* Quote */}
              <div className="text-5xl text-blue-500/20 font-serif mb-4">
                &ldquo;
              </div>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8">
                {testimonials[currentTestimonial].content}
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonials[currentTestimonial].color} flex items-center justify-center text-sm font-bold text-white`}
                >
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-sm text-slate-400">
                    {testimonials[currentTestimonial].role},{" "}
                    {testimonials[currentTestimonial].company}
                  </div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentTestimonial
                        ? "bg-blue-400 w-6"
                        : "bg-slate-600 hover:bg-slate-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section
        id="pricing"
        className="relative py-24 lg:py-32 bg-slate-900/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm mb-6">
              <Target className="w-4 h-4" />
              <span>Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Simple, transparent{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                pricing
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Start for free. Upgrade when you need more power.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border ${
                  plan.popular
                    ? "border-blue-500/30 bg-slate-900/80"
                    : "border-white/5 bg-slate-900/40"
                } backdrop-blur-sm p-6 md:p-8 transition-all hover:-translate-y-1`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xs font-semibold text-white shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-slate-400">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate("/register")}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
                      : "border border-white/10 hover:border-white/20 text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="relative py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
              <MessageSquare className="w-4 h-4" />
              <span>FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Frequently asked{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                questions
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                >
                  <span className="text-sm md:text-base font-medium text-white pr-4">
                    {faq.q}
                  </span>
                  <ChevronRight
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                      activeFaq === i ? "rotate-90" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    activeFaq === i ? "max-h-40" : "max-h-0"
                  }`}
                >
                  <p className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-purple-500/5" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-sm p-8 md:p-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to transform your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                workflow?
              </span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Join 500+ teams already using MentorMind to deliver projects
              faster with the power of AI. Get started free — no credit card
              required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-base transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-semibold text-base transition-all hover:bg-white/5"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <img src="/MentorMind_Logo.png" alt="MentorMind 3.0" className="h-10 w-auto rounded-xl" />
                <span className="text-lg font-bold">
                  <span className="text-white">Mentor</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Mind
                  </span>
                </span>
              </Link>
              <p className="text-sm text-slate-400 max-w-sm">
                AI-powered project management platform that helps teams
                collaborate smarter, deliver faster, and achieve more.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "FAQ", "Changelog"].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() =>
                        scrollToSection(
                          item.toLowerCase().replace(/\s+/g, "-")
                        )
                      }
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} MentorMind. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}