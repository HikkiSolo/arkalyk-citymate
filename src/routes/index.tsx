import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Bot, BusFront, CarFront, ChevronRight, Clock3, Fuel,
  MapPin, Menu, Navigation, Search, Send, SlidersHorizontal, TrainFront, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Conversation, ConversationContent, ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  LangProvider, buses, categories, destinations, intercity, layers, places, ui, useLang,
  type Layer,
} from "@/lib/i18n";

const CityMap = lazy(() => import("@/components/CityMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Арқалық Smart Navigator — интерактивті қала картасы" },
      { name: "description", content: "Арқалықтың мекемелері, көлігі, бағыттары және қалалық AI көмекшісі бар қазақша және орысша интерактивті карта." },
      { property: "og:title", content: "Арқалық Smart Navigator" },
      { property: "og:description", content: "Арқалық мекемелерінің байланыстары, көлік кестесі, қашықтық есебі және AI көмекші." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Unbounded:wght@500;700&display=swap" },
    ],
  }),
  component: () => <LangProvider><App /></LangProvider>,
});

type Panel = "schedule" | "search" | "distance" | "assistant" | "settings" | null;
const allPlaceIds = places.map((place) => place.id);

function App() {
  const { lang, setLang, t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [visibleIds, setVisibleIds] = useState(allPlaceIds);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [enabled, setEnabled] = useState<Record<Layer, boolean>>({ education: true, civic: true, parks: true, shops: true, other: true });
  const shownIds = useMemo(() => {
    const cats = new Set(layers.filter((layer) => enabled[layer.id]).flatMap((layer) => layer.cats));
    return visibleIds.filter((id) => id === activeId || cats.has(places.find((p) => p.id === id)!.cat));
  }, [visibleIds, enabled, activeId]);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!drawerOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [drawerOpen]);

  const resetMap = useCallback(() => {
    setVisibleIds(allPlaceIds);
    setActiveId(null);
    setResetToken((value) => value + 1);
    setDrawerOpen(false);
    setPanel(null);
  }, []);

  const selectPanel = (next: Exclude<Panel, null>) => {
    setPanel(next);
    setDrawerOpen(true);
    if (next !== "search") setVisibleIds(allPlaceIds);
  };

  const selectPlace = (id: string) => {
    setVisibleIds((ids) => ids.includes(id) ? ids : [...ids, id]);
    setActiveId(id);
    if (window.matchMedia("(max-width: 767px)").matches) setDrawerOpen(false);
  };

  const navigation = [
    { id: "schedule" as const, icon: BusFront, label: t(ui.schedule) },
    { id: "search" as const, icon: Search, label: t(ui.search) },
    { id: "distance" as const, icon: Navigation, label: t(ui.distance) },
    { id: "assistant" as const, icon: Bot, label: t(ui.assistant) },
    { id: "settings" as const, icon: SlidersHorizontal, label: t(ui.settings) },
  ];

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-background">
      <main className="absolute inset-0" aria-label={t(ui.appName)}>
        {mounted && (
          <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground">{t(ui.appName)}</div>}>
            <CityMap visibleIds={shownIds} activeId={activeId} resetToken={resetToken} />
          </Suspense>
        )}
      </main>

      <div className="absolute left-3 top-3 z-[900] flex items-center gap-2 sm:left-5 sm:top-5">
        <div className="language-switch" aria-label="Language">
          {(["kk", "ru"] as const).map((item) => (
            <Button key={item} size="sm" variant={lang === item ? "default" : "ghost"} onClick={() => setLang(item)} className="h-8 px-3">
              {item === "kk" ? "KAZ" : "RUS"}
            </Button>
          ))}
        </div>
        <Button size="icon" variant="secondary" onClick={() => setDrawerOpen(true)} aria-label={t(ui.menu)} className="map-control">
          <Menu />
        </Button>
      </div>

      {!drawerOpen && (
        <div className="map-title absolute bottom-7 left-3 z-[800] sm:bottom-8 sm:left-5">
          <span><MapPin /></span>
          <div><strong>{t(ui.appName)}</strong><small>50.2486, 66.9114</small></div>
        </div>
      )}

      {drawerOpen && <button className="drawer-backdrop" aria-label={t(ui.close)} onClick={() => setDrawerOpen(false)} />}
      <aside className={`city-drawer ${drawerOpen ? "city-drawer--open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="city-drawer__header">
          <div>
            <p>{t(ui.appName)}</p>
            <span>АРҚАЛЫҚ · ҚАЗАҚСТАН</span>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setDrawerOpen(false)} aria-label={t(ui.close)}><X /></Button>
        </div>

        <nav className="city-drawer__nav">
          <Button variant="ghost" onClick={resetMap} className="drawer-nav-item">
            <ArrowLeft /><span>{t(ui.back)}</span>
          </Button>
          {navigation.map(({ id, icon: Icon, label }) => (
            <Button key={id} variant="ghost" onClick={() => selectPanel(id)} className={`drawer-nav-item ${panel === id ? "drawer-nav-item--active" : ""}`}>
              <Icon /><span>{label}</span><ChevronRight className="ml-auto" />
            </Button>
          ))}
        </nav>

        <div className="city-drawer__content">
          {!panel && <DrawerHome onSelect={selectPanel} />}
          {panel === "schedule" && <SchedulePanel />}
          {panel === "search" && <SearchPanel onResults={setVisibleIds} onSelect={selectPlace} />}
          {panel === "distance" && <DistancePanel />}
          {panel === "assistant" && <AssistantPanel />}
          {panel === "settings" && (
            <section>
              <PanelTitle icon={SlidersHorizontal}>{t(ui.settings)}</PanelTitle>
              <p className="panel-note mb-3 mt-0">{t(ui.settingsHint)}</p>
              <div className="space-y-2">
                {layers.map((layer) => (
                  <label key={layer.id} className="layer-toggle">
                    <input type="checkbox" checked={enabled[layer.id]} onChange={(e) => setEnabled((s) => ({ ...s, [layer.id]: e.target.checked }))} />
                    <span>{t(layer.label)}</span>
                    <small>{places.filter((p) => layer.cats.includes(p.cat)).length}</small>
                  </label>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}

function PanelTitle({ icon: Icon, children }: { icon: typeof Search; children: string }) {
  return <div className="panel-title"><span><Icon /></span><h2>{children}</h2></div>;
}

function DrawerHome({ onSelect }: { onSelect: (panel: Exclude<Panel, null>) => void }) {
  const { t } = useLang();
  return (
    <div className="space-y-4">
      <div className="drawer-wordmark"><span>50°14′N</span><h2>АРҚАЛЫҚ</h2><p>SMART NAVIGATOR</p></div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" className="h-auto flex-col items-start py-4" onClick={() => onSelect("search")}><Search />{t(ui.search)}</Button>
        <Button variant="secondary" className="h-auto flex-col items-start py-4" onClick={() => onSelect("schedule")}><BusFront />{t(ui.schedule)}</Button>
      </div>
    </div>
  );
}

function SchedulePanel() {
  const { t } = useLang();
  const [mode, setMode] = useState<"local" | "intercity">("local");
  return (
    <section>
      <PanelTitle icon={BusFront}>{t(ui.schedule)}</PanelTitle>
      <div className="segmented mb-4">
        <Button size="sm" variant={mode === "local" ? "default" : "ghost"} onClick={() => setMode("local")}>{t(ui.local)}</Button>
        <Button size="sm" variant={mode === "intercity" ? "default" : "ghost"} onClick={() => setMode("intercity")}>{t(ui.intercity)}</Button>
      </div>
      {mode === "local" ? (
        <div className="space-y-2">{buses.map((bus) => (
          <article key={bus.n} className="schedule-row">
            <strong>{bus.n}</strong><div><h3>{t(bus.route)}</h3><p><Clock3 />{bus.hours} · {t(ui.interval)} {bus.every} {t(ui.min)}</p></div>
          </article>
        ))}</div>
      ) : (
        <div className="space-y-2">{intercity.map((trip) => (
          <article key={`${trip.time}-${trip.to.kk}`} className="schedule-row">
            <span className="schedule-row__icon">{trip.mode.kk === "Пойыз" ? <TrainFront /> : <BusFront />}</span>
            <div><h3>{t(trip.to)}</h3><p>{t(trip.mode)} · {t(ui.departure)} {trip.time}</p></div>
          </article>
        ))}</div>
      )}
      <p className="panel-note">{t(ui.estimate)}</p>
    </section>
  );
}

function SearchPanel({ onResults, onSelect }: { onResults: (ids: string[]) => void; onSelect: (id: string) => void }) {
  const { lang, t } = useLang();
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(lang === "kk" ? "kk-KZ" : "ru-RU");
    if (!normalized) return places;
    return places.filter((place) => [place.name.kk, place.name.ru, place.address.kk, place.address.ru, categories[place.cat].label.kk, categories[place.cat].label.ru, place.summary.kk, place.summary.ru]
      .join(" ").toLocaleLowerCase().includes(normalized));
  }, [lang, query]);
  useEffect(() => { onResults(results.map((place) => place.id)); }, [onResults, results]);
  return (
    <section>
      <PanelTitle icon={Search}>{t(ui.search)}</PanelTitle>
      <div className="search-box"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t(ui.searchPlaceholder)} autoFocus /></div>
      <p className="panel-note mt-2">{t(ui.searchHint)}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-panel-muted"><span>{t(ui.results)}</span><strong>{results.length}</strong></div>
      <div className="mt-2 space-y-1">
        {results.length === 0 && <p className="empty-state">{t(ui.noResults)}</p>}
        {results.map((place) => (
          <Button key={place.id} variant="ghost" className="search-result" onClick={() => onSelect(place.id)}>
            <span className="search-result__icon">{categories[place.cat].icon}</span>
            <span><strong>{t(place.name)}</strong><small>{t(place.address)}</small></span><ChevronRight />
          </Button>
        ))}
      </div>
    </section>
  );
}

function DistancePanel() {
  const { t } = useLang();
  const [destination, setDestination] = useState("astana");
  const selected = destinations.find((item) => item.id === destination) ?? destinations[0]!;
  const hours = selected.km / 80;
  const fuel = Math.round(selected.km * 0.08 * 255);
  return (
    <section>
      <PanelTitle icon={Navigation}>{t(ui.distance)}</PanelTitle>
      <label className="field-label">{t(ui.from)}</label>
      <div className="select-like mb-3">Арқалық / Аркалык</div>
      <label className="field-label" htmlFor="destination">{t(ui.to)}</label>
      <select id="destination" className="drawer-select" value={destination} onChange={(event) => setDestination(event.target.value)}>
        {destinations.map((item) => <option key={item.id} value={item.id}>{t(item.name)}</option>)}
      </select>
      <div className="metric-grid">
        <article><MapPin /><span>{t(ui.distance)}</span><strong>{selected.km.toLocaleString()} {t(ui.km)}</strong></article>
        <article><CarFront /><span>{t(ui.drive)}</span><strong>{Math.floor(hours)} {t(ui.h)} {Math.round((hours % 1) * 60)} {t(ui.min)}</strong></article>
        <article className="col-span-2"><Fuel /><span>{t(ui.fuel)}</span><strong>{fuel.toLocaleString("ru-RU")} ₸</strong></article>
      </div>
      <p className="panel-note">{t(ui.fuelNote)}. {t(ui.estimate)}.</p>
    </section>
  );
}

type ChatMessage = { role: "user" | "assistant"; content: string };

function AssistantPanel() {
  const { lang, t } = useLang();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: value }];
    setMessages(next); setBusy(true); setError("");
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next, lang }) });
      if (!response.ok || !response.body) {
        const details = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(details?.message || t(ui.error));
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = "";
      setMessages([...next, { role: "assistant", content }]);
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        content += decoder.decode(chunk.value, { stream: true });
        setMessages([...next, { role: "assistant", content }]);
      }
      if (!content) throw new Error(t(ui.error));
    } catch (reason) {
      setMessages(next);
      setError(reason instanceof Error ? reason.message : t(ui.error));
    } finally { setBusy(false); }
  }

  return (
    <section className="assistant-panel">
      <PanelTitle icon={Bot}>{t(ui.assistant)}</PanelTitle>
      <Conversation className="assistant-conversation">
        <ConversationContent className="gap-4 px-0 py-3">
          <div className="assistant-intro"><span><Navigation /></span><p>{t(ui.aiHello)}</p></div>
          {messages.map((message, index) => (
            <Message key={`${message.role}-${index}`} from={message.role}>
              <MessageContent className={message.role === "user" ? "bg-primary text-primary-foreground" : "text-panel-foreground"}>
                {message.role === "assistant" ? <MessageResponse>{message.content}</MessageResponse> : message.content}
              </MessageContent>
            </Message>
          ))}
          {busy && messages.at(-1)?.role === "user" && <Shimmer className="text-sm">{t(ui.thinking)}</Shimmer>}
          {error && <p className="chat-error">{error}</p>}
          {messages.length === 0 && <div className="suggestion-list">{t(ui.suggestions).split("|").map((suggestion) => <Button key={suggestion} variant="outline" onClick={() => send(suggestion)}>{suggestion}<Send /></Button>)}</div>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput onSubmit={({ text }) => send(text)} className="assistant-composer">
        <PromptInputTextarea placeholder={t(ui.askPlaceholder)} disabled={busy} />
        <PromptInputFooter className="justify-end"><PromptInputSubmit status={busy ? "streaming" : "ready"} disabled={busy} /></PromptInputFooter>
      </PromptInput>
    </section>
  );
}