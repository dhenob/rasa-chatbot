document.addEventListener("DOMContentLoaded", function() {
  const inputField = document.getElementById("tynBotInput");
  const sendButton = document.getElementById("tynBotSend");
  const chatBody = document.getElementById("tynBotBody");

  sendButton.addEventListener("click", function() {
      let userMessage = inputField.innerText.trim();
      if (userMessage) {
          addMessageToChat("user", userMessage);
          sendMessageToRasa(userMessage);
      }
      inputField.innerText = ""; // Clear input field
      chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the latest message
  });

  function addMessageToChat(sender, message) {
      let messageDiv = document.createElement("div");
      messageDiv.className = sender === "user" ? "user-message" : "bot-message";
      messageDiv.innerText = message;
      chatBody.appendChild(messageDiv);
      chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the latest message
  }

  function sendMessageToRasa(message) {
      fetch('http://localhost:5005/webhooks/rest/webhook', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              message: message,
              sender: 'user',
          }),
      })
      .then(response => response.json())
      .then(data => {
          if (data && data.length > 0) {
              addMessageToChat("bot", data[0].text);
          }
      })
      .catch((error) => {
          console.error('Error:', error);
      });
  }
});
