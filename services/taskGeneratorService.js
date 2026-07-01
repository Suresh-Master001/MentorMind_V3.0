import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// Technical domain skill clusters mapped to real tools/technologies
const TECH_SKILL_CLUSTERS = {
  frontend: ['React', 'Vue.js', 'Angular', 'Next.js', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Redux', 'GraphQL'],
  backend: ['Node.js', 'Express', 'Python', 'Django', 'Java', 'Spring Boot', 'Go', 'Rust', 'PostgreSQL', 'MongoDB', 'Redis'],
  mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Android SDK', 'iOS SDK'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Terraform', 'Jenkins', 'GitHub Actions'],
  testing: ['Jest', 'Cypress', 'Selenium', 'Mocha', 'Chai', 'Playwright', 'Postman', 'JUnit'],
  data: ['Python', 'SQL', 'Pandas', 'Apache Spark', 'Tableau', 'Power BI', 'TensorFlow', 'PyTorch'],
  security: ['OAuth', 'JWT', 'SSL/TLS', 'OWASP', 'Penetration Testing', 'Encryption'],
  design: ['Figma', 'Adobe XD', 'Sketch', 'UI/UX Design', 'Prototyping', 'Design Systems']
};

/**
 * Generate tasks for a project using the Gemini API.
 * Uses technical/tools-based skills and includes duration estimates.
 */
export async function generateTasksForProject(project) {
  if (!genAI) {
    console.warn('Gemini API key not configured. Using fallback tasks.');
    return getFallbackTasks(project);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const techSkillsList = Object.values(TECH_SKILL_CLUSTERS).flat().join(', ');

    const prompt = `You are a senior technical project manager. Given a project title and description, generate a realistic list of TECHNICAL tasks required to complete this project. Each task must use real, specific technologies/tools as skills.

Respond ONLY in valid JSON — no explanation, no markdown, no backticks.

Project Title: ${project.title}
Project Description: ${project.description}
Project Deadline: ${project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : 'N/A'}

Generate 6 to 12 tasks. For each task return:
{
  "tasks": [
    {
      "title": "string (specific technical task name, e.g. 'Setup CI/CD Pipeline with GitHub Actions')",
      "description": "string (clear technical description of what needs to be built)",
      "requiredSkills": ["specific technology/tool like 'Docker', 'GitHub Actions', 'Node.js'", ...],
      "priority": "low" | "medium" | "high" | "critical",
      "estimatedHours": number (1 to 80, realistic hours to complete this task),
      "difficulty": "easy" | "medium" | "hard" | "expert",
      "deadlineOffsetDays": number (days from today when this task should be done)
    }
  ]
}

CRITICAL RULES:
1. requiredSkills MUST be specific technical tools/libraries/frameworks from this list: ${techSkillsList}. DO NOT use generic skills like 'planning', 'development', 'testing', 'design', 'devops'.
2. estimatedHours must be realistic: small features 2-8h, medium features 8-24h, large features 24-80h
3. difficulty should correlate with estimatedHours: easy (2-4h), medium (4-16h), hard (16-40h), expert (40-80h)
4. Distribute deadlines logically across the project timeline from start to end
5. Priority should reflect actual technical importance (implementations and integrations are high; debugging is medium; optimization is low)
6. Use diverse technologies - don't just repeat the same 2 skills for all tasks`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse JSON safely
    let parsed;
    try {
      // Remove any surrounding markdown or code fences
      const cleaned = text.replace(/```json\s*|```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError, 'Raw:', text);
      return getFallbackTasks(project);
    }

    const tasks = parsed.tasks || parsed;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.warn('Gemini returned empty tasks. Using fallback.');
      return getFallbackTasks(project);
    }

    // Validate and normalize each task
    return tasks.map((t) => ({
      title: t.title || 'Untitled Task',
      description: t.description || '',
      requiredSkills: Array.isArray(t.requiredSkills) ? t.requiredSkills : [],
      priority: ['low', 'medium', 'high', 'critical'].includes(t.priority) ? t.priority : 'medium',
      estimatedHours: typeof t.estimatedHours === 'number' && t.estimatedHours >= 0.5 ? t.estimatedHours : 4,
      difficulty: ['easy', 'medium', 'hard', 'expert'].includes(t.difficulty) ? t.difficulty : 'medium',
      deadlineOffsetDays: typeof t.deadlineOffsetDays === 'number' ? t.deadlineOffsetDays : 7
    }));
  } catch (error) {
    console.error('Gemini API error during task generation:', error.message);
    return getFallbackTasks(project);
  }
}

