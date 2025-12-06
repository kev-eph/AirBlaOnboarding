
CREATE DATABASE IF NOT EXISTS airbla_onboarding;
USE airbla_onboarding;


CREATE TABLE IF NOT EXISTS colaboradores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cargo VARCHAR(100) NOT NULL,
  departamento VARCHAR(100) NOT NULL,
  data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progresso_onboarding INT DEFAULT 0,
  status_onboarding ENUM('pendente', 'em_andamento', 'concluido') DEFAULT 'pendente',
  INDEX idx_email (email),
  INDEX idx_status (status_onboarding)
);


CREATE TABLE IF NOT EXISTS modulos_treinamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  duracao_minutos INT,
  ordem INT NOT NULL,
  categoria ENUM('cultura', 'processos', 'ferramentas', 'compliance') NOT NULL,
  conteudo TEXT,
  videoUrl VARCHAR(500),
  quiz JSON,
  INDEX idx_ordem (ordem)
);

CREATE TABLE IF NOT EXISTS modulos_concluidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  colaborador_id INT NOT NULL,
  modulo_id INT NOT NULL,
  data_conclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE,
  FOREIGN KEY (modulo_id) REFERENCES modulos_treinamento(id) ON DELETE CASCADE,
  UNIQUE KEY unique_conclusao (colaborador_id, modulo_id),
  INDEX idx_colaborador (colaborador_id),
  INDEX idx_modulo (modulo_id)
);


INSERT INTO colaboradores (nome, email, cargo, departamento, progresso_onboarding, status_onboarding) VALUES
('Ana Silva', 'ana.silva@airbla.com', 'Desenvolvedora Front-end', 'Tecnologia', 75, 'em_andamento'),
('Carlos Santos', 'carlos.santos@airbla.com', 'Analista de Marketing', 'Marketing', 100, 'concluido'),
('Mariana Costa', 'mariana.costa@airbla.com', 'Gerente de Projetos', 'Gestão', 40, 'em_andamento'),
('João Pereira', 'joao.pereira@airbla.com', 'Designer UX/UI', 'Design', 0, 'pendente'),
('Fernanda Lima', 'fernanda.lima@airbla.com', 'Analista de RH', 'Recursos Humanos', 90, 'em_andamento');

INSERT INTO modulos_treinamento (titulo, descricao, duracao_minutos, ordem, categoria, conteudo, videoUrl, quiz) VALUES
('Bem-vindo à AirBLÁ', 'Conheça a história, missão e valores da empresa', 30, 1, 'cultura', 
'A AirBLÁ nasceu com o propósito de transformar a experiência de viagem. Nossa cultura é baseada em inovação, colaboração e excelência no atendimento. Fundada em 2020, a empresa cresceu rapidamente e hoje conta com mais de 500 colaboradores dedicados a criar experiências memoráveis para nossos clientes.',
'https://www.youtube.com/embed/RPaZYqdS6qg',
'[{"question":"Quando a AirBLÁ foi fundada?","options":["2018","2019","2020","2021"],"correctAnswer":2},{"question":"Quantos colaboradores a AirBLÁ possui atualmente?","options":["Mais de 200","Mais de 500","Mais de 1000","Mais de 100"],"correctAnswer":1},{"question":"Qual é o principal propósito da AirBLÁ?","options":["Lucro máximo","Transformar a experiência de viagem","Expansão internacional","Tecnologia avançada"],"correctAnswer":1}]'),

('Cultura Organizacional', 'Entenda nossos valores e como vivê-los no dia a dia', 45, 2, 'cultura',
'Nossos valores fundamentais são: Inovação Constante - buscamos sempre novas formas de fazer melhor; Colaboração Ativa - trabalhamos em equipe e valorizamos todas as vozes; Foco no Cliente - o cliente está no centro de todas as nossas decisões; Transparência - comunicamos de forma clara e honesta; Respeito à Diversidade - valorizamos e celebramos as diferenças.',
'https://www.youtube.com/embed/RPaZYqdS6qg',
'[{"question":"Quantos valores fundamentais a AirBLÁ possui?","options":["3","4","5","6"],"correctAnswer":2},{"question":"Qual valor coloca o cliente no centro das decisões?","options":["Inovação Constante","Foco no Cliente","Transparência","Colaboração Ativa"],"correctAnswer":1},{"question":"A diversidade é valorizada na AirBLÁ?","options":["Sim, é um dos valores fundamentais","Não é mencionada","Apenas em algumas áreas","Não é prioridade"],"correctAnswer":0}]'),

('Ferramentas de Trabalho', 'Aprenda a usar as principais ferramentas do dia a dia', 60, 3, 'ferramentas',
'Utilizamos Slack para comunicação interna rápida e eficiente; Jira para gestão de projetos e acompanhamento de tarefas; Google Workspace para documentos, planilhas e apresentações colaborativas; GitHub para versionamento de código e colaboração em desenvolvimento; e Zoom para reuniões virtuais e comunicação com equipes remotas.',
'https://www.youtube.com/embed/RPaZYqdS6qg',
'[{"question":"Qual ferramenta usamos para comunicação interna?","options":["WhatsApp","Slack","Teams","Discord"],"correctAnswer":1},{"question":"Para que serve o Jira?","options":["Comunicação","Versionamento de código","Gestão de projetos","Reuniões virtuais"],"correctAnswer":2},{"question":"Qual ferramenta usamos para versionamento de código?","options":["GitLab","Bitbucket","GitHub","SVN"],"correctAnswer":2}]'),

