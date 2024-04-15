const fs = require('fs');
const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();

const router = jsonServer.router(path.resolve(__dirname, 'db.json'));

server.use(jsonServer.defaults({}));
server.use(jsonServer.bodyParser);

// Эндпоинт для логина
server.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'utf-8'));
    const { users = [] } = db;

    const userFromBd = users.find(
      (user) => user.username === username && user.password === password
    );

    if (userFromBd) {
      return res.json(userFromBd);
    }

    return res.status(403).json({ message: 'Пользователь не найден' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e.message });
  }
});

// Проверка создания новой заявки
server.use((req, res, next) => {
  try {
    const { userId, title } = req.body;
    const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'db.json'), 'utf-8'));
    const { requests = [] } = db;

    const requestsFromBd = requests.find(
      (request) => request.title === title && request.userId === userId
    );

    if (requestsFromBd) {
      return res
        .status(403)
        .json({ message: 'Вы уже отправляли заявку на этот документ, она уже была учтена' });
    }

    next();
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e.message });
  }
});

// Проверка авторизации пользователя
server.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ message: 'AUTH ERROR' });
  }

  next();
});

server.use(router);

// Запуск сервера
server.listen(8000, () => {
  console.log(`server is running on 8000 port`);
});
