import type { AnalysisResult } from '../types';

export const demoResult: AnalysisResult = {
  atsScore: 72,
  jobMatch: 68,
  clarityScore: 78,
  analyzedAt: new Date().toISOString(),
  jobTitle: 'Desenvolvedor Front-End Júnior',
  strengths: [
    'Experiência prática com React e TypeScript',
    'Projetos pessoais bem documentados no GitHub',
    'Formação técnica em Análise e Desenvolvimento de Sistemas',
    'Habilidade com ferramentas modernas como Vite e Tailwind CSS',
    'Cursos complementares em JavaScript e Git',
  ],
  weaknesses: [
    'Resumo profissional genérico, sem diferencial claro',
    'Falta de métricas nos projetos (ex: "aumentei performance em X%")',
    'Nenhuma experiência profissional formal listada',
    'Palavras-chave da vaga ausentes no texto do currículo',
    'Link do portfólio ausente ou não destacado',
  ],
  risks: [
    'Currículo pode não passar por triagem automática ATS por falta de palavras-chave',
    'Sem experiência formal pode ser um ponto negativo para alguns recrutadores',
    'Foto e dados pessoais desnecessários podem causar viés',
  ],
  foundKeywords: [
    { keyword: 'React', found: true, importance: 'high' },
    { keyword: 'TypeScript', found: true, importance: 'high' },
    { keyword: 'JavaScript', found: true, importance: 'high' },
    { keyword: 'HTML/CSS', found: true, importance: 'high' },
    { keyword: 'Git', found: true, importance: 'medium' },
    { keyword: 'Tailwind CSS', found: true, importance: 'medium' },
    { keyword: 'API REST', found: true, importance: 'medium' },
    { keyword: 'Responsivo', found: false, importance: 'high' },
    { keyword: 'Next.js', found: false, importance: 'high' },
    { keyword: 'Testes unitários', found: false, importance: 'high' },
    { keyword: 'Jest', found: false, importance: 'medium' },
    { keyword: 'Figma', found: false, importance: 'medium' },
    { keyword: 'Acessibilidade', found: false, importance: 'medium' },
    { keyword: 'CI/CD', found: false, importance: 'low' },
    { keyword: 'Scrum/Agile', found: false, importance: 'low' },
  ],
  missingKeywords: [
    { keyword: 'Next.js', found: false, importance: 'high' },
    { keyword: 'Testes unitários', found: false, importance: 'high' },
    { keyword: 'Responsivo', found: false, importance: 'high' },
    { keyword: 'Jest', found: false, importance: 'medium' },
    { keyword: 'Figma', found: false, importance: 'medium' },
    { keyword: 'Acessibilidade', found: false, importance: 'medium' },
    { keyword: 'CI/CD', found: false, importance: 'low' },
    { keyword: 'Scrum/Agile', found: false, importance: 'low' },
  ],
  sectionSuggestions: [
    {
      section: 'Resumo Profissional',
      current: 'Estudante de ADS apaixonado por tecnologia buscando oportunidade na área.',
      suggestion: 'Desenvolvedor Front-End com foco em React e TypeScript, com projetos práticos em aplicações web responsivas. Busco oportunidade como Desenvolvedor Front-End Júnior para contribuir com times ágeis e crescer tecnicamente.',
      priority: 'high',
    },
    {
      section: 'Projetos',
      current: 'Sistema de gerenciamento de tarefas — React, TypeScript',
      suggestion: 'Task Manager App — React 18, TypeScript, Tailwind CSS | Interface responsiva com drag-and-drop, autenticação JWT e integração com API REST. Redução de 40% no tempo de gerenciamento de tarefas. GitHub: github.com/usuario/taskmanager',
      priority: 'high',
    },
    {
      section: 'Habilidades',
      current: 'React, TypeScript, HTML, CSS, JavaScript, Git',
      suggestion: 'Adicione: Next.js, Jest, Testing Library, Figma, Responsivo/Mobile-first, REST APIs, Vite, ESLint — inclua apenas o que você realmente sabe usar.',
      priority: 'medium',
    },
    {
      section: 'Formação',
      current: 'ADS — FATEC São Paulo (2022-2025)',
      suggestion: 'Análise e Desenvolvimento de Sistemas — FATEC São Paulo (2022–2025) | Disciplinas relevantes: Estrutura de Dados, Desenvolvimento Web, Banco de Dados.',
      priority: 'low',
    },
    {
      section: 'LinkedIn / GitHub',
      current: 'Não informado',
      suggestion: 'Inclua linkedin.com/in/seuperfil e github.com/seuperfil com destaque. Garanta que ambos os perfis estejam atualizados com os projetos do currículo.',
      priority: 'high',
    },
  ],
  optimizedResume: `João Silva
Front-End Developer | React · TypeScript · JavaScript
linkedin.com/in/joaosilva | github.com/joaosilva | (11) 99999-9999 | joao@email.com

RESUMO PROFISSIONAL
Desenvolvedor Front-End com foco em React e TypeScript, com projetos práticos em aplicações web responsivas. Experiência com APIs REST, design systems e boas práticas de código. Buscando oportunidade como Desenvolvedor Front-End Júnior para contribuir com times ágeis e crescer tecnicamente.

HABILIDADES TÉCNICAS
Linguagens: JavaScript (ES6+), TypeScript, HTML5, CSS3
Frameworks/Libs: React 18, Next.js (básico), Tailwind CSS, Styled-Components
Ferramentas: Git, GitHub, Vite, VS Code, Figma (básico)
Metodologias: Responsivo/Mobile-first, REST API, Git Flow
Soft Skills: Trabalho em equipe, comunicação, aprendizado rápido

PROJETOS
Task Manager App | React 18, TypeScript, Tailwind CSS, Node.js
- Interface responsiva com drag-and-drop e autenticação JWT
- Integração com API REST para persistência de dados
- Testes com Jest e React Testing Library
github.com/joaosilva/taskmanager

E-commerce Dashboard | React, TypeScript, Chart.js, API REST
- Dashboard administrativo com gráficos e filtros dinâmicos
- Redução de 60% no tempo de visualização de relatórios
- Responsivo para mobile, tablet e desktop
github.com/joaosilva/dashboard

FORMAÇÃO
Análise e Desenvolvimento de Sistemas — FATEC São Paulo (2022–2025)
Disciplinas: Estrutura de Dados, Desenvolvimento Web, Banco de Dados, Engenharia de Software

CURSOS COMPLEMENTARES
React do Zero ao Avançado — Udemy (2023)
TypeScript para Desenvolvedores JavaScript — Alura (2023)
Git e GitHub: Controle de Versão — DIO (2022)`,
  recruiterMessage: `Olá [Nome do Recrutador], tudo bem?

Vi a vaga de Desenvolvedor Front-End Júnior na [Nome da Empresa] e acredito que meu perfil se encaixa bem com o que vocês buscam.

Tenho experiência prática com React e TypeScript através de projetos pessoais, incluindo um Task Manager e um Dashboard responsivo. Estou cursando ADS na FATEC e sou apaixonado por criar interfaces modernas e funcionais.

Adoraria conversar sobre como posso contribuir com o time de vocês. Meu portfólio está disponível no GitHub: github.com/joaosilva

Agradeço a atenção!
João Silva`,
  coverLetter: `Prezado(a) time de recrutamento da [Empresa],

Me chamo João Silva e estou candidatando-me à vaga de Desenvolvedor Front-End Júnior divulgada na plataforma [LinkedIn/Site].

Sou estudante de Análise e Desenvolvimento de Sistemas pela FATEC São Paulo e desenvolvo projetos práticos com React, TypeScript e Tailwind CSS. Acredito que minha dedicação ao aprendizado contínuo e minha capacidade de entrega de código limpo e responsivo se alinham diretamente com os requisitos da posição.

Destaco como principais contribuições que posso oferecer:
• Desenvolvimento de interfaces responsivas com React e TypeScript
• Integração com APIs REST e gestão de estado
• Comprometimento com boas práticas e código limpo

Agradeço a oportunidade de consideração e fico à disposição para uma conversa.

Atenciosamente,
João Silva`,
  recruiterView: {
    summary30s: 'Estudante de ADS com sólidos projetos em React e TypeScript. Perfil hands-on com portfólio ativo no GitHub. Sem experiência CLT, mas demonstra proatividade e aprendizado consistente. Bom fit para vagas de estágio ou júnior em times que valorizam curva de aprendizado rápida.',
    strengths: [
      'Portfólio técnico ativo com projetos relevantes',
      'Domínio das tecnologias principais da vaga (React, TS)',
      'Formação técnica alinhada à área',
      'Perfil de aprendizado rápido e autodidata',
    ],
    risks: [
      'Sem experiência profissional formal documentada',
      'Nenhuma métrica de impacto nos projetos',
      'Currículo genérico pode se perder em triagem em massa',
    ],
    topSkills: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Git', 'HTML/CSS'],
    interviewQuestions: [
      'Me conta sobre o projeto Task Manager. Qual foi o maior desafio técnico?',
      'Como você estrutura um componente React? Quando usa useState vs useReducer?',
      'Você já trabalhou com TypeScript em projetos reais? Me dê um exemplo.',
      'Como você garante que uma interface é responsiva? Qual sua abordagem?',
      'O que você está estudando atualmente para se desenvolver na área?',
      'Como você lida com code review e feedback de outros devs?',
    ],
  },
  detectorProvaReal: [
    {
      habilidade: 'Next.js',
      status: 'sem_comprovacao',
      risco: 'alto',
      motivo: 'Next.js aparece nas habilidades, mas não está associado a projeto, experiência, curso ou certificação.',
      como_comprovar: 'Adicionar um projeto real em Next.js ao GitHub e descrever no currículo as funcionalidades implementadas.',
    },
    {
      habilidade: 'Figma',
      status: 'sem_comprovacao',
      risco: 'medio',
      motivo: 'Figma está listado como básico, mas não há protótipo, projeto de design ou trabalho prático associado.',
      como_comprovar: 'Incluir um protótipo real no portfólio e explicar como o Figma foi usado no projeto.',
    },
    {
      habilidade: 'Node.js',
      status: 'comprovacao_parcial',
      risco: 'medio',
      motivo: 'Node.js aparece em um projeto, mas a descrição não informa quais tarefas de back-end foram realizadas.',
      como_comprovar: 'Detalhar endpoints, integrações ou regras de negócio implementadas com Node.js e vincular o repositório.',
    },
  ],
  improvementPlan: [
    { step: 1, action: 'Reescreva o resumo profissional', impact: 'high', detail: 'Use a sugestão da aba "Visão Geral". Um resumo forte aumenta o score em até 15 pontos. Seja específico, mencione as tecnologias da vaga e seu objetivo.' },
    { step: 2, action: 'Adicione métricas nos projetos', impact: 'high', detail: 'Transforme descrições genéricas em resultados. Ex: "Reduzi o tempo de carregamento em 40%", "Interface usada por 200+ usuários". Métricas aumentam credibilidade.' },
    { step: 3, action: 'Inclua palavras-chave da vaga', impact: 'high', detail: 'Adicione no currículo: responsivo/mobile-first, testes unitários, Next.js (se souber). Sistemas ATS buscam correspondência direta com o texto da vaga.' },
    { step: 4, action: 'Crie um projeto com Next.js e testes', impact: 'medium', detail: 'Desenvolva um projeto usando Next.js + Jest. Isso preenche 2 gaps críticos da vaga de uma vez. Documente bem no README e suba no GitHub.' },
    { step: 5, action: 'Adicione links de portfólio com destaque', impact: 'medium', detail: 'Coloque GitHub e portfólio logo no cabeçalho, junto do nome. Recrutadores olham isso nos primeiros 10 segundos.' },
    { step: 6, action: 'Otimize seu perfil LinkedIn', impact: 'low', detail: 'Atualize o LinkedIn com os mesmos projetos do currículo. Ative "Open to Work". Inclua as mesmas palavras-chave para aparecer em buscas.' },
  ],
};
