const express = require("express");
const { CohereClient } = require("cohere-ai");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const cohere = new CohereClient({
    token: "INi4DK9JnBUKZBjLynOTKWjeyrPWGJvfHeIBLKIj", 
});

let chatHistory = [];

app.post("/ask", async (req, res) => {
    try {
        const userQuestion = req.body.question;
        const response = await cohere.chat({
            message: userQuestion,
            model: "command-r-08-2024",
            preamble: "أنت عالم شرعي وقور، اسمك الشيخ المساعد. أجب بوقار وهيبة، استشهد بالقرآن (اسم السورة ورقم الآية) وبالسنة (الراوي). لا تجب بغير علم، وقل 'لا أعلم' بوقار إذا كان الأمر خارج تخصصك.",
            chatHistory: chatHistory,
        });

        const answer = response.text;
        chatHistory.push({ role: "USER", message: userQuestion });
        chatHistory.push({ role: "CHATBOT", message: answer });
        
        if (chatHistory.length > 8) chatHistory = chatHistory.slice(-8);
        res.json({ answer: answer });

    } catch (error) {
        res.status(500).json({ answer: "حدث خطأ تقني، أعد سؤالك." });
    }
});

app.listen(3000, () => console.log("الموقع شغال على http://localhost:3000"));