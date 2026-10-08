# Re-architect Арқалық Smart Navigator

## What will change
- Make the Leaflet/OpenStreetMap canvas the full-screen primary experience, centered on Arkalyk at `[50.2486, 66.9114]` with zoom 14 and no map API key.
- Replace the current header and always-visible tabs with a compact top-left `KAZ / RUS` switch and a hamburger button.
- Add a sliding navigation drawer containing only: reset/close, schedules, search, distance calculator, and AI assistant.
- Keep every panel bilingual and update visible copy immediately when the language changes.

## Map and places
- Keep the map browser-only so Leaflet remains safe during page loading.
- Show markers for educational institutions, schools, the hospital, akimat, emergency services, and bus/train stations.
- Let search filter markers as the user types and move the map to a selected result.
- Expand every popup with name, address, phone, and hours; educational places also show passing score guidance, specialties, and dormitory details; hospital/government places show direct lines and service hours.

## Drawer tools
- **Schedule:** switchable local and intercity timetables with route, operating hours, interval, departure, and destination details.
- **Search:** bilingual matching across place names, categories, addresses, and services, with zero-result feedback.
- **Distance:** Arkalyk to Astana, Kostanay, or Almaty with distance, driving time, and estimated fuel cost.
- **AI assistant:** open the existing streaming chat in a focused drawer view, preserving suggestions, loading, and error states.

## Visual and interaction details
- Use a restrained light map with an opaque dark drawer, compact controls, semantic project colors, and clear marker categories.
- Add a map reset control, close drawer on backdrop/Escape, and keep controls usable on small screens.
- Preserve reduced-motion preferences and prevent panels or controls from overlapping.

## Validation
- Check the generated app build status.
- Test language switching, drawer navigation, search-to-marker behavior, map reset, marker popups, calculator changes, schedules, and AI panel opening in the live preview.
- Verify desktop and mobile layouts and confirm no Google Maps code or API-key dependency remains.
