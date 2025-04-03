// DOM Elements
const elements = {
    startButton: document.getElementById("Start"),
    resetButton: document.getElementById("Reset"),
    result: document.getElementById("Result"),
    display: document.getElementById("display"),
    textArea: document.getElementById("typeHere"),
    readButton: document.getElementById("readButton"),
    cancelButton: document.getElementById("cancelRead"),
    toggleMode: document.getElementById("toggleMode"),
    themeIcon: document.getElementById('themeIcon'),
    highScoreDisplay: document.getElementById("highScore"),
    statsDisplay: document.getElementById("statsDisplay"),
    timerDisplay: document.getElementById("timer"),
    container: document.querySelector(".max-w-3xl"),
    difficultyButtons: {
        amateur: document.getElementById("amateur"),
        easy: document.getElementById("easy"),
        medium: document.getElementById("medium"),
        hard: document.getElementById("hard"),
        expert: document.getElementById("expert"),
        master: document.getElementById("master")
    }
};

// Constants
const INITIAL_TIME = 60;
const DEFAULT_DIFFICULTY = "easy";
const WORD_LISTS = {
    amateur: ["ear", "near", "real", "inner", "earn", "are", "nine", "alien", "lane", "learn"],
    easy: ["apple", "table", "chair", "house", "light", "stone", "ocean", "field", "river"],
    medium: ["garden", "planet", "laptop", "guitar", "breeze", "sprint", "frozen", "voyage", "forest", "silent"],
    hard: ["mountain", "electric", "journey", "wildlife", "triangle", "enormous", "mystical", "puzzle", "adventure", "horizon"],
    expert: ["synchronize", "wonderland", "hypothesis", "complexity", "revolution", "dimension", "catastrophe", "phenomenon", "algorithm", "perception"],
    master: ["interdependent", "professor", "unbelievable", "extraordinary", "misconception", "philosopher", "contradiction", "transcendent", "metamorphosis", "procrastinate", "hallucination"]
};

// State variables
let state = {
    startTime: null,
    endTime: null,
    timer: null,
    speech: null,
    selectedText: "",
    countDown: INITIAL_TIME,
    currentDifficulty: DEFAULT_DIFFICULTY,
    isTestRunning: false,
    isDarkMode: localStorage.getItem("darkMode") === "true",
    firstKeyPressed: false,
    correctCharacters: 0,
    lastCorrectIndex: -1
};

// Initialize the application
function init() {
    // Set up event listeners
    elements.startButton.addEventListener("click", startTest);
    elements.resetButton.addEventListener("click", resetTest);
    elements.textArea.addEventListener("input", handleInput);
    elements.readButton.addEventListener("click", readAloud);
    elements.cancelButton.addEventListener("click", stopReading);
    elements.toggleMode.addEventListener("click", toggleMode);

    // Set up difficulty buttons
    Object.keys(elements.difficultyButtons).forEach(level => {
        if (elements.difficultyButtons[level]) {
            elements.difficultyButtons[level].addEventListener("click", () => setDifficulty(level));
        }
    });

    // Initialize dark mode
    // applyDarkMode(state.isDarkMode);
    
    // Load high score
    updateHighScoreDisplay();
}

// Core test functions
function startTest() {
    const text = getTypingText(state.currentDifficulty);
    initializeTest(text);
}

function initializeTest(text) {
    state.selectedText = text.trim();
    state.firstKeyPressed = false;
    state.startTime = null;
    state.endTime = null;
    state.lastCorrectIndex = -1;
    state.correctCharacters = 0;
    state.countDown = INITIAL_TIME;
    state.isTestRunning = true;
    
    // Update UI
    elements.display.textContent = state.selectedText;
    elements.textArea.value = "";
    elements.textArea.style.backgroundColor = state.isDarkMode ? "#1f2937" : "white";
    elements.result.textContent = "";
    elements.statsDisplay.textContent = "Speed: 0 CPM | 0 WPM | Accuracy: 0%";
    elements.timerDisplay.textContent = `⏳ Time Left: ${state.countDown}s`;

    //Disable pasting
    elements.textArea.addEventListener("paste", function(event){
        event.preventDefault();
        alert('Buddy just type the fuck out!😂😂');
        console.log("don\'t do that")
    })
    
    // Clear any existing timer
    clearInterval(state.timer);
    
    // Enable text area and focus
    elements.textArea.disabled = false;
    elements.textArea.focus();
}

