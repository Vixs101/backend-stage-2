import app from "./app";
import { initializeSchema } from "./db/schema";

const PORT = process.env.PORT || 3000;

initializeSchema()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});