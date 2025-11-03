const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database file path
const DB_PATH = path.join(__dirname, 'database.json');

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ngocloi060407@gmail.com',
    pass: 'sbno gszf xtwe sqob'
  }
});

// Thêm các const path
const QUESTIONS_PATH = path.join(__dirname, 'data/questions.json');
const RANKINGS_PATH = path.join(__dirname, 'data/rankings.json');
const SETTINGS_PATH = path.join(__dirname, 'data/settings.json');
const CONTRIBUTIONS_PATH = path.join(__dirname, 'data/contributions.json');
const USERS_PATH = path.join(__dirname, 'data/users.json');

function readDatabase() {
  try {
    const questionsData = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));
    const contributionsData = JSON.parse(fs.readFileSync(CONTRIBUTIONS_PATH, 'utf8'));
    const rankingsData = JSON.parse(fs.readFileSync(RANKINGS_PATH, 'utf8'));
    const settingsData = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    const usersData = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));

    return {
      questions: Array.isArray(questionsData) ? questionsData : questionsData.questions || [],
      contributions: contributionsData.contributions || [],
      rankings: rankingsData.rankings || [], 
      settings: settingsData,
      admin: usersData.admin || { username: 'admin', password: 'admin123' }
    };
  } catch (error) {
    console.error('Error reading database:', error);
    return {
      questions: [],
      contributions: [],
      rankings: [],
      settings: {},
      admin: { username: 'admin', password: 'admin123' }
    };
  }
}

function writeDatabase(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function sendEmailNotification(contribution) {
  const mailOptions = {
    from: 'ngocloi06407@gmail.com',
    to: 'nguyenngocloi6042007@gmail.com',
    subject: 'Có đóng góp câu hỏi mới',
    html: `
      <h2>Có đóng góp câu hỏi mới</h2>
      <p><strong>Câu hỏi:</strong> ${contribution.question}</p>
      <p><strong>Đáp án:</strong></p>
      <ul>
        <li>A: ${contribution.answers[0]}</li>
        <li>B: ${contribution.answers[1]}</li>
        <li>C: ${contribution.answers[2]}</li>
        <li>D: ${contribution.answers[3]}</li>
      </ul>
      <p><strong>Đáp án đúng:</strong> ${contribution.correctAnswer}</p>
    `
  };

  emailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// API Routes


// Get questions
app.get('/api/questions', (req, res) => {
    try {
        const db = readDatabase();
        console.log('Loaded questions count:', db.questions.length);
        
        if (!db.questions || !Array.isArray(db.questions)) {
            console.error('Invalid questions data structure');
            throw new Error('Invalid questions data');
        }

        // Filter out invalid questions
        const validQuestions = db.questions.filter(q => 
            q && q.question && 
            Array.isArray(q.answers) && 
            q.answers.length === 4 &&
            q.correctAnswer
        );

        console.log('Valid questions count:', validQuestions.length);
        res.json(validQuestions);
        
    } catch (error) {
        console.error('Error getting questions:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading questions',
            error: error.message
        });
    }
});

// Add question (admin)
app.post('/api/questions', (req, res) => {
  const db = readDatabase();
  const question = req.body;
  question.id = Date.now().toString();
  
  // Ensure all fields are present
  if (!question.explanation) question.explanation = '';
  if (!question.explanationVideo) question.explanationVideo = '';
  if (!question.explanationImage) question.explanationImage = '';
  
  db.questions.push(question);
  
  // Also add to questions.json file
  try {
    const questionsData = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));
    const questionsArray = Array.isArray(questionsData) ? questionsData : questionsData.questions || [];
    questionsArray.push(question);
    fs.writeFileSync(QUESTIONS_PATH, JSON.stringify({ questions: questionsArray }, null, 2));
  } catch (error) {
    console.error('Error updating questions.json:', error);
  }
  
  writeDatabase(db);
  res.json({ success: true, message: 'Câu hỏi đã được thêm' });
});

// Update question (admin)
app.put('/api/questions/:id', (req, res) => {
  const db = readDatabase();
  const id = req.params.id;
  const updatedQuestion = req.body;
  
  const index = db.questions.findIndex(q => q.id === id);
  if (index !== -1) {
    // Preserve existing fields and update with new data
    const existingQuestion = db.questions[index];
    db.questions[index] = { 
      ...existingQuestion, 
      ...updatedQuestion,
      id: id // Preserve the original ID
    };
    
    // Also update in questions.json file
    try {
      const questionsData = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf8'));
      const questionsArray = Array.isArray(questionsData) ? questionsData : questionsData.questions || [];
      const qIndex = questionsArray.findIndex(q => q.id === id);
      if (qIndex !== -1) {
        questionsArray[qIndex] = { ...questionsArray[qIndex], ...updatedQuestion, id: id };
        fs.writeFileSync(QUESTIONS_PATH, JSON.stringify({ questions: questionsArray }, null, 2));
      }
    } catch (error) {
      console.error('Error updating questions.json:', error);
    }
    
    writeDatabase(db);
    res.json({ success: true, message: 'Câu hỏi đã được cập nhật' });
  } else {
    res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
  }
});

// Delete question (admin)
app.delete('/api/questions/:id', (req, res) => {
  const db = readDatabase();
  const id = req.params.id;
  
  const index = db.questions.findIndex(q => q.id === id);
  if (index !== -1) {
    db.questions.splice(index, 1);
    writeDatabase(db);
    res.json({ success: true, message: 'Câu hỏi đã được xóa' });
  } else {
    res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
  }
});

