// Admin state
let adminState = {
    isLoggedIn: false,
    currentTab: 'dashboard',
    currentModal: null,
    deleteCallback: null
};

// DOM Elements
const screens = {
    login: document.getElementById('login-screen'),
    admin: document.getElementById('admin-dashboard')
};

// Initialize admin
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    setupEventListeners();
});

function initializeAdmin() {
    // Check if already logged in
    const savedLogin = localStorage.getItem('adminLoggedIn');
    if (savedLogin === 'true') {
        showAdminScreen();
    } else {
        showLoginScreen();
    }
}

function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Question management
    document.getElementById('add-question-btn').addEventListener('click', () => {
        openQuestionModal();
    });

    // Skip to last question button
    document.getElementById('skip-to-last-btn').addEventListener('click', handleSkipToLast);
    
    // Modal events
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Question form
    document.getElementById('question-form').addEventListener('submit', handleQuestionSubmit);
    
    // Delete confirmation
    document.getElementById('confirm-delete').addEventListener('click', handleDeleteConfirm);
    
    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    });

    // Notification settings form
    const notificationForm = document.getElementById('notification-settings-form');
    if (notificationForm) {
        notificationForm.addEventListener('submit', handleNotificationSettingsSubmit);
    }
    
    // Preview notification button
    const previewBtn = document.getElementById('preview-notification');
    if (previewBtn) {
        previewBtn.addEventListener('click', handlePreviewNotification);
    }

}

function showLoginScreen() {
    if (screens.login && screens.admin) {
        screens.login.classList.add('active');
        screens.admin.classList.remove('active');
    }
}

function showAdminScreen() {
    if (screens.login && screens.admin) {
        screens.login.classList.remove('active');
        screens.admin.classList.add('active');
        loadDashboardStats();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!username || !password) {
        showNotification('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('adminLoggedIn', 'true');
            showAdminScreen();
            showNotification('Đăng nhập thành công!', 'success');
        } else {
            showNotification(result.message || 'Tên đăng nhập hoặc mật khẩu không đúng!', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Không thể kết nối đến server. Vui lòng thử lại!', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('adminLoggedIn');
    showLoginScreen();
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.reset();
    }
}

function switchTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeNavBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeNavBtn) {
        activeNavBtn.classList.add('active');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.getElementById(`${tabName}-tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    adminState.currentTab = tabName;
    
    // Load tab-specific data
    switch (tabName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'questions':
            loadQuestions();
            break;
        case 'contributions':
            loadContributions();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to load stats');
        
        const stats = await response.json();
        
        // Update stats elements safely
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateElement('total-questions', stats.totalQuestions);
        updateElement('total-players', stats.totalPlayers);
        updateElement('total-contributions', stats.totalContributions);
        updateElement('total-rankings', stats.totalRankings);
        
    } catch (error) {
        console.error('Error loading stats:', error);
        showNotification('Có lỗi xảy ra khi tải thống kê!', 'error');
    }
}

async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        if (!response.ok) throw new Error('Failed to load questions');
        
        const questions = await response.json();
        const questionsList = document.getElementById('questions-list');
        
        if (!questionsList) return;
        
        if (questions.length === 0) {
            questionsList.innerHTML = `
                <div class="empty-state">
                    <p>Chưa có câu hỏi nào</p>
                    <button class="btn btn-primary" onclick="openQuestionModal()">Thêm câu hỏi đầu tiên</button>
                </div>
            `;
            return;
        }
        
        questionsList.innerHTML = questions.map(question => {
            const hasExplanation = question.explanation ? '✅' : '❌';
            const hasVideo = question.explanationVideo ? '🎥' : '';
            const hasImage = question.explanationImage ? '🖼️' : '';
            const questionText = escapeHtml(question.question);
            return `
            <div class="question-item" data-id="${question.id}">
                <div class="question-content">
                    <div class="question-text">${questionText}</div>
                    <div class="question-meta">
                        Đáp án đúng: ${question.correctAnswer} |
                        Giải thích: ${hasExplanation} ${hasVideo} ${hasImage}
                    </div>
                </div>
                <div class="question-actions">
                    <button class="btn btn-warning" onclick="editQuestion('${question.id}')">Sửa</button>
                    <button class="btn btn-danger" onclick="confirmDeleteQuestion('${question.id}')">Xóa</button>
                </div>
            </div>
        `;
        }).join('');
    } catch (error) {
        console.error('Error loading questions:', error);
        showNotification('Có lỗi xảy ra khi tải câu hỏi!', 'error');
    }
}

async function loadContributions() {
    try {
        const response = await fetch('/api/contributions');
        if (!response.ok) throw new Error('Failed to load contributions');
        
        const contributions = await response.json();
        const contributionsList = document.getElementById('contributions-list');
        
        if (!contributionsList) return;
        
        if (contributions.length === 0) {
            contributionsList.innerHTML = `
                <div class="empty-state">
                    <p>Chưa có đóng góp nào</p>
                </div>
            `;
            return;
        }
        
        contributionsList.innerHTML = contributions.map(contribution => `
            <div class="contribution-item" data-id="${contribution.id}">
                <div class="contribution-content">
                    <div class="contribution-text">${contribution.question}</div>
                    <div class="contribution-meta">
                        Đáp án: ${contribution.answers.join(', ')} | 
                        Đáp án đúng: ${contribution.correctAnswer} |
                        Ngày gửi: ${new Date(contribution.timestamp).toLocaleDateString('vi-VN')}
                    </div>
                </div>
                <div class="contribution-actions">
                    <button class="btn btn-success" onclick="approveContribution('${contribution.id}')">Duyệt</button>
                    <button class="btn btn-danger" onclick="deleteContribution('${contribution.id}')">Xóa</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading contributions:', error);
        showNotification('Có lỗi xảy ra khi tải đóng góp!', 'error');
    }
}

// ==================== SETTINGS FUNCTIONS ====================

async function loadSettings() {
    try {
        const settings = await getCurrentSettings();
        
        // Load notification settings
        document.getElementById('notification-active').checked = settings.notification.active;
        document.getElementById('notification-title').value = settings.notification.title || '';
        document.getElementById('notification-content').value = settings.notification.content || '';
        document.getElementById('notification-image').value = settings.notification.image || '';
        document.getElementById('notification-type').value = settings.notification.type || 'info';
        document.getElementById('notification-duration').value = settings.notification.duration || 0;
        
        updateNotificationPreview();
        setupSettingsListeners();
        
    } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Có lỗi xảy ra khi tải cài đặt!', 'error');
        loadDefaultSettings();
    }
}

