// Game state
let gameState = {
    currentScreen: 'loading',
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [], 
    startTime: null,
    endTime: null,
    timer: null,
    timeLeft: 600, // 10 minutes fixed
    totalTime: 600,
    playerName: null
};

// DOM Elements
const screens = {
    loading: document.getElementById('loading-screen'),
    notification: document.getElementById('notification-screen'),
    mainMenu: document.getElementById('main-menu'),
    difficulty: document.getElementById('difficulty-screen'),
    rankingRegistration: document.getElementById('ranking-registration'),
    game: document.getElementById('game-screen'),
    results: document.getElementById('results-screen'),
    ranking: document.getElementById('ranking-screen'),
    contribution: document.getElementById('contribution-screen')
};

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Game initializing...');
    initializeGame();
    setupEventListeners();
});

function initializeGame() {
    console.log('🎮 Starting game initialization...');
    
    // Hiển thị loading screen
    showScreen('loading');
    
    // Simulate loading và load notification
    setTimeout(() => {
        console.log('📝 Loading notification...');
        loadNotification();
    }, 1500);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Play button
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', startGame);
        console.log('✅ Play button listener added');
    }
    
    // Setup answer buttons
    document.querySelectorAll('.btn-answer').forEach(button => {
        button.addEventListener('click', function() {
            const answer = this.getAttribute('data-answer');
            if (answer) {
                selectAnswer(answer);
            }
        });
    });
    
    // Navigation
    document.getElementById('prev-question')?.addEventListener('click', showPreviousQuestion);
    document.getElementById('next-question')?.addEventListener('click', showNextQuestion);
    document.getElementById('submit-answers')?.addEventListener('click', submitAnswers);
    
    // Navigation buttons
    const closeNotificationBtn = document.getElementById('close-notification');
    if (closeNotificationBtn) {
        closeNotificationBtn.addEventListener('click', () => {
            console.log('📌 Closing notification, going to main menu');
            showScreen('mainMenu');
        });
    }
    
    const quickPlayBtn = document.getElementById('quick-play-btn');
    if (quickPlayBtn) {
        quickPlayBtn.addEventListener('click', () => {
            console.log('🎯 Quick play selected');
            gameState.gameMode = 'quick';
            showScreen('difficulty');
        });
    }
    
    const rankingPlayBtn = document.getElementById('ranking-play-btn');
    if (rankingPlayBtn) {
        rankingPlayBtn.addEventListener('click', () => {
            console.log('🏆 Ranking play selected');
            showScreen('rankingRegistration');
        });
    }
    
    const contributionBtn = document.getElementById('contribution-btn');
    if (contributionBtn) {
        contributionBtn.addEventListener('click', () => {
            console.log('📝 Contribution selected');
            showScreen('contribution');
            initializeContributionForm();
        });
    }
    
    // Các event listeners khác...
    document.getElementById('back-to-menu')?.addEventListener('click', () => {
        showScreen('mainMenu');
    });
    
    document.getElementById('back-from-ranking')?.addEventListener('click', () => {
        showScreen('mainMenu');
    });
    
    document.getElementById('back-from-contribution')?.addEventListener('click', () => {
        showScreen('mainMenu');
    });
    
    // Difficulty selection
    document.querySelectorAll('.btn-difficulty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('🎯 Difficulty selected:', e.target.dataset.difficulty);
            gameState.difficulty = e.target.dataset.difficulty;
            startGame();
        });
    });
    
    // Ranking registration
    const rankingForm = document.getElementById('ranking-form');
    if (rankingForm) {
        rankingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const playerName = document.getElementById('player-name')?.value;
            const difficulty = document.getElementById('ranking-difficulty')?.value;
            
            if (!playerName) {
                alert('Vui lòng nhập tên người chơi!');
                return;
            }
            
            console.log('🏆 Starting ranking game:', { playerName, difficulty });
            gameState.playerName = playerName;
            gameState.difficulty = difficulty;
            gameState.gameMode = 'ranking';
            startGame();
        });
    }
    
    // Game controls
    document.getElementById('prev-question')?.addEventListener('click', showPreviousQuestion);
    document.getElementById('next-question')?.addEventListener('click', showNextQuestion);
    document.getElementById('submit-answers')?.addEventListener('click', submitAnswers);
    
    // Answer buttons
    document.querySelectorAll('.btn-answer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const answer = e.target.dataset.answer;
            console.log('✅ Answer selected:', answer);
            selectAnswer(answer);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Results actions
    document.getElementById('play-again')?.addEventListener('click', () => {
        console.log('🔄 Playing again');
        if (gameState.gameMode === 'ranking') {
            showScreen('rankingRegistration');
        } else {
            showScreen('difficulty');
        }
    });
    
    document.getElementById('view-ranking')?.addEventListener('click', () => {
        console.log('📊 Viewing ranking');
        showRanking();
    });
    
    document.getElementById('back-to-main')?.addEventListener('click', () => {
        console.log('🏠 Going back to main menu');
        showScreen('mainMenu');
    });
    
    // Ranking screen
    document.getElementById('back-from-ranking-list')?.addEventListener('click', () => {
        showScreen('results');
    });
    
    // Contribution
    document.getElementById('add-question')?.addEventListener('click', addContributionForm);
    document.getElementById('submit-contributions')?.addEventListener('click', submitContributions);
    
    console.log('✅ All event listeners setup completed');
}

