# Arkalyk Explorer

Create a clean, highly functional interactive city portal & map called "Арқалық Smart Navigator" using React, Tailwind CSS, Lucide icons, and Leaflet map (or simulated interactive map UI).

Key Components & Features:

1. Header & Localization:

   - App title "Арқалық Smart Navigator" with a map pin / AI icon.

   - Language Switcher (Top Right): Kazakh (Қазақша) and Russian (Русский) toggle. Default to Kazakh. All UI text, button labels, and simulated data must respond to language switching.

2. Interactive City Map & Markers:

   - Center map view on Arkalyk city coordinates.

   - Clickable interactive markers for key institutions:

     - Arkalyk Pedagogical Institute (АрҚПИ)

     - Local Colleges & Schools

     - Train / Bus Station (Вокзал)

     - Central Hospital & Akimat

   - Clicking a marker opens an AI-generated Info Card popup displaying: photo placeholder, address, contacts, working hours, and a short summary of services/courses.

3. Sidebar Tools & Tabs:

   - Tab 1: 🚌 Transport & Schedule (Bus routes inside Arkalyk, timetable, taxi numbers).

   - Tab 2: 🎓 Education & Youth (Filter map markers for schools, colleges, student housing, and places to eat).

   - Tab 3: 🛣 Distance & Route Calculator (2GIS style):

     - Origin selector (preset to Arkalyk).

     - Destination selector (e.g., Almaty, Astana, Kostanay).

     - Calculates and displays: Total distance in km, driving time in hours, train travel time, and estimated fuel cost.

   - Tab 4: 🤖 AI City Assistant (Integrated chatbox for answering custom queries about Arkalyk).

4. Design & Polish:

   - Modern, sleek dashboard interface with dark sidebar and clean light map theme.

   - Fully responsive, smooth tab switches, and popups.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8d6b21d8-6e75-4a45-b22a-12056ff826b8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
