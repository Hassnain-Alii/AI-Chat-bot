const chatBody = document.querySelector(".chat-body");
const chatbotContainer = document.querySelector(".chatbot-container");
const msgInput = document.querySelector(".msg-input");
const msgInputField = document.querySelector(".msg-input-field");
const sendBtn = document.querySelector("#chat-control-send");
const fileBtn = document.querySelector("#file-uploader");
const fileInput = document.querySelector("#file-input");
const fileUploadWrap = document.querySelector(".file-upload-wrap");
const filePreDiv = document.querySelector(".attachment-preview-div");
const filePre = document.querySelector(".attachment-preview");
const filePreImg = document.querySelector(".attachment-pre-img");
const filePreClose = document.querySelector("#attachment-pre-close");
const emojiBtn = document.querySelector("#chat-control-emoji");
const chatContentContainer = document.querySelector(
  ".chatbot-content-container"
);

const API_KEY = "AIzaSyBczP1HOfhZ6SL_WHh1tr-AXFSrAXrFaKw";
const BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBczP1HOfhZ6SL_WHh1tr-AXFSrAXrFaKw";

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

const chatHistory = [];
const initialInoutHeight = msgInput.scrollHeight;
const lineBreakDis = (text) => {
  return text.replace(/\n/g, "<br>");
};

const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("msg", ...classes);
  div.innerHTML = content;
  return div;
};

const generateBotResponse = async (incomingGoingMsgDiv) => {
  const botMsgDiv = incomingGoingMsgDiv.querySelector(".msg-text");
  chatHistory.push({
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.data ? [{ inline_data: userData.file }] : []),
    ],
  });
  let requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: chatHistory,
    }),
  };
  try {
    const response = await fetch(BASE_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    console.log(data);
    console.log(response.status);
    const botResponse = data.candidates[0].content.parts[0].text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
    console.log(botResponse);
    if (botMsgDiv) {
      botMsgDiv.textContent = botResponse;
      chatHistory.push({
        role: "model",
        parts: [{ text: userData.message }],
      });
    } else {
      console.log("could not find .msg-text element");
    }
  } catch (error) {
    console.log(error);
    botMsgDiv.textContent =
      "Sorry, I encountered an error processing your request. Please try again later.";
  } finally {
    incomingGoingMsgDiv.classList.remove("thinking-indicator");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

const handleOutGoingMsg = (e) => {
  e.preventDefault();
  userData.message = msgInput.value.trim();
  const text = userData.message;
  filePreDiv.style = "display: none";

  if (userData.message === "" && (!userData.file || !userData.file.data)) {
    console.log("no msg or file found");
    return;
  } else {
    msgInput.value = "";
    chatContentContainer.style.display = "block";
    chatbotContainer.classList.add("chatbot-shadow");
    chatbotContainer.style = "overflow:hidden";
    document.querySelector(".chat-footer").style = "border-radius:0";
    msgInput.dispatchEvent(new Event("input"));
    let msgContent = "";

    if (userData.message !== "" && userData.file && userData.file.data) {
      msgContent = `${
        userData.file.data
          ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment"/>`
          : ""
      }<div class="msg-text">${lineBreakDis(userData.message)}</div>`;
    } else if (
      userData.message !== "" &&
      (!userData.file || !userData.file.data)
    ) {
      msgContent = `<div class="msg-text">${lineBreakDis(
        userData.message
      )}</div>`;
    } else if (userData.message === "" && userData.file && userData.file.data) {
      msgContent = `${
        userData.file.data
          ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment"/>`
          : ""
      }`;
    }

    const outGoingMsgDiv = createMsgElement(msgContent, "user-msg");

    if (userData.message !== "" && outGoingMsgDiv.querySelector(".msg-text")) {
      outGoingMsgDiv.querySelector(".msg-text").innerHTML = lineBreakDis(
        userData.message
      );
    } else {
      console.error("Could not find .msg-text element.");
    }

    userData.file = {};

    chatBody.appendChild(outGoingMsgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
      const msgContent = `<svg
            class="chatbot-icon"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="50"
            height="50"
            viewBox="0 0 50 50"
          >
            <path
              d="M 25 4.5 C 15.204 4.5 5.9439688 11.985969 3.9179688 21.542969 C 3.9119687 21.571969 3.9200156 21.599906 3.9160156 21.628906 C 1.5620156 23.233906 -0.04296875 26.383 -0.04296875 30 C -0.04296875 35.238 3.3210312 39.5 7.4570312 39.5 C 7.7850313 39.5 8.0913438 39.339313 8.2773438 39.070312 C 8.4643437 38.800312 8.5065781 38.456438 8.3925781 38.148438 C 8.3775781 38.110438 6.9550781 34.244 6.9550781 29.5 C 6.9550781 24.506 8.3091719 22.022187 8.3261719 21.992188 C 8.5011719 21.683187 8.4983125 21.305047 8.3203125 20.998047 C 8.1433125 20.689047 7.8130313 20.5 7.4570312 20.5 C 7.0350313 20.5 6.62275 20.554625 6.21875 20.640625 C 8.58675 12.613625 16.57 6.5 25 6.5 C 32.992 6.5 40.688641 12.044172 43.431641 19.576172 C 43.133641 19.530172 42.831438 19.5 42.523438 19.5 C 42.169438 19.5 41.841109 19.689094 41.662109 19.996094 C 41.482109 20.302094 41.481297 20.683187 41.654297 20.992188 C 41.668297 21.016188 43.023437 23.5 43.023438 28.5 C 43.023438 32.44 42.045078 35.767641 41.705078 36.806641 C 40.558078 37.740641 38.815344 39.034297 36.777344 40.154297 C 36.016344 39.305297 34.839391 38.871437 33.650391 39.148438 L 31.867188 39.560547 C 31.024188 39.753547 30.308609 40.262094 29.849609 40.996094 C 29.391609 41.728094 29.245453 42.598453 29.439453 43.439453 C 29.783453 44.935453 31.11975 45.949219 32.59375 45.949219 C 32.83275 45.949219 33.074359 45.923188 33.318359 45.867188 L 35.103516 45.457031 C 35.945516 45.264031 36.661141 44.752531 37.119141 44.019531 C 37.503141 43.406531 37.653984 42.700187 37.583984 41.992188 C 39.728984 40.830188 41.570453 39.483422 42.814453 38.482422 C 46.814453 38.286422 50.023438 34.114 50.023438 29 C 50.023438 25.237 48.284437 21.989172 45.773438 20.451172 C 45.769438 20.376172 45.777859 20.301563 45.755859 20.226562 C 43.152859 11.113563 34.423 4.5 25 4.5 z M 12 19 C 11.447 19 11 19.447 11 20 L 11 32 C 11 32.553 11.447 33 12 33 L 28.044922 33 C 27.540922 34.057 26.743578 35.482375 26.142578 36.484375 C 25.941578 36.819375 25.954828 37.2405 26.173828 37.5625 C 26.360828 37.8395 26.673 38 27 38 C 27.055 38 27.109063 37.995328 27.164062 37.986328 C 33.351062 36.955328 38.412 32.95125 38.625 32.78125 C 38.862 32.59125 39 32.304 39 32 L 39 20 C 39 19.447 38.553 19 38 19 L 12 19 z M 18.5 23 C 19.902 23 21 24.317 21 26 C 21 27.683 19.902 29 18.5 29 C 17.098 29 16 27.683 16 26 C 16 24.317 17.098 23 18.5 23 z M 31.5 23 C 32.902 23 34 24.317 34 26 C 34 27.683 32.902 29 31.5 29 C 30.098 29 29 27.683 29 26 C 29 24.317 30.098 23 31.5 23 z"
            ></path>
          </svg>
          <div class="msg-text">
            <div class="thinking-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>`;
      const incomingGoingMsgDiv = createMsgElement(msgContent, "bot-msg");
      chatBody.appendChild(incomingGoingMsgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
      generateBotResponse(incomingGoingMsgDiv);
    }, 400);
  }
};

msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    handleOutGoingMsg(e);
  }
});

