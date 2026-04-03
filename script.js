const API_KEY = "AIzaSyBTMGzHZzMbmase_g0d5fqx72ETVVZSy9k";

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY;

const SYSTEM_PROMPT = `You are EduBot, a friendly and helpful college guide chatbot made for first-year students. You help students with questions about college life, academics, study tips, hostel, campus facilities, exam preparation, student clubs, and managing time and stress. Always reply in a warm, encouraging, and simple tone. Keep answers short and easy to understand.`;

let chatHistory = [];
let isWaiting = false;

window.onload = function () {
  addMessage("bot", "👋 Hi! I am EduBot, your college guide assistant. Ask me anything about college life, exams, hostel, or student activities!");
};

function addMessage(role, text) {
  const chatWindow = document.getElementById("chatWindow");
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(role === "user" ? "user-msg" : "bot-msg");
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendMessage() {
  if (isWaiting) return;

  const input = document.getElementById("userInput");
  const btn = document.getElementById("sendBtn");
  const userText = input.value.trim();
  if (!userText) return;

  addMessage("user", userText);
  input.value = "";
  btn.disabled = true;
  isWaiting = true;

  chatHistory.push({
    role: "user",
    parts: [{ text: userText }]
  });

  const chatWindow = document.getElementById("chatWindow");
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "bot-msg", "typing");
  typingDiv.id = "typing";
  typingDiv.textContent = "EduBot is typing...";
  chatWindow.appendChild(typingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: chatHistory
      })
    });

    const data = await response.json();
    console.log("Response:", data);

    if (data.error) {
      document.getElementById("typing").remove();
      addMessage("bot", "⚠️ " + data.error.message);
      btn.disabled = false;
      isWaiting = false;
      return;
    }

    const botReply = data.candidates[0].content.parts[0].text;

    chatHistory.push({
      role: "model",
      parts: [{ text: botReply }]
    });

    document.getElementById("typing").remove();
    addMessage("bot", botReply);

  } catch (error) {
    document.getElementById("typing").remove();
    addMessage("bot", "⚠️ Error: " + error.message);
    console.error(error);
  }

  btn.disabled = false;
  isWaiting = false;
  input.focus();
}

document.getElementById("userInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") sendMessage();
});