function showScreen(screenName) {
    console.log('🔄 Switching to screen:', screenName);
    
    // Hide all screens
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
            console.log('❌ Hiding screen:', screen.id);
        }
    });
    
    // Show target screen
    const targetScreen = screens[screenName];
    if (targetScreen) {
        targetScreen.classList.add('active');
        gameState.currentScreen = screenName;
        console.log('✅ Showing screen:', screenName);
    } else {
        console.error('❌ Screen not found:', screenName);
        // Fallback to main menu if screen not found
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) {
            mainMenu.classList.add('active');
            gameState.currentScreen = 'mainMenu';
        }
    }
}

async function loadNotification() {
    try {
        console.log('📡 Fetching notification from API...');
        const response = await fetch('/api/notification');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const notification = await response.json();
        console.log('📝 Notification data:', notification);
        
        if (notification.active) {
            console.log('🔔 Notification is active, showing...');
            showScreen('notification');
            displayNotification(notification);
        } else {
            console.log('🔕 Notification is inactive, skipping to main menu');
            showScreen('mainMenu');
        }
        
    } catch (error) {
        console.error('❌ Error loading notification:', error);
        
        // Fallback to default notification
        console.log('🔄 Using fallback notification');
        const fallbackNotification = {
            active: true,
            title: 'Chào mừng đến với Quiz Game!',
            content: 'Hãy thử thách kiến thức của bạn với hàng ngàn câu hỏi thú vị.\n\nChọn chế độ chơi nhanh để luyện tập hoặc tham gia xếp hạng để cạnh tranh với người chơi khác.',
            image: '',
            type: 'info',
            duration: 0
        };
        
        showScreen('notification');
        displayNotification(fallbackNotification);
    }
}

function displayNotification(notification) {
    console.log('🎨 Displaying notification:', notification);
    
    const notificationContent = document.getElementById('notification-content');
    if (!notificationContent) {
        console.error('❌ Notification content element not found');
        showScreen('mainMenu');
        return;
    }

    const contentWithLineBreaks = notification.content.replace(/\n/g, '<br>');
    
    let html = '';
    
    if (notification.image) {
        html += `<img src="${notification.image}" alt="Welcome" class="notification-image" style="max-width: 100%; border-radius: 10px; margin: 20px 0;" onerror="this.style.display='none'">`;
    }
    
    if (notification.title) {
        html += `<h2>${notification.title}</h2>`;
    }
    
    if (notification.content) {
        html += `<div style="font-size: 1.1em; line-height: 1.6; margin: 15px 0;">${contentWithLineBreaks}</div>`;
    }
    
    notificationContent.innerHTML = html;
    console.log('✅ Notification content updated');
    
    // Add notification type class
    const notificationScreen = document.getElementById('notification-screen');
    if (notificationScreen) {
        notificationScreen.className = `screen active notification-${notification.type}`;
    }
    
    // Auto close if duration is set
    if (notification.duration > 0) {
        console.log(`⏰ Auto-closing notification in ${notification.duration} seconds`);
        setTimeout(() => {
            console.log('🔄 Auto-closing notification');
            showScreen('mainMenu');
        }, notification.duration * 1000);
    }
}

// HÀM LẤY THỜI GIAN TỪ CÀI ĐẶT
async function getGameTimeSettings() {
    try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to load settings');
        
        const settings = await response.json();
        console.log('⏰ Game time settings:', settings.gameTime);
        
        return settings.gameTime || {
            easy: 600,   // 10 phút mặc định
            medium: 480, // 8 phút mặc định
            hard: 360    // 6 phút mặc định
        };
    } catch (error) {
        console.error('❌ Error loading game time settings:', error);
        // Trả về thời gian mặc định nếu có lỗi
        return {
            easy: 600,
            medium: 480, 
            hard: 360
        };
    }
}

