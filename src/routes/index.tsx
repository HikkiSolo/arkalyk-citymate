import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bus, GraduationCap, Route as RouteIcon, Bot, MapPinned, Phone, Send, Car, TrainFront, Fuel, Ruler, Menu, X } from "lucide-react";
import { LangProvider, useLang, ui, buses, taxis, intercity, categories, destinations, type Category } from "@/lib/i18n";

const CityMap = lazy(() => import("@/components/CityMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Арқалық Smart Navigator — қала картасы мен AI көмекші" },
      { name: "description", content: "Interactive Arkalyk city map: transport, education, route calculator and AI city assistant in Kazakh and Russian." },
      { property: "og:title", content: "Арқалық Smart Navigator" },
      { property: "og:description", content: "Interactive Arkalyk city portal with map, transport, routes and AI assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Unbounded:wght@500;700&display=swap" },
    ],
  }),
  component: () => (<LangProvider><App /></LangProvider>),
});

type Tab = "transport" | "edu" | "route" | "ai";
const allCats = categories.map((c) => c.id);

function App() {
  const { lang, setLang, t } = useLang();
  const [tab, setTab] = useState<Tab>("transport");
  const [visible, setVisible] = useState<Category[]>(allCats);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const tabs: { id: Tab; icon: typeof Bus; label: string }[] = [
    { id: "transport", icon: Bus, label: t(ui.tabTransport) },
    { id: "edu", icon: GraduationCap, label: t(ui.tabEdu) },
    { id: "route", icon: RouteIcon, label: t(ui.tabRoute) },
    { id: "ai", icon: Bot, label: t(ui.tabAi) },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="z-[1001] flex items-center justify-between gap-3 border-b border-panel-border bg-panel px-4 py-3 text-panel-foreground">
        <div className="flex items-center gap-3">
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="menu">{open ? <X /> : <Menu />}</button>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><MapPinned className="h-5 w-5" /></div>
          <div>
            <h1 className="font-display text-base font-bold leading-tight sm:text-lg">Арқалық <span className="text-steppe">Smart Navigator</span></h1>
            <p className="text-xs text-panel-muted">{t(ui.subtitle)}</p>
          </div>
        </div>
        <div className="flex rounded-full bg-panel-2 p-1 text-xs font-semibold">
          {(["kk", "ru"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`rounded-full px-3 py-1.5 transition ${lang === l ? "bg-primary text-primary-foreground" : "text-panel-muted hover:text-panel-foreground"}`}>
              {l === "kk" ? "Қазақша" : "Русский"}
            </button>
          ))}
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <aside className={`absolute inset-y-0 left-0 z-[1000] flex w-full max-w-sm flex-col bg-panel text-panel-foreground transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <nav className="grid grid-cols-4 gap-1 border-b border-panel-border p-2">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)} className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-semibold transition ${tab === id ? "bg-panel-2 text-primary" : "text-panel-muted hover:bg-panel-2/60"}`}>
                <Icon className="h-5 w-5" />{label}
              </button>
            ))}
          </nav>
          <div key={tab} className="fade-in flex-1 overflow-y-auto p-4">
            {tab === "transport" && <TransportTab />}
            {tab === "edu" && <EduTab visible={visible} setVisible={setVisible} />}
            {tab === "route" && <RouteTab />}
            {tab === "ai" && <AiTab />}
          </div>
        </aside>
        <main className="flex-1">
          {mounted && <Suspense fallback={null}><CityMap visible={visible} /></Suspense>}
        </main>
      </div>
    </div>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-6"><h2 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-panel-muted">{title}</h2>{children}</section>
);

function TransportTab() {
  const { t } = useLang();
  return (<>
    <Section title={t(ui.busRoutes)}>
      <div className="space-y-2">{buses.map((b) => (
        <div key={b.n} className="flex items-center gap-3 rounded-xl bg-panel-2 p-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-steppe font-display font-bold text-steppe-foreground">{b.n}</div>
          <div className="text-sm"><div className="font-semibold">{t(b.route)}</div>
            <div className="text-xs text-panel-muted">{b.hours} · {t(ui.interval)} {b.every} {t(ui.min)}</div></div>
        </div>))}</div>
    </Section>
    <Section title={t(ui.intercity)}>
      <div className="divide-y divide-panel-border rounded-xl bg-panel-2">{intercity.map((i) => (
        <div key={i.time + i.to.ru} className="flex justify-between p-3 text-sm"><span>{t(i.to)}</span><span className="font-semibold text-primary">{i.time}</span></div>))}</div>
    </Section>
    <Section title={t(ui.taxi)}>
      <div className="space-y-2">{taxis.map((x) => (
        <a key={x.name} href={x.phone === "app" ? "https://go.yandex" : `tel:${x.phone.replace(/[^+\d]/g, "")}`} className="flex items-center justify-between rounded-xl bg-panel-2 p-3 text-sm hover:ring-1 hover:ring-primary">
          <span className="font-semibold">🚕 {x.name}</span><span className="flex items-center gap-1 text-primary"><Phone className="h-3.5 w-3.5" />{x.phone}</span></a>))}</div>
    </Section>
    <p className="text-xs text-panel-muted">* {t(ui.estimate)}</p>
  </>);
}

