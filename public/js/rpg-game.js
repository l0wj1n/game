// RPG Quiz Game Engine
class RPGQuizGame {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.playerStats = {
            name: '',
            class: 'scholar',
            level: 1,
            hp: 100,
            maxHp: 100,
            exp: 0,
            expToNext: 100,
            correct: 0,
            wrong: 0,
            score: 0
        };
        this.selectedAnswer = null;
        this.gameStartTime = null;
        this.timeLimit = 30;
        this.timerInterval = null;
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.currentParticleColor = '#8B5CF6';
        this.wisdomQuotes = [
            "Tri thức là kho báu vô tận, mỗi câu hỏi là một chìa khóa mở ra cánh cửa hiểu biết mới.",
            "Học hỏi không bao giờ là muộn, mỗi kiến thức mới làm phong phú tâm hồn và trí tuệ.",
            "Thực tiễn là tiêu chuẩn của chân lý - tri thức chỉ có giá trị khi được áp dụng vào cuộc sống.",
            "Nhận thức là quá trình không ngừng, mỗi bước đi làm ta hiểu sâu hơn về thế giới xung quanh.",
            "Tri thức đúng đắn đến từ thực tiễn - hãy luôn kiểm nghiệm và áp dụng những gì đã học.",
            "Mỗi câu hỏi được trả lời là một viên gạch xây nên tòa lâu đài trí tuệ của bạn.",
            "Học tập là hành trình suốt đời, không có điểm kết thúc, chỉ có những đỉnh cao mới."
        ];
        this.encouragementQuotes = [
            "Sai cũng được – miễn là bạn không bỏ cuộc!",
            "Mỗi lần vấp ngã là một bước tiến gần hơn đến hiểu biết.",
            "Hít thở sâu, đọc kỹ lại đề – bạn làm được!",
            "Không ai giỏi ngay từ đầu – kiên trì là chìa khóa.",
            "Thử lại nào! Tri thức đến với người bền bỉ.",
            "Sai để học – học để đúng.",
            "Bạn đã đi được một đoạn rồi – tiếp tục thôi!",
            "Một câu sai không định nghĩa bạn – tiếp tục chiến đấu!",
            "Kiến thức luôn mỉm cười với người kiên nhẫn.",
            "Đường đến Hiền Triết bắt đầu từ những bước nhỏ."
        ];
        
        // Audio state
        this.isMuted = (localStorage.getItem('game-muted') === 'true');
        this.audio = {
            intro: null,
            gameplay: null,
            explanation: null,
            victory: null,
            gameover: null
        };
        
