"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const movimientos_1 = __importDefault(require("./routes/movimientos"));
const database_1 = require("./database/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
app.use('/api', movimientos_1.default);
app.get('/', (_, res) => res.send('Backend de Gastos Personales corriendo'));
app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
});
process.on('SIGINT', async () => {
    await database_1.pool.end();
    process.exit();
});