function EduTab({ visible, setVisible }: { visible: Category[]; setVisible: (c: Category[]) => void }) {
  const { t } = useLang();
  const toggle = (c: Category) => setVisible(visible.includes(c) ? visible.filter((v) => v !== c) : [...visible, c]);
  return (
    <Section title={t(ui.filters)}>
      <button onClick={() => setVisible(allCats)} className="mb-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{t(ui.showAll)}</button>
      <div className="grid grid-cols-2 gap-2">{categories.map((c) => {
        const on = visible.includes(c.id);
        return (<button key={c.id} onClick={() => toggle(c.id)} className={`flex items-center gap-2 rounded-xl p-3 text-left text-sm transition ${on ? "bg-panel-2 ring-1 ring-primary" : "bg-panel-2/40 text-panel-muted"}`}>
          <span className="text-xl">{c.icon}</span>{t(c.label)}</button>);
      })}</div>
    </Section>
  );
}

function RouteTab() {
  const { t } = useLang();
  const [dest, setDest] = useState("astana");
  const d = destinations.find((x) => x.id === dest)!;
  const driveH = d.km / 80;
  const fuel = Math.round((d.km * 8) / 100 * 255);
  const stats = [
    { icon: Ruler, label: t(ui.distance), value: `${d.km} ${t(ui.km)}` },
    { icon: Car, label: t(ui.drive), value: `${Math.floor(driveH)} ${t(ui.h)} ${Math.round((driveH % 1) * 60)} ${t(ui.min)}` },
    { icon: TrainFront, label: t(ui.train), value: d.train ? `≈${d.train} ${t(ui.h)}` : t(ui.noTrain) },
    { icon: Fuel, label: t(ui.fuel), value: `${fuel.toLocaleString("ru-RU")} ₸` },
  ];
  const sel = "w-full rounded-xl border border-panel-border bg-panel-2 p-3 text-sm text-panel-foreground outline-none focus:ring-1 focus:ring-primary";
  return (<>
    <label className="mb-1 block text-xs text-panel-muted">{t(ui.from)}</label>
    <select className={sel + " mb-3"} disabled><option>Арқалық / Аркалык</option></select>
    <label className="mb-1 block text-xs text-panel-muted">{t(ui.to)}</label>
    <select className={sel + " mb-5"} value={dest} onChange={(e) => setDest(e.target.value)}>
      {destinations.map((x) => <option key={x.id} value={x.id}>{t(x.name)}</option>)}
    </select>
    <div className="grid grid-cols-2 gap-2">{stats.map(({ icon: Icon, label, value }) => (
      <div key={label} className="fade-in rounded-xl bg-panel-2 p-3" key-dest={dest}>
        <Icon className="mb-2 h-5 w-5 text-steppe" /><div className="text-xs text-panel-muted">{label}</div>
        <div className="font-display text-base font-semibold">{value}</div></div>))}</div>
    <p className="mt-4 text-xs text-panel-muted">* {t(ui.fuelNote)}. {t(ui.estimate)}.</p>
  </>);
}

type Msg = { role: "user" | "assistant"; content: string };
function AiTab() {
  const { t, lang } = useLang();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { if (!busy) inputRef.current?.focus(); }, [busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next, lang }) });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = "";
      setMsgs([...next, { role: "assistant", content: "" }]);
      for (;;) { const { done, value } = await reader.read(); if (done) break; acc += dec.decode(value, { stream: true }); setMsgs([...next, { role: "assistant", content: acc }]); }
      if (!acc) throw new Error();
    } catch { setMsgs([...next, { role: "assistant", content: t(ui.error) }]); }
    setBusy(false);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pb-3 text-sm">
        <div className="flex gap-2"><div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><MapPinned className="h-4 w-4" /></div><p className="pt-1">{t(ui.aiHello)}</p></div>
        {msgs.length === 0 && <div className="flex flex-wrap gap-2">{t(ui.suggestions).split("|").map((s) => (
          <button key={s} onClick={() => send(s)} className="rounded-full border border-panel-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary">{s}</button>))}</div>}
        {msgs.map((m, i) => m.role === "user"
          ? <div key={i} className="ml-8 rounded-2xl rounded-br-sm bg-primary p-3 text-primary-foreground">{m.content}</div>
          : <div key={i} className="prose prose-sm prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"><ReactMarkdown>{m.content || "…"}</ReactMarkdown></div>)}
        {busy && msgs[msgs.length - 1]?.role === "user" && <p className="animate-pulse text-xs text-panel-muted">{t(ui.thinking)}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-panel-border pt-3">
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={t(ui.askPlaceholder)} className="flex-1 rounded-xl bg-panel-2 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
        <button disabled={busy} className="grid w-11 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
