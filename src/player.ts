import { Component, ECS, With } from 'raxis';
import { Canvas, Inputs, Sprite, Transform } from 'raxis-plugins';
import { Vec2 } from 'raxis/math';
import { Planet } from './planet';

export class Player extends Component {}

export class SelectionMarker extends Component {}
export class Selected extends Component {}

export class SelectionEvent extends Component {
	constructor(public type: 'select' | 'deselect', public eid?: number) {
		super();
	}
}

function checkSelecting(ecs: ECS) {
	const { pointer } = ecs.getResource(Inputs);
	const [canvas, ct] = ecs.query([Canvas, Transform]).single();

	const box = canvas.element.getBoundingClientRect();
	const elementSize = new Vec2(box.right - box.left, box.bottom - box.top);
	const offset = new Vec2(box.left, box.top);

	if (
		!pointer.leftIsDown ||
		pointer.pos.x < box.left ||
		pointer.pos.y < box.top ||
		pointer.pos.x > box.right ||
		pointer.pos.y > box.bottom
	) {
		return;
	}

	const pos = pointer.pos
		.clone()
		.sub(offset)
		.sub(elementSize.div(2))
		.mul(new Vec2(2, -2))
		// .setMag(canvas.size.mag())
		.sub(ct.pos);

	const planetQuery = ecs.query([Transform], With(Planet));

	let allOutside = true;

	planetQuery.results().forEach(([t], i) => {
		if (pos.distanceToSq(t.pos) > 25 ** 2) return;

		allOutside = false;

		const eid = planetQuery.entities()[i];

		ecs.getEventWriter(SelectionEvent).send(
			new SelectionEvent('select', eid)
		);
	});

	if (allOutside)
		ecs.getEventWriter(SelectionEvent).send(new SelectionEvent('deselect'));
}

function selectPlanet(ecs: ECS) {
	const selected = ecs.getEventReader(SelectionEvent);
	if (selected.empty()) return;

	selected.get().forEach(({ type, eid }) => {
		ecs.query([], With(Selected))
			.entities()
			.map((e) => ecs.entity(e))
			.forEach((e) => {
				e.children(With(SelectionMarker)).forEach((c) =>
					ecs.destroy(c)
				);

				e.delete(Selected);
			});

		if (type === 'select') {
			const s = ecs.entity(eid!);

			s.insert(new Selected());
			s.addChild(
				ecs.spawn(
					new SelectionMarker(),
					new Transform(new Vec2(75, 75)),
					new Sprite('ellipse', '', true, undefined, 1, 'lime', 3)
				)
			);
		}
	});
}

export function PlayerPlugin(ecs: ECS) {
	ecs.addComponentTypes(Player, Selected, SelectionMarker)
		.addEventTypes(SelectionEvent)
		.addMainSystems(selectPlanet, checkSelecting);
}
