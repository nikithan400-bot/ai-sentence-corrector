document.addEventListener("DOMContentLoaded", function () {

    const sentenceInput = document.getElementById("sentence");
    const charCount = document.getElementById("charCount");
    const wordCount = document.getElementById("wordCount");
    const result = document.getElementById("result");
    const correctBtn = document.getElementById("correctBtn");
    const clearBtn = document.getElementById("clearBtn");
    const copyBtn = document.getElementById("copyBtn");
    const loading = document.getElementById("loading");


    // =========================
    // CHARACTER + WORD COUNT
    // =========================

    sentenceInput.addEventListener("input", function () {

        const text = sentenceInput.value;

        charCount.textContent =
            `${text.length} / 1000`;

        if (text.trim() === "") {
            wordCount.textContent = "0 words";
        } else {
            const words = text.trim().split(/\s+/).length;

            wordCount.textContent =
                `${words} ${words === 1 ? "word" : "words"}`;
        }
    });


    // =========================
    // CTRL + ENTER
    // =========================

    sentenceInput.addEventListener("keydown", function (event) {

        if (event.ctrlKey && event.key === "Enter") {

            event.preventDefault();

            correctSentence();
        }
    });


    // =========================
    // CORRECT SENTENCE
    // =========================

    window.correctSentence = async function () {

        const sentence =
            sentenceInput.value.trim();

        if (!sentence) {

            result.textContent =
                "Please enter a sentence first.";

            result.classList.add("has-result");

            return;
        }


        correctBtn.disabled = true;
        clearBtn.disabled = true;

        correctBtn.textContent =
            "Correcting...";

        loading.style.display =
            "block";

        result.classList.remove("has-result");

        result.textContent =
            "AI is correcting your sentence...";


        try {

            const response = await fetch(
                "/api/correct",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        sentence: sentence
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "AI service request failed."
                );
            }


            let corrected =
                data.result;


            if (!corrected) {

                throw new Error(
                    "No correction received from AI."
                );
            }


            corrected =
                corrected.trim();


            // Remove quotation marks if AI adds them
            corrected =
                corrected.replace(/^["']|["']$/g, "");


            result.textContent =
                corrected;


            result.classList.add(
                "has-result"
            );


        } catch (error) {

            console.error(
                "Correction Error:",
                error
            );


            result.textContent =
                "❌ " + error.message;


            result.classList.add(
                "has-result"
            );

        } finally {

            correctBtn.disabled = false;
            clearBtn.disabled = false;

            correctBtn.textContent =
                "Correct Sentence";

            loading.style.display =
                "none";
        }
    };


    // =========================
    // CLEAR
    // =========================

    window.clearText = function () {

        sentenceInput.value = "";

        charCount.textContent =
            "0 / 1000";

        wordCount.textContent =
            "0 words";

        result.textContent =
            "Your corrected sentence will appear here.";

        result.classList.remove(
            "has-result"
        );

        sentenceInput.focus();
    };


    // =========================
    // COPY
    // =========================

    window.copyResult = async function () {

        const text =
            result.textContent.trim();


        if (
            !text ||
            text ===
            "Your corrected sentence will appear here."
        ) {
            return;
        }


        try {

            await navigator.clipboard.writeText(
                text
            );

            copyBtn.textContent =
                "Copied!";


            setTimeout(function () {

                copyBtn.textContent =
                    "Copy";

            }, 1500);


        } catch (error) {

            alert(
                "Unable to copy the result."
            );
        }
    };

});