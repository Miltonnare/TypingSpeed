const startButton = document.getElementById("Start");
const resetButton = document.getElementById("Reset");
const result = document.getElementById("Result");
const display = document.getElementById("display");
const textArea = document.getElementById("typeHere");
const readButton = document.getElementById("readButton");
const cancelButton = document.getElementById("cancelRead");
const toggleMode = document.getElementById("toggleMode");
const highScoreDisplay = document.getElementById("highScore");
const wpmCounter = document.getElementById("wpmCounter");
let timerDisplay = document.getElementById("timer");

let starttime, endtime, timer, speech;
let selectedText = "";
let countDown = 60;
// let highScore = localStorage.getItem("highWPM") || 0;

highScoreDisplay.innerText = `🏆 High Score: ${highScore} WPM`;

const sample = [
    "A meeting must be held before a project or support is given to a member and the quorum attending the meeting must agree.",
    "Every amount must be accounted for and every member must be aware of the ongoing projects.",
    "Special meetings may be called by the Chairperson or by a majority of the Executive Committee."
];

function StartTest() {
    selectedText = sample[Math.floor(Math.random() * sample.length)].trim();
    display.innerText = selectedText;
    textArea.value = "";
    textArea.style.color = "black";
    result.innerText = "";
    wpmCounter.innerText = "Speed: 0 WPM";
    countDown = 60;
    document.getElementById("timer").innerText = `⏳ Time Left: ${countDown}s`;
    clearInterval(timer);
    textArea.disabled = false;
    textArea.focus();
    starttime = new Date().getTime();
    StartTimer();
}

textArea.addEventListener("input", function () {
    if (!starttime) return;

    const typedText = this.value;
    const expectedPartialText = selectedText.substring(0, typedText.length);

    // Highlight incorrect text in red
    if (typedText !== expectedPartialText) {
        this.style.color = "red";
    } else {
        this.style.color = isDarkModeActive() ? "white" : "black"; 
    }
    if (typedText === selectedText) {
        clearInterval(timer); 
        textArea.disabled = true; 
        calculateWPM(false); 
        result.innerText = "✅ Completed!";
    }

    

    // Update live WPM
    endtime = new Date().getTime();
    calculateWPM(true);
});

function ResetTest() {
    textArea.value = "";
    display.innerText = "";
    result.innerText = "";
    wpmCounter.innerText = "Speed: 0 WPM";
    textArea.style.color = "black";
    starttime = null;
    countDown = 60;
    document.getElementById("timer").innerText = "";
    clearInterval(timer);
}

startButton.addEventListener("click", StartTest);
resetButton.addEventListener("click", ResetTest);

function StartTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (countDown > 0) {
            countDown--;
            timerDisplay.innerText = `⏳ Time Left: ${countDown}s`;
        } else {
            clearInterval(timer);
            textArea.disabled = true;
            result.innerText = "⏱️ Time's up!";
            calculateWPM();
        }
    }, 1000);
}

function calculateWPM(liveUpdate = false) {
    const timeTaken = (new Date().getTime() - starttime) / 1000; // in seconds
    const wordsTyped = textArea.value.trim().split(/\s+/).length;
    const speedTyped = (wordsTyped / (timeTaken / 60)).toFixed(2);

    if (liveUpdate) {
        wpmCounter.innerText = `Speed: ${speedTyped} WPM`;
        return;
    }

    result.innerText = `Final Speed: ${speedTyped} WPM`;

    let highScore = parseFloat(localStorage.getItem("highScore")) || 0;

    if (speedTyped > highScore) {
        localStorage.setItem("highScore", speedTyped);
        highScoreDisplay.innerText = `🏆 High Score: ${speedTyped} WPM`;
    }
}
// Load high score when the page loads
document.addEventListener("DOMContentLoaded", function () {
    let storedHighScore = localStorage.getItem("highScore") || 0;
    document.getElementById("highScore").innerText = `🏆 High Score: ${storedHighScore} WPM`;
});


