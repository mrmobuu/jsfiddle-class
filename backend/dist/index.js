"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redis_1 = require("redis");
const app = (0, express_1.default)();
let client = (0, redis_1.createClient)();
client.connect();
app.use(express_1.default.json());
app.post("/submission", (req, res) => {
    const userId = req.body.userId;
    const code = req.body.code;
    const language = req.body.language;
    client.lPush("problem", JSON.stringify({ userId, code, language }));
    res.json({
        "message": "processing"
    });
});
app.get("/submission/:submissionId", (req, res) => {
});
app.listen(3000, () => {
    console.log("listening on port 3000");
});
//# sourceMappingURL=index.js.map