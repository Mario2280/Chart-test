import * as PIXI from 'pixi.js';
import '@pixi/events';
import { v4 as uuid } from 'uuid';
export interface RectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  app: PIXI.Application
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
    this.on('mousedown', this.onDragStart);
    this.on('mouseup', this.onDragEnd);
    this.on('mouseupoutside', this.onDragEnd);
    this.on('mousemove', this.onDragMove);
    
    const cont = new PIXI.Container();
    cont.x = props.x;
    cont.y = props.y
    cont.addChild(this);
    props.app.stage.addChild(cont);
  }

  onDragStart = (event: PIXI.FederatedMouseEvent) => {
  if(!event.altKey) return;
  const rect = event.currentTarget as Draggable;
  rect.data = event.data;
  rect.dragging = true;
  rect.alpha = 0.5;
  
  rect.parent.zIndex = 10
  
}
onDragEnd = (event: PIXI.FederatedMouseEvent) => {
  const rect = event.currentTarget as Draggable;
  rect.alpha = 1;
  rect.dragging = false;
  rect.data = null;
};
onDragMove = (event: PIXI.FederatedMouseEvent) => {
  const rect = event.currentTarget as Draggable;
  if (rect.dragging) {
    const newPosition = rect.data!.getLocalPosition(rect.parent);
    
    rect.position.set(newPosition.x - this.props.width/2, newPosition.y - this.props.height/2)
  }
};

}




