"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Download,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  UserRound,
  X,
} from "lucide-react";

type Attendee = {
  npk: string;
  name: string;
  branch?: string;
  position?: string;
  timeLog?: string;
  hadir?: string;
};

type RundownItem = {
  time: string;
  activity: string;
  type?: string;
};

type ApiResult = {
  ok: boolean;
  message?: string;
  attendee?: Attendee;
  rundown?: RundownItem[];
  pdfUrl?: string;
};

const OFFICIAL_PDF_URL = "/Raker-ADH-2026-09102026.pdf";

const FALLBACK_RUNDOWN: RundownItem[] = [
  { time: "08.30 – 08.35", activity: "Indonesia Raya", type: "Opening" },
  { time: "08.35 – 08.40", activity: "Mars Maybank & Maybank Finance", type: "Opening" },
  { time: "08.40 – 08.50", activity: "Welcoming Speech dari Direksi", type: "Speech" },
  { time: "08.50 – 09.00", activity: "Welcoming Speech dari Kadiv / Dept Head", type: "Speech" },
  { time: "09.00 – 09.30", activity: "Presentasi 1 – Department Audit", type: "Presentation" },
  { time: "09.30 – 10.00", activity: "Presentasi 2 – Department IC", type: "Presentation" },
  { time: "10.00 – 10.15", activity: "Coffee Break", type: "Break" },
  { time: "10.15 – 10.45", activity: "Presentasi 3 – Department Risk", type: "Presentation" },
  { time: "10.45 – 11.15", activity: "Presentasi 4 – Department HC & GA", type: "Presentation" },
  { time: "11.15 – 12.00", activity: "Presentasi 5 – Department Legal", type: "Presentation" },
  { time: "12.00 – 13.00", activity: "Lunch Break", type: "Break" },
  { time: "13.00 – 14.00", activity: "Discussion Together", type: "Discussion" },
  { time: "14.00 – 14.15", activity: "Presentasi 6 – Department Operation (CS & CC)", type: "Presentation" },
  { time: "14.15 – 14.45", activity: "Discussion Session 1", type: "Discussion" },
  { time: "14.45 – 15.00", activity: "Presentasi 7 – Department Operation (SOP)", type: "Presentation" },
  { time: "15.00 – 15.30", activity: "Coffee Break", type: "Break" },
  { time: "15.30 – 15.45", activity: "Discussion Session 2", type: "Discussion" },
  { time: "15.45 – 16.15", activity: "Presentasi 8 – Department Operation (BPKB)", type: "Presentation" },
  { time: "16.15 – 16.30", activity: "Discussion Session 3", type: "Discussion" },
  { time: "16.30 – 16.45", activity: "Presentasi 9 – Department Operation (Kasir)", type: "Presentation" },
  { time: "16.45 – 17.15", activity: "Discussion Session 4", type: "Discussion" },
  { time: "17.15 – 17.30", activity: "Closing + Photo session", type: "Closing" },
  { time: "17.30 – 18.30", activity: "Preparation to Dinner", type: "Dinner" },
  { time: "18.30 – 21.00", activity: "Employee Engagement Dinner + Photo session", type: "Dinner" },
];

const typeIcon = (type?: string) => {
  if (type === "Break") return "☕";
  if (type === "Discussion") return "◌";
  if (type === "Dinner") return "✦";
  if (type === "Closing") return "✓";
  return "01";
};

