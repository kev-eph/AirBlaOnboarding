const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'airbla_onboarding'
});


db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL com sucesso!');
});



app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando!' });
});


app.get('/api/colaboradores', (req, res) => {
  const query = 'SELECT * FROM colaboradores ORDER BY data_entrada DESC';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


app.get('/api/colaboradores/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM colaboradores WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Colaborador não encontrado' });
    }
    res.json(results[0]);
  });
});


app.post('/api/colaboradores', (req, res) => {
  const { nome, email, cargo, departamento } = req.body;
  
  if (!nome || !email || !cargo || !departamento) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const query = 'INSERT INTO colaboradores (nome, email, cargo, departamento) VALUES (?, ?, ?, ?)';
  db.query(query, [nome, email, cargo, departamento], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      id: result.insertId, 
      nome, 
      email, 
      cargo, 
      departamento,
      message: 'Colaborador cadastrado com sucesso!' 
    });
  });
});

app.put('/api/colaboradores/:id/progresso', (req, res) => {
  const { id } = req.params;
  const { progresso_onboarding } = req.body;

  if (progresso_onboarding < 0 || progresso_onboarding > 100) {
    return res.status(400).json({ error: 'Progresso deve estar entre 0 e 100' });
  }

  const status = progresso_onboarding === 100 ? 'concluido' : 'em_andamento';
  const query = 'UPDATE colaboradores SET progresso_onboarding = ?, status_onboarding = ? WHERE id = ?';
  
  db.query(query, [progresso_onboarding, status, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Colaborador não encontrado' });
    }
    res.json({ message: 'Progresso atualizado com sucesso!', progresso_onboarding, status });
  });
});


app.get('/api/modulos', (req, res) => {
  const query = 'SELECT * FROM modulos_treinamento ORDER BY ordem';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


app.post('/api/modulos/concluir', (req, res) => {
  const { colaborador_id, modulo_id } = req.body;

  if (!colaborador_id || !modulo_id) {
    return res.status(400).json({ error: 'colaborador_id e modulo_id são obrigatórios' });
  }

  const query = 'INSERT INTO modulos_concluidos (colaborador_id, modulo_id) VALUES (?, ?)';
  db.query(query, [colaborador_id, modulo_id], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Módulo já foi concluído por este colaborador' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Módulo marcado como concluído!' });
  });
});


app.get('/api/colaboradores/:id/modulos-concluidos', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT m.*, mc.data_conclusao 
    FROM modulos_concluidos mc
    JOIN modulos_treinamento m ON mc.modulo_id = m.id
    WHERE mc.colaborador_id = ?
    ORDER BY mc.data_conclusao DESC
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


app.get('/api/dashboard/stats', (req, res) => {
  const queries = {
    totalColaboradores: 'SELECT COUNT(*) as total FROM colaboradores',
    emAndamento: 'SELECT COUNT(*) as total FROM colaboradores WHERE status_onboarding = "em_andamento"',
    concluidos: 'SELECT COUNT(*) as total FROM colaboradores WHERE status_onboarding = "concluido"',
    mediaProgresso: 'SELECT AVG(progresso_onboarding) as media FROM colaboradores'
  };

  const stats = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, results) => {
      if (err) {
        console.error(`Erro na query ${key}:`, err);
        stats[key] = 0;
      } else {
        stats[key] = results[0].total || results[0].media || 0;
      }
      
      completed++;
      if (completed === totalQueries) {
        res.json(stats);
      }
    });
  });
});


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Pressione Ctrl+C para parar o servidor');
});