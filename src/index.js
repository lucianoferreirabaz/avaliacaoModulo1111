const express = require("express");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

const cache = {
  users: [],
  recados: [],
};

function findUserByEmail(email) {
  return cache.users.find((user) => user.email === email);
}

function findRecadosByUserId(userId) {
  return cache.recados.filter((recado) => recado.usuario === userId);
}

app.post("/criar-conta", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const hashSenha = await bcrypt.hash(senha, 10);

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Já existe um usuário com esse email" });
    }

    const newUser = {
      id: Date.now().toString(),
      nome,
      email,
      senha: hashSenha,
    };

    cache.users.push(newUser);
    res.status(201).json({ message: "Conta criada com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar conta" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    res.json({ message: "Login realizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

app.post("/recados", async (req, res) => {
  try {
    const { titulo, descricao, usuarioId } = req.body;
    const recado = {
      id: Date.now().toString(),
      titulo,
      descricao,
      usuario: usuarioId,
    };

    cache.recados.push(recado);
    res.status(201).json({ message: "Recado criado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar recado" });
  }
});

app.get("/recados/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const recados = findRecadosByUserId(usuarioId);
    res.json(recados);
  } catch (err) {
    res.status(500).json({ error: "Erro ao obter recados" });
  }
});

app.put("/recados/:id", async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    const { id } = req.params;
    const recado = cache.recados.find((r) => r.id === id);

    if (!recado) {
      return res.status(404).json({ error: "Recado não encontrado" });
    }

    recado.titulo = titulo;
    recado.descricao = descricao;

    res.json({ message: "Recado atualizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar recado" });
  }
});

app.delete("/recados/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const index = cache.recados.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Recado não encontrado" });
    }

    cache.recados.splice(index, 1);
    res.json({ message: "Recado excluído com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir recado" });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
