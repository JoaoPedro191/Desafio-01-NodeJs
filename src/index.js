const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const checkExistsUserAccount = users.find((user) => {
    return user.username === username;
  });

  if (!checkExistsUserAccount) {
    return response.status(404).json({ error: "user not found" });
  }

  request.user = checkExistsUserAccount;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const verifyUserNameAlreadyExist = users.some((user) => {
    return user.username === username;
  });

  if (verifyUserNameAlreadyExist) {
    return response.status(400).json({ error: "User Already Exist" });
  }
  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });
  return response.status(201).json(users[0]);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { deadline, title } = request.body;

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });
  return response.status(201).json(user.todos[0]);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: " Todo not found" });
  }

  todo.title = title;
  deadline = new Date(deadline);
  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const verifyExistTodos = user.todos.find((todo) => todo.id === id);
  if (!verifyExistTodos) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }
  verifyExistTodos.done = true;
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const verifyExistTodos = user.todos.find((user) => {
    return user.id === id;
  });

  if (!verifyExistTodos) {
    return response.status(404).json({ error: "todos not found" });
  }

  user.todos.splice(0, 1);

  return response.status(204).json();
});

module.exports = app;
