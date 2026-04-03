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

  const chatWindow = document.getElementById("chatWindow");
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "bot-msg", "typing");
  typingDiv.id = "typing";
  typingDiv.textContent = "EduBot is typing...";
  chatWindow.appendChild(typingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...chatHistory,
          { role: "user", content: userText }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      document.getElementById("typing").remove();
      addMessage("bot", "⚠️ No response. Please try again.");
      btn.disabled = false;
      isWaiting = false;
      return;
    }

    const botReply = data.choices[0].message.content;
    chatHistory.push({ role: "user", content: userText });
    chatHistory.push({ role: "assistant", content: botReply });

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