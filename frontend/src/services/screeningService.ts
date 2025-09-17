import { JobDescription, ScreeningResult, Question } from '../types';

// Mock CV parsing service
export const parseCVContent = async (file: File): Promise<string> => {
  // In a real app, this would use a PDF parsing library or API
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Simulate CV content extraction
      const mockCVContent = `
        John Doe
        Senior Software Engineer
        
        Experience:
        - 5 years of React development
        - 3 years of Node.js backend development
        - Experience with TypeScript, JavaScript, Python
        - Worked with AWS, Docker, Kubernetes
        - Led teams of 3-5 developers
        - Built scalable web applications
        
        Skills:
        React, TypeScript, Node.js, Python, AWS, Docker, Git, Agile, Leadership
        
        Education:
        Bachelor's in Computer Science
      `;
      
      setTimeout(() => resolve(mockCVContent), 1000);
    };
    reader.readAsText(file);
  });
};

// Mock AI screening service
export const screenCandidate = async (
  cvContent: string,
  jobDescription: JobDescription
): Promise<ScreeningResult> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock screening logic
  const cvSkills = extractSkillsFromCV(cvContent);
  const requiredSkills = jobDescription.skills;
  
  const matchedSkills = cvSkills.filter(skill => 
    requiredSkills.some(req => req.toLowerCase().includes(skill.toLowerCase()))
  );
  
  const missingSkills = requiredSkills.filter(skill => 
    !cvSkills.some(cv => cv.toLowerCase().includes(skill.toLowerCase()))
  );
  
  const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  const isMatch = score >= 70;
  
  const result: ScreeningResult = {
    isMatch,
    score,
    matchedSkills,
    missingSkills,
    summary: isMatch 
      ? `Strong candidate with ${score}% skill match. Demonstrates relevant experience and technical capabilities.`
      : `Candidate shows ${score}% skill match. May need additional training or experience in key areas.`,
  };
  
  if (isMatch) {
    result.questions = await generateQuestions(jobDescription, matchedSkills);
  }
  
  return result;
};

const extractSkillsFromCV = (cvContent: string): string[] => {
  // Simple skill extraction - in reality, this would be more sophisticated
  const skillKeywords = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'AWS', 
    'Docker', 'Kubernetes', 'Git', 'Agile', 'Leadership', 'Java', 'C++',
    'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST API'
  ];
  
  return skillKeywords.filter(skill => 
    cvContent.toLowerCase().includes(skill.toLowerCase())
  );
};

const generateQuestions = async (
  jobDescription: JobDescription,
  matchedSkills: string[]
): Promise<Question[]> => {
  // Mock question generation based on job requirements
  const questions: Question[] = [
    {
      id: '1',
      question: `Can you describe your experience with ${matchedSkills[0] || 'the main technology'} and how you've used it in previous projects?`,
      type: 'technical',
      difficulty: 'medium',
      expectedAnswer: 'Look for specific examples, project details, and problem-solving approach.',
      timeLimit: 0
    },
    {
      id: '2',
      question: 'Tell me about a challenging project you worked on and how you overcame the obstacles.',
      type: 'behavioral',
      difficulty: 'medium',
      expectedAnswer: 'Assess problem-solving skills, resilience, and learning ability.',
      timeLimit: 0
    },
    {
      id: '3',
      question: `How would you approach building a scalable ${jobDescription.title.toLowerCase()} solution?`,
      type: 'situational',
      difficulty: 'hard',
      expectedAnswer: 'Evaluate architectural thinking, scalability concepts, and best practices.',
      timeLimit: 0
    },
    {
      id: '4',
      question: 'How do you stay updated with the latest technologies and industry trends?',
      type: 'behavioral',
      difficulty: 'easy',
      expectedAnswer: 'Look for continuous learning mindset and professional development.',
      timeLimit: 0
    },
    {
      id: '5',
      question: `What would you do if you encountered a performance issue in a ${matchedSkills.includes('React') ? 'React' : 'web'} application?`,
      type: 'technical',
      difficulty: 'hard',
      expectedAnswer: 'Assess debugging skills, performance optimization knowledge, and systematic approach.',
      timeLimit: 0
    }
  ];
  
  return questions;
};