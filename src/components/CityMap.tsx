import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Clock3, ExternalLink, GraduationCap, MapPin, Phone, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories, places, ui, useLang, type Category } from "@/lib/i18n";

const ARKALYK: [number, number] = [50.2486, 66.9114];

function MapController({ activeId, resetToken }: { activeId: string | null; resetToken: number }) {
  const map = useMap();
  const lastReset = useRef(resetToken);
  useEffect(() => {
    if (lastReset.current !== resetToken) {
      lastReset.current = resetToken;
      map.flyTo(ARKALYK, 14, { duration: 0.7 });
    }
  }, [map, resetToken]);
  useEffect(() => {
    const place = places.find((item) => item.id === activeId);
    if (!place) return;
    map.flyTo(place.pos, 16, { duration: 0.7 });
  }, [activeId, map]);
  return null;
}

function PopupDetail({ placeId }: { placeId: string }) {
  const { t } = useLang();
  const place = places.find((item) => item.id === placeId);
  if (!place) return null;
  const cat = categories[place.cat];
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${place.pos[0]}&mlon=${place.pos[1]}#map=18/${place.pos[0]}/${place.pos[1]}`;
  return (
    <article className="place-popup">
      <div className="place-popup__heading">
        <span className="place-popup__icon" aria-hidden="true">{cat.icon}</span>
        <div>
          <p className="place-popup__category">{t(cat.label)}</p>
          <h2>{t(place.name)}</h2>
        </div>
      </div>
      <p className="place-popup__summary">{t(place.summary)}</p>
      <dl className="place-popup__facts">
        <div><MapPin /><dt>{t(ui.address)}</dt><dd>{t(place.address)}</dd></div>
        <div><Phone /><dt>{t(ui.phone)}</dt><dd><a href={`tel:${place.phone.split("/")[0]!.replace(/[^+\d]/g, "")}`}>{place.phone}</a></dd></div>
        <div><Clock3 /><dt>{t(ui.hours)}</dt><dd>{t(place.hours)}</dd></div>
      </dl>
      {place.education && (
        <div className="place-popup__section">
          <h3><GraduationCap />{t(ui.passingScore)}</h3>
          <p>{t(place.education.passingScore)}</p>
          <p className="place-popup__note">{t(ui.scoreNote)}</p>
          <h3>{t(ui.specialties)}</h3>
          <ul>{place.education.specialties.map((specialty) => <li key={specialty.kk}>{t(specialty)}</li>)}</ul>
          <h3>{t(ui.dormitory)}</h3>
          <p>{t(place.education.dormitory)}</p>
        </div>
      )}
      {place.civic && (
        <div className="place-popup__section">
          <h3><ShieldAlert />{t(ui.directLines)}</h3>
          <ul>{place.civic.directLines.map((line) => <li key={line.kk}>{t(line)}</li>)}</ul>
          <h3>{t(ui.services)}</h3>
          <p>{t(place.civic.services)}</p>
        </div>
      )}
      <Button asChild variant="outline" className="w-full justify-between">
        <a href={mapsUrl} target="_blank" rel="noreferrer">{t(ui.openInMaps)}<ExternalLink /></a>
      </Button>
    </article>
  );
}

export default function CityMap({ visibleIds, activeId, resetToken }: { visibleIds: string[]; activeId: string | null; resetToken: number }) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const icons = useMemo(() => Object.fromEntries(
    (Object.keys(categories) as Category[]).map((id) => [id, L.divIcon({
      className: "city-pin-wrap",
      html: `<div class="city-pin city-pin--${id}"><span>${categories[id].icon}</span></div>`,
      iconSize: [42, 48], iconAnchor: [21, 45], popupAnchor: [0, -42],
    })]),
  ) as Record<Category, L.DivIcon>, []);

  useEffect(() => {
    if (!activeId) return;
    const timer = window.setTimeout(() => markerRefs.current[activeId]?.openPopup(), 730);
    return () => window.clearTimeout(timer);
  }, [activeId]);

  return (
    <MapContainer center={ARKALYK} zoom={14} className="h-full w-full" zoomControl attributionControl>
      <TileLayer attribution="&copy; OpenStreetMap contributors &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      <MapController activeId={activeId} resetToken={resetToken} />
      {places.filter((place) => visibleIds.includes(place.id)).map((place) => (
        <Marker
          key={place.id}
          position={place.pos}
          icon={icons[place.cat]}
          ref={(marker) => { markerRefs.current[place.id] = marker; }}
        >
          <Popup maxWidth={360} minWidth={280}><PopupDetail placeId={place.id} /></Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}