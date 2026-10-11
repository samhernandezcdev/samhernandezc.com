// About page copy (EN canonical, ES hand-written). Facts come only from the
// experience collection, the published case study and note, and the Phase 4A
// evidence. Applied AI is described as direction, never as a title or as
// production experience.
import type { Locale } from "@/i18n/ui";

type Principle = { title: string; body: string; link?: { href: string; text: string } };

type AboutCopy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lead: string;
  leadDirection: string;
  pathTitle: string;
  path: string[];
  pathCaseStudy: string;
  principlesTitle: string;
  principlesIntro: string;
  principles: Principle[];
  experienceTitle: string;
  experienceIntro: string;
  directionTitle: string;
  direction: string[];
  roles: string;
  bkode: string;
};

const en: AboutCopy = {
  metaTitle: "About · Samuel Hernández",
  metaDescription:
    "Samuel Hernández, software engineer: backend systems and domain-heavy applications where correctness matters, now extended to evaluated, reliable AI systems.",
  title: "About",
  lead: "I'm a software engineer focused on backend systems, domain-heavy applications and software where correctness matters.",
  leadDirection:
    "I am extending this work toward AI systems where evaluation, observability and controlled uncertainty matter.",
  pathTitle: "How I got here",
  path: [
    "I started building full-stack applications: a geospatial web application in a university research group, then a document management system for the oil and energy sector and internal business applications for an industrial services company.",
    "Over time the interesting part moved from the screens to what sits underneath them: access control for confidential documents, architecture decisions written down as records, and written comparisons such as GraphQL versus REST for specific services.",
    "My current work is an internal engineering calculation and configuration platform. Engineering rules validated by specialists run in one Python and FastAPI backend, kept separate from changing operational data and from the commercial system.",
  ],
  pathCaseStudy: "Read the case study",
  principlesTitle: "How I work",
  principlesIntro: "A few habits that show up in most of what I build.",
  principles: [
    {
      title: "One authoritative place for each rule",
      body: "Rules that matter live behind one implementation and one validation boundary. The interface checks inputs for usability; it does not keep its own copy of the rules.",
    },
    {
      title: "Separate what is deterministic from what changes",
      body: "A calculation from inputs and rules should be reproducible. Recommendations that depend on catalogs, stock or other live data are a different kind of answer, and I keep them apart.",
      link: { href: "/notes/deterministic-rules-changing-data", text: "Deterministic rules on top of changing data" },
    },
    {
      title: "Make system boundaries explicit",
      body: "When several systems touch the same workflow, each one should own a clear part of it, and the data that crosses between them should be deliberate.",
    },
    {
      title: "Domain specialists own correctness",
      body: "I implement rules; the people who own them validate them. Tests built from their reference cases matter more to me than a coverage percentage.",
    },
    {
      title: "Say what is not known",
      body: "When something is not measured or not decided, I say so instead of covering it with architecture vocabulary.",
    },
  ],
  experienceTitle: "Experience",
  experienceIntro: "Roles, dates and what I built in each.",
  directionTitle: "Current direction",
  direction: [
    "Current work includes studying and building around retrieval, structured outputs, agents and evaluation. The part that interests me most is the engineering around probabilistic components: checks that stay deterministic, evaluation against reference answers, and visibility into what a system accepted and why.",
    "That is a direction, not a finished transition. I'm building it on the same backend, data and correctness work described above.",
  ],
  roles:
    "I'm interested in roles where software engineering and AI systems meet: backend and software engineering, implementation and forward-deployed engineering, and applied AI engineering as the direction of that work.",
  bkode: "Independent client work goes through BKODE, separately from this site.",
};

const es: AboutCopy = {
  metaTitle: "Sobre mí · Samuel Hernández",
  metaDescription:
    "Samuel Hernández, ingeniero de software: sistemas backend y aplicaciones de dominio complejo donde la exactitud importa, hoy extendidos a IA evaluada y confiable.",
  title: "Sobre mí",
  lead: "Soy ingeniero de software. Me enfoco en sistemas backend, aplicaciones con reglas de dominio complejas y software donde la exactitud importa.",
  leadDirection:
    "Hoy extiendo ese trabajo hacia sistemas de IA donde la evaluación, la observabilidad y el control de la incertidumbre son parte del diseño.",
  pathTitle: "Cómo llegué aquí",
  path: [
    "Empecé construyendo aplicaciones full-stack: una aplicación web geoespacial en un grupo de investigación universitario, después un sistema de gestión documental para el sector oil & energía y aplicaciones internas para una empresa de servicios industriales.",
    "Con el tiempo, lo interesante dejó de estar en las pantallas y pasó a lo que hay debajo: control de acceso para documentos confidenciales, decisiones de arquitectura documentadas como registros y comparaciones escritas, como GraphQL frente a REST para servicios concretos.",
    "Mi trabajo actual es una plataforma interna de cálculo y configuración de ingeniería. Las reglas de ingeniería, validadas por especialistas, se ejecutan en un solo backend en Python y FastAPI, separadas de los datos operativos que cambian y del sistema comercial.",
  ],
  pathCaseStudy: "Leer el caso de estudio",
  principlesTitle: "Cómo trabajo",
  principlesIntro: "Algunos hábitos que aparecen en casi todo lo que construyo.",
  principles: [
    {
      title: "Un solo lugar autoritativo para cada regla",
      body: "Las reglas importantes viven detrás de una sola implementación y una sola frontera de validación. La interfaz valida entradas para facilitar el uso; no mantiene su propia copia de las reglas.",
    },
    {
      title: "Separar lo determinista de lo que cambia",
      body: "Un cálculo a partir de entradas y reglas debe ser reproducible. Las recomendaciones que dependen de catálogos, inventario u otros datos vivos son otro tipo de respuesta, y las mantengo separadas.",
      link: { href: "/notes/deterministic-rules-changing-data", text: "Deterministic rules on top of changing data" },
    },
    {
      title: "Fronteras explícitas entre sistemas",
      body: "Cuando varios sistemas participan en el mismo flujo, cada uno debe ser dueño de una parte clara, y los datos que cruzan entre ellos deben ser deliberados.",
    },
    {
      title: "Los especialistas del dominio son dueños de la exactitud",
      body: "Yo implemento las reglas; quienes las conocen las validan. Las pruebas construidas con sus casos de referencia me importan más que un porcentaje de cobertura.",
    },
    {
      title: "Decir lo que no se sabe",
      body: "Cuando algo no está medido o no está decidido, lo digo en lugar de cubrirlo con vocabulario de arquitectura.",
    },
  ],
  experienceTitle: "Experiencia",
  experienceIntro: "Roles, fechas y lo que construí en cada uno.",
  directionTitle: "Dirección actual",
  direction: [
    "Hoy estudio y construyo alrededor de recuperación de información (retrieval), salidas estructuradas, agentes y evaluación. Lo que más me interesa es la ingeniería alrededor de los componentes probabilísticos: verificaciones que siguen siendo deterministas, evaluación contra respuestas de referencia y visibilidad de qué aceptó un sistema y por qué.",
    "Es una dirección, no una transición terminada. La construyo sobre el mismo trabajo de backend, datos y exactitud que describo arriba.",
  ],
  roles:
    "Me interesan los roles donde se encuentran la ingeniería de software y los sistemas de IA: ingeniería backend y de software, ingeniería de implementación y forward-deployed, e ingeniería de IA aplicada como la dirección de ese trabajo.",
  bkode: "El trabajo independiente con clientes se gestiona por medio de BKODE, por separado de este sitio.",
};

export const about: Record<Locale, AboutCopy> = { en, es };
