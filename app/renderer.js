const marked = require("marked");
const path = require("path");

const { remote, ipcRenderer } = require("electron");
const mainProcess = remote.require("./main");
const currentWindow = remote.getCurrentWindow();

let filePath = "";
let originalContent = "";

const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdownButton = document.querySelector("#save-markdown");
const revertButton = document.querySelector("#revert");
const saveHtmlButton = document.querySelector("#save-html");
const showFileButton = document.querySelector("#show-file");
const openInDefaultButton = document.querySelector("#open-in-default");

const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

markdownView.addEventListener("keyup", (event) => {
  const currentContent = event.target.value;

  renderMarkdownToHtml(currentContent);

  updateUserInterface(currentContent !== originalContent);
});

openFileButton.addEventListener("click", () => {
  mainProcess.getFileFromUser();
});

const updateUserInterface = (isEdited) => {
  let title = "Fire Sale";

  if (filePath) {
    title = `${path.basename(filePath)} - ${title}`;
  }

  if (isEdited) {
    title = `${title} *`;
  }

  // mac specific
  currentWindow.setRepresentedFilename(filePath);
  currentWindow.setDocumentEdited(isEdited);
  // mac specific

  saveMarkdownButton.disabled = !isEdited;
  revertButton.disabled = !isEdited;
  currentWindow.setTitle(title);
};

ipcRenderer.on("file-opened", (event, file, content) => {
  filePath = file;
  originalContent = content;
  markdownView.value = content; // 좌측에 표시되는 부분
  renderMarkdownToHtml(content); // 우측에 마크다운표시되는 부분

  updateUserInterface();
});