/**
 * Fallback task templates using technical skills and durations when Gemini is unavailable.
 */
function getFallbackTasks(project) {
  const projectDays = project.deadline
    ? Math.max(1, Math.floor((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
    : 30;

  // Calculate estimated hours based on project scope (longer project = bigger scope)
  const scopeFactor = Math.min(5, Math.ceil(projectDays / 10));

  return [
    {
      title: 'Set Up React + Vite Project Scaffold',
      description: 'Initialize project with Vite, configure Tailwind CSS, set up routing and state management',
      requiredSkills: ['React', 'Vite', 'Tailwind CSS'],
      priority: 'high',
      estimatedHours: 4 * scopeFactor,
      difficulty: 'easy',
      deadlineOffsetDays: Math.max(1, Math.floor(projectDays * 0.1))
    },
    {
      title: 'Design Database Schema with MongoDB',
      description: 'Design and implement MongoDB collections, indexes, and data relationships',
      requiredSkills: ['MongoDB', 'Mongoose'],
      priority: 'high',
      estimatedHours: 6 * scopeFactor,
      difficulty: 'medium',
      deadlineOffsetDays: Math.max(2, Math.floor(projectDays * 0.15))
    },
    {
      title: 'Build REST API with Node.js + Express',
      description: 'Create RESTful API endpoints, middleware, authentication with JWT, input validation',
      requiredSkills: ['Node.js', 'Express', 'JWT'],
      priority: 'high',
      estimatedHours: 16 * scopeFactor,
      difficulty: 'medium',
      deadlineOffsetDays: Math.max(3, Math.floor(projectDays * 0.25))
    },
    {
      title: 'Implement Frontend UI Components in React',
      description: 'Build reusable React components, implement responsive layout, integrate API calls',
      requiredSkills: ['React', 'JavaScript', 'HTML/CSS'],
      priority: 'high',
      estimatedHours: 24 * scopeFactor,
      difficulty: 'hard',
      deadlineOffsetDays: Math.max(5, Math.floor(projectDays * 0.4))
    },
    {
      title: 'Write Unit Tests with Jest',
      description: 'Write unit tests for API endpoints and utility functions, achieve >80% coverage',
      requiredSkills: ['Jest', 'Node.js'],
      priority: 'medium',
      estimatedHours: 8 * scopeFactor,
      difficulty: 'medium',
      deadlineOffsetDays: Math.max(7, Math.floor(projectDays * 0.55))
    },
    {
      title: 'Dockerize Application for Development',
      description: 'Create Dockerfile and docker-compose.yml for local development environment',
      requiredSkills: ['Docker'],
      priority: 'medium',
      estimatedHours: 4 * scopeFactor,
      difficulty: 'easy',
      deadlineOffsetDays: Math.max(9, Math.floor(projectDays * 0.7))
    },
    {
      title: 'End-to-End Testing with Cypress',
      description: 'Write E2E tests for critical user flows, test responsive behavior',
      requiredSkills: ['Cypress', 'JavaScript'],
      priority: 'medium',
      estimatedHours: 8 * scopeFactor,
      difficulty: 'medium',
      deadlineOffsetDays: Math.max(11, Math.floor(projectDays * 0.8))
    },
    {
      title: 'Deploy to Production on AWS',
      description: 'Configure AWS EC2/ECS, set up CI/CD pipeline, SSL certificates, and monitoring',
      requiredSkills: ['AWS', 'Docker', 'CI/CD'],
      priority: 'critical',
      estimatedHours: 6 * scopeFactor,
      difficulty: 'hard',
      deadlineOffsetDays: Math.max(13, Math.floor(projectDays * 0.9))
    }
  ];
}