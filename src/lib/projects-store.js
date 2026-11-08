import { defaultProjects } from './default-projects.js';

const API_URL = (process.env.API_URL || 'http://localhost:5000').replace(
  /\/+$/,
  '',
);

const builtInProjects = () =>
  defaultProjects.map((project, index) => ({
    ...project,
    id: `s${index}`,
    repo: '',
    image: '',
    order: index,
  }));

export async function getPublicProjects() {
  try {
    const response = await fetch(`${API_URL}/api/projects`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) {
      throw new Error(`Projects request failed with status ${response.status}.`);
    }

    const data = await response.json();
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      return data.projects;
    }
    throw new Error('Projects response did not contain a non-empty list.');
  } catch (error) {
    console.error('[projects] Server read failed; using built-in list:', error);
    return builtInProjects();
  }
}
