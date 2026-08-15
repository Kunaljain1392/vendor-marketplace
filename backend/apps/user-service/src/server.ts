import app from "./app.js";
import "dotenv/config";

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
    console.log(`User Servoce running on prot ${PORT}`)
})

export default server;