const STORAGE_KEYS = {
    USER: 'eduHub_user',
    QUESTIONS: 'eduHub_questions',
    ANSWERS: 'eduHub_answers',
    SAVED: 'eduHub_saved',
    NOTIFICATIONS: 'eduHub_notifications'
};

const DEFAULT_USER = {
    id: 1,
    name: 'You',
    avatar: '👤',
    location: 'Bengaluru, Karnataka',
    reputation: 0,
    questionsAsked: 0,
    answersGiven: 0,
    savedItems: [],
    joinDate: new Date().toLocaleDateString()
};

const SAMPLE_QUESTIONS = [
    {
        id: 1,
        title: 'How do I solve quadratic equations?',
        description: 'x² + 5x + 6 = 0, I\'m stuck on factoring...',
        subject: 'Mathematics',
        author: 'Priya Kumar',
        reputation: 123,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        votes: 12,
        answers: 7,
        views: 145
    },
    {
        id: 2,
        title: 'How to reverse a list in Python?',
        description: '[1,2,3] → [3,2,1], what\'s the simplest way?',
        subject: 'Programming',
        author: 'Rahul Singh',
        reputation: 234,
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        votes: 45,
        answers: 12,
        views: 230
    },
    {
        id: 3,
        title: 'Understanding Newton\'s 3rd law',
        description: 'Help understanding Newton\'s 3rd law with examples',
        subject: 'Physics',
        author: 'Ananya Patel',
        reputation: 456,
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        votes: 8,
        answers: 3,
        views: 67
    },
    {
        id: 4,
        title: 'What was the impact of the British Raj on Indian economy?',
        description: 'Need points for my history project...',
        subject: 'History',
        author: 'Aditya Kumar',
        reputation: 189,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        votes: 20,
        answers: 5,
        views: 180
    }
];

function initApp() {
    loadUserData();
    loadQuestions();
    renderHome();
    loadNotifications();
}

function loadUserData() {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (!stored) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    }
}

function getUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || DEFAULT_USER;
}

function updateUser(updates) {
    const user = getUser();
    const updated = { ...user, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
}

function loadQuestions() {
    const stored = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!stored) {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(SAMPLE_QUESTIONS));
    }
}

function getQuestions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS)) || SAMPLE_QUESTIONS;
}

function addQuestion(question) {
    const questions = getQuestions();
    const newQuestion = {
        id: questions.length + 1,
        ...question,
        votes: 0,
        answers: 0,
        views: 0,
        timestamp: new Date(),
        userAnswers: []
    };
    questions.push(newQuestion);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    return newQuestion;
}

function getAnswers(questionId) {
    const stored = localStorage.getItem(STORAGE_KEYS.ANSWERS);
    if (!stored) return [];
    const answers = JSON.parse(stored);
    return answers.filter(a => a.questionId === questionId);
}

function addAnswer(questionId, answerText) {
    const answers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWERS)) || [];
    const user = getUser();
    const newAnswer = {
        id: answers.length + 1,
        questionId,
        author: user.name,
        text: answerText,
        timestamp: new Date(),
        votes: 0,
        isCorrect: false
    };
    answers.push(newAnswer);
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
    
    updateUser({ answersGiven: user.answersGiven + 1 });
    return newAnswer;
}

function getSavedItems() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED)) || [];
}

function toggleSaveItem(questionId) {
    const saved = getSavedItems();
    const index = saved.indexOf(questionId);
    if (index > -1) {
        saved.splice(index, 1);
    } else {
        saved.push(questionId);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(saved));
}

function isSaved(questionId) {
    return getSavedItems().includes(questionId);
}

function loadNotifications() {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '0';
    document.getElementById('notificationCount').textContent = stored;
}

function addNotification() {
    const count = parseInt(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '0') + 1;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, count.toString());
    loadNotifications();
}

function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    document.getElementById(screenName).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item')?.classList.add('active');

    if (screenName === 'profile') {
        renderProfile();
    } else if (screenName === 'browse') {
        renderBrowse();
    } else if (screenName === 'saved') {
        renderSaved();
    } else if (screenName === 'askQuestion') {
        resetAskForm();
    }

    window.scrollTo(0, 0);
}

