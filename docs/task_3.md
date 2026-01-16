## **📝 Task 3: Map Component (Leaflet)**

**Prompt:** Let's build the interactive map. Since we are using Next.js, we need to handle Client-Side Rendering for Leaflet correctly.

1. Install `react-leaflet` and `leaflet`.  
2. Create a reusable `MapComponent` that renders an OpenStreetMap layer.  
3. Ensure this component is dynamically imported with `{ ssr: false }` to prevent hydration errors.  
4. The map should take up the majority of the screen space.  
5. Add a standard marker icon configuration (fix the standard Leaflet icon missing asset issue common in Webpack/Next.js).