export default function Home() {
  const [npk, setNpk] = useState("");
  const [step, setStep] = useState<"gate" | "rundown">("gate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [rundown, setRundown] = useState<RundownItem[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const rundownRef = useRef<HTMLDivElement | null>(null);

  const npkValid = useMemo(() => /^[0-9]{6}$/.test(npk), [npk]);

  useEffect(() => {
    if (step !== "rundown") return;
    const root = rundownRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { root: null, threshold: 0.14 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [step, rundown]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!npkValid) {
      setError("NPK harus tepat 6 digit angka.");
      return;
    }

    setLoading(true);
    try {
      // NPK is matched against the official Google Sheets participant database
      // through the Next.js server route and Google Apps Script.
      // Apps Script writes status_hadir = 1 when the NPK is valid.
      const checkinResponse = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npk, action: "checkin" }),
      });
      const data: ApiResult = await checkinResponse.json();
      if (!checkinResponse.ok || !data.ok) {
        throw new Error(data.message || "NPK valid, tetapi status kehadiran gagal disimpan.");
      }

      setAttendee(data.attendee || null);
      setRundown(data.rundown?.length ? data.rundown : FALLBACK_RUNDOWN);
      setPdfUrl(OFFICIAL_PDF_URL);
      setStep("rundown");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("gate");
    setNpk("");
    setError("");
    setAttendee(null);
    setRundown([]);
    setPdfUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (step === "rundown") {
    return (
      <main className="app-shell rundown-shell">
        <div className="rundown-bg" />
        <header className="rundown-header">
          <img className="brand-logo header-brand-logo" src="/maybank-finance-logo.jpg" alt="Maybank Finance" />
          <div className="rundown-header-actions">
            <button className="icon-button" onClick={reset} aria-label="Back to NPK validation">
              <ArrowLeft size={20} />
            </button>
            <button className="icon-button" onClick={() => setShowInfo(true)} aria-label="Event info">
              <span>i</span>
            </button>
          </div>
        </header>

        <section className="welcome-panel">
          <div className="eyebrow"><Check size={15} /> REGISTRATION VERIFIED</div>
          <h1>Welcome, <span>{attendee?.name || "Participant"}</span>.</h1>
          <p>Here&apos;s your event journey. Scroll down to explore the full rundown.</p>
          <div className="identity-row">
            <div><small>NPK</small><strong>{attendee?.npk || npk}</strong></div>
            {attendee?.branch && <div><small>AREA</small><strong>{attendee.branch}</strong></div>}
            {attendee?.position && <div><small>POSITION</small><strong>{attendee.position}</strong></div>}
          </div>
        </section>

        <section className="event-facts">
          <div><CalendarDays size={17} /><span>10 October 2026</span></div>
          <div><Clock3 size={17} /><span>08.30 WIB – selesai</span></div>
          <div><MapPin size={17} /><span>Wisma Kodel, Jakarta</span></div>
        </section>

        <section className="rundown-section" ref={rundownRef}>
          <div className="section-heading">
            <div>
              <span className="section-kicker">THE DAY</span>
              <h2>Event Rundown</h2>
            </div>
            <span className="count-pill">{rundown.length} sessions</span>
          </div>

          <div className="timeline">
            <div className="timeline-line" />
            {rundown.map((item, index) => (
              <article className="timeline-item" data-reveal key={`${item.time}-${item.activity}-${index}`}>
                <div className="timeline-dot"><span>{typeIcon(item.type)}</span></div>
                <div className={`schedule-card ${item.type === "Break" ? "break-card" : ""}`}>
                  <div className="card-topline">
                    <span className="time-label">{item.time}</span>
                    <span className="type-label">{item.type || "Session"}</span>
                  </div>
                  <h3>{item.activity}</h3>
                  <div className="card-arrow"><ArrowRight size={15} /></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="download-card">
          <div className="download-icon"><Download size={22} /></div>
          <div>
            <span>KEEP IT WITH YOU</span>
            <h3>Download full rundown</h3>
            <p>Save the official PDF for quick access during the event.</p>
          </div>
          {pdfUrl ? (
            <a className="download-button" href={OFFICIAL_PDF_URL} download="Raker-ADH-2026-09102026.pdf">
              Download <ArrowRight size={17} />
            </a>
          ) : (
            <button className="download-button disabled" disabled>
              PDF unavailable
            </button>
          )}
        </section>

        <footer className="site-footer">
          <small>PT Maybank Indonesia Finance berizin dan diawasi oleh Otoritas Jasa Keuangan (OJK).</small>
        </footer>

        {showInfo && (
          <div className="modal-backdrop" onClick={() => setShowInfo(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowInfo(false)}><X size={18} /></button>
              <div className="eyebrow"><Sparkles size={15} /> EVENT ACCESS</div>
              <h2>Raker ADH Nasional 2026</h2>
              <p>Registration access is matched against the official participant database through Google Sheets.</p>
              <div className="modal-note"><ShieldCheck size={18} /><span>Your NPK is checked server-side before your rundown is unlocked.</span></div>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="app-shell gate-shell">
      <div className="hero-image" />
      <div className="hero-overlay" />
      <div className="grain" />

      <header className="gate-header">
        <img className="brand-logo header-brand-logo" src="/maybank-finance-logo.jpg" alt="Maybank Finance" />
        <button className="info-link" onClick={() => setShowInfo(true)}>Event Info <ChevronDown size={15} /></button>
      </header>

      <section className="gate-content">
        <div className="event-tag"><Sparkles size={14} /> REGISTRATION PORTAL</div>
        <h1>RAKER ADH<br /><span>NASIONAL 2026</span></h1>
        <p className="hero-copy">One quick check before you enter.<br />Use your registered NPK to unlock the event rundown.</p>

        <form className="npk-card" onSubmit={handleSubmit} noValidate>
          <div className="input-heading">
            <div>
              <small>PARTICIPANT ACCESS</small>
              <h2>Enter your NPK</h2>
            </div>
            <div className="secure-badge"><ShieldCheck size={15} /> SECURE</div>
          </div>
          <label htmlFor="npk">6-digit NPK</label>
          <div className={`npk-input-wrap ${error ? "has-error" : ""} ${npkValid ? "is-valid" : ""}`}>
            <UserRound size={19} />
            <input
              id="npk"
              value={npk}
              onChange={(e) => setNpk(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoComplete="off"
              placeholder="000000"
              aria-invalid={Boolean(error)}
              maxLength={6}
            />
            <span className="digit-count">{npk.length}/6</span>
          </div>
          <div className="input-hint">Only numbers are accepted. Exactly 6 digits. Participant data is verified against the official event database.</div>
          {error && <div className="error-message">{error}</div>}
          <button className="enter-button" type="submit" disabled={!npkValid || loading}>
            {loading ? <><LoaderCircle className="spin" size={18} /> Checking...</> : <><TicketCheck size={18} /> Check Registration <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="scroll-cue"><ArrowDown size={16} /> Scroll to continue</div>
      </section>

      <footer className="gate-footer">
        <span>10 OCTOBER 2026</span><span>WISMA KODEL · JAKARTA</span><span>SMART CASUAL</span>
      </footer>

      {showInfo && (
        <div className="modal-backdrop" onClick={() => setShowInfo(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowInfo(false)}><X size={18} /></button>
            <div className="eyebrow"><CalendarDays size={15} /> EVENT INFO</div>
            <h2>RAKER ADH NASIONAL 2026</h2>
            <div className="info-list">
              <div><CalendarDays size={18} /><span>Sabtu, 10 Oktober 2026</span></div>
              <div><Clock3 size={18} /><span>08.30 WIB – selesai</span></div>
              <div><MapPin size={18} /><span>Wisma Kodel, Jakarta</span></div>
              <div><span className="shirt">▣</span><span>Smart Casual</span></div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
