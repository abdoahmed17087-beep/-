const express = require("express");
const { CohereClient } = require("cohere-ai");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY, 
});

app.use(express.json());
app.use(express.static(__dirname));

const systemPrompt = `أنت "المساعد الشرعي الذكي"، عالم مسلم وقور. 
- أجب بلهجة مصرية مبسطة ووقورة.
- تذكر دائماً المعلومات التي أخبرك بها المستخدم (مثل اسمه) وناده بها بوقار.
- لا تذكر أحاديث إلا إذا كنت متأكداً أنها في البخاري أو مسلم.`;

// هنا السر: مصفوفة لحفظ المحادثة (للتبسيط في البروجيكت ده)
// ملاحظة: في المشاريع الكبيرة بنستخدم Database، بس كدة هتشتغل معاك مؤقتاً
let globalHistory = [];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) return res.status(400).json({ reply: "اتفضل اسأل يا بني." });

        // نبعت السؤال للـ AI مع تاريخ المحادثة اللي فات عشان يفتكر
        const response = await cohere.chat({
            message: question,
            model: "command-r-08-2024",
            preamble: systemPrompt,
            chatHistory: globalHistory // هنا الذاكرة
        });

        const reply = response.text;

        // بنضيف السؤال والجواب للذاكرة عشان المرة الجاية يفتكرهم
        globalHistory.push({ role: "USER", message: question });
        globalHistory.push({ role: "CHATBOT", message: reply });

        // لو الذاكرة كبرت أوي بنمسح القديم عشان السيرفر ميهنجش (آخر 10 رسايل مثلاً)
        if (globalHistory.length > 20) {
            globalHistory.shift();
            globalHistory.shift();
        }

        res.json({ reply: reply });

    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "عذراً يا بني، حدث تداخل في الأفكار." });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
