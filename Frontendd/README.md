# BFHL Full Stack Challenge — Complete Solution

## Project Structure

```
bfhl-project/
├── backend/
│   ├── server.js        ← Express API entry point
│   ├── processor.js     ← All logic (validation, trees, cycles, depth)
│   └── package.json
├── frontend/
│   └── index.html       ← Complete single-page frontend
└── README.md
```

---

## ⚙️ Local Setup

### Backend

```bash
cd backend
npm install
npm start
# Server runs at http://localhost:3000
```

Test it:
```bash
curl -X POST http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data": ["A->B", "A->C", "B->D", "X->Y", "Y->Z", "Z->X", "hello"]}'
```

### Frontend

Open `frontend/index.html` in any browser.
Set the API URL field to `http://localhost:3000`

---

## 🚀 Deployment

### Backend → Render (free)

1. Push your `backend/` folder to a **public GitHub repo**
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Deploy → copy the URL (e.g. `https://yourname-bfhl.onrender.com`)

### Frontend → Netlify (free, drag & drop)

1. Go to https://netlify.com → Add new site → Deploy manually
2. Drag and drop your `frontend/` folder
3. Your frontend is live at e.g. `https://yourapp.netlify.app`
4. On first load, paste your Render backend URL into the API URL field

### Alternative: Vercel (frontend + backend)

```bash
npm install -g vercel
cd backend && vercel
cd ../frontend && vercel
```

---

## 📋 Submission Checklist

- ✅ Backend responds to POST /bfhl
- ✅ CORS enabled
- ✅ Frontend URL is live
- ✅ GitHub repo is public

---

## 🔑 Customizing Your Credentials

In `backend/server.js`, update lines 6–8:

```js
const USER_ID = "yourfullname_ddmmyyyy";        // e.g. "johndoe_17091999"
const EMAIL_ID = "you@srmist.edu.in";
const COLLEGE_ROLL_NUMBER = "RA2111003010001";
```

---

## 🧪 Test with the Example from PDF

POST body:
```json
{
  "data": [
    "A->B", "A->C", "B->D", "C->E", "E->F",
    "X->Y", "Y->Z", "Z->X",
    "P->Q", "Q->R",
    "G->H", "G->H", "G->I",
    "hello", "1->2", "A->"
  ]
}
```

Expected: 3 trees, 1 cycle, largest root = A, duplicates = ["G->H"], invalid = ["hello","1->2","A->"]