function setupSettingsListeners() {
    // Notification settings listeners
    const notificationFields = [
        'notification-active',
        'notification-title', 
        'notification-content',
        'notification-image',
        'notification-type',
        'notification-duration'
    ];
    
    notificationFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', updateNotificationPreview);
            element.addEventListener('change', updateNotificationPreview);
        }
    });

}

function loadDefaultSettings() {
    // Default notification settings
    const defaultNotification = {
        'notification-active': true,
        'notification-title': 'Chào mừng đến với Quiz Game!',
        'notification-content': 'Hãy thử thách kiến thức của bạn với hàng ngàn câu hỏi thú vị.\n\nChọn chế độ chơi nhanh để luyện tập hoặc tham gia xếp hạng để cạnh tranh với người chơi khác.',
        'notification-image': '',
        'notification-type': 'info',
        'notification-duration': 0
    };
    
    Object.entries(defaultNotification).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    });

    updateNotificationPreview();
}

// ==================== NOTIFICATION SETTINGS FUNCTIONS ====================

async function handleNotificationSettingsSubmit(e) {
    e.preventDefault();
    
    const notificationSettings = {
        active: document.getElementById('notification-active').checked,
        title: document.getElementById('notification-title').value,
        content: document.getElementById('notification-content').value,
        image: document.getElementById('notification-image').value,
        type: document.getElementById('notification-type').value,
        duration: parseInt(document.getElementById('notification-duration').value) || 0
    };
    
    // Validate duration
    if (notificationSettings.duration < 0 || notificationSettings.duration > 60) {
        showNotification('Thời gian hiển thị phải từ 0 đến 60 giây!', 'error');
        return;
    }
    
    try {
        // Hiển thị trạng thái loading
        const saveBtn = document.querySelector('#notification-settings-form button[type="submit"]');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="btn-icon">⏳</span> Đang lưu...';
        saveBtn.disabled = true;
        
        // Lấy cài đặt hiện tại
        const currentSettings = await getCurrentSettings();
        
        // Cập nhật chỉ phần notification
        const updatedSettings = {
            ...currentSettings,
            notification: notificationSettings
        };
        
        const response = await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedSettings)
        });
        
        if (!response.ok) throw new Error('Failed to save settings');
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('✅ Cài đặt thông báo đã được lưu thành công!', 'success');
            updateNotificationPreview();
        } else {
            showNotification(result.message || '❌ Có lỗi xảy ra khi lưu cài đặt!', 'error');
        }
        
    } catch (error) {
        console.error('Error saving notification settings:', error);
        showNotification('❌ Không thể kết nối đến server!', 'error');
    } finally {
        // Khôi phục trạng thái nút
        const saveBtn = document.querySelector('#notification-settings-form button[type="submit"]');
        if (saveBtn) {
            saveBtn.innerHTML = '<span class="btn-icon">💾</span> Lưu cài đặt';
            saveBtn.disabled = false;
        }
    }
}

