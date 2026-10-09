export interface ProjectItem {
  id: string;
  title: string;
  clientType: string;
  category: string;
  year: string;
  summary: string;
  description: string;
  deliverables: string[];
  techOrTools: string[];
  tags: string[];
  metricsOrHighlight?: string;
  image?: string;
  liveUrl?: string;
  repoUrl?: string;
}

export interface WorldConfig {
  id: string;
  slug: string;
  name: string;
  field: 'developer' | 'designer' | 'illustrator';
  styleTier: 'regular-ish' | 'crazy' | 'out of this universe';
  archetype: string;
  tagline: string;
  description: string;
  portalGlyph: string;
  portalColor: string;
  accentColor: string;
  bgColor: string;
  soundtrackMood: string;
  projects: ProjectItem[];
}