('Processos Internos', 'Conheça os principais processos e fluxos de trabalho', 50, 4, 'processos',
'Entenda como funcionam os principais processos da empresa: aprovações devem seguir a hierarquia definida; solicitações de férias devem ser feitas com 30 dias de antecedência; reembolsos são processados em até 7 dias úteis após aprovação; reuniões recorrentes incluem daily às 9h e retrospectiva quinzenal; cerimônias ágeis como planning e review são realizadas a cada sprint.',
'https://www.youtube.com/embed/RPaZYqdS6qg',
'[{"question":"Com quantos dias de antecedência devem ser solicitadas as férias?","options":["15 dias","20 dias","30 dias","45 dias"],"correctAnswer":2},{"question":"Em quanto tempo são processados os reembolsos?","options":["3 dias úteis","7 dias úteis","10 dias úteis","15 dias úteis"],"correctAnswer":1},{"question":"Que horas é a daily?","options":["8h","9h","10h","11h"],"correctAnswer":1}]'),

('Compliance e Segurança', 'Políticas de segurança da informação e LGPD', 40, 5, 'compliance',
'A segurança dos dados é nossa prioridade máxima. Seguimos rigorosamente a LGPD (Lei Geral de Proteção de Dados): todas as senhas devem ter no mínimo 12 caracteres com letras, números e símbolos; dados de clientes são criptografados em repouso e em trânsito; acesso aos dados é controlado por níveis de permissão; incidentes de segurança devem ser reportados imediatamente; treinamentos de segurança são obrigatórios anualmente.',
'https://www.youtube.com/embed/RPaZYqdS6qg',
'[{"question":"Quantos caracteres mínimos as senhas devem ter?","options":["8","10","12","16"],"correctAnswer":2},{"question":"Como os dados de clientes são protegidos?","options":["Apenas backup","Criptografia em repouso e trânsito","Apenas firewall","Não há proteção específica"],"correctAnswer":1},{"question":"Com que frequência são os treinamentos de segurança?","options":["Mensalmente","Trimestralmente","Semestralmente","Anualmente"],"correctAnswer":3}]'),

('Metodologias Ágeis', 'Scrum e Kanban na prática', 55, 6, 'processos',
'Trabalhamos com metodologias ágeis para entregar valor continuamente. Nossas cerimônias incluem: Daily Standup (15 min) - sincronização diária da equipe; Sprint Planning - planejamento do trabalho da sprint; Sprint Review - demonstração do trabalho realizado; Retrospectiva - reflexão sobre melhorias; Refinamento - detalhamento de histórias futuras. Os sprints têm duração de 2 semanas.',
'https://www.youtube.com/embed/RPaZYqdS6qg',
'[{"question":"Qual a duração dos sprints na AirBLÁ?","options":["1 semana","2 semanas","3 semanas","4 semanas"],"correctAnswer":1},{"question":"Quanto tempo dura uma Daily Standup?","options":["5 minutos","10 minutos","15 minutos","30 minutos"],"correctAnswer":2},{"question":"O que é feito na Retrospectiva?","options":["Planejamento de tarefas","Demonstração do trabalho","Reflexão sobre melhorias","Refinamento de histórias"],"correctAnswer":2}]'),

('Diversidade e Inclusão', 'Promovendo um ambiente inclusivo e respeitoso', 35, 7, 'cultura',
'Valorizamos a diversidade em todas as suas formas: gênero, etnia, idade, orientação sexual, deficiência, origem e experiências. Temos programas ativos de inclusão, grupos de afinidade para apoio mútuo, canais de denúncia anônimos e seguros, treinamentos contínuos sobre viés inconsciente, políticas de linguagem inclusiva, e adaptações para pessoas com deficiência. Todos são responsáveis por promover um ambiente respeitoso.',
'https://www.youtube.com/embed/RPaZYqdS6qg',
'[{"question":"A AirBLÁ possui canais de denúncia?","options":["Não possui","Sim, anônimos e seguros","Apenas para gestores","Apenas presenciais"],"correctAnswer":1},{"question":"Quem é responsável por promover um ambiente respeitoso?","options":["Apenas o RH","Apenas os gestores","Todos os colaboradores","Apenas a diretoria"],"correctAnswer":2},{"question":"Há adaptações para pessoas com deficiência?","options":["Não há","Sim, são previstas","Apenas em alguns casos","Não é mencionado"],"correctAnswer":1}]'),

('Atendimento ao Cliente', 'Excelência no relacionamento com clientes', 45, 8, 'processos',
'O cliente está no centro de tudo que fazemos. Nossas diretrizes de atendimento incluem: responder em até 2 horas durante horário comercial; usar linguagem clara e empática; sempre buscar resolver o problema na primeira interação; oferecer soluções, não desculpas; seguir os SLAs estabelecidos; registrar todos os atendimentos no sistema; solicitar feedback após resolução. Encantar o cliente é nosso objetivo.',
'https://www.youtube.com/embed/RPaZYqdS6qg',
'[{"question":"Qual o tempo máximo para responder ao cliente?","options":["1 hora","2 horas","4 horas","24 horas"],"correctAnswer":1},{"question":"Quando devemos solicitar feedback?","options":["Antes do atendimento","Durante o atendimento","Após a resolução","Nunca"],"correctAnswer":2},{"question":"Qual é o objetivo principal no atendimento?","options":["Fechar o chamado rápido","Encantar o cliente","Seguir o script","Evitar reclamações"],"correctAnswer":1}]');

INSERT INTO modulos_concluidos (colaborador_id, modulo_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8),
(3, 1), (3, 2),
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 7);
