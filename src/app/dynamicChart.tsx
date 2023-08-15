'use client'

import { WheelEvent, useEffect, useState, useRef, PointerEvent } from 'react'
import * as PIXI from 'pixi.js'
import Rectangle from './rectangle'
import Head from 'next/head'

interface Candle {
	open: number
	close: number
	high: number
	low: number
}

function generateRandomColumn(count: number) {
	const data: Array<Candle> = []
	let prevClose = 50

	for (let i = 0; i < count; i++) {
		const open = prevClose
		const close = open + (Math.random() - 0.5) * 2
		const high = Math.max(open, close) + Math.random() * 2
		const low = Math.min(open, close) - Math.random() * 2

		data.push({ open, close, high, low })
		prevClose = close
	}

	return data
}

const data = generateRandomColumn(100)

const app = new PIXI.Application<HTMLCanvasElement>({
	width: window.innerWidth,
	height: window.innerHeight - 200,
	backgroundColor: 0xffffff,
})
const xAxisCont = new PIXI.Container()
const yAxisCont = new PIXI.Container()
const chartCont = new PIXI.Container()


app.stage.sortableChildren = true
const MAX_ZOOM = 2
const MIN_ZOOM = 0.5
const STEP_ZOOM = 0.1

export default function Chart() {
	const CANVAS_WIDTH = window.innerWidth 
	const CANVAS_HEIGHT = window.innerHeight - 200;
	const [zoomLevel, setZoomLevel] = useState(1)
	const [panX, setPanX] = useState(0)
	const [panY, setPanY] = useState(0)
	const [isPointerDown, setIsPointerDown] = useState(false)

	const [isSomeCandleMoved, setIsSomeCandleMoved] = useState(false)

	const canvasRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (canvasRef.current) {
			canvasRef.current.appendChild(app.view);
			
		}
	}, [canvasRef])


	useEffect(() => {
		console.log('1 time');
		app.stage.addChild(xAxisCont)
		app.stage.addChild(yAxisCont)
		app.stage.addChild(chartCont);
		drawCandlestickChart();
		console.log(chartCont.position)
		
	}, []);
	useEffect(() => {
		console.log(chartCont.position)
		chartCont.position.set(panX, -panY);
		chartCont.scale.set(zoomLevel)
		updateXAxis();
		updateYAxis();
	}, [zoomLevel, panX, panY])
	return (
		<>
			<Head>
				<title>Chart</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>

			<div
				ref={canvasRef}
				onPointerMove={handlePointeMove}
				onPointerDown={handlePointeDown}
				onPointerUp={handlePointeUp}></div>
			<button className='btn' onClick={handleZoomIn}>+</button>
			<button className='btn' onClick={handleZoomOut}>-</button>
		</>
	)

	function handlePointeMove(e: PointerEvent) {
		if (isPointerDown) {
			setPanX((prevPan) => prevPan + e.movementX)
			setPanY((prevPan) => prevPan - e.movementY)
		}
	}

	function handlePointeDown(e: PointerEvent) {
		if (isSomeCandleMoved) return
		setIsPointerDown(true)
	}

	function handlePointeUp(e: PointerEvent) {
		setIsPointerDown(false)
	}

	function handleZoomIn(){
		if (isSomeCandleMoved) return;
		setZoomLevel((prevZoom) => Math.min(prevZoom + STEP_ZOOM, MAX_ZOOM))
	}
	function handleZoomOut() {
		if (isSomeCandleMoved) return
		setZoomLevel((prevZoom) => Math.max(prevZoom - STEP_ZOOM, MIN_ZOOM))
	}
	

	function drawCandlestickChart() {
		if (!app) return
		const minValue = Math.min(...data.map((item) => item.low))
		const maxValue = Math.max(...data.map((item) => item.high))
		const valueRange = maxValue - minValue

		const candleCount = data.length
		const candleWidth = CANVAS_WIDTH / candleCount
		const candleSpacing = candleWidth * 0.2

		data.forEach((item, index) => {
			const x = index * (candleWidth + candleSpacing) * zoomLevel + panX
			const candleHeight = ((item.high - item.low) / valueRange) * CANVAS_HEIGHT * zoomLevel
			const candleOffset = ((item.open - minValue) / valueRange) * CANVAS_HEIGHT * zoomLevel + panY
			chartCont.addChild(new Rectangle({
				x,
				y: CANVAS_HEIGHT - candleOffset,
				width: candleWidth * zoomLevel,
				height: candleHeight,
				color: item.close >= item.open ? 'green' : 'red',
				app,
				clickedFn: setIsSomeCandleMoved,
			}))
		})
	}

	function updateXAxis(){
		const g = new PIXI.Graphics()
		xAxisCont.children[0]?.destroy(true);
		xAxisCont.removeChildren();
		let xPos = 0;
		const numericStep = 200
		const HEIGHT = 50
		let pos = -panX ;
		while(xPos <= window.innerWidth){
			let lineLength = pos % numericStep == 0 ? 15 : 2
			g.lineStyle(2, 0xff0000).beginFill().moveTo(xPos, 0).lineTo(xPos, lineLength).endFill()

			if (pos % numericStep === 0) {
				
				const text = new PIXI.Text(pos.toString());
				g.addChild(text)
				text.position.set(xPos, lineLength)
			}

			xPos += 1 * zoomLevel
			pos += 1
		}
		xAxisCont.addChild(g)
	}

	function updateYAxis() {
		yAxisCont.children[0]?.destroy(true);
		yAxisCont.removeChildren()
		const g = new PIXI.Graphics()

		let yPos = 0
		const numericStep = 200
		const WIDTH = 50
		let pos = panY
		while (yPos <= window.innerHeight - 200) {
			let lineLength = pos % numericStep == 0 ? 15 : 2
			g.lineStyle(2, 0xff0000).beginFill().moveTo(0, yPos).lineTo(lineLength, yPos).endFill()

			if (pos % numericStep === 0) {

				const text = new PIXI.Text(pos.toString())
				g.addChild(text)
				text.position.set(lineLength, yPos)
			}

			yPos += 1 * zoomLevel
			pos += 1
		}
		yAxisCont.addChild(g)
	}
}

