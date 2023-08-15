import * as PIXI from 'pixi.js';
import '@pixi/events';
import { v4 as uuid } from 'uuid';
import { Dispatch, SetStateAction } from 'react';
export interface RectangleProps {
	x: number
	y: number
	width: number
	height: number
	color: string
	app: PIXI.Application
	clickedFn: Dispatch<SetStateAction<boolean>>
}

interface Draggable extends PIXI.DisplayObject {
  data: PIXI.FederatedMouseEvent | null;
  dragging: boolean;
}

export default class Rectangle extends PIXI.Graphics {
  
  constructor(private props: RectangleProps, public data = null, public dragging = false, public key = uuid()){
    super();
    this.beginFill(props.color);
    this.drawRect(0, 0, props.width, props.height);
    this.endFill();
    this.eventMode = 'static';
    this.on('pointerdown', this.onDragStart);
    this.on('pointerup', this.onDragEnd);
    this.on('pointerupoutside', this.onDragEnd);
    this.on('pointermove', this.onDragMove);
    this.position.set(props.x, props.y);
  
    props.app.stage.addChild(this)
  }

onDragStart = (event: PIXI.FederatedPointerEvent) => {
  
  const rect = event.currentTarget as Draggable;
  rect.data = event.data;
  rect.dragging = true;
  rect.alpha = 0.5;
  
  rect.parent.zIndex = 10
  this.props.clickedFn(true)
}
onDragEnd = (event: PIXI.FederatedPointerEvent) => {
  const rect = event.currentTarget as Draggable;
  rect.alpha = 1;
  rect.parent.zIndex = 1;
  rect.dragging = false;
  rect.data = null;
  this.props.clickedFn(false)
};
onDragMove = (event: PIXI.FederatedPointerEvent) => {
  const rect = event.currentTarget as Draggable;
  if (rect.dragging) {
    const newPosition = rect.data!.getLocalPosition(rect.parent);
    
    rect.position.set(newPosition.x - this.props.width/2, newPosition.y - this.props.height/2)
  }
};

}




