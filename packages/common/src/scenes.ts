export interface Scene {
  start: number;
  end: number;
  score: number;
  reason: string;
}

export const serializeScenes = (scenes: Scene[]) =>
  JSON.stringify(
    scenes.map((scene) => ({
      ...scene,
      start: Number(scene.start.toFixed(3)),
      end: Number(scene.end.toFixed(3)),
      score: Number(scene.score.toFixed(4)),
    })),
    null,
    2,
  );
