import { createClient } from "redis"
import fs from "fs"
import { spawn } from "child_process"
import { prisma } from "./db.js"

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
            const submissionId = parseResponse.submissionId

            // console.log("Processing question for data " + JSON.stringify(parseResponse));
            console.log("Processing question for data " + submissionId);

            let fileOutput = "";

            if (language === "c++") {
                const filePath = __dirname + "/code/a.cpp"
                fs.writeFileSync(filePath, code);
                const responseCompiler = spawn("g++", [filePath, "-o", "./code/out"]);
                let exitCodeCompiler = 0;
                responseCompiler.on("exit", async (exitcode) => {
                    if (exitcode !== 0) {
                        exitCodeCompiler = exitcode;
                        await prisma.submission.update({
                            where: {
                                id: submissionId
                            },
                            data: {
                                status: "Failure"
                            }
                        })
                    }
                })
                if (exitCodeCompiler !== 0) {
                    continue;
                }

                // await new Promise((r) => setTimeout(r, 5000));
                console.log("running code for c++");
                const response = spawn("./code/out");
                response.stdout.on("data", (chunk) => {
                    fileOutput += chunk.toString();
                })

                await new Promise(resolve => {
                    response.on("exit", async (exitcode) => {
                        if (exitcode === 0) {
                            await prisma.submission.update({
                                where: {
                                    id: submissionId
                                },
                                data: {
                                    status: "Suceess",
                                    output: fileOutput
                                }
                            })
                        } else {
                            await prisma.submission.update({
                                where: {
                                    id: submissionId
                                },
                                data: {
                                    status: "Failure",
                                }
                            })
                        }
                    })
                    resolve();
                })
            } else if (language === "js") {
                const filePath = __dirname + "/code/a.js"
                fs.writeFileSync(filePath, code);
                const response = spawn("node", [filePath]);

                console.log("running javascript program", code);

                response.stdout.on("data", (chunk) => {
                    fileOutput += chunk.toString();
                })
                await new Promise(resolve => {
                    response.on("exit", async (exitcode) => {
                        if (exitcode === 0) {
                            await prisma.submission.update({
                                where: {
                                    id: submissionId
                                },
                                data: {
                                    status: "Suceess",
                                    output: fileOutput
                                }
                            })
                        } else {
                            await prisma.submission.update({
                                where: {
                                    id: submissionId
                                },
                                data: {
                                    status: "Failure",
                                }
                            })
                        }
                    })
                    resolve();
                })

                // await new Promise((r) => setTimeout(r, 2000));
            } else if (language === "py") {
                const filePath = __dirname + "/code/a.py"
                fs.writeFileSync(filePath, code);
                const response = spawn("python3", [filePath]);
                response.stdout.on("data", (chunk) => {
                    fileOutput += chunk.toString();
                })
                await new Promise(resolve => {
                    response.on("exit", async (exitcode) => {
                        if (exitcode === 0) {
                            await prisma.submission.update({
                                where: {
                                    id: submissionId
                                },
                                data: {
                                    status: "Suceess",
                                    output: fileOutput
                                }
                            })
                        } else {
                            await prisma.submission.update({
                                where: {
                                    id: submissionId
                                },
                                data: {
                                    status: "Failure",
                                }
                            })
                        }
                    })
                    resolve();
                })

            }

            // to-do update the value in the database 
        }
    });