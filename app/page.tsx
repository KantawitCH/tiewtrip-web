"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Map,
  Wallet,
  Users,
  Sparkles,
  Plane,
  Ticket,
  Clock,
  ArrowRight,
  CheckCircle2,
  Vote,
  MessageSquare,
  Smartphone,
  Globe,
  Camera,
  Compass,
  UtensilsCrossed,
  Backpack,
  MapPin,
  Calendar,
  Plus
} from "lucide-react";

const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --cream: #FAF7F0;
    --ink: #1A1714;
    --coral: #FF5C3A;
    --mint: #3DFFC0;
    --yellow: #FFE44D;
    --plum: #2D0A3E;
    --soft: #EBE8E0;
  }

  body.custom-cursor-active { cursor: none !important; }
  body.custom-cursor-active * { cursor: none !important; }

  .spark-root {
    font-family: var(--font-dm-sans), sans-serif;
    background: var(--cream);
    color: var(--ink);
    overflow-x: hidden;
    min-height: 100vh;
  }

  /* ... cursor styles ... */
  .cursor-dot {
    position: fixed;
    width: 10px; height: 10px;
    background: var(--coral);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease, width 0.2s, height 0.2s, background 0.2s;
    display: none;
  }
  body.custom-cursor-active .cursor-dot { display: block; }
  .cursor-dot.expanded { width: 20px; height: 20px; background: var(--coral); opacity: 0.7; }

  .cursor-ring {
    position: fixed;
    width: 38px; height: 38px;
    border: 2px solid var(--coral);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    opacity: 0.45;
    transition: opacity 0.2s;
    display: none;
  }
  body.custom-cursor-active .cursor-ring { display: block; }
  .cursor-ring.hidden { opacity: 0; }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 52px;
    background: transparent;
    transition: background 0.3s;
  }
  .nav.scrolled { background: rgba(250,247,240,0.9); backdrop-filter: blur(12px); }

  .nav-logo {
    font-family: var(--font-fraunces), serif;
    font-size: 1.7rem; font-weight: 900;
    color: var(--ink); text-decoration: none;
    letter-spacing: -0.02em;
  }
  .nav-logo span { color: var(--coral); }

  .nav-links { display: flex; gap: 36px; list-style: none; }
  .nav-link {
    font-size: 0.8rem; font-weight: 500;
    color: var(--ink); text-decoration: none;
    letter-spacing: 0.08em; text-transform: uppercase;
    position: relative; padding-bottom: 3px;
    cursor: pointer;
  }
  .nav-link::after {
    content: ''; position: absolute; left: 0; bottom: 0;
    width: 0; height: 2px; background: var(--coral);
    transition: width 0.3s ease;
  }
  .nav-link:hover::after { width: 100%; }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; justify-content: center;
    padding: 130px 52px 80px;
    position: relative; overflow: hidden;
  }

  .blob {
    position: absolute; border-radius: 50%;
    filter: blur(90px); opacity: 0.3;
    pointer-events: none;
  }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 0.75rem; font-weight: 500;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--coral); margin-bottom: 28px;
  }
  .pulse-dot {
    width: 8px; height: 8px;
    background: var(--coral); border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }

  .hero-h1 {
    font-family: var(--font-figtree), sans-serif;
    font-size: clamp(3rem, 7vw, 6.5rem);
    font-weight: 900; line-height: 1;
    letter-spacing: -0.03em;
    margin-bottom: 32px; max-width: 900px;
  }
  .hero-h1 em { font-style: italic; color: var(--coral); }

  .hero-bottom {
    display: flex; align-items: flex-end;
    justify-content: space-between; flex-wrap: wrap; gap: 32px;
  }

  .hero-desc {
    font-size: 1.05rem; line-height: 1.75;
    color: #6A6560; max-width: 380px;
  }

  .btn-group { display: flex; gap: 14px; align-items: center; }

  .btn {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 15px 30px; border-radius: 100px;
    font-family: var(--font-dm-sans), sans-serif; font-size: 0.875rem; font-weight: 500;
    text-decoration: none; border: none; outline: none;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  .btn:hover { transform: translateY(-3px); }
  .btn-primary { background: var(--ink); color: var(--cream); box-shadow: 0 6px 20px rgba(26,23,20,0.18); }
  .btn-primary:hover { box-shadow: 0 14px 36px rgba(26,23,20,0.28); }
  .btn-outline { border: 1.5px solid var(--ink); color: var(--ink); background: transparent; }
  .btn-outline:hover { background: var(--ink); color: var(--cream); }

  /* MARQUEE */
  .marquee-bar { background: var(--ink); padding: 16px 0; overflow: hidden; white-space: nowrap; }
  .marquee-inner { display: inline-flex; gap: 52px; animation: scroll 22s linear infinite; }
  .marquee-item { font-family: var(--font-figtree), sans-serif; font-style: italic; font-size: 0.95rem; color: rgba(255,255,255,0.55); }
  .marquee-star { color: var(--coral); opacity: 1; font-style: normal; font-size: 1.1rem; }
  @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  /* SECTION BASE */
  .section { padding: 100px 52px; }

  .section-eyebrow {
    font-size: 0.75rem; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--coral);
    font-weight: 500; margin-bottom: 10px;
  }
  .section-title {
    font-family: var(--font-figtree), sans-serif;
    font-size: clamp(2.4rem, 4.5vw, 4rem);
    font-weight: 700; letter-spacing: -0.03em; line-height: 1.1;
    margin-bottom: 52px;
  }
  .section-title span { color: var(--coral); }
  .section-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 52px; }
  .section-link {
    font-size: 0.8rem; color: var(--coral); text-decoration: none;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    border-bottom: 1px solid var(--coral); padding-bottom: 2px;
    cursor: pointer;
  }

  /* WORK GRID */
  .work-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
    gap: 20px;
  }

  .work-card {
    border-radius: 18px; overflow: hidden; position: relative;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
    cursor: pointer;
  }
  .work-card:hover { transform: translateY(-8px) scale(1.01); }
  .work-card:first-child { grid-row: span 2; }

  .work-card-inner {
    width: 100%; height: 100%; min-height: 240px;
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 26px; position: relative; overflow: hidden;
  }
  .work-card:first-child .work-card-inner { min-height: 100%; min-height: 520px; }

  .card-gradient {
    position: absolute; inset: 0;
    transition: transform 0.5s ease;
  }
  .work-card:hover .card-gradient { transform: scale(1.06); }
  .card-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);
  }

  .card-emoji-badge {
    position: absolute; top: 22px; right: 22px;
    font-size: 2.2rem; z-index: 2;
    animation: floaty 3s ease-in-out infinite;
  }
  @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }

  .card-tag {
    font-size: 0.68rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
    background: rgba(255,255,255,0.18); color: #fff;
    padding: 5px 12px; border-radius: 100px;
    align-self: flex-start; margin-bottom: 10px; position: relative; z-index: 2;
  }
  .card-title {
    font-family: var(--font-figtree), sans-serif; font-size: 1.3rem; font-weight: 700;
    color: #fff; line-height: 1.2; position: relative; z-index: 2;
  }

  /* SERVICES */
  .services-section { background: var(--ink); color: var(--cream); }
  .services-section .section-title { color: var(--cream); }

  .services-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 2px; background: rgba(255,255,255,0.07);
    border-radius: 20px; overflow: hidden;
  }
  .service-card {
    background: var(--ink); padding: 44px 32px;
    position: relative; transition: background 0.3s;
    cursor: pointer;
  }
  .service-card:hover { background: #222018; }

  .service-num {
    font-family: var(--font-figtree), sans-serif; font-size: 3rem; font-weight: 900;
    color: rgba(255,255,255,0.05); line-height: 1; margin-bottom: 22px;
    transition: color 0.3s;
  }
  .service-card:hover .service-num { color: var(--coral); opacity: 0.35; }

  .service-icon-badge {
    position: absolute; top: 32px; right: 32px;
    font-size: 1.6rem; opacity: 0.55;
    transition: opacity 0.3s, transform 0.3s;
  }
  .service-card:hover .service-icon-badge { opacity: 1; transform: rotate(12deg) scale(1.15); }

  .service-name {
    font-family: var(--font-figtree), sans-serif; font-size: 1.3rem; font-weight: 700;
    margin-bottom: 14px; line-height: 1.2;
  }
  .service-desc { font-size: 0.85rem; line-height: 1.75; color: rgba(255,255,255,0.45); }

  /* STATS */
  .stats-section { background: var(--yellow); }
  .stats-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 2px; background: rgba(0,0,0,0.08);
    border-radius: 20px; overflow: hidden;
  }
  .stat-card { background: var(--yellow); padding: 48px 28px; text-align: center; }
  .stat-num {
    font-family: var(--font-figtree), sans-serif; font-size: 4.2rem; font-weight: 900;
    line-height: 1; color: var(--ink); margin-bottom: 8px;
  }
  .stat-label {
    font-size: 0.78rem; color: rgba(26,23,20,0.55);
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
  }

  /* TEAM */
  .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
  .team-card { text-align: center; cursor: pointer; }
  .team-avatar {
    width: 100%; aspect-ratio: 1; border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 3.8rem; margin-bottom: 16px;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .team-card:hover .team-avatar { transform: scale(1.05) rotate(-2.5deg); }
  .team-name {
    font-family: var(--font-figtree), sans-serif; font-size: 1.05rem;
    font-weight: 700; margin-bottom: 4px;
  }
  .team-role {
    font-size: 0.75rem; color: var(--coral);
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
  }

  /* CTA */
  .cta-section {
    background: var(--plum); padding: 110px 52px;
    text-align: center; position: relative; overflow: hidden;
  }
  .cta-bg-star {
    position: absolute; font-size: 38rem;
    color: rgba(255,255,255,0.02);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none; user-select: none;
    animation: rotateStar 80s linear infinite;
  }
  @keyframes rotateStar { to { transform: translate(-50%, -50%) rotate(360deg); } }

  .cta-title {
    font-family: var(--font-figtree), sans-serif;
    font-size: clamp(3rem, 6.5vw, 7rem);
    font-weight: 900; letter-spacing: -0.04em; line-height: 0.95;
    color: #fff; margin-bottom: 28px; position: relative; z-index: 1;
  }
  .cta-title em { font-style: italic; color: var(--mint); }
  .cta-desc { color: rgba(255,255,255,0.45); font-size: 1.05rem; margin-bottom: 48px; max-width: 460px; margin-left: auto; margin-right: auto; position: relative; z-index: 1; }

  .btn-cta {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 20px 52px; border-radius: 100px;
    background: var(--mint); color: var(--ink);
    font-family: var(--font-dm-sans), sans-serif; font-size: 1rem; font-weight: 600;
    text-decoration: none; border: none;
    box-shadow: 0 0 60px rgba(61,255,192,0.28);
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative; z-index: 1;
    cursor: pointer;
  }
  .btn-cta:hover { transform: translateY(-4px); box-shadow: 0 0 90px rgba(61,255,192,0.45); }

  /* FOOTER */
  .footer {
    background: var(--ink); color: rgba(255,255,255,0.35);
    padding: 36px 52px; font-size: 0.82rem;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-logo { font-family: var(--font-fraunces), serif; font-size: 1.3rem; font-weight: 900; color: var(--cream); text-decoration: none; letter-spacing: -0.02em; }
  .footer-logo span { color: var(--coral); }

  /* SHOWCASE */
  .showcase-section {
    padding: 120px 52px;
    background: var(--cream);
    overflow: hidden;
  }
  .showcase-container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    height: 700px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mockup-stack {
    position: relative;
    width: 100%;
    height: 100%;
    perspective: 1000px;
  }
  .mockup-card {
    position: absolute;
    background: white;
    border-radius: 24px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.12);
    border: 1px solid rgba(0,0,0,0.05);
    overflow: hidden;
    transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s ease;
  }
  
  /* Dashboard Mockup */
  .mockup-dashboard {
    width: 700px;
    height: 450px;
    top: 50%;
    left: 45%;
    transform: translate(-50%, -50%) rotateX(10deg) rotateY(-15deg) rotateZ(2deg);
    z-index: 3;
  }
  
  /* Overview Mockup */
  .mockup-overview {
    width: 600px;
    height: 400px;
    top: 40%;
    left: 60%;
    transform: translate(-50%, -50%) rotateX(5deg) rotateY(10deg) rotateZ(-2deg);
    z-index: 2;
    opacity: 0.9;
  }
  
  /* Money Mockup */
  .mockup-money {
    width: 500px;
    height: 350px;
    top: 60%;
    left: 35%;
    transform: translate(-50%, -50%) rotateX(-5deg) rotateY(-20deg) rotateZ(5deg);
    z-index: 1;
    opacity: 0.8;
  }

  .mockup-header {
    height: 50px;
    background: #f8f8f8;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    padding: 0 20px;
    gap: 8px;
  }
  .dot-red { width: 10px; height: 10px; border-radius: 50%; background: #ff5f56; }
  .dot-yellow { width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e; }
  .dot-green { width: 10px; height: 10px; border-radius: 50%; background: #27c93f; }
  
  .mockup-content {
    padding: 24px;
    height: calc(100% - 50px);
    background: white;
  }

  .mockup-title {
    font-family: var(--font-figtree), serif;
    font-size: 1.5rem;
    font-weight: 900;
    margin-bottom: 20px;
    color: var(--ink);
  }

  /* Mini UI Elements */
  .mini-ticket {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  }
  .mini-bar { height: 8px; border-radius: 4px; background: #eee; margin-bottom: 8px; }
  .mini-bar.short { width: 40%; }
  .mini-bar.long { width: 80%; }
  .mini-bar.coral { background: var(--coral); opacity: 0.2; }

  .showcase-text {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 10;
    padding-bottom: 40px;
  }

  /* FADE IN */
  .fade-in { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .fade-in.visible { opacity: 1; transform: translateY(0); }

  @media (max-width: 900px) {
    .nav { padding: 18px 24px; }
    .nav-links { display: none; }
    .hero { padding: 110px 24px 60px; }
    .hero-bottom { flex-direction: column; align-items: flex-start; }
    .section { padding: 60px 24px; }
    .work-grid { grid-template-columns: 1fr 1fr; }
    .work-card:first-child { grid-row: span 1; }
    .work-card:first-child .work-card-inner { min-height: 240px; }
    .services-grid { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .team-grid { grid-template-columns: 1fr 1fr; }
    .footer { flex-direction: column; gap: 14px; text-align: center; }
    .section-row { flex-direction: column; gap: 12px; }
  }
`;

const features = [
  { tag: "Planning", title: "Collaborative Itineraries", icon: Map, bg: "linear-gradient(135deg, #2D0A3E, #FF5C3A)" },
  { tag: "Budget", title: "Expense Splitting", icon: Wallet, bg: "linear-gradient(135deg, #1A1714, #3DFFC0 200%)" },
  { tag: "Decisions", title: "Group Polls & Voting", icon: Vote, bg: "linear-gradient(135deg, #FFE44D, #FF5C3A)" },
  { tag: "AI", title: "Smart Suggestions", icon: Sparkles, bg: "linear-gradient(135deg, #3DFFC0, #2D0A3E)" },
  { tag: "Social", title: "Real-time Chat", icon: MessageSquare, bg: "linear-gradient(135deg, #FF5C3A, #FFE44D)" },
];

const benefits = [
  { num: "01", icon: CheckCircle2, name: "Plan Together", desc: "Co-create the perfect trip with real-time collaboration tools." },
  { num: "02", icon: Wallet, name: "Track Costs", desc: "Split bills instantly and see who owes what without the math." },
  { num: "03", icon: Vote, name: "Decide Faster", desc: "Vote on dates, destinations, and activities to keep things moving." },
  { num: "04", icon: Smartphone, name: "Mobile First", desc: "Access your itinerary anywhere, even when you're offline." },
  { num: "05", icon: Sparkles, name: "AI Powered", desc: "Let our AI build your draft itinerary in seconds." },
  { num: "06", icon: Globe, name: "Global Ready", desc: "Multi-currency support for international adventures." },
];

const stats = [
  { num: "10k+", label: "Trips Planned" },
  { num: "50k+", label: "Happy Travelers" },
  { num: "4.9", label: "App Rating" },
  { num: "1M+", label: "Memories Made" },
];

const team = [
  { name: "Sarah J.", role: "Backpacker", icon: Backpack, bg: "linear-gradient(135deg, #FF5C3A22, #FF5C3A44)" },
  { name: "Mike T.", role: "Foodie", icon: UtensilsCrossed, bg: "linear-gradient(135deg, #3DFFC022, #3DFFC044)" },
  { name: "Elena R.", role: "Photographer", icon: Camera, bg: "linear-gradient(135deg, #FFE44D22, #FFE44D44)" },
  { name: "David K.", role: "Explorer", icon: Compass, bg: "linear-gradient(135deg, #2D0A3E22, #2D0A3E44)" },
];

const marqueeItems = ["Tokyo", "Paris", "New York", "London", "Bali", "Iceland", "Kyoto", "Rome", "Barcelona", "Amsterdam"];

function useCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ring, setRing] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const rafRef = useRef<number>(0);
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Add custom cursor class to body
    document.body.classList.add('custom-cursor-active');

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.13;
      current.current.y += (target.current.y - current.current.y) * 0.13;
      setRing({ x: current.current.x, y: current.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
      // Remove custom cursor class
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  return { pos, ring, hovered, setHovered };
}

function useScrollFade() {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-in");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("visible"), i * 60);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return scrolled;
}

export default function LandingPage() {
  const { pos, ring, hovered, setHovered } = useCursor();
  const scrolled = useScrolled();
  useScrollFade();

  const hover = () => setHovered(true);
  const unhover = () => setHovered(false);
  const interactiveProps = { onMouseEnter: hover, onMouseLeave: unhover };

  return (
    <>
      <style>{styles}</style>

      {/* Cursor */}
      <div className={`cursor-dot ${hovered ? 'expanded' : ''}`} style={{ left: pos.x, top: pos.y }} />
      <div className={`cursor-ring ${hovered ? 'hidden' : ''}`} style={{ left: ring.x, top: ring.y }} />

      <div className="spark-root">

        {/* NAV */}
        <nav className={`nav${scrolled ? " scrolled" : ""}`}>
          <Link href="/" className="nav-logo font-fraunces" {...interactiveProps}>TiewTrip<span>.</span></Link>
          <ul className="nav-links">
            {["Features", "Benefits", "Community"].map(l => (
              <li key={l}>
                <a href={`#${l.toLowerCase()}`} className="nav-link" {...interactiveProps}>{l}</a>
              </li>
            ))}
            <li>
              <Link href="/auth/sign-in" className="nav-link" {...interactiveProps}>Sign In</Link>
            </li>
          </ul>
        </nav>

        {/* HERO */}
        <section className="hero">
          {/* Blobs */}
          <div className="blob" style={{ width: 520, height: 520, background: "#FF5C3A", top: -120, right: -100, animation: "drift 8s ease-in-out infinite alternate" }} />
          <div className="blob" style={{ width: 420, height: 420, background: "#3DFFC0", bottom: -80, left: "18%", animation: "drift 8s 2s ease-in-out infinite alternate" }} />
          <div className="blob" style={{ width: 300, height: 300, background: "#FFE44D", top: "42%", right: "22%", animation: "drift 8s 4s ease-in-out infinite alternate" }} />
          <style>{`@keyframes drift { from{transform:translate(0,0) scale(1)} to{transform:translate(28px,18px) scale(1.08)} }`}</style>

          <div className="hero-badge">
            <div className="pulse-dot" />
            Group Travel OS — Est. 2024
          </div>

          <h1 className="hero-h1">
            Plan trips with <em>joy</em>,<br />not spreadsheets.
          </h1>

          <div className="hero-bottom">
            <p className="hero-desc">The all-in-one platform for collaborative itineraries, expense splitting, and group decision making.</p>
            <div className="btn-group">
              <Link href="/dashboard" className="btn btn-primary" {...interactiveProps}>Start Planning →</Link>
              <Link href="/auth/sign-in" className="btn btn-outline" {...interactiveProps}>Sign In</Link>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee-bar">
          <div className="marquee-inner">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <div key={`marquee-${i}`} className="inline-flex items-center gap-12">
                <span className="marquee-item">{item}</span>
                <span className="marquee-star">✦</span>
              </div>
            ))}
          </div>
        </div>

        {/* SHOWCASE SECTION */}
        <section className="showcase-section">
          <div className="text-center mb-16 fade-in">
            <p className="section-eyebrow">The Experience</p>
            <h2 className="section-title">Crafted for <span>adventurers</span></h2>
          </div>

          <div className="showcase-container fade-in">
            <div className="mockup-stack">
              {/* Money Mockup */}
              <div className="mockup-card mockup-money">
                <div className="mockup-header">
                  <div className="dot-red" /><div className="dot-yellow" /><div className="dot-green" />
                </div>
                <div className="mockup-content">
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-5 h-5 text-coral" />
                    <span className="font-bold text-xs uppercase tracking-wider">Shared Wallet</span>
                  </div>
                  <div className="text-3xl font-black mb-6">$2,450.00</div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-soft">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-soft" />
                          <div className="mini-bar long coral" style={{ width: 80, marginBottom: 0 }} />
                        </div>
                        <div className="mini-bar short" style={{ width: 40, marginBottom: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overview Mockup */}
              <div className="mockup-card mockup-overview">
                <div className="mockup-header">
                  <div className="dot-red" /><div className="dot-yellow" /><div className="dot-green" />
                </div>
                <div className="mockup-content" style={{ background: 'var(--ink)', color: 'white' }}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="px-3 py-1 rounded-full bg-white/10 text-[10px] uppercase font-bold">5 Days • 3 Travelers</div>
                    <Sparkles className="w-5 h-5 text-mint" />
                  </div>
                  <h3 className="text-4xl font-black mb-4">Tokyo 2024</h3>
                  <div className="flex gap-4 opacity-60 text-xs">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Japan</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Oct 12 - 17</span>
                  </div>
                  <div className="mt-12 grid grid-cols-2 gap-4">
                    <div className="h-20 rounded-2xl bg-white/5 border border-white/10 p-4">
                      <div className="mini-bar short" style={{ background: 'rgba(255,255,255,0.2)' }} />
                      <div className="mini-bar long" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                    <div className="h-20 rounded-2xl bg-white/5 border border-white/10 p-4">
                      <div className="mini-bar short" style={{ background: 'rgba(255,255,255,0.2)' }} />
                      <div className="mini-bar long" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Mockup */}
              <div className="mockup-card mockup-dashboard">
                <div className="mockup-header">
                  <div className="dot-red" /><div className="dot-yellow" /><div className="dot-green" />
                </div>
                <div className="mockup-content">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="mockup-title" style={{ marginBottom: 0 }}>Travel Desk</h3>
                    <div className="w-8 h-8 rounded-full bg-coral" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                      <div key={i} className="mini-ticket">
                        <div className="space-y-2 flex-1">
                          <div className="mini-bar short coral" />
                          <div className="mini-bar long" />
                          <div className="mini-bar short" />
                        </div>
                        <div className="w-12 h-12 bg-soft rounded-lg flex items-center justify-center">
                          <Ticket className="w-6 h-6 text-ink/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 p-4 rounded-2xl bg-soft/30 border border-dashed border-soft flex items-center justify-center gap-3">
                    <Plus className="w-4 h-4 text-muted" />
                    <span className="text-xs font-bold text-muted uppercase tracking-widest">New Adventure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-text fade-in">
            <p className="text-muted text-sm uppercase tracking-[0.2em] font-bold">Interactive • Collaborative • Intelligent</p>
          </div>
        </section>

        {/* WORK (FEATURES) */}
        <section className="section" id="features">
          <div className="section-row">
            <div>
              <p className="section-eyebrow">Everything You Need</p>
              <h2 className="section-title">Core <span>features</span></h2>
            </div>
            <Link href="/dashboard" className="section-link" {...interactiveProps}>Try it now →</Link>
          </div>
          <div className="work-grid">
            {features.map((p, i) => (
              <div className={`work-card fade-in`} key={i} style={{ transitionDelay: `${i * 0.08}s` }} {...interactiveProps}>
                <div className="work-card-inner">
                  <div className="card-gradient" style={{ background: p.bg }} />
                  <div className="card-overlay" />
                  <div className="card-emoji-badge" style={{ animationDelay: `${i * 0.5}s` }}>
                    <p.icon className="w-10 h-10 text-white" />
                  </div>
                  <span className="card-tag">{p.tag}</span>
                  <h3 className="card-title">{p.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SERVICES (BENEFITS) */}
        <section className="section services-section" id="benefits">
          <p className="section-eyebrow" style={{ color: "var(--coral)" }}>Why TiewTrip?</p>
          <h2 className="section-title">Travel <span>smarter</span></h2>
          <div className="services-grid">
            {benefits.map((s, i) => (
              <div className="service-card fade-in" key={i} style={{ transitionDelay: `${i * 0.07}s` }} {...interactiveProps}>
                <div className="service-num">{s.num}</div>
                <div className="service-icon-badge">
                  <s.icon className="w-8 h-8 text-coral" />
                </div>
                <h3 className="service-name">{s.name}</h3>
                <p className="service-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="stats-section">
          <div className="section" style={{ paddingTop: 60, paddingBottom: 60 }}>
            <div className="stats-grid">
              {stats.map((s, i) => (
                <div className="stat-card fade-in" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM (COMMUNITY) */}
        <section className="section" id="community">
          <p className="section-eyebrow">Community</p>
          <h2 className="section-title">Built for <span>travelers</span></h2>
          <div className="team-grid">
            {team.map((m, i) => (
              <div className="team-card fade-in" key={i} style={{ transitionDelay: `${i * 0.1}s` }} {...interactiveProps}>
                <div className="team-avatar" style={{ background: m.bg }}>
                  <m.icon className="w-12 h-12 text-ink/40" />
                </div>
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section" id="contact">
          <div className="cta-bg-star">✦</div>
          <h2 className="cta-title">Ready to<br /><em>take off</em>?</h2>
          <p className="cta-desc">Join thousands of travelers planning their next adventure with TiewTrip.</p>
          <Link href="/dashboard" className="btn-cta" {...interactiveProps}>
            Start Planning <span>→</span>
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <Link href="/" className="footer-logo font-fraunces" {...interactiveProps}>TiewTrip<span>.</span></Link>
          <span>© 2024 TiewTrip. All rights reserved.</span>
          <span>Made with ❤️ for travelers.</span>
        </footer>

      </div>
    </>
  );
}

