document.getElementById("analyze-btn").addEventListener("click", analyzeGame);
document.getElementById("clear-btn").addEventListener("click", clearInputs);

const fields = [
  "game-5-player1", "game-5-player2",
  "game-6-player1", "game-6-player2",
  "game-7-player1", "game-7-player2",
  "game-8-player1", "game-8-player2",
  "game-9-player1", "game-9-player2",
  "game-10-player1", "game-10-player2"
];

fields.forEach((fieldId, index) => {
  const nextFieldId = fields[index + 1];
  addInputFormatting(fieldId, nextFieldId);
});

function addInputFormatting(inputId, nextInputId) {
  const input = document.getElementById(inputId);
  input.addEventListener("input", () => {
    let value = input.value.replace(/[^0-9]/g, "");
    if (value.length === 0) input.value = "";
    else if (value.length === 1) input.value = value + ".";
    else if (value.length > 1) input.value = value.slice(0, 1) + "." + value.slice(1, 3);

    if (input.value.length === 4 && nextInputId) {
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) nextInput.focus();
    }
  });
}

function clearInputs() {
  document.querySelectorAll("input").forEach(input => input.value = "");
  document.getElementById("result").innerHTML = "<p>Рекомендации будут здесь.</p>";
  document.getElementById("ai-prediction").innerHTML = "";
}

function analyzeGame() {
  const games = [];
  for (let i = 5; i <= 10; i++) {
    const player1 = parseFloat(document.getElementById(`game-${i}-player1`).value);
    const player2 = parseFloat(document.getElementById(`game-${i}-player2`).value);

    if (isNaN(player1) || isNaN(player2)) {
      document.getElementById("result").innerHTML = "<p>Пожалуйста, введите все коэффициенты для игр.</p>";
      return;
    }

    games.push({ player1, player2 });
  }

  const prediction = predictWinnerWithHistory(games);

  if (prediction.winner) {
    document.getElementById("ai-prediction").innerHTML =
      `<span style="color: green;">🤖 Прогноз AI: Победит Игрок ${prediction.winner} (уверенность: ${prediction.confidence}%)</span>`;
  } else {
    document.getElementById("ai-prediction").innerHTML =
      `<span style="color: green;">🤖 Прогноз AI: Недостаточно данных для точного прогноза.</span>`;
  }

  localStorage.setItem("lastAnalysis", JSON.stringify(games));
}

// Базовая логика предсказания
function predictWinner(games) {
  let trend1 = 0, trend2 = 0;

  for (let i = 1; i < games.length; i++) {
    const prev = games[i - 1], curr = games[i];
    const drop1 = prev.player1 - curr.player1;
    const drop2 = prev.player2 - curr.player2;
    if (drop1 > 0) trend1 += drop1;
    if (drop2 > 0) trend2 += drop2;
  }

  const avg1 = games.reduce((sum, g) => sum + g.player1, 0) / games.length;
  const avg2 = games.reduce((sum, g) => sum + g.player2, 0) / games.length;

  const imp1 = 1 / avg1, imp2 = 1 / avg2;
  const total = imp1 + imp2;

  const prob1 = (imp1 / total) + trend1 * 0.01;
  const prob2 = (imp2 / total) + trend2 * 0.01;

  if (Math.abs(prob1 - prob2) < 0.05) return { winner: null };
  const winner = prob1 > prob2 ? 1 : 2;
  const confidence = (Math.max(prob1, prob2) * 100).toFixed(1);
  return { winner, confidence };
}

// С учётом истории
function predictWinnerWithHistory(games) {
  const base = predictWinner(games);
  const history = JSON.parse(localStorage.getItem("predictionHistory") || "[]");

  const total = history.length;
  const correct = history.filter(e => {
    const pred = e.prediction.includes("Игрок 1") ? 1 : 2;
    return (pred === 1 && e.outcome === "Победил") || (pred === 2 && e.outcome === "Победил");
  }).length;

  const accuracy = total ? correct / total : 1;
  if (base.winner) base.confidence = (parseFloat(base.confidence) * accuracy).toFixed(1);
  return base;
}

// История — кнопки
const resultSection = document.querySelector(".result-section");
const btnBox = document.createElement("div");
btnBox.style.marginTop = "15px";

const winBtn = document.createElement("button");
winBtn.textContent = "Победил";
winBtn.style.marginRight = "10px";

const loseBtn = document.createElement("button");
loseBtn.textContent = "Проиграл";

btnBox.appendChild(winBtn);
btnBox.appendChild(loseBtn);
resultSection.appendChild(btnBox);

winBtn.addEventListener("click", () => savePredictionResult("Победил"));
loseBtn.addEventListener("click", () => savePredictionResult("Проиграл"));

function savePredictionResult(outcome) {
  const text = document.getElementById("ai-prediction").textContent;
  if (!text.includes("Игрок")) return;

  const games = [];
  for (let i = 5; i <= 10; i++) {
    const p1 = parseFloat(document.getElementById(`game-${i}-player1`).value);
    const p2 = parseFloat(document.getElementById(`game-${i}-player2`).value);
    games.push({ player1: p1, player2: p2 });
  }

  const record = {
    date: new Date().toISOString(),
    prediction: text,
    outcome,
    coefficients: games
  };

  const history = JSON.parse(localStorage.getItem("predictionHistory") || "[]");
  history.push(record);
  localStorage.setItem("predictionHistory", JSON.stringify(history));
  alert("Результат сохранён в историю.");
}
