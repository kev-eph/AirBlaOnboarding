import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [colaboradores, setColaboradores] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);


  const [newColaborador, setNewColaborador] = useState({
    nome: '',
    email: '',
    cargo: '',
    departamento: ''
  });


  useEffect(() => {
    loadDashboardStats();
    loadColaboradores();
    loadModulos();
  }, []);


  const loadDashboardStats = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      showMessage('Erro ao carregar estatísticas', 'error');
    }
  };

  const loadColaboradores = async () => {
    try {
      const response = await fetch(`${API_URL}/colaboradores`);
      const data = await response.json();
      setColaboradores(data);
    } catch (error) {
      showMessage('Erro ao carregar colaboradores', 'error');
    }
  };

  const loadModulos = async () => {
    try {
      const response = await fetch(`${API_URL}/modulos`);
      const data = await response.json();
      setModulos(data);
    } catch (error) {
      showMessage('Erro ao carregar módulos', 'error');
    }
  };

  const loadColaboradorDetails = async (id) => {
    try {
      const [colaboradorRes, modulosRes] = await Promise.all([
        fetch(`${API_URL}/colaboradores/${id}`),
        fetch(`${API_URL}/colaboradores/${id}/modulos-concluidos`)
      ]);
      
      const colaborador = await colaboradorRes.json();
      const modulosConcluidos = await modulosRes.json();
      
      setSelectedColaborador({ ...colaborador, modulosConcluidos });
      setActiveTab('detalhes');
    } catch (error) {
      showMessage('Erro ao carregar detalhes do colaborador', 'error');
    }
  };

  // Cadastrar novo colaborador
  const handleCadastrar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/colaboradores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newColaborador)
      });

      if (response.ok) {
        showMessage('Colaborador cadastrado com sucesso!', 'success');
        setNewColaborador({ nome: '', email: '', cargo: '', departamento: '' });
        loadColaboradores();
        loadDashboardStats();
        setActiveTab('colaboradores');
      } else {
        const error = await response.json();
        showMessage(error.error || 'Erro ao cadastrar colaborador', 'error');
      }
    } catch (error) {
      showMessage('Erro ao cadastrar colaborador', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar progresso
  const handleUpdateProgresso = async (id, novoProgresso) => {
    try {
      const response = await fetch(`${API_URL}/colaboradores/${id}/progresso`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progresso_onboarding: novoProgresso })
      });

      if (response.ok) {
        showMessage('Progresso atualizado com sucesso!', 'success');
        loadColaboradores();
        loadDashboardStats();
        if (selectedColaborador && selectedColaborador.id === id) {
          loadColaboradorDetails(id);
        }
      }
    } catch (error) {
      showMessage('Erro ao atualizar progresso', 'error');
    }
  };

  // Marcar módulo como concluído
  const handleConcluirModulo = async (colaboradorId, moduloId) => {
    try {
      const response = await fetch(`${API_URL}/modulos/concluir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colaborador_id: colaboradorId, modulo_id: moduloId })
      });

      if (response.ok) {
        showMessage('Módulo concluído!', 'success');
        loadColaboradorDetails(colaboradorId);
        
        const totalModulos = modulos.length;
        const modulosConcluidos = selectedColaborador.modulosConcluidos.length + 1;
        const novoProgresso = Math.round((modulosConcluidos / totalModulos) * 100);
        handleUpdateProgresso(colaboradorId, novoProgresso);
      } else {
        const error = await response.json();
        showMessage(error.error || 'Erro ao concluir módulo', 'error');
      }
    } catch (error) {
      showMessage('Erro ao concluir módulo', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleOpenModulo = (modulo) => {
    setSelectedModulo(modulo);
    setQuizAnswers({});
    setQuizResult(null);
    setActiveTab('modulo-view');
  };

  const handleQuizAnswer = (questionIndex, answer) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: answer
    });
  };

  const handleSubmitQuiz = () => {
    const modulo = selectedModulo;
    let correctAnswers = 0;
    const totalQuestions = modulo.quiz.length;

    modulo.quiz.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;
    const passed = score >= 70;

    setQuizResult({
      score,
      passed,
      correctAnswers,
      totalQuestions
    });

    if (passed) {
      showMessage('Parabéns! Você passou no teste! 🎉', 'success');
    } else {
      showMessage('Você precisa acertar pelo menos 70% para concluir o módulo. Tente novamente!', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'concluido': return '#10b981';
      case 'em_andamento': return '#f59e0b';
      case 'pendente': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'concluido': return 'Concluído';
      case 'em_andamento': return 'Em Andamento';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const getCategoriaIcon = (categoria) => {
    switch(categoria) {
      case 'cultura': return '🎯';
      case 'processos': return '⚙️';
      case 'ferramentas': return '🛠️';
      case 'compliance': return '🔒';
      default: return '📚';
    }
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>✈️ AirBLÁ Onboarding</h1>
            <p>Sistema de Integração de Colaboradores</p>
          </div>
        </div>
      </header>

      {/* Message Toast */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Navigation */}
      <nav className="nav">
        <div className="container">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'colaboradores' ? 'active' : ''} 
            onClick={() => setActiveTab('colaboradores')}
          >
            👥 Colaboradores
          </button>
          <button 
            className={activeTab === 'modulos' ? 'active' : ''} 
            onClick={() => setActiveTab('modulos')}
          >
            📚 Módulos
          </button>
          <button 
            className={activeTab === 'cadastrar' ? 'active' : ''} 
            onClick={() => setActiveTab('cadastrar')}
          >
            ➕ Cadastrar
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main container">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <h2>Dashboard de Onboarding</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{stats.totalColaboradores || 0}</h3>
                  <p>Total de Colaboradores</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>{stats.emAndamento || 0}</h3>
                  <p>Em Andamento</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{stats.concluidos || 0}</h3>
                  <p>Concluídos</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>{Math.round(stats.mediaProgresso || 0)}%</h3>
                  <p>Progresso Médio</p>
                </div>
              </div>
            </div>

            <div className="recent-section">
              <h3>Colaboradores Recentes</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Cargo</th>
                      <th>Departamento</th>
                      <th>Progresso</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colaboradores.slice(0, 5).map(col => (
                      <tr key={col.id} onClick={() => loadColaboradorDetails(col.id)} style={{cursor: 'pointer'}}>
                        <td>{col.nome}</td>
                        <td>{col.cargo}</td>
                        <td>{col.departamento}</td>
                        <td>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{width: `${col.progresso_onboarding}%`}}></div>
                            <span className="progress-text">{col.progresso_onboarding}%</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge" style={{backgroundColor: getStatusColor(col.status_onboarding)}}>
                            {getStatusText(col.status_onboarding)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Colaboradores Tab */}
        {activeTab === 'colaboradores' && (
          <div className="colaboradores">
            <h2>Gerenciar Colaboradores</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Cargo</th>
                    <th>Departamento</th>
                    <th>Progresso</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {colaboradores.map(col => (
                    <tr key={col.id}>
                      <td>{col.id}</td>
                      <td>{col.nome}</td>
                      <td>{col.email}</td>
                      <td>{col.cargo}</td>
                      <td>{col.departamento}</td>
                      <td>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: `${col.progresso_onboarding}%`}}></div>
                          <span className="progress-text">{col.progresso_onboarding}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="status-badge" style={{backgroundColor: getStatusColor(col.status_onboarding)}}>
                          {getStatusText(col.status_onboarding)}
                        </span>
                      </td>
                      <td>
                        <button className="btn-small" onClick={() => loadColaboradorDetails(col.id)}>
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Módulos Tab */}
        {activeTab === 'modulos' && (
          <div className="modulos">
            <h2>Módulos de Treinamento</h2>
            <div className="modulos-grid">
              {modulos.map(mod => (
                <div 
                  key={mod.id} 
                  className="modulo-card"
                  onClick={() => handleOpenModulo(mod)}
                  style={{cursor: 'pointer'}}
                >
                  <div className="modulo-header">
                    <span className="modulo-icon">{getCategoriaIcon(mod.categoria)}</span>
                    <span className="modulo-ordem">Módulo {mod.ordem}</span>
                  </div>
                  <h3>{mod.titulo}</h3>
                  <p className="modulo-descricao">{mod.descricao}</p>
                  <div className="modulo-meta">
                    <span>⏱️ {mod.duracao_minutos} min</span>
                    <span className="categoria-badge">{mod.categoria}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cadastrar Tab */}
        {activeTab === 'cadastrar' && (
          <div className="cadastrar">
            <h2>Cadastrar Novo Colaborador</h2>
            <form onSubmit={handleCadastrar} className="form">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={newColaborador.nome}
                  onChange={(e) => setNewColaborador({...newColaborador, nome: e.target.value})}
                  required
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div className="form-group">
                <label>Email Corporativo *</label>
                <input
                  type="email"
                  value={newColaborador.email}
                  onChange={(e) => setNewColaborador({...newColaborador, email: e.target.value})}
                  required
                  placeholder="Ex: maria.silva@airbla.com"
                />
              </div>
              <div className="form-group">
                <label>Cargo *</label>
                <input
                  type="text"
                  value={newColaborador.cargo}
                  onChange={(e) => setNewColaborador({...newColaborador, cargo: e.target.value})}
                  required
                  placeholder="Ex: Desenvolvedor Full Stack"
                />
              </div>
              <div className="form-group">
                <label>Departamento *</label>
                <select
                  value={newColaborador.departamento}
                  onChange={(e) => setNewColaborador({...newColaborador, departamento: e.target.value})}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Design">Design</option>
                  <option value="Gestão">Gestão</option>
                  <option value="Operações">Operações</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar Colaborador'}
              </button>
            </form>
          </div>
        )}

        {/* Detalhes do Colaborador */}
        {activeTab === 'detalhes' && selectedColaborador && (
          <div className="detalhes">
            <button className="btn-back" onClick={() => {setActiveTab('colaboradores'); setSelectedColaborador(null);}}>
              ← Voltar
            </button>
            
            <div className="detalhes-header">
              <div>
                <h2>{selectedColaborador.nome}</h2>
                <p className="subtitle">{selectedColaborador.cargo} • {selectedColaborador.departamento}</p>
                <p className="email">{selectedColaborador.email}</p>
              </div>
              <span className="status-badge-large" style={{backgroundColor: getStatusColor(selectedColaborador.status_onboarding)}}>
                {getStatusText(selectedColaborador.status_onboarding)}
              </span>
            </div>

            <div className="progress-section">
              <h3>Progresso do Onboarding</h3>
              <div className="progress-bar-large">
                <div className="progress-fill" style={{width: `${selectedColaborador.progresso_onboarding}%`}}></div>
                <span className="progress-text">{selectedColaborador.progresso_onboarding}%</span>
              </div>
              <p className="progress-info">
                {selectedColaborador.modulosConcluidos.length} de {modulos.length} módulos concluídos
              </p>
            </div>

            <div className="modulos-progresso">
              <h3>Módulos de Treinamento</h3>
              {modulos.map(mod => {
                const concluido = selectedColaborador.modulosConcluidos.some(mc => mc.id === mod.id);
                return (
                  <div key={mod.id} className={`modulo-item ${concluido ? 'concluido' : ''}`}>
                    <div className="modulo-item-header">
                      <span className="modulo-icon">{getCategoriaIcon(mod.categoria)}</span>
                      <div className="modulo-item-info">
                        <h4>{mod.titulo}</h4>
                        <p>{mod.descricao}</p>
                        <span className="modulo-meta-small">⏱️ {mod.duracao_minutos} min</span>
                      </div>
                      {concluido ? (
                        <span className="check-icon">✅</span>
                      ) : (
                        <button 
                          className="btn-concluir" 
                          onClick={() => handleConcluirModulo(selectedColaborador.id, mod.id)}
                        >
                          Marcar como Concluído
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Visualização do Módulo */}
        {activeTab === 'modulo-view' && selectedModulo && (
          <div className="modulo-view">
            <button className="btn-back" onClick={() => {setActiveTab('modulos'); setSelectedModulo(null); setQuizResult(null);}}>
              ← Voltar para Módulos
            </button>

            <div className="modulo-content-header">
              <div className="modulo-title-section">
                <span className="modulo-icon-large">{getCategoriaIcon(selectedModulo.categoria)}</span>
                <div>
                  <span className="modulo-ordem-large">Módulo {selectedModulo.ordem}</span>
                  <h2>{selectedModulo.titulo}</h2>
                  <p className="subtitle">{selectedModulo.descricao}</p>
                </div>
              </div>
              <div className="modulo-meta-info">
                <span>⏱️ {selectedModulo.duracao_minutos} minutos</span>
                <span className="categoria-badge-large">{selectedModulo.categoria}</span>
              </div>
            </div>

            <div className="modulo-content-body">
              <div className="modulo-section">
                <h3>📖 Conteúdo</h3>
                <p>{selectedModulo.conteudo}</p>
              </div>

              {selectedModulo.videoUrl && (
                <div className="modulo-section">
                  <h3>🎥 Vídeo do Módulo</h3>
                  <div className="video-container">
                    <iframe
                      width="100%"
                      height="450"
                      src={selectedModulo.videoUrl}
                      title="Vídeo do Módulo"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              <div className="modulo-section quiz-section">
                <h3>✍️ Teste de Conhecimento</h3>
                <p className="quiz-intro">Responda às questões abaixo para concluir o módulo. Você precisa acertar pelo menos 70% das questões.</p>

                {selectedModulo.quiz && selectedModulo.quiz.map((question, qIndex) => (
                  <div key={qIndex} className="quiz-question">
                    <h4>Questão {qIndex + 1}</h4>
                    <p className="question-text">{question.question}</p>
                    <div className="quiz-options">
                      {question.options.map((option, oIndex) => (
                        <label key={oIndex} className="quiz-option">
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            value={oIndex}
                            checked={quizAnswers[qIndex] === oIndex}
                            onChange={() => handleQuizAnswer(qIndex, oIndex)}
                            disabled={quizResult !== null}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {!quizResult && (
                  <button 
                    className="btn-primary" 
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length !== selectedModulo.quiz.length}
                  >
                    Enviar Respostas
                  </button>
                )}

                {quizResult && (
                  <div className={`quiz-result ${quizResult.passed ? 'passed' : 'failed'}`}>
                    <h4>{quizResult.passed ? '🎉 Parabéns!' : '😔 Não foi dessa vez!'}</h4>
                    <p>Você acertou {quizResult.correctAnswers} de {quizResult.totalQuestions} questões ({Math.round(quizResult.score)}%)</p>
                    {quizResult.passed ? (
                      <p className="result-message">Você concluiu o módulo com sucesso!</p>
                    ) : (
                      <p className="result-message">Você precisa de pelo menos 70% para concluir. Revise o conteúdo e tente novamente.</p>
                    )}
                    <button 
                      className="btn-primary" 
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizResult(null);
                      }}
                    >
                      {quizResult.passed ? 'Voltar aos Módulos' : 'Tentar Novamente'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2024 AirBLÁ - Sistema de Onboarding | Desenvolvido com React + Node.js + MySQL</p>
        </div>
      </footer>
    </div>
  );
}

export default App;