        // Character evolution stages
        this.characterStages = [
            { minCorrect: 0,  title: 'Tân Thủ' },
            { minCorrect: 3,  title: 'Học Viên' },
            { minCorrect: 6,  title: 'Học Giả Trẻ' },
            { minCorrect: 9,  title: 'Học Giả' },
            { minCorrect: 12, title: 'Hiền Giả' },
            { minCorrect: 15, title: 'Nhà Hiền Triết' }
        ];
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupThemeSelector();
        this.loadTheme();
        this.loadQuestions();
        this.setupAudio();
        // Start with intro mode (dark theme)
        document.body.classList.add('intro-mode');
        this.startLoading();
    }


    setupCanvas() {
        this.canvas = document.getElementById('particle-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            this.animateParticles();
        }
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    setupEventListeners() {
        // Start journey button → start immediately as Newbie
        document.getElementById('start-journey-btn')?.addEventListener('click', () => {
            // Remove intro mode (dark theme) and switch to light theme
            document.body.classList.remove('intro-mode');
            // Set default character info
            this.playerStats.name = this.playerStats.name?.trim() ? this.playerStats.name : 'Người Mới';
            this.playerStats.class = 'newbie';
            // Dừng nhạc intro và phát nhạc gameplay
            this.playMusic('gameplay');
            // Start game directly
            this.startGame();
        });

        // Character class selection
        document.querySelectorAll('.class-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const emoji = btn.dataset.emoji;
                const className = btn.dataset.class;
                document.querySelector('.avatar-circle').textContent = emoji;
                this.playerStats.class = className;
            });
        });

        // Begin game button (legacy from character screen) → also start immediately if present
        document.getElementById('begin-game-btn')?.addEventListener('click', () => {
            this.playerStats.name = this.playerStats.name?.trim() ? this.playerStats.name : 'Người Mới';
            this.playerStats.class = 'newbie';
            this.startGame();
        });

        // Answer buttons
        document.querySelectorAll('.answer-card').forEach(card => {
            card.addEventListener('click', () => {
                if (!this.selectedAnswer) {
                    this.selectAnswer(card.dataset.answer);
                }
            });
        });

        // Explanation screen close button
        document.getElementById('close-explanation')?.addEventListener('click', () => {
            this.closeExplanation();
        });

        // Play again buttons
        document.getElementById('play-again-btn')?.addEventListener('click', () => {
            this.resetGame();
            // Phát nhạc gameplay khi chơi lại
            this.playMusic('gameplay');
            this.startGame();
        });

        document.getElementById('retry-btn')?.addEventListener('click', () => {
            this.resetGame();
            // Phát nhạc gameplay khi retry
            this.playMusic('gameplay');
            this.startGame();
        });

        // Menu buttons
        document.getElementById('main-menu-btn')?.addEventListener('click', () => {
            this.resetGame();
            // Return to intro mode (dark theme)
            document.body.classList.add('intro-mode');
            this.showScreen('intro-screen');
            // Phát lại nhạc intro khi quay về menu
            this.playMusic('intro');
        });

        document.getElementById('gameover-menu-btn')?.addEventListener('click', () => {
            this.resetGame();
            // Return to intro mode (dark theme)
            document.body.classList.add('intro-mode');
            this.showScreen('intro-screen');
            // Phát lại nhạc intro khi quay về menu
            this.playMusic('intro');
        });

        // Video control
        const video = document.getElementById('video-background');
        if (video) {
            video.addEventListener('loadeddata', () => {
                video.play().catch(e => console.log('Video autoplay prevented:', e));
            });
        }

        // Sound toggle
        const soundBtn = document.getElementById('sound-toggle');
        if (soundBtn) {
            const refreshIcon = () => {
                soundBtn.textContent = this.isMuted ? '🔇' : '🔈';
                soundBtn.classList.toggle('muted', this.isMuted);
            };
            refreshIcon();
            soundBtn.addEventListener('click', () => {
                this.isMuted = !this.isMuted;
                localStorage.setItem('game-muted', String(this.isMuted));
                this.updateVolumes();
                refreshIcon();
            });
        }
    }

    setupAudio() {
        // Logic nhạc:
        // - Intro: Phát nhạc intro khi vào intro screen
        // - Sau khi nhấn "Bắt đầu hành trình" → phát nhạc gameplay
        // - Khi chọn đáp án (đúng/sai) → KHÔNG đổi nhạc, giữ nhạc gameplay
        // - Khi xem giải thích → KHÔNG đổi nhạc, giữ nhạc gameplay
        // - Khi thắng game → phát nhạc victory
        // - Khi thua game → phát nhạc gameover (động lực)
        const tracks = {
            // Intro: Nhạc ambient nhẹ nhàng, tạo không khí bắt đầu hành trình tri thức
            intro: 'https://files.catbox.moe/8bswry.mp3',
            
            // Gameplay: Nhạc nền khi đang trả lời câu hỏi (phát sau khi nhấn "Bắt đầu hành trình")
            gameplay: 'https://files.catbox.moe/3knyhz.mp3',
            
            // Explanation: Không sử dụng (không phát nhạc khi xem giải thích)
            explanation: 'https://files.catbox.moe/590wca.mp3',
            
            // Victory: Nhạc chiến thắng khi hoàn thành game
            victory: 'https://files.catbox.moe/8bswry.mp3',
            
            // Gameover: Nhạc động lực, cổ vũ bản thân khi thua game
            gameover: 'https://files.catbox.moe/590wca.mp3'
        };

        this.audio.intro = new Audio(tracks.intro);
        this.audio.gameplay = new Audio(tracks.gameplay);
        this.audio.explanation = new Audio(tracks.explanation);
        this.audio.victory = new Audio(tracks.victory);
        this.audio.gameover = new Audio(tracks.gameover);

        this.audio.intro.loop = true;
        this.audio.gameplay.loop = true;
        this.audio.explanation.loop = true;
        this.audio.victory.loop = false;
        this.audio.gameover.loop = true;

        this.updateVolumes();
    }

    updateVolumes() {
        const base = this.isMuted ? 0 : 0.25;
        Object.values(this.audio).forEach(a => { if (a) a.volume = base; });
    }

    stopAllMusic() {
        Object.values(this.audio).forEach(a => { if (a) { a.pause(); a.currentTime = 0; } });
    }

    playMusic(kind) {
        this.stopAllMusic();
        const track = this.audio[kind];
        if (track) {
            this.updateVolumes();
            track.play().catch(() => {});
        }
    }

    setupThemeSelector() {
        // Open theme modal
        document.getElementById('theme-selector-btn')?.addEventListener('click', () => {
            this.openThemeModal();
        });

        // Close theme modal
        document.getElementById('close-theme-modal')?.addEventListener('click', () => {
            this.closeThemeModal();
        });

        // Click outside to close
        document.getElementById('theme-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'theme-modal') {
                this.closeThemeModal();
            }
        });

        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.applyTheme(theme);
                this.closeThemeModal();
            });
        });
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('game-theme');
        if (savedTheme) {
            this.applyTheme(savedTheme);
            // Mark selected theme
            document.querySelectorAll('.theme-option').forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.theme === savedTheme) {
                    option.classList.add('selected');
                }
            });
        }
    }

    applyTheme(themeName) {
        document.body.setAttribute('data-theme', themeName);
        localStorage.setItem('game-theme', themeName);
        
        // Update selected state
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.theme === themeName) {
                option.classList.add('selected');
            }
        });

        // Update particle colors based on theme
        this.updateParticleColors(themeName);
    }

    updateParticleColors(themeName) {
        const themeColors = {
            'pink-blue': '#EC4899',
            'purple-gold': '#8B5CF6',
            'green-cyan': '#10B981',
            'red-orange': '#EF4444',
            'blue-purple': '#3B82F6',
            'yellow-pink': '#FBBF24',
            'professional-blue': '#2563EB',
            'elegant-purple': '#7C3AED',
            'fresh-green': '#059669'
        };
        
        this.currentParticleColor = themeColors[themeName] || '#6366F1';
    }

    openThemeModal() {
        const modal = document.getElementById('theme-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeThemeModal() {
        const modal = document.getElementById('theme-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    startLoading() {
        const progressBar = document.getElementById('loading-progress');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.showScreen('intro-screen');
                    // Phát nhạc intro khi vào intro screen
                    this.playMusic('intro');
                }, 500);
            }
            if (progressBar) progressBar.style.width = progress + '%';
        }, 200);
    }

    async loadQuestions() {
        try {
            const response = await fetch('/api/questions');
            const data = await response.json();
            
            if (Array.isArray(data)) {
                this.questions = data.map(q => ({
                    ...q,
                    id: q.id || Math.random().toString()
                }));
            } else if (data.questions) {
                this.questions = data.questions;
            }
            
            // Shuffle questions for variety
            this.shuffleArray(this.questions);
            
            console.log(`Loaded ${this.questions.length} questions`);
        } catch (error) {
            console.error('Error loading questions:', error);
            alert('Không thể tải câu hỏi. Vui lòng thử lại!');
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    startGame() {
        if (this.questions.length === 0) {
            alert('Chưa có câu hỏi. Vui lòng đợi...');
            return;
        }

        // Check for admin skip to last
        const skipToLast = localStorage.getItem('adminSkipToLast');
        if (skipToLast === 'true') {
            // Skip to last question
            this.currentQuestionIndex = this.questions.length - 1;
            localStorage.removeItem('adminSkipToLast'); // Remove flag after use
        } else {
            this.currentQuestionIndex = 0;
        }

        // Ensure default character identity
        if (!this.playerStats.name || !this.playerStats.name.trim()) {
            this.playerStats.name = 'Người Mới';
        }
        if (!this.playerStats.class) {
            this.playerStats.class = 'newbie';
        }

        this.playerStats.hp = 100;
        this.playerStats.maxHp = 100;
        this.playerStats.exp = 0;
        this.playerStats.correct = 0;
        this.playerStats.wrong = 0;
        this.playerStats.score = 0;
        this.gameStartTime = Date.now();
        this.updateStageHUD();
        
        this.showScreen('game-screen');
        this.loadQuestion();
        // Nhạc gameplay đã được phát khi nhấn "Bắt đầu hành trình", không cần phát lại ở đây
    }

    updateStageHUD() {
        const stage = this.getCurrentStageTitle();
        const hudStage = document.getElementById('hud-stage');
        if (hudStage) hudStage.textContent = stage;
        const hudName = document.getElementById('hud-name');
        if (hudName && this.playerStats.name) hudName.textContent = this.playerStats.name;
    }

    getCurrentStageTitle() {
        const correct = this.playerStats.correct;
        let current = this.characterStages[0].title;
        for (const stage of this.characterStages) {
            if (correct >= stage.minCorrect) current = stage.title;
        }
        return current;
    }

    loadQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame(true);
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        this.selectedAnswer = null;

        // Random challenge: trick label only (25%)
        this.currentChallenge = Math.random() < 0.25 ? 'trick' : 'normal';
        this.renderQuestion(question);
        // Update HUD
        this.updateHUD();
    }

    renderQuestion(question) {
        if (!question) return;
        document.getElementById('question-number').textContent = 
            `Câu ${this.currentQuestionIndex + 1}/${this.questions.length}`;
        const questionTextEl = document.getElementById('question-text');
        if (this.currentChallenge === 'trick') {
            questionTextEl.textContent = `🧩 Thử thách mẹo: ${question.question}`;
        } else {
            questionTextEl.textContent = question.question;
        }

        const answers = ['A', 'B', 'C', 'D'];
        answers.forEach(letter => {
            const answerText = document.getElementById(`answer-${letter.toLowerCase()}-text`);
            const answerCard = document.querySelector(`[data-answer="${letter}"]`);
            if (answerText && question.answers[letter.charCodeAt(0) - 65]) {
                answerText.textContent = question.answers[letter.charCodeAt(0) - 65];
            }
            if (answerCard) {
                answerCard.classList.remove('selected', 'correct', 'incorrect');
                answerCard.disabled = false;
            }
        });
        this.startTimer();
    }

    // (removed obstacle mini-game)

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        let timeLeft = this.timeLimit;
        const timerText = document.getElementById('timer-text');
        const timerProgress = document.getElementById('timer-progress');
        const circumference = 2 * Math.PI * 45;

        const updateTimer = () => {
            if (timeLeft <= 0) {
                this.handleTimeOut();
                return;
            }

            if (timerText) timerText.textContent = timeLeft;
            
            const offset = circumference - (timeLeft / this.timeLimit) * circumference;
            if (timerProgress) {
                timerProgress.style.strokeDashoffset = offset;
                
                // Change color based on time
                timerProgress.classList.remove('warning', 'critical');
                if (timeLeft <= 10) {
                    timerProgress.classList.add('critical');
                } else if (timeLeft <= 15) {
                    timerProgress.classList.add('warning');
                }
            }

            timeLeft--;
        };

        updateTimer();
        this.timerInterval = setInterval(updateTimer, 1000);
    }

    selectAnswer(answer) {
        if (this.selectedAnswer) return;

        this.selectedAnswer = answer;
        
        // Visual feedback với hiệu ứng xoay
        document.querySelectorAll('.answer-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.answer === answer) {
                card.classList.add('selected');
                // Thêm hiệu ứng bounce
                card.style.animation = 'answer-selected 0.5s ease';
            }
        });

        // Auto-submit after short delay
        setTimeout(() => {
            this.checkAnswer();
        }, 500);
    }

    checkAnswer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.correctAnswer;

        // Show correct/incorrect
        document.querySelectorAll('.answer-card').forEach(card => {
            card.disabled = true;
            if (card.dataset.answer === question.correctAnswer) {
                card.classList.add('correct');
                this.createParticleEffect(card, 'correct');
            } else if (card.dataset.answer === this.selectedAnswer && !isCorrect) {
                card.classList.add('incorrect');
                this.createParticleEffect(card, 'incorrect');
            }
        });

        // Update stats
        if (isCorrect) {
            this.playerStats.correct++;
            // Base EXP
            let gainedExp = 20;
            // Bonus for trick challenge
            if (this.currentChallenge === 'trick') {
                gainedExp += 10;
            }
            this.playerStats.exp += gainedExp;
            this.playerStats.score += 100;
            this.showDamageNumber('+20 EXP', '#8B5CF6', this.getRandomPosition());
            if (gainedExp > 20) {
                this.showDamageNumber(`+${gainedExp - 20} EXP (Thử thách)`, '#7C3AED', this.getRandomPosition());
            }
            this.showDamageNumber('+100', '#10B981', this.getRandomPosition());
            
            // Level up check
            if (this.playerStats.exp >= this.playerStats.expToNext) {
                this.levelUp();
            }
        } else {
            this.playerStats.wrong++;
            const damage = 15;
            this.playerStats.hp = Math.max(0, this.playerStats.hp - damage);
            this.showDamageNumber(`-${damage} HP`, '#EF4444', this.getRandomPosition());
            this.maybeShowEncouragement();
            
            if (this.playerStats.hp <= 0) {
                setTimeout(() => this.endGame(false), 1500);
                return;
            }
        }

        this.updateHUD();
        this.updateStageHUD();

        // Show explanation screen after answer feedback
        setTimeout(() => {
            this.showExplanation(question, isCorrect);
        }, 2000);
    }

    showExplanation(question, isCorrect) {
        const explanationScreen = document.getElementById('explanation-screen');
        const titleElement = document.getElementById('explanation-title');
        const questionElement = document.getElementById('explanation-question');
        const textElement = document.getElementById('explanation-text');
        const mediaContainer = document.getElementById('explanation-media-container');
        const knowledgeElement = document.getElementById('explanation-knowledge');

        // Set title
        titleElement.textContent = isCorrect ? 'Chúc Mừng! Bạn Trả Lời Đúng' : 'Cần Ôn Tập Thêm';
        titleElement.style.color = isCorrect ? '#10B981' : '#EF4444';

        // Set question
        questionElement.textContent = question.question;

        // Set explanation text
        const explanation = question.explanation || 
            (isCorrect ? 
                `Đáp án ${question.correctAnswer} là đúng! ${question.answers[question.correctAnswer.charCodeAt(0) - 65]}` :
                `Đáp án đúng là ${question.correctAnswer}. ${question.answers[question.correctAnswer.charCodeAt(0) - 65]}`);
        textElement.textContent = explanation;

        // Chỉ dùng phần giải thích chữ, ẩn vùng media
        if (mediaContainer) {
            mediaContainer.innerHTML = '';
            mediaContainer.style.display = 'none';
        }

        // Show knowledge gain message
        knowledgeElement.style.display = 'flex';
        knowledgeElement.querySelector('p').textContent = 
            isCorrect ? 'Bạn đã nâng cấp tri thức của mình!' : 'Hãy xem giải thích để nâng cao hiểu biết!';

        // Show explanation screen
        // KHÔNG đổi nhạc, giữ nhạc gameplay khi xem giải thích
        this.showScreen('explanation-screen');
    }

    closeExplanation() {
        // Move to next question
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame(true);
        } else {
            this.showScreen('game-screen');
            this.loadQuestion();
        }
    }

    handleTimeOut() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Time out = wrong answer
        this.playerStats.wrong++;
        const damage = 20;
        this.playerStats.hp = Math.max(0, this.playerStats.hp - damage);
        this.showDamageNumber(`-${damage} HP (Hết thời gian!)`, '#EF4444', this.getRandomPosition());
        this.maybeShowEncouragement();

        // Show correct answer
        const question = this.questions[this.currentQuestionIndex];
        document.querySelectorAll('.answer-card').forEach(card => {
            card.disabled = true;
            if (card.dataset.answer === question.correctAnswer) {
                card.classList.add('correct');
            }
        });

        this.updateHUD();

        if (this.playerStats.hp <= 0) {
            setTimeout(() => this.endGame(false), 1500);
        } else {
            setTimeout(() => {
                this.currentQuestionIndex++;
                this.loadQuestion();
            }, 2000);
        }
    }

    levelUp() {
        this.playerStats.level++;
        this.playerStats.exp = 0;
        this.playerStats.expToNext = Math.floor(this.playerStats.expToNext * 1.5);
        this.playerStats.maxHp += 20;
        this.playerStats.hp = this.playerStats.maxHp;
        
        this.showDamageNumber('LEVEL UP!', '#F59E0B', { x: window.innerWidth / 2, y: window.innerHeight / 2 });
        this.createExplosionEffect(window.innerWidth / 2, window.innerHeight / 2);
        this.updateStageHUD();
    }

    updateHUD() {
        // Character info
        const hudName = document.getElementById('hud-name');
        const hudLevel = document.getElementById('hud-level');
        if (hudName) hudName.textContent = this.playerStats.name;
        if (hudLevel) hudLevel.textContent = this.playerStats.level;

        // Health bar
        const healthFill = document.getElementById('health-fill');
        const healthText = document.getElementById('health-text');
        const healthPercent = (this.playerStats.hp / this.playerStats.maxHp) * 100;
        if (healthFill) healthFill.style.width = healthPercent + '%';
        if (healthText) healthText.textContent = `${this.playerStats.hp}/${this.playerStats.maxHp}`;

        // Exp bar
        const expFill = document.getElementById('exp-fill');
        const expText = document.getElementById('exp-text');
        const expPercent = (this.playerStats.exp / this.playerStats.expToNext) * 100;
        if (expFill) expFill.style.width = expPercent + '%';
        if (expText) expText.textContent = `${this.playerStats.exp}/${this.playerStats.expToNext}`;

        // Stats
        const correctCount = document.getElementById('correct-count');
        const wrongCount = document.getElementById('wrong-count');
        const scoreDisplay = document.getElementById('score-display');
        if (correctCount) correctCount.textContent = this.playerStats.correct;
        if (wrongCount) wrongCount.textContent = this.playerStats.wrong;
        if (scoreDisplay) scoreDisplay.textContent = this.playerStats.score;
    }

    endGame(victory) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        const totalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        if (victory) {
            // Calculate final score
            const timeBonus = Math.max(0, (this.timeLimit * this.questions.length) - totalTime);
            this.playerStats.score += timeBonus;
            
            // Calculate knowledge level
            const accuracy = (this.playerStats.correct / this.questions.length) * 100;
            let knowledgeLevel = 'Novice';
            // Final title is based on progression narrative
            let title = this.getCurrentStageTitle();
            
            if (accuracy >= 90) {
                knowledgeLevel = 'Master';
                title = 'Bậc Thầy';
            } else if (accuracy >= 75) {
                knowledgeLevel = 'Expert';
                title = 'Chuyên Gia';
            } else if (accuracy >= 60) {
                knowledgeLevel = 'Advanced';
                title = 'Nâng Cao';
            } else if (accuracy >= 40) {
                knowledgeLevel = 'Intermediate';
                title = 'Trung Cấp';
            }
            
            // Show victory screen
            document.getElementById('victory-score').textContent = this.playerStats.score;
            document.getElementById('victory-correct').textContent = `${this.playerStats.correct}/${this.questions.length}`;
            document.getElementById('knowledge-level').textContent = knowledgeLevel;
            document.getElementById('victory-rank').textContent = title === 'Nhà Hiền Triết' ? title : `${title}`;
            
            // Random wisdom quote
            const randomQuote = this.wisdomQuotes[Math.floor(Math.random() * this.wisdomQuotes.length)];
            document.getElementById('wisdom-quote-text').textContent = `"${randomQuote}"`;
            
            // Knowledge message based on performance
            let message = '';
            if (accuracy >= 90) {
                message = 'Xuất sắc! Bạn đã nắm vững kiến thức về chủ nghĩa Mác – Lênin. Tri thức của bạn đã được nâng cấp lên cấp độ Bậc Thầy!';
            } else if (accuracy >= 75) {
                message = 'Tuyệt vời! Bạn đã có hiểu biết sâu sắc. Tiếp tục học hỏi để đạt đến đỉnh cao tri thức!';
            } else if (accuracy >= 60) {
                message = 'Tốt lắm! Bạn đã nắm được nhiều kiến thức. Hãy tiếp tục rèn luyện để hoàn thiện hơn!';
            } else {
                message = 'Bạn đã hoàn thành hành trình! Mỗi câu hỏi là một bài học quý giá. Hãy tiếp tục nỗ lực để nâng cao tri thức!';
            }
            document.getElementById('knowledge-message-text').textContent = message;
            
            // Submit ranking
            this.submitRanking(totalTime);
            
            // Create victory effects
            this.createVictoryEffects();
            
            setTimeout(() => {
                this.showScreen('victory-screen');
            }, 1000);
            this.playMusic('victory');
        } else {
            // Show game over screen
            const gameoverStats = document.getElementById('gameover-stats');
            if (gameoverStats) {
                gameoverStats.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Điểm số:</span>
                        <strong>${this.playerStats.score}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Câu đúng:</span>
                        <strong>${this.playerStats.correct}/${this.currentQuestionIndex}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Thời gian:</span>
                        <strong>${totalTime}s</strong>
                    </div>
                `;
                // Add encouragement line below stats
                const encour = document.createElement('div');
                encour.id = 'gameover-encouragement';
                encour.textContent = this.getEncouragementMessage(true);
                encour.style.marginTop = '14px';
                encour.style.textAlign = 'center';
                encour.style.color = 'var(--text-primary, #e5e7eb)';
                encour.style.fontWeight = '600';
                encour.style.fontSize = '1rem';
                gameoverStats.parentElement?.insertBefore(encour, gameoverStats.nextSibling);
            }
            
            setTimeout(() => {
                this.showScreen('gameover-screen');
            }, 1000);
            this.playMusic('gameover');
        }
    }

    maybeShowEncouragement() {
        // Show when many wrong answers or low HP
        const lowHp = this.playerStats.hp <= Math.max(20, Math.floor(this.playerStats.maxHp * 0.25));
        const frequentWrong = this.playerStats.wrong >= 2 && this.playerStats.wrong % 2 === 0;
        if (!lowHp && !frequentWrong) return;
        const message = this.getEncouragementMessage(false);
        this.showToast(message);
    }

    getEncouragementMessage(isGameOver) {
        if (isGameOver) {
            return "Thất bại chỉ là tạm thời. Mỗi lần thử lại là một lần mạnh mẽ hơn!";
        }
        const idx = Math.floor(Math.random() * this.encouragementQuotes.length);
        return this.encouragementQuotes[idx];
    }

    showToast(text) {
        const toast = document.createElement('div');
        toast.textContent = text;
        toast.style.position = 'fixed';
        toast.style.left = '50%';
        toast.style.bottom = '32px';
        toast.style.transform = 'translateX(-50%)';
        toast.style.maxWidth = '90vw';
        toast.style.padding = '10px 14px';
        toast.style.borderRadius = '12px';
        toast.style.background = 'rgba(17, 24, 39, 0.85)';
        toast.style.color = '#F9FAFB';
        toast.style.fontWeight = '600';
        toast.style.fontSize = '14px';
        toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
        toast.style.backdropFilter = 'blur(8px)';
        toast.style.zIndex = '9999';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 200ms ease, transform 200ms ease';
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(-6px)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(0)';
            setTimeout(() => toast.remove(), 250);
        }, 2200);
    }

    async submitRanking(time) {
        try {
            const rankingData = {
                name: this.playerStats.name,
                score: this.playerStats.score,
                time: time,
                correct: this.playerStats.correct,
                total: this.questions.length,
                difficulty: 'normal'
            };

            await fetch('/api/rankings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rankingData)
            });

            // Rank is already set based on knowledge level in endGame function
        } catch (error) {
            console.error('Error submitting ranking:', error);
        }
    }

    resetGame() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.currentQuestionIndex = 0;
        this.selectedAnswer = null;
        this.playerStats = {
            name: this.playerStats.name,
            class: this.playerStats.class,
            level: 1,
            hp: 100,
            maxHp: 100,
            exp: 0,
            expToNext: 100,
            correct: 0,
            wrong: 0,
            score: 0
        };
    }

    // Visual Effects
    showDamageNumber(text, color, position) {
        const effectDiv = document.getElementById('combat-effects');
        if (!effectDiv) return;

        const damageNum = document.createElement('div');
        damageNum.className = 'damage-number';
        damageNum.textContent = text;
        damageNum.style.color = color;
        damageNum.style.left = position.x + 'px';
        damageNum.style.top = position.y + 'px';
        
        effectDiv.appendChild(damageNum);

        setTimeout(() => {
            damageNum.remove();
        }, 1000);
    }

    getRandomPosition() {
        return {
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
            y: window.innerHeight / 2 + (Math.random() - 0.5) * 200
        };
    }

    createParticleEffect(element, type) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const color = type === 'correct' ? '#10B981' : '#EF4444';

        for (let i = 0; i < 20; i++) {
            const particle = {
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color: color,
                size: Math.random() * 5 + 3
            };
            this.particles.push(particle);
        }
    }

    createExplosionEffect(x, y) {
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const particle = {
                x: x,
                y: y,
                vx: Math.cos(angle) * (Math.random() * 5 + 2),
                vy: Math.sin(angle) * (Math.random() * 5 + 2),
                life: 1,
                color: '#F59E0B',
                size: Math.random() * 6 + 4
            };
            this.particles.push(particle);
        }
    }

    createVictoryEffects() {
        // Create multiple explosion effects
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createExplosionEffect(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight
                );
            }, i * 200);
        }
    }

    animateParticles() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.vy += 0.2; // Gravity

            if (particle.life > 0) {
                this.ctx.globalAlpha = particle.life;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                return true;
            }
            return false;
        });

        // Create background particles
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2;
            const opacity = Math.random() * 0.5;

            this.ctx.globalAlpha = opacity;
            this.ctx.fillStyle = this.currentParticleColor || '#8B5CF6';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;

        requestAnimationFrame(() => this.animateParticles());
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new RPGQuizGame();
});