// Sửa lại hàm startGame
async function startGame() {
    console.log('🎮 Starting game...');
    try {
        // Reset game state
        gameState.questions = [];
        gameState.currentQuestionIndex = 0;
        gameState.userAnswers = [];
        gameState.startTime = Date.now();
        
        console.log('Fetching questions...');
        const response = await fetch('/api/questions');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const questions = await response.json();
        console.log('Loaded questions:', questions);
        
        if (!questions || questions.length === 0) {
            throw new Error('No questions available');
        }

        // Random 10 questions
        gameState.questions = shuffleArray(questions).slice(0, 17);
        console.log('Selected questions:', gameState.questions);
        
        gameState.userAnswers = new Array(17).fill(null);
        
        // Show game screen
        showScreen('game');
        
        // Display first question
        showQuestion();
        
        // Start timer
        startTimer();
        
    } catch (error) {
        console.error('Error starting game:', error);
        alert('Có lỗi xảy ra khi tải câu hỏi. Vui lòng thử lại sau.');
        showScreen('mainMenu');
    }
}

// Sửa lại hàm showQuestion
function showQuestion() {
    const question = gameState.questions[gameState.currentQuestionIndex];
    if (!question) {
        console.error('No question found at index:', gameState.currentQuestionIndex);
        return;
    }

    // Hiển thị số câu hỏi
    const questionCounter = document.getElementById('question-counter');
    if (questionCounter) {
        questionCounter.textContent = `Câu ${gameState.currentQuestionIndex + 1}/${gameState.questions.length}`;
    }

    // Hiển thị câu hỏi
    const questionText = document.getElementById('question-text');
    if (questionText) {
        questionText.textContent = question.question;
    }

    // Hiển thị các đáp án
    const answerLetters = ['A', 'B', 'C', 'D'];
    answerLetters.forEach((letter, index) => {
        const button = document.getElementById(`answer-${letter.toLowerCase()}`);
        if (button && question.answers[index]) {
            button.textContent = `${letter}. ${question.answers[index]}`;
            button.classList.remove('selected');
            if (gameState.userAnswers[gameState.currentQuestionIndex] === letter) {
                button.classList.add('selected');
            }
        }
    });

    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');
    const submitBtn = document.getElementById('submit-answers');
    
    const isFirstQuestion = gameState.currentQuestionIndex === 0;
    const isLastQuestion = gameState.currentQuestionIndex === gameState.questions.length - 1;
    
    if (prevBtn) prevBtn.style.display = isFirstQuestion ? 'none' : 'block';
    if (nextBtn) nextBtn.style.display = isLastQuestion ? 'none' : 'block';
    if (submitBtn) submitBtn.style.display = isLastQuestion ? 'block' : 'none';
}