function renderHome() {
    const questions = getQuestions();
    const subjects = [...new Set(questions.map(q => q.subject))];

    let chipsHTML = '<div class="chip active" onclick="filterBySubject(\'all\')">All</div>';
    subjects.forEach(subject => {
        chipsHTML += `<div class="chip" onclick="filterBySubject('${subject}')">${subject}</div>`;
    });
    document.getElementById('subjectChips').innerHTML = chipsHTML;

    renderQuestionsFeed(questions);
}

function renderQuestionsFeed(questions) {
    let html = '';
    questions.slice(0, 10).forEach(q => {
        const timeAgo = getTimeAgo(q.timestamp);
        html += `
            <div class="question-card" onclick="viewQuestion(${q.id})">
                <span class="question-badge">${q.subject}</span>
                <div class="question-title">${q.title}</div>
                <div class="question-preview">${q.description}</div>
                <div class="question-meta">
                    <div class="question-meta-left">
                        <span>By <strong>${q.author}</strong></span>
                        <span>· ${timeAgo}</span>
                    </div>
                    <div class="question-stats">
                        <div class="stat">💬 ${q.answers} Answers</div>
                        <div class="stat">👍 ${q.votes}</div>
                        <div class="stat">👁️ ${q.views} views</div>
                    </div>
                </div>
            </div>
        `;
    });
    document.getElementById('questionsFeed').innerHTML = html || '<div class="empty-state">No questions yet. Be the first to ask!</div>';
}

function filterBySubject(subject) {
    const questions = getQuestions();
    const filtered = subject === 'all' ? questions : questions.filter(q => q.subject === subject);
    renderQuestionsFeed(filtered);
    document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
    event.target.classList.add('active');
}

let currentStep = 1;

function nextStep() {
    if (currentStep === 1) {
        if (!document.getElementById('questionTitle').value.trim()) {
            alert('Please enter a question title');
            return;
        }
        currentStep = 2;
    } else if (currentStep === 2) {
        const selectedSubjects = Array.from(document.querySelectorAll('input[name="subject"]:checked')).map(i => i.value);
        if (selectedSubjects.length === 0) {
            alert('Please select at least one subject');
            return;
        }
        updateReview();
        currentStep = 3;
    }
    updateStepUI();
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepUI();
    }
}

function updateStepUI() {
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));

    document.getElementById(`step${currentStep}Content`).classList.remove('hidden');

    for (let i = 1; i <= 3; i++) {
        document.getElementById(`step${i}`).classList.toggle('active', i <= currentStep);
        if (i < 3) {
            document.getElementById(`progressLine${i}`).classList.toggle('active', i < currentStep);
        }
    }

    document.getElementById('stepLabel').textContent = `Step ${currentStep}/3`;
}

function updateReview() {
    const title = document.getElementById('questionTitle').value;
    const description = document.getElementById('questionDescription').value;
    const subjects = Array.from(document.querySelectorAll('input[name="subject"]:checked')).map(i => i.value).join(', ');
    const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'Not selected';

    document.getElementById('reviewTitle').textContent = title;
    document.getElementById('reviewDescription').textContent = description || 'No additional details provided';
    document.getElementById('reviewSubject').textContent = `Subject: ${subjects}`;
    document.getElementById('reviewDifficulty').textContent = `Difficulty: ${difficulty}`;
}

function postQuestion() {
    const title = document.getElementById('questionTitle').value.trim();
    const description = document.getElementById('questionDescription').value.trim();
    const subjects = Array.from(document.querySelectorAll('input[name="subject"]:checked')).map(i => i.value);
    const user = getUser();

    if (!title || subjects.length === 0) {
        alert('Please fill all required fields');
        return;
    }

    const question = {
        title,
        description,
        subject: subjects[0],
        author: user.name,
        reputation: user.reputation
    };

    addQuestion(question);
    updateUser({ questionsAsked: user.questionsAsked + 1 });

    showToast('✅ Question Posted Successfully!');
    resetAskForm();
    setTimeout(() => switchScreen('home'), 1500);
}

