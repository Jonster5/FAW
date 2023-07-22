import { Component, ECS, ECSEvent } from 'raxis';
import { Assets, Sprite, Transform, loadJSONFile } from 'raxis-plugins';
import { Planet, PlanetAsset, TierMarker, TierProgressBar } from './planet';
import { Vec2 } from 'raxis/math';
import { Player } from './player';

export interface LevelAsset {
  planets: PlanetAsset[];
}

export class Level extends Component {
  constructor() {
    super();
  }
}

export class NewLevelEvent extends ECSEvent {
  constructor(public num: number) {
    super();
  }
}

async function createNewLevel(ecs: ECS) {
  const nle = ecs.getEventReader(NewLevelEvent);
  if (nle.empty()) return;

  const assets = ecs.getResource(Assets);

  const { num } = nle.get()[0];
  const path = `levels/${num}.json`;

  const data = (await loadJSONFile(path)) as LevelAsset;

  data.planets.forEach((p) => {
    const planet = ecs.spawn(
      new Planet('regular', 1),
      new Transform(new Vec2(50, 50), new Vec2(p.x, p.y)),
      new Sprite('ellipse', p.faction)
    );

    if (p.faction === 'blue') planet.insert(new Player());

    const progress = ecs.spawn(
      new TierProgressBar(),
      new Transform(new Vec2(0, 5), new Vec2(0, -40)),
      new Sprite('rectangle', 'red')
    );

    const tier = ecs.spawn(
      new TierMarker(),
      new Transform(new Vec2(20, 20)),
      new Sprite('image', assets['tiers'])
    );

    planet.addChildren(progress, tier);
  });
}

export function LevelPlugin(ecs: ECS) {
  ecs
    .addComponentType(Level)
    .addEventTypes(NewLevelEvent)
    .addMainSystem(createNewLevel);
}
