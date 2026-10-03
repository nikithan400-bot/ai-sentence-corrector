const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/api/correct", async (req, res) => {

    try {

        const { sentence } = req.body;

        if (!sentence || !sentence.trim()) {

            return res.status(400).json({
                error: "Please enter a sentence."
            });

        }


        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${process.env.OPENROUTER_API_KEY}`,

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    model: "google/gemma-4-31b-it:free",

                    temperature: 0,

                    max_tokens: 100,

                    messages: [

                        {
                            role: "system",

                            content: `
You are an English grammar correction tool.

Correct the user's sentence.

IMPORTANT:
Return ONLY the corrected sentence.

Do NOT provide:
- explanation
- headings
- bullet points
- numbering
- alternative versions
- comments
- questions
- "Corrected Sentence"
- "Explanation of Mistakes"
- "More Natural Version"

Preserve the original meaning.

Only correct:
- grammar
- spelling
- capitalization
- punctuation

Do not add new information.
Do not remove important words.

Example:

Input:
hey nikitha come and bring the towel to me

Output:
Hey Nikitha, come and bring the towel to me.

Return ONLY the corrected sentence.
`
                        },

                        {
                            role: "user",
                            content: sentence
                        }

                    ]

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            console.log(data);

            return res.status(500).json({
                error: "AI service request failed."
            });

        }


        let corrected =
            data.choices?.[0]?.message?.content?.trim();


        if (!corrected) {

            return res.status(500).json({
                error: "No response received from AI."
            });

        }


        // Remove "Corrected Sentence"
        corrected =
            corrected.replace(
                /.*?Corrected\s*Sentence\s*:?\s*/is,
                ""
            );


        // Remove Explanation
        corrected =
            corrected.split(
                /Explanation\s*(?:of\s+Mistakes)?\s*:?\s*/i
            )[0];


        // Remove More Natural Version
        corrected =
            corrected.split(
                /More\s+Natural\s+Version\s*:?\s*/i
            )[0];


        // Remove markdown symbols
        corrected =
            corrected.replace(/\*\*/g, "");


        // Remove quotation marks
        corrected =
            corrected.replace(
                /^["']|["']$/g,
                ""
            );


        // Remove extra spaces
        corrected =
            corrected.replace(
                /\s+/g,
                " "
            ).trim();


        res.json({
            result: corrected
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Something went wrong."
        });

    }

});


app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});