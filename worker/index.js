const { createClient } = require("redis");
const fs = require("fs");
const { spawn } = require("child_process");

const client = createClient();

// bad approach, worker running external code is talking to database.

client.connect().then(
    async () => {
        while (1) {
            const data = await client.rPop("problem");
            if (!data) {
                await new Promise((r) => setTimeout(r, 1000));
                continue;
            }

            const parseResponse = JSON.parse(data);
            const language = parseResponse.language;
            const code = parseResponse.code;
            const userId = parseResponse.userId;

            console.log("Processing question for user " + userId);

            if (language === "c++") {
                const filePath = __dirname + "/code/a.cpp"
                fs.writeFileSync(filePath, code);
                spawn("g++", [filePath, "-o", "./code/out"]);
                await new Promise((r) => setTimeout(r, 5000));
                console.log("running code for c++");
                const response = spawn("./code/out");
                response.stdout.on("data", (chunk) => {
                    console.log(chunk.toString());
                })


            } else if (language === "js") {
                const filePath = __dirname + "/code/a.js"
                fs.writeFileSync(filePath, code);
                const response = spawn("node", [filePath]);

                console.log("running javascript program", code);

                response.stdout.on("data", (chunk) => {
                    console.log(chunk.toString());
                })

                // await new Promise((r) => setTimeout(r, 2000));
            } else if (language === "py") {
                const filePath = __dirname + "/code/a.py "
                fs.writeFileSync(filePath, code);
                const response = spawn("python3", [filePath]);
                response.stdout.on("data", (chunk) => {
                    console.log(chunk.toString());
                })
            }

            // to-do update the value in the database 
        }
    });