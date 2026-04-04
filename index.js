const express = require("express");
const { CohereClient } = require("cohere-ai");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// التأكد من وجود المفتاح في Vercel Settings
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY, 
});

app.use(express.json());
app.use(express.static(__dirname));

const systemPrompt = `أنت "المساعد الشرعي الذكي"، عالم مسلم وقور. 
- أجب بلهجة مصرية مبسطة ووقورة.
- لا تذكر أحاديث إلا إذا كنت متأكداً أنها في البخاري أو مسلم.
- إذا قيل لك "أهلاً" أو "سلام"، رد بالترحيب والدعاء للسائل.
- تخصصك الدين فقط، لا تفتِ في غير ذلك.`;

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// معالجة الأسئلة مع حماية من التعليق
app.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ reply: "اتفضل اسأل يا بني، أنا سامعك." });
        }

        const response = await cohere.chat({
            message: question,
            model: "command-r-08-2024",
            preamble: systemPrompt,
            // تحديد أقصى عدد كلمات للرد عشان السيرفر ميعلقش (Max Tokens)
            maxTokens: 500 
        });

        // الرد اللي هيرجع للمتصفح
        res.json({ reply: response.text });

    } catch (error) {
        console.error("Error details:", error);
        res.status(500).json({ reply: "عذراً يا بني، حدث تداخل في الأفكار (خطأ في السيرفر)." });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
