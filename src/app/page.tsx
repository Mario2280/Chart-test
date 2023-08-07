"use client";

import { WheelEvent, useEffect, useState, MouseEvent, useRef } from "react";
import * as PIXI from 'pixi.js';
import Rectangle from './rectangle';
import Head from 'next/head';
import ZoomableTimeline from './timeline';

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
}


function generateRandomColumn(count: number) {
  const data: Array<Candle> = [];
  let prevClose = 50;

  for (let i = 0; i < count; i++) {
    const open = prevClose;
    const close = open + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;

    data.push({ open, close, high, low });
    prevClose = close;
  }
  
  return data;
}


const data = generateRandomColumn(30);
const app = new PIXI.Application<HTMLCanvasElement>({
  width: 1920,
  height:  1080,
  backgroundColor: 0xffffff,
  forceCanvas: true
});
app.stage.sortableChildren = true;
const MAX_ZOOM = 2;
const MIN_ZOOM = 0.5;
const STEP_ZOOM = 0.1;
export default function Chart() {
  
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT =  1080;
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);
  
  
  useEffect(() => {
    if(canvasRef.current){
      canvasRef.current.appendChild(app.view);
    }
  }, [canvasRef])

  
  useEffect(() => {
    app.stage.removeChildren();
    drawCandlestickChart();
  },
  [zoomLevel, panX]);
  return (
    <>
      <Head>
        <title>Chart</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
        />
      </Head>
        <div ref={canvasRef} onMouseMove={handleMouseMove} onWheel={handleWheelMove}>
          <ZoomableTimeline zoomLevel={zoomLevel} panX={panX}/>
        </div>
       
    </>
  );


function handleMouseMove(event: MouseEvent) {
    if(event.altKey) return;
    if (event.buttons === 1) {
      setPanX((prevPan) => prevPan + event.movementX > 0 ? prevPan : prevPan + event.movementX);
    }
  }

  function handleWheelMove(event: WheelEvent) {
    if(event.altKey) return;
    if(event.deltaY < 0) {
      setZoomLevel((prevZoom) => Math.min(prevZoom + STEP_ZOOM, MAX_ZOOM));
    } else {
      setZoomLevel((prevZoom) => Math.max(prevZoom - STEP_ZOOM, MIN_ZOOM));
    }
    
  }

  function drawCandlestickChart() {
    if(!app) return;
    const minValue = Math.min(...data.map((item) => item.low));
    const maxValue = Math.max(...data.map((item) => item.high));
    const valueRange = maxValue - minValue;

    const candleCount = data.length;
    const candleWidth = CANVAS_WIDTH / candleCount;
    const candleSpacing = candleWidth * 0.2;
    
    data.forEach((item, index) => {
      const x = index * (candleWidth + candleSpacing) * zoomLevel + panX;
      const candleHeight =
        ((item.high - item.low) / valueRange) * CANVAS_HEIGHT * zoomLevel;
      const candleOffset =
        ((item.open - minValue) / valueRange) * CANVAS_HEIGHT * zoomLevel;
      new Rectangle({ x, y: CANVAS_HEIGHT - candleOffset, width: candleWidth * zoomLevel, height: candleHeight, color: (item.close >= item.open ? "green" : "red"), app });
    });

  }


}