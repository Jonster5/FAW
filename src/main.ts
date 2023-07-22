import { ECS } from 'raxis';
import './style.scss';
import { CanvasSettings, KeysToTrack, defaultPlugins } from 'raxis-plugins';
import { LevelPlugin, NewLevelEvent } from './level';
import { PlanetPlugin } from './planet';
import { PlayerPlugin } from './player';

const target = document.getElementById('target');

const ecs = new ECS()
  .insertPlugins(...defaultPlugins)
  .insertResource(new CanvasSettings({ target, width: 2000 }))
  .insertResource(new KeysToTrack([]))
  .insertPlugins(LevelPlugin, PlanetPlugin, PlayerPlugin);
// Start after that stuff

ecs.run().then((ecs) => {
  ecs.getEventWriter(NewLevelEvent).send(new NewLevelEvent(1));
});
