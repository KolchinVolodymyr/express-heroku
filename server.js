const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send("Hello World!123");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT);