function handleInput() {
    if (!state.isTestRunning) return;
    
    const typedText = elements.textArea.value;
    const displayText = state.selectedText;
    
    // Start timer on first valid keystroke
    if (!state.firstKeyPressed && typedText.length > 0 && typedText[0] === displayText[0]) {
        state.firstKeyPressed = true;
        state.startTime = Date.now();
        startTimer();
    }

    // Validate each character
    let newText = "";
    state.correctCharacters = 0;
    
    for (let i = 0; i < typedText.length; i++) {
        if (i >= displayText.length) break;
        
        if (typedText[i] === displayText[i]) {
            newText += typedText[i];
            state.correctCharacters++;
            state.lastCorrectIndex = i;
        } else {
            break;
        }
    }
    
    // Update textarea with validated text
    elements.textArea.value = newText;
    
    // Visual feedback
    if (newText.length === displayText.length && newText === displayText) {
        // Completed successfully
        elements.textArea.style.backgroundColor = "#69ff33";
        state.endTime = Date.now();
        completeTest();
    } else if (newText.length > 0) {
        // Partially correct
        elements.textArea.style.backgroundColor = state.isDarkMode ? "#1f2937" : "white";
    } else {
        // Incorrect
        elements.textArea.style.backgroundColor = "#ff9966";
    }
    
    // Update live stats
    calculateLiveStats();
}

function calculateLiveStats() {
    if (!state.startTime) return;
    
    const currentTime = Date.now();
    const timeElapsed = (currentTime - state.startTime) / 1000; // seconds
    const cpm = Math.floor((state.correctCharacters / timeElapsed) * 60) || 0;
    const wpm = Math.floor(cpm / 5);
    const accuracy = elements.textArea.value.length > 0 
        ? Math.floor((state.correctCharacters / elements.textArea.value.length) * 100) 
        : 0;
    
    elements.statsDisplay.textContent = `Speed: ${cpm} CPM | ${wpm} WPM | Accuracy: ${accuracy}%`;
}

function completeTest() {
    clearInterval(state.timer);
    elements.textArea.disabled = true;
    state.isTestRunning = false;
    
    const timeTaken = (state.endTime - state.startTime) / 1000; // seconds
    const cpm = Math.floor((state.selectedText.length / timeTaken) * 60);
    const wpm = Math.floor(cpm / 5);
    const accuracy = Math.floor((state.correctCharacters / state.selectedText.length) * 100);
    
    elements.result.textContent = `Final: ${cpm} CPM | ${wpm} WPM | ${accuracy}% Accuracy`;
    updateHighScore(cpm, wpm, accuracy);
}

function resetTest() {
    // Reset state
    state.startTime = null;
    state.endTime = null;
    state.selectedText = "";
    state.countDown = INITIAL_TIME;
    state.isTestRunning = false;
    state.firstKeyPressed = false;
    state.correctCharacters = 0;
    state.lastCorrectIndex = -1;
    
    // Clear timer
    clearInterval(state.timer);
    
    // Reset UI
    elements.textArea.value = "";
    elements.display.textContent = "";
    elements.result.textContent = "";
    elements.statsDisplay.textContent = "Speed: 0 CPM | 0 WPM | Accuracy: 0%";
    elements.textArea.style.backgroundColor = state.isDarkMode ? "#1f2937" : "white";
    elements.timerDisplay.textContent = "⏳ Time Left: 0s";
}

// Timer functions
function startTimer() {
    state.timer = setInterval(() => {
        state.countDown--;
        elements.timerDisplay.textContent = `⏳ Time Left: ${state.countDown}s`;
        
        if (state.countDown <= 0) {
            timeExpired();
        }
    }, 1000);
}

function timeExpired() {
    clearInterval(state.timer);
    elements.textArea.disabled = true;
    elements.result.textContent = "⏱️ Time's up!";
    state.isTestRunning = false;
    calculateLiveStats();
}

