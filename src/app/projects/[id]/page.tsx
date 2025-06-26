import SidebarProvider from "@/providers/SidebarProvider";
import ProjectClient from "@/components/(pages)/projects/ProjectClient";

const ProjectSinglePage = async ({params}: {params: Promise<{id: string}>}) => {
  const {id} = await params;

  const project = {
    id: "3f8a4a62-1a2b-4d6f-bc12-7e9b9f9a4e2d",
    user_id: "7e2b3c89-f3d2-4b67-b915-8e3a1f6279a7",
    name: "AI Model for Cancer Research",
    slug: "ai-model-cancer-research",
    tagline: "Revolutionizing cancer diagnosis with AI-powered analytics",
    demo: ["/2_test.png", "/1_test.png"],
    description:
      "This groundbreaking project focuses on developing a sophisticated artificial intelligence model designed to revolutionize cancer care through early detection and personalized treatment strategies. Our mission is to harness the power of machine learning and deep learning algorithms to analyze complex medical data, including imaging scans, laboratory results, and patient histories, enabling healthcare professionals to identify cancer at its earliest stages when treatment is most effective. The AI system will provide personalized treatment recommendations by considering individual patient characteristics, genetic markers, and treatment response patterns. By integrating cutting-edge computer vision techniques for medical imaging analysis and natural language processing for clinical documentation, we aim to create a comprehensive diagnostic tool that enhances clinical decision-making. Our platform will assist oncologists, radiologists, and healthcare teams in reducing diagnostic errors, improving patient outcomes, and accelerating the path from diagnosis to effective treatment. The project emphasizes collaboration between technologists, medical professionals, and researchers to ensure clinical relevance and real-world applicability.",
    project_image:
      "https://d32crm5i3cn4pm.cloudfront.net/project-images/cc682da1-6849-496d-a81f-6f23beb502c5/image.jpg",
    project_image_metadata: {
      fileName: "wallhaven-wyzzlp.jpg",
      fileSize: 490835,
      uploadedAt: "2025-04-22T22:31:26.772Z",
    },
    background_image:
      "https://d32crm5i3cn4pm.cloudfront.net/project-backgrounds/cc682da1-6849-496d-a81f-6f23beb502c5/image.jpg",
    background_image_metadata: {
      fileName: "wallhaven-wyzzlp.jpg",
      fileSize: 490835,
      uploadedAt: "2025-04-22T22:31:26.772Z",
    },
    category: "Health",
    current_stage: "Prototype",
    why_join:
      "Join us to be at the forefront of AI technology in healthcare and make a real impact on patient lives.",
    language_proficiency: ["Russian", "English"],
    skills: ["Python", "TensorFlow", "PyTorch", "Docker", "AWS"],
    created_at: "2025-06-20T14:30:00Z",
    updated_at: "2025-06-22T10:00:00Z",
    target_audience: "Medical researchers",
    revenue_expectations: "Ad-based, $2–5K/mo",
    collaboration_model: "Partnership",
    funding_investment: "Looking for investors",
    compensation_model: "Equity-based",
    open_positions: [
      {
        title: "Data Scientist",
        description: "Expert in medical image analysis and AI.",
        slots: 2,
        required_skills: ["Python", "Deep Learning", "Medical Imaging"],
        engagement: "Full-time",
      },
      {
        title: "Clinical Researcher",
        description: "Experience with oncology clinical trials.",
        slots: 1,
        required_skills: ["Clinical Research", "Oncology", "Data Analysis"],
        engagement: "Part-time",
      },
    ],
    required_skills: ["Python", "Machine Learning", "Data Analysis", "Healthcare Domain Knowledge"],
    engagement_model: "Full-time / Part-time",
    availability: "Open for applications",
    working_hours: "40",
    community_platforms: "Slack, Zoom",
    our_team: [
      {
        user_id: "7e2b3c89-f3d2-4b67-b915-8e3a1f6279a7",
        name: "Dr. Alice Nguyen",
        role: "Project Lead",
        profile_url: "https://example.com/users/alice-nguyen",
      },
      {
        user_id: "9a4c7d56-3e8a-4f91-a9f3-2e7e7b8b4c91",
        name: "Bob Lee",
        role: "Lead Data Scientist",
        profile_url: "https://example.com/users/bob-lee",
      },
    ],
  };

  const skills = [
    {
      name: "React",
      image_url: "https://d32crm5i3cn4pm.cloudfront.net/skills-image/react.svg",
    },
    {
      name: "Nextjs",
      image_url: "https://d32crm5i3cn4pm.cloudfront.net/skills-image/nextjs.svg",
    },
    {
      name: "Java",
      image_url: "https://d32crm5i3cn4pm.cloudfront.net/skills-image/java.svg",
    },
    {
      name: "JavaScript",
      image_url: "https://d32crm5i3cn4pm.cloudfront.net/skills-image/javascript.svg",
    },
    {
      name: "C++",
      image_url: "https://d32crm5i3cn4pm.cloudfront.net/skills-image/c-plusplus.svg",
    },
    {
      name: "C",
      image_url: "https://d32crm5i3cn4pm.cloudfront.net/skills-image/c.svg",
    },
    {
      name: "Ruby",
      image_url: "https://d32crm5i3cn4pm.cloudfront.net/skills-image/ruby.svg",
    },
    {
      name: "Dark",
      image_url: "https://d32crm5i3cn4pm.cloudfront.net/skills-image/dart.svg",
    },
    {
      name: "Swift",
      image_url: "https://d32crm5i3cn4pm.cloudfront.net/skills-image/swift.svg",
    },
    {
      name: "Python",
      image_url: "https://d32crm5i3cn4pm.cloudfront.net/skills-image/python.svg",
    },
  ];

  return (
    <SidebarProvider removePadding bottomPadding>
      <ProjectClient project={project} skills={skills} />
    </SidebarProvider>
  );
};

export default ProjectSinglePage;
