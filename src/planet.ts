import { Component, ECS, With, Without } from 'raxis';
import { Assets, Sprite, Time, Transform, loadImages } from 'raxis-plugins';

export type PlanetType = 'regular' | 'strong' | 'shield';

export interface PlanetAsset {
  faction: string;
  x: number;
  y: number;
}

export class Planet extends Component {
  constructor(public type: PlanetType, public tier: number = 0) {
    super();
  }
}

export class TierProgressBar extends Component {}
export class TierMarker extends Component {}

async function loadAssets(ecs: ECS) {
  const assets = ecs.getResource(Assets);

  assets['tiers'] = await loadImages(
    ...[0, 1, 2, 3, 4].map((n) => `images/tier${n}.png`)
  );
}

function updateTier(ecs: ECS) {
  const pQuery = ecs.query([Planet]);
  const time = ecs.getResource(Time);

  const bars = pQuery
    .entities()
    .map((e) => ecs.entity(e))
    .map((e) => e.children(With(TierProgressBar))[0])
    .map((e) => ecs.entity(e).get(Transform));

  const tiers = pQuery
    .entities()
    .map((e) => ecs.entity(e))
    .map((e) => e.children(With(TierMarker))[0])
    .map((e) => ecs.entity(e).get(Sprite));

  pQuery.results().forEach(([p], i) => {
    p.tier += (0.1 * time.delta) / 1000;

    if (p.tier < 0) p.tier = 0;
    if (p.tier > 4) p.tier = 4;

    tiers[i].ci = Math.floor(p.tier);
    bars[i].size.x = (p.tier % 1) * 50;
  });
}

export function PlanetPlugin(ecs: ECS) {
  ecs
    .addComponentTypes(Planet, TierProgressBar, TierMarker)
    .addStartupSystem(loadAssets)
    .addMainSystems(updateTier);
}
