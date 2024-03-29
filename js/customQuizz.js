const container = document.querySelector('.container');
const questionElement = document.querySelector('.question');
const optionsElement = document.querySelector('.responses');
const timerElement = document.querySelector('.timer');
const stepElement = document.querySelector('.step');
const skipButton = document.querySelector('.skip input[type="button"]');
const backgroundMusic = document.getElementById('backgroundMusic');
const questionTime = 20;
let timerInterval;
let currentQuestionIndex, score, questions;
const successAudio = new Audio('../music/yay-6326.mp3');
const errorAudio = new Audio('../music/windows-error-sound-effect-35894.mp3');

document.getElementById('uploadFile').addEventListener('change', handleFileUpload);


/*GERE LE CHARGEMENT DU FICHIER JSON D'UN QUIZZ PERSONNALISE IMPORTE*/
function handleFileUpload(event) {
    // Récupère le fichier sélectionné par l'utilisateur
    const file = event.target.files[0];

    if (file) {
        // Crée un objet FileReader pour lire le contenu du fichier
        const reader = new FileReader();

        // Lorsque le contenu du fichier est chargé avec succès
        reader.onload = function (e) {
            // Stocke le contenu du fichier dans la variable fileContent
            const fileContent = e.target.result;

            try {
                // Tente de parser le contenu du fichier JSON
                const parsedData = JSON.parse(fileContent);

                // Vérifie si les données JSON sont conformes à la structure attendue
                if (parsedData && parsedData.quiz && parsedData.quiz.questions) {
                    // Stocke les questions du quiz dans la variable questions
                    questions = parsedData.quiz.questions;

                    // Mélange les questions pour les rendre aléatoires
                    shuffle(questions);

                    // Démarre le quiz
                    startQuiz();
                } else {
                    // Affiche une erreur si la structure JSON n'est pas conforme
                    console.error("Le fichier JSON ne contient pas les données attendues.");
                }
            } catch (error) {
                // Affiche une erreur en cas d'échec du parsing JSON
                console.error("Erreur lors de la lecture du fichier JSON", error);
            }
        };

        // Lit le contenu du fichier en tant que texte
        reader.readAsText(file);
    }
}


function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    backgroundMusic.play();

    // Masquez le champ d'entrée de fichier
    document.getElementById('uploadFile').style.display = 'none';

    // Affichez l'élément du quiz en utilisant style.display
    document.querySelector('.container').style.display = 'block';

    showNextQuestion();
}

function selectAnswer(selected, correctAnswer, button) {
    document.querySelectorAll('.responses button').forEach(btn => btn.disabled = true);

    if (selected === correctAnswer) {
        score++;
        button.style.backgroundColor = "green";
        console.log("Réponse correcte !");
        playAudio(successAudio);
    } else {
        button.style.backgroundColor = "red";
        console.log("Réponse incorrecte.");
        playAudio(errorAudio);
    }
}


function playAudio(audio) {
    backgroundMusic.pause();

    audio.play().then(() => {
        audio.onended = () => {
            backgroundMusic.play();

            // Déclenchez la transition vers la prochaine question ici
            currentQuestionIndex++;
            showNextQuestion();
            document.querySelectorAll('.responses button').forEach(btn => {
                btn.disabled = false;
                btn.style.backgroundColor = "";
            });
        };
    }).catch(e => {
        console.error("Erreur lors de la lecture de la musique", e);
    });
}

function showNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }

    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.question;
    optionsElement.innerHTML = '';
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => selectAnswer(option, question.answer, button));
        optionsElement.appendChild(button);
    });
    stepElement.textContent = `${currentQuestionIndex + 1}/${questions.length}`;

    resetTimer();
    startTimer();
}

function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerElement.textContent = formatTime(questionTime);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startTimer() {
    let timeLeft = questionTime;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            currentQuestionIndex++;
            showNextQuestion();
        }
    }, 500);
}

function endQuiz() {
    clearInterval(timerInterval);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;

    container.innerHTML = `
        <h1>Fin du quiz!</h1>
        <p>Votre score : ${score}</p>
        <div class="end-quiz-buttons">
            <button id="restartQuizButton">Recommencer le Quizz</button>
        </div>
    `;

    document.getElementById('restartQuizButton').addEventListener('click', restartQuiz);
}

function restartQuiz() {
    location.reload();
}

skipButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    currentQuestionIndex++;
    showNextQuestion();
});