function selectAnswer(answer) {
    console.log('Selected answer:', answer);
    
    if (!gameState.questions[gameState.currentQuestionIndex]) {
        console.error('No question found');
        return;
    }

    // Cập nhật đáp án đã chọn
    gameState.userAnswers[gameState.currentQuestionIndex] = answer;

    // Xóa trạng thái selected của tất cả các nút
    document.querySelectorAll('.btn-answer').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Thêm trạng thái selected cho nút được chọn
    const selectedButton = document.querySelector(`button[data-answer="${answer}"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
}

function showNextQuestion() {
    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
        gameState.currentQuestionIndex++;
        showQuestion();
    }
}

function showPreviousQuestion() {
    if (gameState.currentQuestionIndex > 0) {
        gameState.currentQuestionIndex--;
        showQuestion();
    }
}

function startTimer() {
    clearInterval(gameState.timer);
    
    // Cập nhật timer display ngay lập tức
    updateTimerDisplay();
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            console.log('⏰ Time is up! Auto-submitting...');
            autoSubmitGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;
    
    // Hiển thị thời gian dạng MM:SS
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Cảnh báo màu sắc dựa trên phần trăm thời gian còn lại
    const percentageLeft = (gameState.timeLeft / gameState.totalTime) * 100;
    
    timerElement.classList.remove('timer-warning', 'timer-critical', 'timer-normal');
    
    if (percentageLeft <= 20) {
        timerElement.classList.add('timer-critical');
    } else if (percentageLeft <= 40) {
        timerElement.classList.add('timer-warning');
    } else {
        timerElement.classList.add('timer-normal');
    }
}

function autoSubmitGame() {
    console.log('🔄 Auto-submitting game due to time out');
    
    // Tự động chọn đáp án ngẫu nhiên cho những câu chưa trả lời
    gameState.questions.forEach((_, index) => {
        if (gameState.userAnswers[index] === null) {
            const answers = ['A', 'B', 'C', 'D'];
            const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
            gameState.userAnswers[index] = randomAnswer;
            console.log(`🤖 Auto-selected answer ${randomAnswer} for question ${index + 1}`);
        }
    });
    
    // Nộp bài ngay lập tức
    submitAnswers();
}

async function submitAnswers() {
    clearInterval(gameState.timer);
    gameState.endTime = Date.now();
    
    // Calculate results
    const totalTime = Math.floor((gameState.endTime - gameState.startTime) / 1000);
    const timeUsed = gameState.totalTime - gameState.timeLeft;
    let correctCount = 0;
    
    gameState.questions.forEach((question, index) => {
        if (gameState.userAnswers[index] === question.correctAnswer) {
            correctCount++;
        }
    });
    
    const wrongCount = gameState.questions.length - correctCount;
    const score = Math.round((correctCount / gameState.questions.length) * 1000);
    
    console.log('📊 Game results:', { 
        score, 
        correctCount, 
        wrongCount, 
        totalTime: timeUsed,
        timeLeft: gameState.timeLeft 
    });
    
    // Display results
    const updateResult = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };
    
    updateResult('score', score);
    updateResult('correct-answers', correctCount);
    updateResult('wrong-answers', wrongCount);
    updateResult('total-time', `${timeUsed}s`);
    
    // Hiển thị thông báo nếu hết thời gian
    if (gameState.timeLeft <= 0) {
        const resultsContainer = document.getElementById('results-screen');
        if (resultsContainer) {
            const timeOutMessage = document.createElement('div');
            timeOutMessage.className = 'time-out-message';
            timeOutMessage.innerHTML = `
                <div class="alert alert-warning">
                    <strong>⏰ Hết thời gian!</strong> Bài làm đã được tự động nộp.
                </div>
            `;
            resultsContainer.querySelector('.results-container').prepend(timeOutMessage);
        }
    }
    
    // Save ranking if in ranking mode
    if (gameState.gameMode === 'ranking') {
        await saveRanking(score, timeUsed, correctCount);
    }
    
    showScreen('results');
}

async function saveRanking(score, time, correctCount) {
    try {
        const rankingData = {
            playerName: gameState.playerName || 'Anonymous',
            score: score,
            time: time,
            correctAnswers: correctCount,
            totalQuestions: gameState.questions.length,
            date: new Date().toISOString()
        };
        
        const response = await fetch('/api/rankings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rankingData)
        });
        
        if (!response.ok) throw new Error('Failed to save ranking');
        
    } catch (error) {
        console.error('Error saving ranking:', error);
    }
}

// Contribution functionality
function initializeContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;

    formsContainer.innerHTML = '';
    addContributionForm();
    
    // Thêm nút submit và add new
    const actionButtons = document.createElement('div');
    actionButtons.className = 'contribution-actions';
    actionButtons.innerHTML = `
        <button id="add-question" class="btn btn-primary">
            <i class="fas fa-plus"></i> Thêm câu hỏi
        </button>
        <button id="submit-contributions" class="btn btn-success">
            <i class="fas fa-paper-plane"></i> Gửi đóng góp
        </button>
    `;
    formsContainer.after(actionButtons);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    for (const form of forms) {
        const index = form.dataset.index;
        
        const question = document.getElementById(`question-${index}`)?.value?.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value?.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value?.trim(); 
        const answerC = document.getElementById(`answer-c-${index}`)?.value?.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value?.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;

        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert('Vui lòng điền đầy đủ thông tin cho tất cả câu hỏi');
            return;
        }

        contributions.push({
            question,
            answers: [answerA, answerB, answerC, answerD],
            correctAnswer
        });
    }

    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });

        if (!response.ok) throw new Error('Failed to submit');

        alert('Cảm ơn bạn đã đóng góp câu hỏi!');
        showScreen('mainMenu');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}

function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

function removeContributionForm(index) {
    const forms = document.querySelectorAll('.contribution-form');
    if (forms.length <= 1) {
        alert('Cần ít nhất một câu hỏi!');
        return;
    }
    
    const form = document.querySelector(`.contribution-form[data-index="${index}"]`);
    if (form) {
        form.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            form.remove();
            reindexContributionForms();
        }, 300);
    }
}

function reindexContributionForms() {function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;
    
    const formIndex = document.querySelectorAll('.contribution-form').length;
    
    const formHTML = `
        <div class="contribution-form" data-index="${formIndex}">
            <div class="form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa câu hỏi
                </button>
            </div>
            
            <div class="form-group">
                <label for="question-${formIndex}">Câu hỏi:</label>
                <textarea id="question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;
    
    formsContainer.insertAdjacentHTML('beforeend', formHTML);
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}
    const forms = document.querySelectorAll('.contribution-form');
    forms.forEach((form, newIndex) => {
        form.setAttribute('data-index', newIndex);
        
        // Update all IDs and labels
        const elements = form.querySelectorAll('[id]');
        elements.forEach(element => {
            const oldId = element.id;
            const newId = oldId.replace(/-\d+$/, `-${newIndex}`);
            element.id = newId;
            
            // Update label for attribute
            const label = form.querySelector(`label[for="${oldId}"]`);
            if (label) {
                label.setAttribute('for', newId);
            }
        });
        
        // Update header
        const header = form.querySelector('h3');
        if (header) {
            header.textContent = `Câu hỏi ${newIndex + 1}`;
        }
        
        // Update remove button onclick
        const removeBtn = form.querySelector('.remove-question');
        if (removeBtn) {
            removeBtn.setAttribute('onclick', `removeContributionForm(${newIndex})`);
        }
    });
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form');
    const contributions = [];
    
    // Validate all forms
    for (const form of forms) {
        const index = form.dataset.index;
        const question = document.getElementById(`question-${index}`)?.value.trim();
        const answerA = document.getElementById(`answer-a-${index}`)?.value.trim();
        const answerB = document.getElementById(`answer-b-${index}`)?.value.trim();
        const answerC = document.getElementById(`answer-c-${index}`)?.value.trim();
        const answerD = document.getElementById(`answer-d-${index}`)?.value.trim();
        const correctAnswer = document.getElementById(`correct-answer-${index}`)?.value;
        
        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho Câu hỏi ${parseInt(index) + 1}!`);
            return;
        }
        
        // Check for duplicate answers
        const answers = [answerA, answerB, answerC, answerD];
        const uniqueAnswers = new Set(answers.map(a => a.toLowerCase()));
        if (uniqueAnswers.size !== answers.length) {
            alert(`Câu hỏi ${parseInt(index) + 1} có đáp án trùng nhau!`);
            return;
        }
        
        contributions.push({
            question: question,
            answers: answers,
            correctAnswer: correctAnswer
        });
    }
    
    try {
        const response = await fetch('/api/contributions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contributions)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('Đóng góp của bạn đã được gửi thành công! Cảm ơn bạn.');
            showScreen('mainMenu');
        } else {
            alert(result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error submitting contributions:', error);
        alert('Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}

// Keyboard input handler
function handleKeyboardInput(event) {
    if (gameState.currentScreen !== 'game') return;
    
    switch (event.key) {
        case '1':
        case 'a':
            selectAnswer('A');
            break;
        case '2':
        case 'b':
            selectAnswer('B');
            break;
        case '3':
        case 'c':
            selectAnswer('C');
            break;
        case '4':
        case 'd':
            selectAnswer('D');
            break;
        case 'ArrowLeft':
            showPreviousQuestion();
            break;
        case 'ArrowRight':
        case 'Enter':
            if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
                showNextQuestion();
            } else {
                submitAnswers();
            }
            break;
    }
}

// Utility functions
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Make functions globally available for HTML onclick
window.removeContributionForm = removeContributionForm;

// Debug function to check screen status
function debugScreens() {
    console.log('🔍 Screen Debug Info:');
    Object.entries(screens).forEach(([name, screen]) => {
        if (screen) {
            console.log(`- ${name}: ${screen.classList.contains('active') ? 'ACTIVE' : 'inactive'}`);
        } else {
            console.log(`- ${name}: NOT FOUND`);
        }
    });
    console.log('Current screen state:', gameState.currentScreen);
}

// Gọi debug để kiểm tra
setTimeout(debugScreens, 2000);

// Force show main menu after 3 seconds if stuck
setTimeout(() => {
    if (gameState.currentScreen === 'loading') {
        console.log('🔄 Force showing main menu due to timeout');
        showScreen('mainMenu');
    }
}, 3000);