const maxHeight = 200;
msgInput.addEventListener("input", () => {
  msgInput.style.height = "auto";
  msgInput.style.height = `${initialInoutHeight}px`;
  // msgInput.style.height = Math.min(msgInput.scrollHeight, maxHeight);
  // msgInput.style.height = newHeight + "px";

  // if (newHeight === maxHeight) {
  //   msgInput.style.overflowY = "auto";
  // } else {
  //   msgInput.style.overflowY = "hidden";
  // }
});

sendBtn.addEventListener("click", (e) => {
  handleOutGoingMsg(e);
});
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) {
    console.log("file not found");
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    filePreImg.src = e.target.result;
    filePreDiv.style = "display: block";
    const base64String = e.target.result.split(",")[1];
    userData.file = {
      data: base64String,
      mime_type: file.type,
    };

    fileInput.value = "";
    console.log(userData);
  };
  reader.readAsDataURL(file);
  msgInput.focus();
});

const picker = new EmojiMart.Picker({
  theme: "auto",
  skinTonePosition: "none",
  previewPosition: "none",
  emojiSize: "20",
  navPosition: "top",
  onClickOutside: (e) => {
    const emojiPicker = document.querySelector("em-emoji-picker");

    if (e.target === emojiBtn) {
      emojiPicker.style.display =
        emojiPicker.style.display === "block" ? "none" : "block";
    } else {
      emojiPicker.style.display = "none";
    }
  },
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = msgInput;
    msgInput.setRangeText(emoji.native, start, end, "end");
    msgInput.focus();
  },
});
document.querySelector(".emoji-picker-container").appendChild(picker);

fileBtn.addEventListener("click", () => {
  fileInput.click();
});
filePreClose.addEventListener("click", () => {
  userData.file = {};
  filePreDiv.style.display = "none";
  filePreImg.src = "";
});
