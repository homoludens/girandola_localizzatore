# **LLM Agent Prompts: Girandola Localizzatore**  

Use these prompts sequentially to build the application. Start by providing the **Master Context** to the agent so it understands the full scope. Then, feed it the **Task** prompts one by one.

## **🚀 Master Context (System Prompt)**

**Instruction:** Please adhere to the following project specifications for all future code generation in this session.

**Project Name:** Girandola Localizzatore **Goal:** Create a location tracking application where users can log in, view a map, add points of interest called "Girandolas" (Pinwheels), and export the data.

**Tech Stack Requirements:**

1. **Framework:** Next.js 16 (App Router).  
2. **Hosting:** Optimized for Vercel Free Tier.  
3. **Styling:** Tailwind CSS (using `shadcn/ui` components is preferred for UI elements).  
4. **Database:** Vercel KV (Redis) for storage.  
5. **Authentication:** NextAuth.js (Auth.js) using Google Provider.  
6. **Maps:** `react-leaflet` (OpenStreetMap) to ensure it remains free/open source without requiring a Google Maps API key.  
7. **Internationalization:** Support English (en) and Italian (it) using `next-intl` or similar lightweight middleware.

**Core Features:**

* **Auth:** Google OAuth login.  
* **i18n:** Auto-detect browser language, with a manual toggle in the UI.  
* **Map Interface:** Full-screen map showing existing "Girandolas".  
* **Add Location:** Users can click a button to "Add Girandola". This should offer two modes:  
  1. Get current GPS from browser.  
  2. Manual placement on map.  
* **Storage:** Data saved to Vercel KV. Each record must include: Coordinates (lat/long), User Email, and Timestamp.  
* **Export:** A button to export all points as a `.csv` file.

## **📝 Task 1: Project Scaffolding & i18n Setup**

**Prompt:** Act as a Senior React Developer. Please initialize the project structure for "Girandola Localizzatore".

1. Set up a new Next.js App Router project structure.  
2. Install `next-intl` for internationalization.  
3. Configure middleware to detect browser locale (English vs Italian) and redirect accordingly.  
4. Create a generic Layout that allows for a manual language switcher (a simple dropdown or toggle) in the top navigation bar.  
5. Create `messages/en.json` and `messages/it.json` with basic translation keys for "Home", "Login", and "Language".

Do not implement Auth or Maps yet. Focus solely on the structure and localization wiring.

## **📝 Task 2: Authentication (NextAuth)**

**Prompt:** Now, let's implement Authentication using NextAuth.js.

1. Install necessary packages for NextAuth.  
2. Configure the Google OAuth provider.  
3. Create the `api/auth/[...nextauth]/route.ts` handler.  
4. Create a generic "Login" page that is shown to unauthenticated users.  
5. Protect the main dashboard route so only logged-in users can access it.  
6. Display the user's avatar and email in the top navigation bar next to the language switcher.

*Note: Assume I have `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in my `.env` file.*

## **📝 Task 3: Map Component (Leaflet)**

**Prompt:** Let's build the interactive map. Since we are using Next.js, we need to handle Client-Side Rendering for Leaflet correctly.

1. Install `react-leaflet` and `leaflet`.  
2. Create a reusable `MapComponent` that renders an OpenStreetMap layer.  
3. Ensure this component is dynamically imported with `{ ssr: false }` to prevent hydration errors.  
4. The map should take up the majority of the screen space.  
5. Add a standard marker icon configuration (fix the standard Leaflet icon missing asset issue common in Webpack/Next.js).

## **📝 Task 4: Vercel KV & API Routes**

**Prompt:** We need to connect the frontend to the backend storage using Vercel KV (Redis).

1. Install `@vercel/kv`.  
2. Create a Next.js API Route `GET /api/girandolas` to fetch all saved locations.  
3. Create a Next.js API Route `POST /api/girandolas` to save a new location.  
   * The payload should include: `{ lat: number, lng: number }`.  
   * The backend should append the session user's email and a timestamp to the record before saving.  
4. Data Structure strategy: Store items in a Redis List or Hash so they can be easily retrieved.

## **📝 Task 5: "Add Girandola" Feature**

**Prompt:** Now, connect the Map UI to the logic.

1. Add a floating action button (or prominent UI button) called "Add Girandola" (translated).  
2. When clicked, open a Dialog/Modal with two options:  
   * **"Use My GPS"**: Calls `navigator.geolocation.getCurrentPosition` and sends the data to the POST API.  
   * **"Pick on Map"**: Changes the map cursor/mode to allow the user to click a spot on the map to set the coordinates, then confirm to save.  
3. Upon successful save, the map should automatically refresh (or update state) to show the new marker.

## **📝 Task 6: CSV Export**

**Prompt:** Implement the final feature: Data Export.

1. Add an "Export CSV" button to the UI.  
2. When clicked, fetch the full list of Girandolas from the API.  
3. Convert the JSON data (Lat, Lng, User Email, Date) into a CSV string.  
4. Trigger a browser download of the file named `girandolas_export.csv`.

## **📝 Task 7: UI Polish & Deployment Check**

**Prompt:** Review the current code.

1. Ensure all text labels (Buttons, Modals, Errors) are using the `useTranslations` hook from `next-intl`.  
2. Ensure the layout is responsive (mobile-friendly) using Tailwind classes.  
3. Add a check to ensure no API keys are hardcoded.  
4. Provide a `README.md` snippet

