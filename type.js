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

let starttime, endtime, timer, speech;
let selectedText = "";
let countDown = 60;
let highScore = localStorage.getItem("highWPM") || 0;

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
            document.getElementById("timer").innerText = `⏳ Time Left: ${countDown}s`;
            textArea.disabled = false;
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

    if (speedTyped > highScore) {
        highScore = speedTyped;
        localStorage.setItem("highWPM", highScore);
        highScoreDisplay.innerText = `🏆 High Score: ${highScore} WPM`;
    }
}

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
    short: [
        "Success is not final, failure is not fatal.",
        "Dream big, work hard.",
        "The future belongs to those who prepare for it today."
    ],
    medium: [
        "A strong community is built on trust and mutual respect.",
        "Coding is not just about writing programs; it's about solving problems efficiently.",
        "Effective communication is key to success in any profession."
    ],
    long: [
        "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        "Innovation distinguishes between a leader and a follower. Keep challenging yourself to improve.",
        "Time is the most valuable resource we have. Use it wisely, for it can never be reclaimed."
    ]
};

// Function to Set Difficulty
function setDifficulty(level) {
    selectedText = texts[level][Math.floor(Math.random() * texts[level].length)];
    display.innerText = selectedText;
    textArea.value = "";
    textArea.disabled = false;
    textArea.focus();
    result.innerText="";
    countDown=60;
    document.getElementById("timer").innerText = `⏳ Time Left: ${countDown}s`;
    clearInterval(timer);
    starttime = new Date().getTime();
    StartTimer();
}
function isDarkModeActive() {
    return document.body.classList.contains("dark-mode");
}

// Event Listeners for Difficulty Selection
shortButton.addEventListener("click", () => setDifficulty("short"));
mediumButton.addEventListener("click", () => setDifficulty("medium"));
longButton.addEventListener("click", () => setDifficulty("long"));

const difficultyButtons = document.querySelectorAll(".Difficulties button");

difficultyButtons.forEach(button => {
    button.addEventListener("click", () => {
        difficultyButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
    });
});