function handlePreviewNotification() {
    updateNotificationPreview();
    showNotification('Đã cập nhật xem trước thông báo!', 'success');
}

function updateNotificationPreview() {
    const preview = document.getElementById('notification-preview');
    if (!preview) return;
    
    const settings = getCurrentNotificationSettings();
    
    let html = '';
    
    if (!settings.active) {
        html = `
            <div class="preview-disabled">
                <div class="preview-icon">🔕</div>
                <h4>Thông báo đang tắt</h4>
                <p>Người chơi sẽ không thấy thông báo này khi vào game</p>
            </div>
        `;
    } else {
        const contentWithLineBreaks = settings.content.replace(/\n/g, '<br>');
        
        html = `
            <div class="notification-preview-content notification-${settings.type}">
                <div class="preview-header">
                    <span class="preview-badge">Xem trước</span>
                </div>
                ${settings.image ? `
                    <div class="preview-image-container">
                        <img src="${settings.image}" alt="Preview" class="preview-image" onerror="this.style.display='none'">
                    </div>
                ` : ''}
                <div class="preview-text-content">
                    ${settings.title ? `<h3 class="preview-title">${settings.title}</h3>` : ''}
                    ${settings.content ? `<div class="preview-content">${contentWithLineBreaks}</div>` : ''}
                </div>
                <div class="preview-meta">
                    <span class="meta-item">Kiểu: ${getNotificationTypeText(settings.type)}</span>
                    <span class="meta-item">Thời gian: ${settings.duration > 0 ? settings.duration + ' giây' : 'Không tự tắt'}</span>
                </div>
                <div class="preview-actions">
                    <button class="btn-preview-close">Bắt đầu chơi</button>
                </div>
            </div>
        `;
    }
    
    preview.innerHTML = html;
    
    // Add click event for preview close button
    const closeBtn = preview.querySelector('.btn-preview-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            showNotification('Đây là xem trước! Trong thực tế, nút này sẽ đóng thông báo.', 'info');
        });
    }
}

function getCurrentNotificationSettings() {
    return {
        active: document.getElementById('notification-active')?.checked || false,
        title: document.getElementById('notification-title')?.value || '',
        content: document.getElementById('notification-content')?.value || '',
        image: document.getElementById('notification-image')?.value || '',
        type: document.getElementById('notification-type')?.value || 'info',
        duration: parseInt(document.getElementById('notification-duration')?.value) || 0
    };
}

// ==================== UTILITY FUNCTIONS ====================

async function getCurrentSettings() {
    try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to load settings');
        return await response.json();
    } catch (error) {
        console.error('Error loading current settings:', error);
        // Trả về cài đặt mặc định nếu có lỗi
        return {
            notification: {
                active: true,
                title: 'Chào mừng đến với Quiz Game!',
                content: 'Hãy thử thách kiến thức của bạn với hàng ngàn câu hỏi thú vị.',
                image: '',
                type: 'info',
                duration: 0
            },
            gameTime: {
                easy: 600,
                medium: 480,
                hard: 360
            }
        };
    }
}

function getNotificationTypeText(type) {
    const types = {
        'info': 'Thông tin',
        'success': 'Thành công', 
        'warning': 'Cảnh báo',
        'error': 'Lỗi'
    };
    return types[type] || type;
}

function getDifficultyText(difficulty) {
    switch (difficulty) {
        case 'easy': return 'Dễ';
        case 'medium': return 'Trung bình';
        case 'hard': return 'Khó';
        default: return difficulty;
    }
}

// ==================== QUESTION MANAGEMENT FUNCTIONS ====================