function resetAskForm() {
    document.getElementById('questionTitle').value = '';
    document.getElementById('questionDescription').value = '';
    document.getElementById('questionImage').value = '';
    document.querySelectorAll('input[name="subject"]').forEach(i => i.checked = false);
    document.querySelectorAll('input[name="difficulty"]').forEach(i => i.checked = false);
    currentStep = 1;
    updateStepUI();
}

function viewQuestion(questionId) {
    const questions = getQuestions();
    const question = questions.find(q => q.id === questionId);
    
    if (!question) return;

    question.views++;
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));

    const timeAgo = getTimeAgo(question.timestamp);
    const saved = isSaved(questionId);

    let html = `
        <div class="flex-between" style="margin-bottom: 16px;">
            <span class="question-badge">${question.subject}</span>
            <button class="icon-btn" onclick="toggleSave(${questionId})">
                ${saved ? '⭐' : '☆'}
            </button>
        </div>

        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">${question.title}</h1>
        <p style="color: var(--text-light); margin-bottom: 16px;">${question.description}</p>

        <div class="flex gap-12" style="margin-bottom: 20px; font-size: 14px;">
            <button class="btn btn-sm" onclick="voteQuestion(${questionId}, 1)">👍 ${question.votes}</button>
            <button class="btn btn-sm" onclick="voteQuestion(${questionId}, -1)">👎</button>
        </div>

        <div style="padding: 12px 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); color: var(--text-lighter); font-size: 12px; margin-bottom: 20px;">
            <div>By <strong>${question.author}</strong></div>
            <div>👁️ ${question.views} views · ${timeAgo}</div>
        </div>
    `;

    document.getElementById('detailContent').innerHTML = html;

    const answers = getAnswers(questionId);
    let answersHTML = '';

    if (answers.length === 0) {
        answersHTML = '<div class="empty-state">No answers yet. Be the first to answer!</div>';
    } else {
        answers.forEach(answer => {
            const answerTimeAgo = getTimeAgo(new Date(answer.timestamp));
            answersHTML += `
                <div class="answer-card">
                    ${answer.isCorrect ? '<div class="answer-correct-badge">✅ MARKED AS CORRECT</div>' : ''}
                    <div class="answer-content">${answer.text}</div>
                    <div class="answer-footer">
                        <span><strong>${answer.author}</strong> · ${answerTimeAgo}</span>
                        <div class="answer-voting">
                            <button class="vote-btn" onclick="voteAnswer(${answer.id}, 1)">👍 ${answer.votes}</button>
                            <button class="vote-btn" onclick="voteAnswer(${answer.id}, -1)">👎</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('answersList').innerHTML = answersHTML;
    document.getElementById('answerInput').value = '';
    switchScreen('questionDetail');
}

function postAnswer() {
    const answerText = document.getElementById('answerInput').value.trim();
    if (!answerText) {
        alert('Please write an answer');
        return;
    }

    const questionId = getCurrentQuestionId();
    addAnswer(questionId, answerText);
    addNotification();
    showToast('✅ Answer Posted!');
    viewQuestion(questionId);
}

function getCurrentQuestionId() {
    return parseInt(document.getElementById('detailContent').onclick?.toString().match(/\d+/)?.[0] || 1);
}

function voteQuestion(questionId, value) {
    const questions = getQuestions();
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.votes += value;
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
        viewQuestion(questionId);
    }
}

function voteAnswer(answerId, value) {
    const answers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWERS)) || [];
    const answer = answers.find(a => a.id === answerId);
    if (answer) {
        answer.votes += value;
        localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
    }
}

function toggleSave(questionId) {
    toggleSaveItem(questionId);
    viewQuestion(questionId);
}

function renderProfile() {
    const user = getUser();
    const badges = ['📐 Math Expert', '✅ Helper', '🎯 Power User', '🌟 Super', '👑 Master'];

    let html = `
        <div class="profile-header">
            <div class="profile-avatar">${user.avatar}</div>
            <div class="profile-name">${user.name}</div>
            <div class="profile-location">📍 ${user.location}</div>
        </div>

        <div class="stat-card">
            <div class="stat-value">${user.reputation}</div>
            <div class="stat-label">Total Reputation Points</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div class="stat-card">
                <div class="stat-value">${user.questionsAsked}</div>
                <div class="stat-label">Questions Asked</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${user.answersGiven}</div>
                <div class="stat-label">Answers Given</div>
            </div>
        </div>

        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">BADGES EARNED (${badges.length})</h3>
        <div class="badges">
            ${badges.map(b => `<div class="badge"><div class="badge-icon">${b[0]}</div><div class="badge-name">${b.split(' ')[1]}</div></div>`).join('')}
        </div>

        <div class="stat-card">
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">LEARNING STREAK</div>
            <div class="stat-value">🔥 ${Math.floor(Math.random() * 30) + 1} Days</div>
        </div>

        <button class="btn btn-secondary btn-full" style="margin-top: 20px;" onclick="editProfile()">📝 Edit Profile</button>
    `;

    document.getElementById('profileContent').innerHTML = html;
}

function editProfile() {
    const name = prompt('Enter your name:');
    if (name) {
        updateUser({ name });
        renderProfile();
        showToast('✅ Profile Updated!');
    }
}

function renderBrowse() {
    const questions = getQuestions();
    let html = '';
    
    questions.forEach(q => {
        const timeAgo = getTimeAgo(q.timestamp);
        html += `
            <div class="question-card" onclick="viewQuestion(${q.id})">
                <span class="question-badge">${q.subject}</span>
                <div class="question-title">${q.title}</div>
                <div class="question-preview">${q.description}</div>
                <div class="question-meta">
                    <div>By <strong>${q.author}</strong> · ${timeAgo}</div>
                    <div class="question-stats">
                        <span>💬 ${q.answers}</span>
                        <span>👍 ${q.votes}</span>
                    </div>
                </div>
            </div>
        `;
    });

    document.getElementById('browseContent').innerHTML = html || '<div class="empty-state">No questions found</div>';
}

function filterQuestions() {
    const search = document.getElementById('browseSearch').value.toLowerCase();
    const questions = getQuestions().filter(q => 
        q.title.toLowerCase().includes(search) || 
        q.description.toLowerCase().includes(search) ||
        q.subject.toLowerCase().includes(search)
    );

    let html = '';
    questions.forEach(q => {
        const timeAgo = getTimeAgo(q.timestamp);
        html += `
            <div class="question-card" onclick="viewQuestion(${q.id})">
                <span class="question-badge">${q.subject}</span>
                <div class="question-title">${q.title}</div>
                <div class="question-preview">${q.description}</div>
                <div class="question-meta">
                    <div>By <strong>${q.author}</strong></div>
                    <div class="question-stats">
                        <span>💬 ${q.answers}</span>
                        <span>👍 ${q.votes}</span>
                    </div>
                </div>
            </div>
        `;
    });

    document.getElementById('browseContent').innerHTML = html || '<div class="empty-state">No questions match your search</div>';
}

function renderSaved() {
    const saved = getSavedItems();
    const questions = getQuestions();
    const savedQuestions = questions.filter(q => saved.includes(q.id));

    let html = '';
    savedQuestions.forEach(q => {
        const timeAgo = getTimeAgo(q.timestamp);
        html += `
            <div class="question-card" onclick="viewQuestion(${q.id})">
                <span class="question-badge">${q.subject}</span>
                <div class="question-title">${q.title}</div>
                <div class="question-preview">${q.description}</div>
                <div class="question-meta">
                    <div>By <strong>${q.author}</strong> · ${timeAgo}</div>
                </div>
            </div>
        `;
    });

    document.getElementById('savedContent').innerHTML = html || '<div class="empty-state">You haven\'t saved any questions yet</div>';
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function loadMoreQuestions() {
    showToast('No more questions available');
}

function toggleSearch() {
    const searchBar = document.querySelector('.search-bar');
    searchBar.style.display = searchBar.style.display === 'flex' ? 'none' : 'flex';
}

document.addEventListener('DOMContentLoaded', initApp);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('data:application/javascript,', { scope: '/' }).catch(() => {});
}