import {ProjectOpenPosition} from "@/types/positionFieldsTypes";

export const mockPositions: ProjectOpenPosition[] = [
  {
    id: "1",
    title: "Software Engineer",
    fullDescription:
      "We're looking for a passionate Software Engineer to join our engineering team and help build scalable, reliable software solutions. You'll work on challenging technical problems, contribute to architectural decisions, and collaborate with product teams to deliver features that delight our users. This role offers opportunities to work with modern technologies, participate in code reviews, and mentor junior developers.",
    requirements:
      "3+ years of software development experience\nProficiency in React, Node.js, and TypeScript\nExperience with database design and optimization\nKnowledge of cloud platforms (AWS, GCP, or Azure)\nUnderstanding of software architecture patterns\nExperience with agile development methodologies",
    requiredSkills: ["React", "Node.js", "TypeScript", "AWS", "GCP", "Azure"],
    applicants: 42,
    timeCommitment: "Full-time (40+ hours/week)",
    experienceLevel: "Mid-Level",
    status: "Open",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Data Scientist",
    fullDescription:
      "Join our AI research team to develop cutting-edge machine learning models for medical image analysis. You'll work with large datasets of medical scans, implement deep learning algorithms, and collaborate with medical professionals to improve cancer detection accuracy. This role involves research, experimentation, and deployment of AI models in healthcare settings.",
    requirements:
      "PhD or Master's in Data Science, Computer Science, or related field\nExperience with medical imaging and DICOM data\nProficiency in Python, TensorFlow, and PyTorch\nKnowledge of computer vision and deep learning\nExperience with statistical analysis and data visualization\nUnderstanding of healthcare regulations and data privacy",
    requiredSkills: [
      "Python",
      "TensorFlow",
      "PyTorch",
      "Computer Vision",
      "Medical Imaging",
      "Statistics",
    ],
    applicants: 28,
    timeCommitment: "Full-time (40+ hours/week)",
    experienceLevel: "Senior",
    status: "Closed",
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-12T09:15:00Z",
  },
  {
    id: "3",
    title: "UX Designer",
    fullDescription:
      "We're seeking a creative UX Designer to help us create intuitive and beautiful user experiences. You'll work closely with product managers and developers to design user interfaces that are both functional and aesthetically pleasing.",
    requirements:
      "2+ years of UX/UI design experience\nProficiency in Figma, Sketch, or Adobe XD\nExperience with user research and usability testing\nKnowledge of design systems and component libraries\nUnderstanding of accessibility principles\nExperience with prototyping tools",
    requiredSkills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"],
    applicants: 0,
    timeCommitment: "Part-time (20 hours/week)",
    experienceLevel: "Junior",
    status: "Draft",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-01-20T09:00:00Z",
  },
];
