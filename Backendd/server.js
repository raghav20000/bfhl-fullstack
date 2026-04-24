const express = require('express');
const cors = require('cors');
const { processBFHL } = require('./processor');

const app = express();
app.use(cors());
app.use(express.json());

const USER_ID = "ManubothuVenkataSaiRaghav_25092005";
const EMAIL_ID = "raghav_manubothu@srmap.edu.in";
const COLLEGE_ROLL_NUMBER = "AP23110010702";

app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'data must be an array' });
    }
    const result = processBFHL(data, USER_ID, EMAIL_ID, COLLEGE_ROLL_NUMBER);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'BFHL API running. Use POST /bfhl' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
