// Contribution functionality
let contributionFormCount = 0;

// Initialize contribution form when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeContribution();
});

function initializeContribution() {
    const contributeBtn = document.getElementById('contribute-btn');
    const closeContributionModal = document.getElementById('close-contribution-modal');
    const cancelContributionBtn = document.getElementById('cancel-contribution-btn');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const submitContributionsBtn = document.getElementById('submit-contributions-btn');

    if (contributeBtn) {
        contributeBtn.addEventListener('click', () => {
            showContributionModal();
        });
    }

    if (closeContributionModal) {
        closeContributionModal.addEventListener('click', () => {
            hideContributionModal();
        });
    }

    if (cancelContributionBtn) {
        cancelContributionBtn.addEventListener('click', () => {
            hideContributionModal();
        });
    }

    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => {
            addContributionForm();
        });
    }

    if (submitContributionsBtn) {
        submitContributionsBtn.addEventListener('click', () => {
            submitContributions();
        });
    }

    // Initialize with one form
    addContributionForm();
}

function showContributionModal() {
    const modal = document.getElementById('contribution-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function hideContributionModal() {
    const modal = document.getElementById('contribution-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function addContributionForm() {
    const formsContainer = document.getElementById('contribution-forms');
    if (!formsContainer) return;

    const formIndex = contributionFormCount++;
    
    const formHTML = `
        <div class="contribution-form-item" data-index="${formIndex}">
            <div class="contribution-form-header">
                <h3>Câu hỏi ${formIndex + 1}</h3>
                <button type="button" class="btn btn-danger btn-sm remove-question-btn" onclick="removeContributionForm(${formIndex})">
                    🗑️ Xóa
                </button>
            </div>
            
            <div class="form-group">
                <label for="contribution-question-${formIndex}">Câu hỏi:</label>
                <textarea id="contribution-question-${formIndex}" placeholder="Nhập câu hỏi..." required></textarea>
            </div>
            
            <div class="answer-options">
                <div class="form-group">
                    <label for="contribution-answer-a-${formIndex}">Đáp án A:</label>
                    <input type="text" id="contribution-answer-a-${formIndex}" placeholder="Đáp án A" required>
                </div>
                <div class="form-group">
                    <label for="contribution-answer-b-${formIndex}">Đáp án B:</label>
                    <input type="text" id="contribution-answer-b-${formIndex}" placeholder="Đáp án B" required>
                </div>
                <div class="form-group">
                    <label for="contribution-answer-c-${formIndex}">Đáp án C:</label>
                    <input type="text" id="contribution-answer-c-${formIndex}" placeholder="Đáp án C" required>
                </div>
                <div class="form-group">
                    <label for="contribution-answer-d-${formIndex}">Đáp án D:</label>
                    <input type="text" id="contribution-answer-d-${formIndex}" placeholder="Đáp án D" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="contribution-correct-answer-${formIndex}">Đáp án đúng:</label>
                <select id="contribution-correct-answer-${formIndex}" required>
                    <option value="">Chọn đáp án đúng</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </div>
        </div>
    `;

    const formDiv = document.createElement('div');
    formDiv.innerHTML = formHTML;
    formsContainer.appendChild(formDiv.firstElementChild);
}

function removeContributionForm(index) {
    const formItem = document.querySelector(`.contribution-form-item[data-index="${index}"]`);
    if (formItem) {
        formItem.remove();
        // Update question numbers
        updateQuestionNumbers();
    }
}

function updateQuestionNumbers() {
    const forms = document.querySelectorAll('.contribution-form-item');
    forms.forEach((form, index) => {
        const header = form.querySelector('.contribution-form-header h3');
        if (header) {
            header.textContent = `Câu hỏi ${index + 1}`;
        }
    });
}

async function submitContributions() {
    const forms = document.querySelectorAll('.contribution-form-item');
    const contributions = [];
    
    if (forms.length === 0) {
        alert('Vui lòng thêm ít nhất một câu hỏi!');
        return;
    }

    for (const form of forms) {
        const index = form.dataset.index;
        
        const question = document.getElementById(`contribution-question-${index}`)?.value?.trim();
        const answerA = document.getElementById(`contribution-answer-a-${index}`)?.value?.trim();
        const answerB = document.getElementById(`contribution-answer-b-${index}`)?.value?.trim();
        const answerC = document.getElementById(`contribution-answer-c-${index}`)?.value?.trim();
        const answerD = document.getElementById(`contribution-answer-d-${index}`)?.value?.trim();
        const correctAnswer = document.getElementById(`contribution-correct-answer-${index}`)?.value;

        if (!question || !answerA || !answerB || !answerC || !answerD || !correctAnswer) {
            alert(`Vui lòng điền đầy đủ thông tin cho câu hỏi ${parseInt(index) + 1}!`);
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

        const result = await response.json();

        if (result.success) {
            alert('✅ ' + result.message + '\n\nCảm ơn bạn đã đóng góp câu hỏi!');
            // Clear forms
            const formsContainer = document.getElementById('contribution-forms');
            if (formsContainer) {
                formsContainer.innerHTML = '';
                contributionFormCount = 0;
                addContributionForm();
            }
            hideContributionModal();
        } else {
            alert('❌ ' + (result.message || 'Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Có lỗi xảy ra khi gửi đóng góp. Vui lòng thử lại.');
    }
}