// Read Aloud Feature
function readAloud() {
    if (!selectedText) {
        alert("⚠️ No text available to read!");
        return;
    }

    stopReading(); // Stop any ongoing speech before starting a new one

    speech = new SpeechSynthesisUtterance(selectedText);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speechSynthesis.speak(speech);
}

function stopReading() {
    speechSynthesis.cancel();
}

readButton.addEventListener("click", readAloud);
cancelButton.addEventListener("click", stopReading);

// Dark Mode Toggle
toggleMode.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

});

const shortButton = document.getElementById("short");
const mediumButton = document.getElementById("medium");
const longButton = document.getElementById("long");
const texts = {
    amateur: () => generateRandomText(11, 15, ["ear", "near", "real", "inner", "earn", "are", "nine", "alien", "lane", "learn"]),
    easy: () => generateRandomText(15, 17, ["apple", "table", "chair", "house", "light", "stone", "ocean", "field", "river"]),
    medium: () => generateRandomText(17, 20, ["garden", "planet", "laptop", "guitar", "breeze", "sprint", "frozen", "voyage", "forest", "silent"]),
    hard: () => generateRandomText(20, 23, ["mountain", "electric", "journey", "wildlife", "triangle", "enormous", "mystical", "puzzle", "adventure", "horizon"]),
    expert: () => generateRandomText(20, 23, ["synchronize", "wonderland", "hypothesis", "complexity", "revolution", "dimension", "catastrophe", "phenomenon", "algorithm", "perception"]),
    master: () => generateRandomText(20, 25, ["interdependent", "professor", "unbelievable", "extraordinary", "misconception", "philosopher", "contradiction", "transcendent", "metamorphosis", "procrastinate", "hallucination"])
};

function generateRandomText(minWords, maxWords, wordList) {
    let text = [];
    let wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    
    for (let i = 0; i < wordCount; i++) {
        text.push(wordList[Math.floor(Math.random() * wordList.length)]);
    }
    return text.join(' ');
}

function getTypingText(level) {
    return texts[level] ? texts[level]() : "Invalid level";
}

function setDifficulty(level) {
    let selectedText = getTypingText(level);
    if (selectedText === "Invalid level") {
        console.error(`Error: Invalid level '${level}' selected`);
        return;
    }
    let timerDisplay = document.getElementById("timer");

    if (!display || !textArea || !result || !timerDisplay) {
        console.error("Error: Required elements not found in the DOM");
        return;
    }

    display.innerText = selectedText;
    textArea.value = "";
    textArea.disabled = false;
    textArea.focus();
    result.innerText = "";
    
    let countDown = 60;
    timerDisplay.innerText = `⏳ Time Left: ${countDown}s`;
    clearInterval(timer);
    
    starttime = new Date().getTime();
    StartTimer();
}

// Dark mode checker
function isDarkModeActive() {
    return document.body.classList.contains("dark-mode");
}

// Event listeners for difficulty buttons
["amateur", "easy", "medium", "hard", "expert", "master"].forEach(level => {
    document.getElementById(level)?.addEventListener("click", () => setDifficulty(level));
});

// Event Listeners for Difficulty Selection

const difficultyButtons = document.querySelectorAll(".Difficulties button");

difficultyButtons.forEach(button => {
    button.addEventListener("click", () => {
        difficultyButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
    });
});

//store highscore in localstorage

document.addEventListener("DOMContentLoaded", function(){
    let highScore = localStorage.getItem('highScore') || 0;
    document.getElementById("highScore").innerHTML = `🏆 High Score: ${highScore} WPM`;
});

function updateHighScore(wpm){
    let highScore = localStorage.getItem('highScore') || 0;
    if(wpm>highScore){
        localStorage.setItem(`highScore, ${wpm}`);
        document.getElementById("highScore").innerText = `🏆 High Score: ${wpm} WPM`
    }
}