import { Project, Experience, Education, Certification } from '@/types';

export const projects: Project[] = [
  {
    id: 'nexusrag',
    title: 'Multilingual NexusRAG - Real-Time Document Intelligence Supporting 100+ Languages',
    description:
      'Architected and deployed production-grade Retrieval-Augmented Generation (RAG) system with HuggingFace Inference Providers, serving users with real-time document intelligence and conversational AI capabilities. Built with advanced RAG pipeline featuring dual retrieval modes, confidence scoring, source transparency, and automatic document expiration for enhanced security.',
    techStack: [
      'Python',
      'FastAPI',
      'HuggingFace',
      'LangChain',
      'Firebase',
      'React',
      'Vite',
      'SQLite',
      'Vector Databases',
    ],
    features: [
      'Production-grade RAG system supporting 100+ languages',
      'Dual retrieval modes: strict document-only and hybrid querying',
      'Confidence scoring with source transparency and chunk previews',
      'Automatic document expiration for enhanced security',
      'Firebase Authentication with SQLite session persistence',
      'Multi-session management with message branching',
      'Export functionality and comprehensive document panel',
      'Scalable backend with automated cleanup mechanisms',
    ],
    githubLink: 'https://github.com/crazy-scientistt/nexusrag',
    screenshots: [
      '/assets/images/nexusrag-landingpage.png',
      '/assets/images/nexusrag-features.png',
      '/assets/images/nexusrag-authentication.png',
      '/assets/images/nexusrag-workplace1.png',
      '/assets/images/nexusrag-workplace2.png',
      '/assets/images/nexusrag-workplace3.png',
    ],
    thumbnail: '/assets/images/nexusrag-landingpage.png',
    tags: ['RAG', 'HuggingFace', 'LangChain', 'FastAPI'],
  },
  {
    id: 'deepdeception',
    title: 'DeepDeception - AI Deepfake Detection System',
    description:
      'Engineered production-ready deepfake detection system achieving 85.9% accuracy across 53,400+ video frames using XceptionNet architecture. Built scalable Django REST API supporting 100+ concurrent users with consistent high availability on cloud infrastructure.',
    techStack: [
      'Python',
      'XceptionNet',
      'TensorFlow',
      'OpenCV',
      'Django',
      'Railway',
      'SQL',
      'HTML/CSS',
      'JavaScript',
    ],
    features: [
      'Deepfake detection with 85.9% accuracy across 53,400+ video frames',
      'Advanced XceptionNet architecture for facial analysis',
      'Scalable Django REST API supporting 100+ concurrent users',
      'GPU acceleration on Google Colab P100 instances',
      '60% reduction in training time through pipeline optimization',
      'User-friendly web interface with drag-and-drop functionality',
      'Detailed confidence scoring and comprehensive reporting',
      'Cloud deployment on Railway platform with high availability',
    ],
    githubLink: 'https://github.com/uwdhuwhduwg/deepfakeDetection',
    screenshots: [
      '/assets/images/landing page.png',
      '/assets/images/result page 1.png',
      '/assets/images/result page 2.png',
      '/assets/images/result page 3.png',
      '/assets/images/result page 4.png',
    ],
    thumbnail: '/assets/images/landing page.png',
    tags: ['XceptionNet', 'TensorFlow', 'Django', 'OpenCV'],
  },
  {
    id: 'smartchat',
    title: 'SmartChat AI - LLM-Powered Conversational Assistant',
    description:
      'Fine-tuned Llama 3.2 7B model with custom prompt engineering strategies for domain-specific conversational applications. Integrated Firebase Authentication and real-time database with advanced NLP techniques for enhanced user experience.',
    techStack: [
      'Python',
      'Llama 3.2 (7B)',
      'Unsloth AI',
      'Firebase',
      'React',
      'Natural Language Processing',
    ],
    features: [
      'Fine-tuned Llama 3.2 7B model for domain-specific conversations',
      'Custom prompt engineering strategies for optimal performance',
      'Firebase Authentication and real-time database integration',
      'Sentiment analysis and context-aware response generation',
      '92% user satisfaction score through iterative optimization',
      'Advanced NLP techniques for natural conversations',
      'Continuous model refinement based on user feedback',
      'Scalable architecture for production deployment',
    ],
    githubLink: 'https://github.com/crazy-scientistt/smartchat-ai',
    screenshots: [
      '/assets/images/smartchat-demo.svg',
    ],
    thumbnail: '/assets/images/smartchat-demo.svg',
    tags: ['Llama', 'NLP', 'Firebase', 'LLM'],
  },
  {
    id: 'unity-fps',
    title: 'Maze of Fury – Unity FPS with AI Enemies',
    description:
      '"Maze of Fury" stands as a testament to the intersection of advanced game design principles, captivating narrative elements, and cutting-edge artificial intelligence implementations within the Unity 3D environment. Drawing inspiration from the adrenaline-fueled action of the Maze Runner movie franchise, this project aims to immerse players in a heart-pounding first-person shooting experience set within a labyrinthine maze.',
    techStack: ['Python', 'Unity 3D', 'Keras', 'C#', 'NavMesh AI', 'Game Development'],
    features: [
      'Three distinct levels with varying degrees of complexity',
      'Responsive and challenging enemy AI behavior',
      'Fluid and responsive movement controls for precision navigation',
      'Heart-pounding combat encounters with vampire enemies',
      'Dynamic health system requiring strategic decision-making',
      'Strategic cookie collection objectives throughout the maze',
      'Optimized performance for smooth gameplay',
      'Immersive visuals and atmospheric effects',
    ],
    githubLink: 'https://github.com/crazy-scientistt/maze-of-fury',
    screenshots: [
      '/assets/images/unitygame.png',
      '/assets/images/maze2.png',
      '/assets/images/maze3.png',
      '/assets/images/maze4.png',
      '/assets/images/maze5.png',
      '/assets/images/maze6.png',
    ],
    thumbnail: '/assets/images/unitygame.png',
    tags: ['Unity 3D', 'C#', 'NavMesh AI', 'Game Dev'],
  },
  {
    id: 'self-driving',
    title: 'Self-Driving Car Simulation',
    description:
      'An autonomous vehicle simulation system built using CNN-based computer vision and behavioral cloning techniques. The simulator replicates what NVIDIA did in the simulation, allowing us to collect all our data from the simulator. The simulator has two modes: Training mode for data collection and Autonomous mode for testing the model.',
    techStack: ['Python', 'Unity 3D', 'Keras', 'Anaconda', 'OpenCV', 'CNN', 'Behavioral Cloning'],
    features: [
      'CNN-based vision system for road analysis',
      'Behavioral cloning from human driving data',
      'Real-time steering angle prediction and speed control',
      'Integration with Unity-based Udacity simulator',
      'Two distinct tracks: Lake track and Jungle track',
      'Training mode for data collection and autonomous mode for testing',
      'Robust performance in various simulated road conditions',
      'Comprehensive training pipeline with frame capture and analysis',
    ],
    githubLink: 'https://github.com/crazy-scientistt/self-driving-car',
    screenshots: ['/assets/images/car1.png', '/assets/images/car2.png', '/assets/images/car3.png'],
    thumbnail: '/assets/images/car1.png',
    tags: ['Python', 'Keras', 'CNN', 'OpenCV'],
  }

];

export const experiences: Experience[] = [
  {
    title: 'AI Software Development Intern',
    company: 'Buzzware Tech',
    period: 'July 2024 - September 2024',
    description:
      'Engineered scalable ML and LLM inference pipelines, reducing end-to-end model latency by 20% through TensorFlow optimization, mixed-precision training, and GPU acceleration strategies. Contributed to early-stage Retrieval-Augmented Generation (RAG) experimentation, implementing document chunking, embedding pipelines, and vector similarity search. Containerized AI services using Docker and optimized deployment workflows across development and production environments.',
  },
];

export const education: Education[] = [
  {
    degree: 'Bachelor of Science in Artificial Intelligence',
    institution: 'Bahria University',
    period: '2021 - June 2025',
    gpa: '3.65/4.0',
  },
];

export const certifications: Certification[] = [
  {
    title: 'Deep Learning Specialization',
    issuer: 'Udemy',
    date: '2024',
    description: 'Neural Networks and Deep Learning',
  },
  {
    title: 'Elements of AI',
    issuer: 'University of Helsinki & Reaktor',
    date: '2024',
    description: 'Introduction to AI concepts, machine learning, and neural networks',
    image: '/assets/images/ElementsofAI-Certificate.png',
  },
];
