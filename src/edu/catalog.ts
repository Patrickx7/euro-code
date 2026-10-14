/** Currículo carregado no navegador: os módulos de `content/` viram pedaços baixados sob demanda. */
import type { ContentModule, Exercise, Lesson } from '../shared/content';

const loaders = import.meta.glob<{ default: ContentModule }>('/content/*/*/index.ts');

export interface Catalog {
  modules: ContentModule[];
  exercise(id: string): { exercise: Exercise; module: ContentModule } | undefined;
  lesson(id: string): Lesson | undefined;
}

let catalog: Promise<Catalog> | null = null;

export function loadCatalog(): Promise<Catalog> {
  catalog ??= Promise.all(Object.values(loaders).map(async (load) => (await load()).default)).then(
    (modules) => {
      const exercises = new Map<string, { exercise: Exercise; module: ContentModule }>();
      const lessons = new Map<string, Lesson>();
      for (const module of modules) {
        for (const exercise of module.exercises) exercises.set(exercise.id, { exercise, module });
        for (const lesson of module.lessons) lessons.set(lesson.id, lesson);
      }
      return {
        modules,
        exercise: (id) => exercises.get(id),
        lesson: (id) => lessons.get(id),
      };
    },
  );
  return catalog;
}
