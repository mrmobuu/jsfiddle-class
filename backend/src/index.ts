import express from "express";
import { createClient } from "redis";
import { prisma } from "./db";

const app = express();
let client = createClient()
client.connect();

app.use(express.json());

app.post("/submission", async (req, res) => {
    const code = req.body.code;
    const language = req.body.language;


    const response = await prisma.submission.create({
        data: {
            language: language,
            code: code,
            status: "Processing"

        }
    })
    client.lPush("problem", JSON.stringify({ submissionId: response.id, code, language }));

    res.json({
        "message": "processing",
        response: response,
        id: response.id
    })
});

app.get("/submission/:submissionId", (req, res) => {

});

app.listen(3000, () => {
    console.log("listening on port 3000");
});