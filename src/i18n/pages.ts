import p1 from "@/assets/project-1.png";
import {
  Bug,
  Code2,
  LayoutTemplate,
  Lightbulb,
  Plug,
  Workflow,
} from "lucide-astro";

export const languages = {
  es: {
    label: "Español",
    path: "/",
    alternatePath: "/en",
    switchLabel: "EN",
    htmlLang: "es",
    ogLocale: "es_MX",
  },
  en: {
    label: "English",
    path: "/en",
    alternatePath: "/",
    switchLabel: "ES",
    htmlLang: "en",
    ogLocale: "en_US",
  },
} as const;

export type Language = keyof typeof languages;

export const pages = {
  es: {
    meta: {
      title: "Desarrollador de Software Full Stack",
      description:
        "Desarrollador de software full stack especializado en el desarrollo de aplicaciones web modernas, soluciones de automatización y sistemas de software escalables. Disponible para trabajos freelance y a distancia.",
    },
    header: {
      brand: "Ing. Samuel Hernández",
      nav: [
        { href: "#servicios", label: "Servicios" },
        { href: "#skills", label: "Skills" },
        { href: "#proyectos", label: "Proyectos" },
        { href: "#curriculum", label: "Currículum" },
        { href: "#contacto", label: "Contacto" },
      ],
      cta: "Contáctame",
      mobileCta: "Contrátame",
      mobileNavLabel: "Navegación móvil",
      openMenuLabel: "Abrir menú",
      closeMenuLabel: "Cerrar menú",
      languageSwitchLabel: "Cambiar idioma a inglés",
    },
    hero: {
      badge: "Disponible para freelance & trabajo remoto",
      title: "Desarrollador de Software",
      titleAccent:
        "para empresas que necesitan operar mejor, automatizar y crecer.",
      description:
        "Construyo aplicaciones web, sistemas backend y automatizaciones con TypeScript, React, Node.js y Python. Me enfoco en soluciones claras, mantenibles y listas para escalar.",
      primaryCta: "Contáctame",
      secondaryCta: "Ver Proyectos",
      stackLabel: "Tecnologías principales",
      stack: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Python", "AWS"],
    },
    services: {
      eyebrow: "Servicios",
      title: "¿Cómo puedo ayudarte?",
      description:
        "Servicios enfocados en desarrollo de software, automatización e integración de sistemas.",
      items: [
        {
          icon: Code2,
          title: "Desarrollo Web",
          description:
            "Aplicaciones web listas para producción con React, Next.js y Node.js: tipadas, probadas y diseñadas para escalar.",
        },
        {
          icon: LayoutTemplate,
          title: "Landing Pages",
          description:
            "Sitios web de marketing de alta conversión con un diseño refinado, tiempos de carga instantáneos y una base sólida de SEO.",
        },
        {
          icon: Bug,
          title: "Arreglar Bugs",
          description:
            "Diagnosticar y resolver problemas en los códigos existentes: front-end, back-end, infraestructura o rendimiento.",
        },
        {
          icon: Plug,
          title: "Desarrollo de APIs",
          description:
            "API robustas de REST y GraphQL con PostgreSQL, autenticación, validación y documentación completa.",
        },
        {
          icon: Workflow,
          title: "Automatización de Procesos",
          description:
            "Automatiza los flujos de trabajo manuales, integra servicios de terceros y pon en marcha herramientas internas que ahorran tiempo.",
        },
        {
          icon: Lightbulb,
          title: "Consultoría Tecnológica",
          description:
            "Revisiones de la arquitectura, decisiones sobre tech stack y planificación del roadmap para ayudar a tu equipo a avanzar más rápido con confianza.",
        },
      ],
    },
    skills: {
      eyebrow: "Skills",
      title: "Conjunto de herramientas modernas",
      description:
        "El conjunto de tecnologías que utilizo para desarrollar software sostenible de principio a fin.",
      groups: [
        {
          title: "Frontend",
          items: ["TypeScript", "React", "Next.js", "Astro", "TailwindCSS", "Vite", "Shadcn/UI"],
        },
        {
          title: "Backend",
          items: ["Python", "Node.js", "REST APIs", "JWT", "Zod", "Jest"],
        },
        {
          title: "Bases de Datos",
          items: ["PostgreSQL", "Prisma", "Redis", "SQL", "Migraciones"],
        },
        {
          title: "DevOps",
          items: ["Docker", "CI/CD", "Github Actions", "Linux", "Nginx"],
        },
        {
          title: "Cloud",
          items: ["Fundamentos de AWS", "S3", "EC2", "Lambda", "CloudFront"],
        },
      ],
    },
    projects: {
      eyebrow: "Proyectos Destacados",
      title: "Trabajos seleccionados",
      description:
        "Algunos proyectos que ponen de manifiesto mi enfoque del diseño, la ingeniería y la ejecución.",
      liveAriaLabel: "Sitio en vivo",
      items: [
        {
          image: p1,
          title: "Heavy-Lift — Landing Page",
          description:
            "Sitio web comercial para la empresa Heavy-Lift, enfocado en presentar servicios, generar confianza y facilitar solicitudes de cotización desde cualquier dispositivo.",
          tech: ["Astro", "TypeScript", "Tailwind CSS", "SEO", "Netlify"],
          live: "https://heavy-lift.com.mx",
          repo: "#",
        },
      ],
    },
    resume: {
      eyebrow: "Currículum",
      title: "Resumen profesional",
      description:
        "Un resumen conciso de mi experiencia, mis habilidades y lo que puedo aportar a su equipo.",
      name: "Ing. Samuel Hernández",
      summary:
        "Desarrollador de Software Full Stack • Compatible con ATS • Actualizado Junio 2026",
      highlights: [
        "Full Stack Developer enfocado en apps web, APIs y automatización",
        "TypeScript, React, Next.js, Node.js, PostgreSQL y Python",
        "Experiencia construyendo dashboards y herramientas internas",
        "Fundador de BKODE — ingeniería digital para crecimiento empresarial",
        "Disponible para freelance y oportunidades remotas",
      ],
      downloadLabel: "Descargar CV",
      openLabel: "Abrir CV",
      pdfPath: "/Samuel-Hernandez-CV-ES.pdf",
      stats: [
        { value: "4+", label: "Años de experiencia" },
        { value: "5+", label: "Proyectos entregados" },
        { value: "100%", label: "Disponible remoto" },
        { value: "24h", label: "Respuesta típica" },
      ],
    },
    availability: {
      badge: "Disponible actualmente",
      title:
        "Disponible para proyectos como freelance y oportunidades de trabajo a distancia.",
      description:
        "Estaré agendando nuevos proyectos para el próximo trimestre. Charlemos de lo que estás desarrollando o tienes en mente.",
      cta: "Empezar proyecto",
    },
    contact: {
      eyebrow: "Contacto",
      title: "Hablemos de tu próximo proyecto",
      description:
        "Cuéntame qué necesitas construir, corregir o automatizar. Te responderé en un plazo de 24 horas.",
      emailLabel: "Correo electrónico",
      locationLabel: "Ubicación",
      location: "Remoto — Disponible en todo el mundo",
      responseLabel: "Tiempo de respuesta",
      response: "En un plazo de 24 horas",
      form: {
        botLabel: "No llenar este campo:",
        nameLabel: "Nombre",
        namePlaceholder: "Tu nombre",
        emailLabel: "Correo",
        emailPlaceholder: "tu@correo.com",
        descriptionLabel: "Descripción del Proyecto",
        descriptionPlaceholder:
          "Cuéntame qué necesitas, fecha estimada y cualquier detalle importante.",
        submitLabel: "Enviar mensaje",
        sentLabel: "¡Mensaje enviado, gracias!",
      },
    },
    footer: {
      founderLabel: "Fundador de",
      role: "Desarrollador de Software",
      copyright: "Todos los Derechos Reservados.",
    },
  },
  en: {
    meta: {
      title: "Full Stack Software Developer",
      description:
        "Full stack software developer specializing in modern web applications, automation solutions, and scalable software systems. Available for freelance and remote work.",
    },
    header: {
      brand: "Eng. Samuel Hernández",
      nav: [
        { href: "#servicios", label: "Services" },
        { href: "#skills", label: "Skills" },
        { href: "#proyectos", label: "Projects" },
        { href: "#curriculum", label: "Resume" },
        { href: "#contacto", label: "Contact" },
      ],
      cta: "Contact me",
      mobileCta: "Hire me",
      mobileNavLabel: "Mobile navigation",
      openMenuLabel: "Open menu",
      closeMenuLabel: "Close menu",
      languageSwitchLabel: "Switch language to Spanish",
    },
    hero: {
      badge: "Available for freelance & remote work",
      title: "Software Developer",
      titleAccent:
        "for companies that need to operate better, automate, and grow.",
      description:
        "I build web applications, backend systems, and automations with TypeScript, React, Node.js, and Python. I focus on clear, maintainable solutions ready to scale.",
      primaryCta: "Contact me",
      secondaryCta: "View Projects",
      stackLabel: "Core technologies",
      stack: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Python", "AWS"],
    },
    services: {
      eyebrow: "Services",
      title: "How can I help?",
      description:
        "Services focused on software development, automation, and systems integration.",
      items: [
        {
          icon: Code2,
          title: "Web Development",
          description:
            "Production-ready web applications with React, Next.js, and Node.js: typed, tested, and designed to scale.",
        },
        {
          icon: LayoutTemplate,
          title: "Landing Pages",
          description:
            "High-converting marketing websites with refined design, instant load times, and a strong SEO foundation.",
        },
        {
          icon: Bug,
          title: "Bug Fixing",
          description:
            "Diagnose and resolve issues in existing codebases: frontend, backend, infrastructure, or performance.",
        },
        {
          icon: Plug,
          title: "API Development",
          description:
            "Robust REST and GraphQL APIs with PostgreSQL, authentication, validation, and complete documentation.",
        },
        {
          icon: Workflow,
          title: "Process Automation",
          description:
            "Automate manual workflows, integrate third-party services, and launch internal tools that save time.",
        },
        {
          icon: Lightbulb,
          title: "Technology Consulting",
          description:
            "Architecture reviews, tech stack decisions, and roadmap planning to help your team move faster with confidence.",
        },
      ],
    },
    skills: {
      eyebrow: "Skills",
      title: "Modern toolset",
      description:
        "The technologies I use to develop sustainable software from end to end.",
      groups: [
        {
          title: "Frontend",
          items: ["TypeScript", "React", "Next.js", "Astro", "TailwindCSS", "Vite", "Shadcn/UI"],
        },
        {
          title: "Backend",
          items: ["Python", "Node.js", "REST APIs", "JWT", "Zod", "Jest"],
        },
        {
          title: "Databases",
          items: ["PostgreSQL", "Prisma", "Redis", "SQL", "Migrations"],
        },
        {
          title: "DevOps",
          items: ["Docker", "CI/CD", "Github Actions", "Linux", "Nginx"],
        },
        {
          title: "Cloud",
          items: ["AWS fundamentals", "S3", "EC2", "Lambda", "CloudFront"],
        },
      ],
    },
    projects: {
      eyebrow: "Featured Projects",
      title: "Selected work",
      description:
        "A few projects that show my approach to design, engineering, and execution.",
      liveAriaLabel: "Live site",
      items: [
        {
          image: p1,
          title: "Heavy-Lift — Landing Page",
          description:
            "Commercial website for Heavy-Lift, focused on presenting services, building trust, and making quote requests easy from any device.",
          tech: ["Astro", "TypeScript", "Tailwind CSS", "SEO", "Netlify"],
          live: "https://heavy-lift.com.mx",
          repo: "#",
        },
      ],
    },
    resume: {
      eyebrow: "Resume",
      title: "Professional summary",
      description:
        "A concise overview of my experience, skills, and what I can contribute to your team.",
      name: "Eng. Samuel Hernández",
      summary:
        "Full Stack Software Developer • ATS-friendly • Updated June 2026",
      highlights: [
        "Full Stack Developer focused on web apps, APIs, and automation",
        "TypeScript, React, Next.js, Node.js, PostgreSQL, and Python",
        "Experience building dashboards and internal tools",
        "Founder of BKODE — digital engineering for business growth",
        "Available for freelance and remote opportunities",
      ],
      downloadLabel: "Download Resume",
      openLabel: "Open Resume",
      pdfPath: "/Samuel-Hernandez-CV-EN.pdf",
      stats: [
        { value: "4+", label: "Years of experience" },
        { value: "5+", label: "Projects delivered" },
        { value: "100%", label: "Remote available" },
        { value: "24h", label: "Typical response" },
      ],
    },
    availability: {
      badge: "Currently available",
      title: "Available for freelance projects and remote opportunities.",
      description:
        "I will be scheduling new projects for the next quarter. Let’s talk about what you are building or have in mind.",
      cta: "Start a project",
    },
    contact: {
      eyebrow: "Contact",
      title: "Let’s talk about your next project",
      description:
        "Tell me what you need to build, fix, or automate. I will reply within 24 hours.",
      emailLabel: "Email",
      locationLabel: "Location",
      location: "Remote — Available worldwide",
      responseLabel: "Response time",
      response: "Within 24 hours",
      form: {
        botLabel: "Do not fill this field:",
        nameLabel: "Name",
        namePlaceholder: "Your name",
        emailLabel: "Email",
        emailPlaceholder: "you@email.com",
        descriptionLabel: "Project Description",
        descriptionPlaceholder:
          "Tell me what you need, estimated timeline, and any important details.",
        submitLabel: "Send message",
        sentLabel: "Message sent, thank you!",
      },
    },
    footer: {
      founderLabel: "Founder of",
      role: "Software Developer",
      copyright: "All Rights Reserved.",
    },
  },
} as const;

export type PageContent = (typeof pages)[Language];
