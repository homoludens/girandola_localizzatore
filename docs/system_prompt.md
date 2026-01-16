**Instruction:** Please adhere to the following project specifications for all future code generation in this session.

**Project Name:** Girandola Localizzatore **Goal:** Create a location tracking application where users can log in, view a map, add points of interest called "Girandolas" (Pinwheels), and export the data.

**Tech Stack Requirements:**

0. **MOBILE FIRST** this app will be used on mobile phones. MUST be great on mobile.
1. **Framework:** Next.js 16 (App Router).  
2. **Hosting:** Optimized for Vercel Free Tier. 
3. **Styling:** Tailwind CSS (using `shadcn/ui` components is preferred for UI elements).  
4. **Database:** Vercel KV (Redis) for storage.  
5. **Authentication:** NextAuth.js (Auth.js) using Google Provider.  
6. **Maps:** `react-leaflet` (OpenStreetMap) to ensure it remains free/open source without requiring a Google Maps API key.  
7. **Internationalization:** Support English (en) and Italian (it) using `next-intl` or similar lightweight middleware.

**Core Features:**

* **i18n:** Auto-detect browser language, with a manual toggle in the UI.  
* **Map Interface:** Full-screen map showing existing "Girandolas".  
* **Add Location:** Users can click a button to "Add Girandola". This should offer two modes:  
  1. Get current GPS from browser.  
  2. Manual placement on map.  
* **Storage:** Data saved to Vercel KV. Each record must include: Coordinates (lat/long), User Email, and Timestamp.  
* **Export:** A button to export all points as a `.csv` file.


Commit after every prompt.