// High score management
function updateHighScore(cpm, wpm, accuracy) {
    const highScore = JSON.parse(localStorage.getItem("highScore")) || { cpm: 0, wpm: 0, accuracy: 0 };
    
    if (cpm > highScore.cpm || (cpm === highScore.cpm && wpm > highScore.wpm)) {
        const newScore = { cpm, wpm, accuracy };
        localStorage.setItem("highScore", JSON.stringify(newScore));
        updateHighScoreDisplay();
        showToast(`New High Score! 🎉 ${cpm} CPM | ${wpm} WPM | ${accuracy}%`);
    }
}

function updateHighScoreDisplay() {
    const highScore = JSON.parse(localStorage.getItem("highScore")) || { cpm: 0, wpm: 0, accuracy: 0 };
    elements.highScoreDisplay.textContent = `🏆 High Score: ${highScore.cpm} CPM | ${highScore.wpm} WPM | ${highScore.accuracy}%`;
}

// Difficulty management
function setDifficulty(level) {
    if (!WORD_LISTS[level]) {
        console.error(`Invalid difficulty level: ${level}`);
        return;
    }
    
    state.currentDifficulty = level;
    
    // If test is running, restart with new difficulty
    if (state.isTestRunning) {
        startTest();
    }
}

function getTypingText(level) {
    if (level === "easy") {
        const sampleSentences = [
            "A meeting must be held before a project or support is given to a member and the quorum attending the meeting must agree.",
            "Every amount must be accounted for and every member must be aware of the ongoing projects.",
            "Special meetings may be called by the Chairperson or by a majority of the Executive Committee."
        ];
        return sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
    }
    
    const minWords = level === "amateur" ? 10 : 15;
    const maxWords = level === "master" ? 25 : 20;
    return generateRandomText(minWords, maxWords, WORD_LISTS[level]);
}

function generateRandomText(minWords, maxWords, wordList) {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    let text = [];
    
    for (let i = 0; i < wordCount; i++) {
        text.push(wordList[Math.floor(Math.random() * wordList.length)]);
    }
    
    return text.join(' ');
}

// Text-to-speech functions
function readAloud() {
    if (!state.selectedText) {
        showToast("No text to read!", "error");
        return;
    }
    
    stopReading();
    state.speech = new SpeechSynthesisUtterance(state.selectedText);
    state.speech.lang = "en-US";
    window.speechSynthesis.speak(state.speech);
}

function stopReading() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

// Dark mode functions
function updateTheme() {
    if (state.isDarkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("bg-gradient-to-b", "from-blue-50", "to-indigo-100");
      document.body.classList.add("bg-gray-900");

      elements.container?.classList.add("bg-gray-800", "text-white");
      elements.container?.classList.remove("bg-white");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("bg-gradient-to-b", "from-blue-50", "to-indigo-100");
      document.body.classList.remove("bg-gray-900");

      elements.container?.classList.remove("bg-gray-800", "text-white");
      elements.container?.classList.add("bg-white");
    }

    // Update text area colors if not showing error/success
    if (elements.textArea && 
        elements.textArea.style.backgroundColor !== "#69ff33" && 
        elements.textArea.style.backgroundColor !== "#ff9966") {
      elements.textArea.style.backgroundColor = state.isDarkMode ? "#1f2937" : "white";
    }
    
    if (elements.textArea) {
      elements.textArea.style.color = state.isDarkMode ? "white" : "black";
    }

    // Update theme icon
    elements.themeIcon.src = state.isDarkMode ? "assets/moon.svg" : "assets/sun.svg";
    elements.themeIcon.alt = state.isDarkMode ? "Dark Mode" : "Light Mode";
  }

  // Set initial state on page load
  updateTheme();

elements.toggleMode.addEventListener("click", function(){
    state.isDarkMode = !state.isDarkMode;
    localStorage.setItem("darkMode", state.isDarkMode);
    updateTheme(state.isDarkMode);
})

// UI functions
function showToast(message, type = "success") {
    Toastify({
        text: message,
        duration: 2000,
        backgroundColor: type === "error" ? "#ff3333" : "#4CAF50",
        close: true,
        gravity: "bottom",
        position: "right"
    }).showToast();
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Initialize high score storage if not exists
    if (!localStorage.getItem("highScore")) {
        localStorage.setItem("highScore", JSON.stringify({ cpm: 0, wpm: 0, accuracy: 0 }));
    }
    
    init();
});