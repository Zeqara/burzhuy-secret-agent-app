const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage });

app.post('/api/register', (req, res) => {
    const { name, phone, city } = req.body;
    if (!name || !phone || !city) {
        return res.status(400).json({ message: 'Все поля обязательны.' });
    }
    console.log('Новый агент:', { name, phone, city });
    res.status(201).json({ message: 'Регистрация успешна!', user: { name, phone, city } });
});

app.post('/api/report', upload.array('photos', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Нужно прикрепить фото.' });
    }
    console.log('Новый отчет:', { body: req.body, files: req.files.map(f => f.filename) });
    res.status(200).json({ message: 'Отчет успешно отправлен!' });
});

app.post('/api/support', (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ message: 'Вопрос не может быть пустым.' });
    }
    console.log('Вопрос в поддержку:', { question });
    res.status(200).json({ message: 'Сообщение отправлено.' });
});

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