function openQuestionModal(question = null) {
    const modal = document.getElementById('question-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('question-form');
    
    if (!modal || !title || !form) return;
    
    if (question) {
        // Edit mode
        title.textContent = 'Sửa câu hỏi';
        document.getElementById('question-id').value = question.id;
        document.getElementById('modal-question').value = question.question || '';
        document.getElementById('modal-answer-a').value = question.answers[0] || '';
        document.getElementById('modal-answer-b').value = question.answers[1] || '';
        document.getElementById('modal-answer-c').value = question.answers[2] || '';
        document.getElementById('modal-answer-d').value = question.answers[3] || '';
        document.getElementById('modal-correct-answer').value = question.correctAnswer || '';
        document.getElementById('modal-explanation').value = question.explanation || '';
        document.getElementById('modal-explanation-video').value = question.explanationVideo || '';
        document.getElementById('modal-explanation-image').value = question.explanationImage || '';
    } else {
        // Add mode
        title.textContent = 'Thêm câu hỏi';
        form.reset();
        document.getElementById('question-id').value = '';
    }
    
    modal.classList.add('active');
    adminState.currentModal = 'question';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    adminState.currentModal = null;
    adminState.deleteCallback = null;
}

async function handleQuestionSubmit(e) {
    e.preventDefault();
    
    const questionId = document.getElementById('question-id').value;
    const questionData = {
        question: document.getElementById('modal-question').value,
        answers: [
            document.getElementById('modal-answer-a').value,
            document.getElementById('modal-answer-b').value,
            document.getElementById('modal-answer-c').value,
            document.getElementById('modal-answer-d').value
        ],
        correctAnswer: document.getElementById('modal-correct-answer').value,
        explanation: document.getElementById('modal-explanation').value || '',
        explanationVideo: document.getElementById('modal-explanation-video').value || '',
        explanationImage: document.getElementById('modal-explanation-image').value || ''
    };
    
    try {
        let response;
        if (questionId) {
            // Update existing question
            response = await fetch(`/api/questions/${questionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(questionData)
            });
        } else {
            // Add new question
            response = await fetch('/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(questionData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            closeModal();
            loadQuestions(); // Reload the questions list
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error saving question:', error);
        showNotification('Có lỗi xảy ra khi lưu câu hỏi!', 'error');
    }
}

async function editQuestion(questionId) {
    try {
        const response = await fetch('/api/questions');
        if (!response.ok) throw new Error('Failed to load questions');
        
        const questions = await response.json();
        const question = questions.find(q => q.id === questionId);
        
        if (question) {
            openQuestionModal(question);
        } else {
            showNotification('Không tìm thấy câu hỏi!', 'error');
        }
    } catch (error) {
        console.error('Error loading question for edit:', error);
        showNotification('Có lỗi xảy ra khi tải câu hỏi!', 'error');
    }
}

function confirmDeleteQuestion(questionId) {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    
    adminState.deleteCallback = () => deleteQuestion(questionId);
    modal.classList.add('active');
    adminState.currentModal = 'delete';
}

async function deleteQuestion(questionId) {
    try {
        const response = await fetch(`/api/questions/${questionId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            loadQuestions(); // Reload the questions list
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        showNotification('Có lỗi xảy ra khi xóa câu hỏi!', 'error');
    }
}

async function approveContribution(contributionId) {
    try {
        const response = await fetch(`/api/contributions/${contributionId}/approve`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            loadContributions(); // Reload the contributions list
            loadDashboardStats(); // Update stats
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error approving contribution:', error);
        showNotification('Có lỗi xảy ra khi duyệt đóng góp!', 'error');
    }
}

async function deleteContribution(contributionId) {
    if (!confirm('Bạn có chắc chắn muốn xóa đóng góp này?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/contributions/${contributionId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            loadContributions(); // Reload the contributions list
            loadDashboardStats(); // Update stats
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting contribution:', error);
        showNotification('Có lỗi xảy ra khi xóa đóng góp!', 'error');
    }
}

function handleDeleteConfirm() {
    if (adminState.deleteCallback) {
        adminState.deleteCallback();
    }
    closeModal();
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.admin-notification').forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `admin-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: adminNotificationSlideIn 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'adminNotificationSlideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Close on click
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'adminNotificationSlideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
}

function getNotificationColor(type) {
    const colors = {
        info: '#007bff',
        success: '#28a745',
        warning: '#ffc107', 
        error: '#dc3545'
    };
    return colors[type] || colors.info;
}

// Inject admin notification styles
const adminNotificationStyles = `
@keyframes adminNotificationSlideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes adminNotificationSlideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.admin-notification .notification-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.admin-notification .notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    margin-left: 10px;
    opacity: 0.8;
}

.admin-notification .notification-close:hover {
    opacity: 1;
}
`;

// Inject styles only once
if (!document.querySelector('#admin-notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'admin-notification-styles';
    styleSheet.textContent = adminNotificationStyles;
    document.head.appendChild(styleSheet);
}

// Skip to last question function
async function handleSkipToLast() {
    if (!confirm('Bạn có chắc muốn bỏ qua tất cả câu hỏi đến câu cuối cùng? Hành động này sẽ lưu vào localStorage để game có thể skip khi bắt đầu chơi.')) {
        return;
    }

    try {
        // Set skip flag in localStorage
        localStorage.setItem('adminSkipToLast', 'true');
        
        showNotification('✅ Đã kích hoạt chế độ bỏ qua! Mở game và sẽ tự động nhảy đến câu cuối khi bắt đầu chơi.', 'success');
    } catch (error) {
        console.error('Error setting skip:', error);
        showNotification('Có lỗi xảy ra!', 'error');
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}