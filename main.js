const app = require("./app");
const connectToDB = require("./db");

require("dotenv").config();

const PORT = process.env.PORT || 8000;

connectToDB();

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
