## **📝 Task 4: Vercel KV & API Routes**

**Prompt:** We need to connect the frontend to the backend storage using Vercel KV (Redis).

1. Install `@vercel/kv`.  
2. Create a Next.js API Route `GET /api/girandolas` to fetch all saved locations.  
3. Create a Next.js API Route `POST /api/girandolas` to save a new location.  
   * The payload should include: `{ lat: number, lng: number }`.  
   * The backend should append the session user's email and a timestamp to the record before saving.  
4. Data Structure strategy: Store items in a Redis List or Hash so they can be easily retrieved.
