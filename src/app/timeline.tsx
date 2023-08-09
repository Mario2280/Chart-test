'use client'
import React, { useEffect, useRef } from "react";
const WIDTH = 3440;
const HEIGHT = 25;

const ZoomableTimeline = (props : {zoomLevel: number, panX: number}) =>  {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const numericStep = 100;
  const drawTimeline = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";
    ctx.font = "15px Arial";
    let xPos = 0;
    let pos = -props.panX;
    while (xPos <= WIDTH) {
      let lineLength = pos % numericStep === 0 ? 10 : 1;
      ctx.beginPath();
      ctx.moveTo(xPos, HEIGHT - lineLength);
      ctx.lineTo(xPos, HEIGHT);
      ctx.closePath();
      ctx.stroke();

      if (pos % numericStep === 0) {
        
        ctx.fillText(pos.toString(), xPos, HEIGHT - lineLength - 3);
      }

      xPos += 1 * props.zoomLevel;
      pos += 1;
    }
  }


  useEffect(() => {
    drawTimeline();
  }, [props.zoomLevel, props.panX]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
    ></canvas>
  );
};
export default ZoomableTimeline;