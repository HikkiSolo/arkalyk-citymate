import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Phone, Clock, Sparkles } from "lucide-react";
import { categories, places, ui, useLang, type Category } from "@/lib/i18n";

const icons = Object.fromEntries(
  categories.map((c) => [c.id, L.divIcon({ className: "", html: `<div class="city-pin"><span>${c.icon}</span></div>`, iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -34] })]),
) as Record<Category, L.DivIcon>;

export default function CityMap({ visible }: { visible: Category[] }) {
  const { t } = useLang();
  return (
    <MapContainer center={[50.2486, 66.9114]} zoom={14} className="h-full w-full" zoomControl={false}>
      <TileLayer attribution="&copy; OpenStreetMap &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      {places.filter((p) => visible.includes(p.cat)).map((p) => {
        const cat = categories.find((c) => c.id === p.cat)!;
        return (
          <Marker key={p.id} position={p.pos} icon={icons[p.cat]}>
            <Popup>
              <div className="fade-in">
                <div className="flex h-24 items-center justify-center bg-panel text-5xl">{cat.icon}</div>
                <div className="space-y-2 p-4 text-card-foreground">
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">{t(cat.label)}</span>
                  <h3 className="font-display text-sm font-semibold leading-snug">{t(p.name)}</h3>
                  <p className="flex gap-2 text-xs"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />{t(p.address)}</p>
                  <p className="flex gap-2 text-xs"><Phone className="h-3.5 w-3.5 shrink-0 text-primary" />{p.phone}</p>
                  <p className="flex gap-2 text-xs"><Clock className="h-3.5 w-3.5 shrink-0 text-primary" />{t(p.hours)}</p>
                  <div className="rounded-lg bg-muted p-2 text-xs">
                    <div className="mb-1 flex items-center gap-1 font-semibold"><Sparkles className="h-3 w-3 text-primary" />{t(ui.aiSummary)}</div>
                    {t(p.summary)}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