// Submit contribution
app.post('/api/contributions', (req, res) => {
    try {
        const contributions = req.body;
        if (!Array.isArray(contributions)) {
            throw new Error('Invalid contributions data');
        }

        const db = readDatabase();
        
        // Validate và thêm ID, timestamp cho mỗi câu hỏi
        contributions.forEach((contribution, index) => {
            contribution.id = (Date.now() + index).toString();
            contribution.timestamp = new Date().toISOString();
            
            // Thêm vào contributions thay vì questions (để admin duyệt)
            if (!db.contributions) {
                db.contributions = [];
            }
            db.contributions.push(contribution);
        });

        // Lưu contributions vào file
        try {
            const contributionsData = { contributions: db.contributions };
            fs.writeFileSync(CONTRIBUTIONS_PATH, JSON.stringify(contributionsData, null, 2));
        } catch (error) {
            console.error('Error writing contributions:', error);
        }

        writeDatabase(db);
        
        // Gửi email thông báo
        if (contributions.length > 0) {
            sendEmailNotification(contributions[0]);
        }

        res.json({ 
            success: true,
            message: 'Đóng góp đã được ghi nhận và đang chờ duyệt'
        });

    } catch (error) {
        console.error('Error handling contribution:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xử lý đóng góp'
        });
    }
});

// Get contributions (admin)
app.get('/api/contributions', (req, res) => {
  const db = readDatabase();
  res.json(db.contributions);
});

// Approve contribution (admin)
app.post('/api/contributions/:id/approve', (req, res) => {
  const db = readDatabase();
  const id = req.params.id;
  
  const index = db.contributions.findIndex(c => c.id === id);
  if (index !== -1) {
    const contribution = db.contributions[index];
    
    // Add to questions
    contribution.id = Date.now().toString();
    db.questions.push(contribution);
    
    // Remove from contributions
    db.contributions.splice(index, 1);
    
    writeDatabase(db);
    res.json({ success: true, message: 'Câu hỏi đã được duyệt' });
  } else {
    res.status(404).json({ success: false, message: 'Không tìm thấy đóng góp' });
  }
});

// Delete contribution (admin)
app.delete('/api/contributions/:id', (req, res) => {
  const db = readDatabase();
  const id = req.params.id;
  
  const index = db.contributions.findIndex(c => c.id === id);
  if (index !== -1) {
    db.contributions.splice(index, 1);
    writeDatabase(db);
    res.json({ success: true, message: 'Đóng góp đã được xóa' });
  } else {
    res.status(404).json({ success: false, message: 'Không tìm thấy đóng góp' });
  }
});

// Submit ranking
app.post('/api/rankings', (req, res) => {
  const db = readDatabase();
  const ranking = req.body;
  ranking.id = Date.now().toString();
  ranking.timestamp = new Date().toISOString();
  ranking.ip = req.ip;
  
  db.rankings.push(ranking);
  writeDatabase(db);
  res.json({ success: true, message: 'Kết quả đã được lưu' });
});

// Get rankings
app.get('/api/rankings', (req, res) => {
  const db = readDatabase();
  const rankings = db.rankings
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.time - b.time;
    })
    .slice(0, 100); // Top 100
  
  res.json(rankings);
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const db = readDatabase();
  const { username, password } = req.body;
  
  if (username === db.admin.username && password === db.admin.password) {
    res.json({ success: true, message: 'Đăng nhập thành công' });
  } else {
    res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
  }
});

// Get dashboard stats
app.get('/api/admin/stats', (req, res) => {
  const db = readDatabase();
  const stats = {
    totalQuestions: db.questions.length,
    totalPlayers: [...new Set(db.rankings.map(r => r.ip))].length,
    totalContributions: db.contributions.length,
    totalRankings: db.rankings.length
  };
  
  res.json(stats);
});
// API để lấy thông báo
app.get('/api/notification', (req, res) => {
    const db = readDatabase();
    res.json(db.settings.notification);
});

// API để cập nhật thông báo (admin only)
app.put('/api/admin/notification', (req, res) => {
    const db = readDatabase();
    const notification = req.body;
    
    // Validation
    if (typeof notification.active !== 'boolean') {
        return res.status(400).json({ 
            success: false, 
            message: 'Trạng thái không hợp lệ' 
        });
    }
    
    db.settings.notification = {
        active: notification.active,
        title: notification.title || '',
        content: notification.content || '',
        image: notification.image || '',
        type: notification.type || 'info',
        duration: Math.max(0, Math.min(60, parseInt(notification.duration) || 0))
    };
    
    writeDatabase(db);
    
    res.json({ 
        success: true, 
        message: 'Cập nhật thông báo thành công!',
        notification: db.settings.notification
    });
});
// API để lấy toàn bộ cài đặt
app.get('/api/settings', (req, res) => {
    const db = readDatabase();
    res.json(db.settings);
});

// API để cập nhật toàn bộ cài đặt
app.put('/api/admin/settings', (req, res) => {
    const db = readDatabase();
    const newSettings = req.body;
    
    console.log('📝 Updating settings:', newSettings);
    
    // Validate và merge settings
    if (newSettings.notification) {
        db.settings.notification = {
            active: typeof newSettings.notification.active === 'boolean' ? newSettings.notification.active : true,
            title: newSettings.notification.title || '',
            content: newSettings.notification.content || '',
            image: newSettings.notification.image || '',
            type: newSettings.notification.type || 'info',
            duration: Math.max(0, Math.min(60, parseInt(newSettings.notification.duration) || 0))
        };
    }
    writeDatabase(db);
    
    res.json({ 
        success: true, 
        message: 'Cập nhật cài đặt thành công!',
        settings: db.settings
    });
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});