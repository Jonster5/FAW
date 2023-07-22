import { ECS } from 'raxis';
import './style.scss';
import { CanvasSettings, KeysToTrack, defaultPlugins } from 'raxis-plugins';

const app = document.getElementById('app');

const ecs = new ECS()
	.insertPlugins(...defaultPlugins)
	.insertResource(new CanvasSettings({ target: app, width: 2000 }))
	.insertResource(new KeysToTrack([]));
// Start after that stuff

ecs.run();
