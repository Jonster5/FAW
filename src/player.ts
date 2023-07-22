import { Component, ECS, With } from 'raxis';
import { Canvas, Inputs, Transform } from 'raxis-plugins';
import { Vec2 } from 'raxis/math';
import { Planet } from './planet';

export class Player extends Component {}

export class SelectionMarker extends Component {}
export class Selected extends Component {}

export class HoverEvent extends Component {
  constructor(public type: 'enter' | 'exit', public eid: number) {
    super();
  }
}

function checkHovering(ecs: ECS) {
  const { pointer } = ecs.getResource(Inputs);
  const [canvas, ct] = ecs.query([Canvas, Transform]).single();

  const box = canvas.element.getBoundingClientRect();
  const elementSize = new Vec2(box.right - box.left, box.bottom - box.top);
  const offset = new Vec2(box.left, box.top);

  if (
    pointer.pos.x < box.left ||
    pointer.pos.y < box.top ||
    pointer.pos.x > box.right ||
    pointer.pos.y > box.bottom
  ) {
    return;
  }

  // const scale = window.devicePixelRatio * canvas.zoom;

  const pos = pointer.pos
    .clone()
    .sub(offset)
    .sub(elementSize.div(2))
    .mul(new Vec2(2, -2))
    // .setMag(canvas.size.mag())
    .sub(ct.pos);

  const planets = ecs.query([Transform], With(Planet)).results();

  planets.forEach(([t], i) => {
    if (
      !pos
        .clone()
        .sub(t.pos)
        .toArray()
        .every((n) => n > 0) ||
      !t.size
        .clone()
        .sub(pos.clone().sub(t.pos))
        .toArray()
        .every((n) => n > 0)
    )
      return;

    const entity = ecs.entity(
      ecs.query([Transform], With(Planet)).entities()[i]
    );

    ecs.getEventWriter(HoverEvent).send(new HoverEvent('enter', entity.id()));
  });
}

function selectPlanet(ecs: ECS) {}

export function PlayerPlugin(ecs: ECS) {
  ecs
    .addComponentTypes(Player, Selected, SelectionMarker)
    .addEventTypes(HoverEvent)
    .addMainSystems(selectPlanet, checkHovering);
}
