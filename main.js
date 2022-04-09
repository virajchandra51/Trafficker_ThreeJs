import * as THREE from 'three'
import { Group, MathUtils } from 'three';
import {OrbitControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'


window.focus()

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)]  
} 
function getDistance(coordinate1, coordinate2) {
    return Math.sqrt((coordinate1.x - coordinate2.x) ** 2 + (coordinate1.y - coordinate2.y) ** 2)
}
const vehicleColors = [0xa52523 ,0xbdb638 ,0x78b14b]
const speed = 0.0017
const playerAngleInitial = Math.PI

let ready
let playerAngleMoved
let score
let otherVehicles = []
let lastTimeStamp
let accelerate = false
let decelerate = false


const config = {
    showHitZones: false,
    shadows: true, // Use shadow
    trees: true, // Add trees to the map
    curbs: true, // Show texture on the extruded geometry
    grid: false // Show grid helper
  };
  
const trackRadius = 225
const trackWidth = 45
const innerTrackRadius = trackRadius - trackWidth
const outerTrackRadius = trackRadius + trackWidth

const arcAngle1 = (1/3) * Math.PI
const deltaY = Math.sin(arcAngle1) * innerTrackRadius
const arcAngle2 = Math.asin( deltaY/ outerTrackRadius)
const arcCenterX = (Math.cos(arcAngle1)* innerTrackRadius +  Math.cos(arcAngle2)* outerTrackRadius) / 2
const arcAngle3 = Math.acos(arcCenterX/ innerTrackRadius)
const arcAngle4 = Math.acos(arcCenterX/outerTrackRadius)

const scoreElement = document.getElementById("score");
const buttonsElement = document.getElementById("buttons");
const instructionsElement = document.getElementById("instructions");
const resultsElement = document.getElementById("results");
const accelerateButton = document.getElementById("accelerate");
const decelerateButton = document.getElementById("decelerate");

setTimeout(() => {
    if (ready) instructionsElement.style.opacity = 1;
    buttonsElement.style.opacity = 1;
    
  }, 3000);



const aspectRatio = window.innerWidth / window.innerHeight
const cameraWidth = 1200
const cameraHeight = cameraWidth / aspectRatio

const camera = new THREE.OrthographicCamera(
    cameraWidth/-2,
    cameraWidth/2,
    cameraHeight/2,
    cameraHeight/-2,
    50,
    700
)
camera.position.set(0,-210,300)
camera.lookAt(0,0,0)


const scene = new THREE.Scene()
const playerCar = Car();
const ground_grass_material = new THREE.MeshLambertMaterial({color:0x8bc560})
const ground_floor_Boxmaterial = new THREE.MeshLambertMaterial({color:0xa1a2a6})
const upper_floor_Boxmaterial = new THREE.MeshLambertMaterial({color:0x525e6c})
const window_door = new THREE.MeshLambertMaterial({color:0x056ca6})
const railing_fence = new THREE.MeshLambertMaterial({color:0x252a2e})
const gold_doorknob = new THREE.MeshLambertMaterial({color:0xba8e37})

function window_creater() {
  const window = new THREE.Group()
  const window_framel = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1.5,1.5,18),
    window_door
  )
  window_framel.position.set(-5,-12,25)
  window.add(window_framel)

  const window_framer = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1.5,1.5,18),
    window_door
  )
  window_framer.position.set(-5,-4,25)
  window.add(window_framer)
  
  const window_frameu = new THREE.Mesh(
    new THREE.BoxBufferGeometry(6,12,4),
    window_door
  )
  window_frameu.position.set(-6,-8,35)
  window.add(window_frameu)

  const window_frameb = new THREE.Mesh(
    new THREE.BoxBufferGeometry(6,10.5,2.8),
    window_door
  )
  window_frameb.position.set(-6,-8,17)
  window.add(window_frameb)

  const window_frame_midv1 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(.3,.3,18),
    window_door
  )
  window_frame_midv1.position.set(-5,-9,25)
  window.add(window_frame_midv1)

  const window_frame_midv2 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(.3,.3,18),
    window_door
  )
  window_frame_midv2.position.set(-5,-7,25)
  window.add(window_frame_midv2)

  const window_frame_midh1 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(.3,10,.3),
    window_door
  )
  window_frame_midh1.position.set(-5,-8,28.4)
  window.add(window_frame_midh1)

  const window_frame_midh2 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(.3,10,.3),
    window_door
  )
  window_frame_midh2.position.set(-5,-8,25)
  window.add(window_frame_midh2)

  const window_frame_midh3 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(.3,10,.3),
    window_door
  )
  window_frame_midh3.position.set(-5,-8,21.6)
  window.add(window_frame_midh3)

  const window_glass = new THREE.Mesh(
    new THREE.BoxBufferGeometry(9,8,15),
    new THREE.MeshLambertMaterial({color: 0x878787})
  )
  window_glass.position.set(-10,-8,26)
  window.add(window_glass)
return window
}
function vertical_fence() {
  const vertical_fence = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.8,0.8,8),
    railing_fence
  )
  return vertical_fence
}
function brickx() {
  const brickx = new THREE.Mesh(
    new THREE.BoxBufferGeometry(3,6.5,5),
    new THREE.MeshLambertMaterial({color: 0x878787})
  )
  return brickx
}
function bricky() {
  const bricky = new THREE.Mesh(
    new THREE.BoxBufferGeometry(6.5,3,5),
    new THREE.MeshLambertMaterial({color: 0x6b7b7b})
  )
  return bricky
}
function Building() {
  const building = new THREE.Group()
{ //grass, ground floor, first floor
  const ground_grass = new THREE.Mesh(
    new THREE.BoxBufferGeometry(30,45,5),
    ground_grass_material
  )
  ground_grass.position.x=10
  ground_grass.position.z=-30

  building.add(ground_grass)

  const ground_floor_box = new THREE.Mesh(
    new THREE.BoxBufferGeometry(30,45,40),
    ground_floor_Boxmaterial
  )
  ground_floor_box.receiveShadow = ground_floor_box.castShadow = true
  ground_floor_box.position.x = -15
  ground_floor_box.position.z = -12.5

  building.add(ground_floor_box)

  const f_floor_box = new THREE.Mesh(
    new THREE.BoxBufferGeometry(24,45,35),
    upper_floor_Boxmaterial
  )
  f_floor_box.receiveShadow = f_floor_box.castShadow = true
  f_floor_box.position.z = 25
  f_floor_box.position.x = -18
  building.add(f_floor_box)
}
{ //roof 1,2,3
  const f_floor_roof1 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(24,45,2),
    ground_floor_Boxmaterial
  )
  f_floor_roof1.receiveShadow = f_floor_roof1.castShadow = true
  f_floor_roof1.position.z = 43
  f_floor_roof1.position.x = -18
  building.add(f_floor_roof1)

  const f_floor_roof2 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(25,46,4),
    new THREE.MeshLambertMaterial({color: 0x666666})
  )
  f_floor_roof2.receiveShadow = f_floor_roof2.castShadow = true
  f_floor_roof2.position.z = 46
  f_floor_roof2.position.x = -18
  building.add(f_floor_roof2)

  const f_floor_roof3 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(28,48,3),
    ground_floor_Boxmaterial
  )
  f_floor_roof3.receiveShadow = f_floor_roof3.castShadow = true
  f_floor_roof3.position.z = 49
  f_floor_roof3.position.x = -18
  building.add(f_floor_roof3)
} 
{ //stairs
  const stair1 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(10,19,3.5),
    upper_floor_Boxmaterial
  )
  stair1.position.x = 5
  stair1.position.y = -8
  stair1.position.z = -26
  building.add(stair1)

  const stair2 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(8,15,3.5),
    upper_floor_Boxmaterial
  )
  stair2.position.x = 3
  stair2.position.y = -8
  stair2.position.z = -23
  building.add(stair2)

  const stair3 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(5,11,3.5),
    upper_floor_Boxmaterial
  )
  stair3.position.x = 2
  stair3.position.y = -8
  stair3.position.z = -20
  building.add(stair3)
}
{ //door
  const door = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.6,8,20),
    railing_fence
  )
  door.receiveShadow = true
  door.position.x = 1
  door.position.y = -8
  door.position.z = -12
  building.add(door)

  const gold = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.7,2.2,1.5),
   gold_doorknob
  )
  gold.receiveShadow= true
  gold.position.x = 1
  gold.position.y = -8
  gold.position.z = -7.5
  building.add(gold)


const frame_door1 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1.5,1.5,18),
    window_door
  )
  frame_door1.position.set(0.8,-12,-10)
  building.add(frame_door1)

  const frame_door2 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1.5,1.5,18),
    window_door
  )
  frame_door2.position.set(1.2,-4,-10)
  building.add(frame_door2)
  
  const frame_door3 = new THREE.Mesh(
    new THREE.BoxBufferGeometry(6,12,4),
    window_door
  )
  frame_door3.position.set(-0.5,-8,-1)
  building.add(frame_door3)
}  
{ //vertical_fence
  const fence1 = vertical_fence()
  fence1.position.set(18,1,-24)
  building.add(fence1)

  const fence2 = vertical_fence()
  fence2.position.set(18,5,-24)
  building.add(fence2)

  const fence3 = vertical_fence()
  fence3.position.set(18,9,-24)
  building.add(fence3)

  const fence6 = vertical_fence()
  fence6.position.set(18,13,-24)
  building.add(fence6)

  const fence4 = vertical_fence()
  fence4.position.set(18,17,-24)
  building.add(fence4)

  const fence5 = vertical_fence()
  fence5.position.set(18,21,-24)
  building.add(fence5)

  const fence7 = vertical_fence()
  fence7.position.set(18,-21,-24)
  building.add(fence7)

  const fence8 = vertical_fence()
  fence8.position.set(18,-17,-24)
  building.add(fence8)

  const fence9 = vertical_fence()
  fence9.position.set(13,-21,-24)
  building.add(fence9)

  const fence10 = vertical_fence()
  fence10.position.set(8,-21,-24)
  building.add(fence10)

  const fence11 = vertical_fence()
  fence11.position.set(3,-21,-24)
  building.add(fence11)

  const fence12 = vertical_fence()
  fence12.position.set(13,21,-24)
  building.add(fence12)

  const fence13 = vertical_fence()
  fence13.position.set(8,21,-24)
  building.add(fence13)
  
  const fence14 = vertical_fence()
  fence14.position.set(3,21,-24)
  building.add(fence14)
}
{ //railing
  const railing1 = vertical_fence()
  railing1.position.set(-1.5,5,6.2)
  building.add(railing1)
  
  const railing2 = vertical_fence()
  railing2.position.set(-1.5,7,6.2)
  building.add(railing2)

  const railing3 = vertical_fence()
  railing3.position.set(-1.5,9,6.2)
  building.add(railing3)

  const railing4 = vertical_fence()
  railing4.position.set(-1.5,11,6.2)
  building.add(railing4)

  const railing5 = vertical_fence()
  railing5.position.set(-1.5,13,6.2)
  building.add(railing5)

  const railing6 = vertical_fence()
  railing6.position.set(-1.5,15,6.2)
  building.add(railing6)

  const railing7 = vertical_fence()
  railing7.position.set(-1.5,17,6.2)
  building.add(railing7)

  const railing8 = vertical_fence()
  railing8.position.set(-1.5,19,6.2)
  building.add(railing8)

  const railing9 = vertical_fence()
  railing9.position.set(-1.5,21,6.2)
  building.add(railing9)

  const railing24 = vertical_fence()
  railing24.position.set(-4,21,6.2)
  building.add(railing24)

  const railing10 = vertical_fence()
  railing10.position.set(-1.5,3,6.2)
  building.add(railing10)

  const railing11 = vertical_fence()
  railing11.position.set(-1.5,1,6.2)
  building.add(railing11)

  const railing12 = vertical_fence()
  railing12.position.set(-1.5,-1,6.2)
  building.add(railing12)

  const railing13 = vertical_fence()
  railing13.position.set(-1.5,-3,6.2)
  building.add(railing13)
  
  const railing14 = vertical_fence()
  railing14.position.set(-1.5,-5,6.2)
  building.add(railing14)

  const railing15 = vertical_fence()
  railing15.position.set(-1.5,-7,6.2)
  building.add(railing15)

  const railing16 = vertical_fence()
  railing16.position.set(-1.5,-9,6.2)
  building.add(railing16)

  const railing17 = vertical_fence()
  railing17.position.set(-1.5,-11,6.2)
  building.add(railing17)

  const railing18 = vertical_fence()
  railing18.position.set(-1.5,-13,6.2)
  building.add(railing18)

  const railing19 = vertical_fence()
  railing19.position.set(-1.5,-15,6.2)
  building.add(railing19)

  const railing20 = vertical_fence()
  railing20.position.set(-1.5,-17,6.2)
  building.add(railing20)

  const railing21 = vertical_fence()
  railing21.position.set(-1.5,-19,6.2)
  building.add(railing21)

  const railing22 = vertical_fence()
  railing22.position.set(-1.5,-21,6.2)
  building.add(railing22)

  const railing23 = vertical_fence()
  railing23.position.set(-4,-21,6.2)
  building.add(railing23)



}
{ //horizontal fence
    const hor_fence1 = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.5,24,0.5),
      railing_fence
    )
    hor_fence1.position.set(18,11,-18.5)
    building.add(hor_fence1)
  
    const hor_fence2 = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.5,24,0.5),
      railing_fence
    )
    hor_fence2.position.set(18,11,-22.5)
    building.add(hor_fence2)
  
    const hor_fence3 = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.5,8,0.5),
      railing_fence
    )
    hor_fence3.position.set(18,-19,-22.5)
    building.add(hor_fence3)
  
    const hor_fence4 = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.5,8,0.5),
      railing_fence
    )
    hor_fence4.position.set(18,-19,-18.5)
    building.add(hor_fence4)
  
    const hor_fence5 = new THREE.Mesh(
      new THREE.BoxBufferGeometry(19,0.5,0.5),
      railing_fence
    )
    hor_fence5.position.set(10,-21,-22.5)
    building.add(hor_fence5)
  
    const hor_fence6 = new THREE.Mesh(
      new THREE.BoxBufferGeometry(19,0.5,0.5),
      railing_fence
    )
    hor_fence6.position.set(10,-21,-18.5)
    building.add(hor_fence6)
  
    const hor_fence7 = new THREE.Mesh(
      new THREE.BoxBufferGeometry(19,0.5,0.5),
      railing_fence
    )
    hor_fence7.position.set(10,21,-22.5)
    building.add(hor_fence7)
  
    const hor_fence8 = new THREE.Mesh(
      new THREE.BoxBufferGeometry(19,0.5,0.5),
      railing_fence
    )
    hor_fence8.position.set(10,21,-18.5)
    building.add(hor_fence8)
}
{ //bricks
const brick1 = brickx()
brick1.position.set(-0.8,-19.5,4)
building.add(brick1)

const brick2 = brickx()
brick2.position.set(-0.8,-19.8,-8)
building.add(brick2)

const brick3 = brickx()
brick3.position.set(-0.8,-19.8,-20)
building.add(brick3)

const brick4 = brickx()
brick4.position.set(-0.8,19.8,-20)
building.add(brick4)

const brick5 = brickx()
brick5.position.set(-0.8,19.8,-8)
building.add(brick5)

const brick6 = brickx()
brick6.position.set(-0.8,19.8,4)
building.add(brick6) 

const brick7 = brickx()
brick7.position.set(-7,-19.8,18)
building.add(brick7)

const brick8 = brickx()
brick8.position.set(-7,-19.8,30)
building.add(brick8)

const brick9 = brickx()
brick9.position.set(-7,19.8,18)
building.add(brick9)

const brick10 = brickx()
brick10.position.set(-7,19.8,30)
building.add(brick10)

const brick11 = bricky()
brick11.position.set(-8.8,-21.5,36)
building.add(brick11)

const brick12 = bricky()
brick12.position.set(-8.8,-21.5,24)
building.add(brick12)

const brick13 = bricky()
brick13.position.set(-8.8,-21.5,12)
building.add(brick13)

const brick14 = bricky()
brick14.position.set(-8.8,21.5,36)
building.add(brick14)

const brick15 = bricky()
brick15.position.set(-8.8,21.5,24)
building.add(brick15)

const brick16 = bricky()
brick16.position.set(-8.8,21.5,12)
building.add(brick16)

const brick17 = bricky()
brick17.position.set(-3,-21.5,-2.3)
building.add(brick17)

const brick18 = bricky()
brick18.position.set(-3,-21.5,-14.3)
building.add(brick18)

const brick19 = bricky()
brick19.position.set(-3,-21.5,-26.3)
building.add(brick19)

const brick20 = bricky()
brick20.position.set(-3,21.5,-2.3)
building.add(brick20)

const brick21 = bricky()
brick21.position.set(-3,21.5,-14.3)
building.add(brick21)

const brick22 = bricky()
brick22.position.set(-3,21.5,-26.3)
building.add(brick22)
}
{ //window
  const window1 = window_creater()
  building.add(window1)
  const window2 = window_creater()
  window2.position.y = 15
  building.add(window2)
  const window3 = window_creater()
  window3.position.set(6,15,-36)
  building.add(window3)
}
return building
}
const building1 = Building()
building1.scale.set(2.5,2.5,2.5)
building1.position.set(-10,320,110)
building1.rotateZ(-Math.PI/2.5)
building1.rotateY(-Math.PI/12)
building1.rotateX(-Math.PI/30)






scene.add(building1)



scene.add(playerCar)

renderMap(cameraWidth, cameraHeight*2)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
dirLight.position.set(100, -300 ,400)
dirLight.castShadow = true
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.left = -400;
dirLight.shadow.camera.right = 350;
dirLight.shadow.camera.top = 400;
dirLight.shadow.camera.bottom = -300;
dirLight.shadow.camera.near = 100;
dirLight.shadow.camera.far = 800;
scene.add(dirLight)


const renderer = new THREE.WebGL1Renderer({antialias: true, powerPreference: "high-performance"})
renderer.setSize(window.innerWidth,window.innerHeight)
if (config.shadows) renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement)

reset()

function reset() {
    
    playerAngleMoved = 0
    score = 0
    scoreElement.innerText = "Press UP"
    

    otherVehicles.forEach((vehicle) => {
        scene.remove(vehicle.mesh)


    })
    otherVehicles = []

    resultsElement.style.display = "none";
    lastTimeStamp = undefined
    movePlayerCar(0)


    renderer.render(scene,camera)
    ready = true
}
function startGame() {
    if (ready){
    ready = false
    scoreElement.innerText = 0;
    buttonsElement.style.opacity = 1;
    instructionsElement.style.opacity = 0;
    renderer.setAnimationLoop(animation)
    }
}
function positionScoreElement() {
    const arcCenterXinPixels = (arcCenterX / cameraWidth) * window.innerWidth;
    scoreElement.style.cssText = `
      left: ${window.innerWidth / 2 - arcCenterXinPixels * 1.3}px;
      top: ${window.innerHeight / 2}px
    `;
}
function getLineMarkings(mapWidth,mapHeight) {
    const canvas = document.createElement("canvas")
    canvas.width = mapWidth
    canvas.height = mapHeight
    const context = canvas.getContext("2d")
    
    context.fillStyle = "#546e90"
    context.fillRect(0,0,mapWidth,mapHeight)
  
    context.lineWidth = 2
    context.strokeStyle = "#e0ffff"
    context.setLineDash([10,14])
  
    //leftc
    context.beginPath()
    context.arc(
        mapWidth/2 - arcCenterX,
        mapHeight/2,
        trackRadius,0, Math.PI*2
      )
     context.stroke()
  
     //rightc
     context.beginPath()
     context.arc(
         mapWidth/2 + arcCenterX,
         mapHeight/2,
         trackRadius,0,Math.PI *2
     )
     context.stroke()
  
     return new THREE.CanvasTexture(canvas) 
}
function getCurbsTexture(mapWidth,mapHeight) {
    const canvas = document.createElement("canvas")
    canvas.width = mapWidth
    canvas.height= mapHeight
    const context = canvas.getContext("2d")

    context.fillStyle = "#67C240"
    context.fillRect(0,0,mapWidth,mapHeight)

    context.lineWidth = 65
    context.strokeStyle = "#a2ff75"
    context.beginPath()
    context.arc(
            mapWidth/2-arcCenterX,
            mapHeight/2,
            innerTrackRadius,
            arcAngle1,
            -arcAngle1, false 
        )
        context.arc(
            mapWidth / 2 + arcCenterX,
            mapHeight / 2,
            outerTrackRadius,
            Math.PI + arcAngle2,
            Math.PI - arcAngle2, true
            
        )   
    context.stroke() 
    
    context.beginPath()
    context.arc(
            mapWidth / 2 + arcCenterX,
            mapHeight / 2,
            innerTrackRadius,
            Math.PI + arcAngle1,
            Math.PI - arcAngle1
        )
    context.arc(
            mapWidth / 2 - arcCenterX,
            mapHeight / 2,
            outerTrackRadius,
            arcAngle2,
            -arcAngle2,
            true
        )
    context.stroke()

    context.lineWidth = 60
    context.strokeStyle = "#67C240"
    context.beginPath()
    context.arc(
            mapWidth/2-arcCenterX,
            mapHeight/2,
            innerTrackRadius,
            arcAngle1,
            -arcAngle1, false 
        )
        context.arc(
            mapWidth / 2 + arcCenterX,
            mapHeight / 2,
            outerTrackRadius,
            Math.PI + arcAngle2,
            Math.PI - arcAngle2, true
            
        )   
    context.stroke() 
    
    context.beginPath()
    context.arc(
            mapWidth / 2 + arcCenterX,
            mapHeight / 2,
            innerTrackRadius,
            Math.PI + arcAngle1,
            Math.PI - arcAngle1
        )
    context.arc(
            mapWidth / 2 - arcCenterX,
            mapHeight / 2,
            outerTrackRadius,
            arcAngle2,
            -arcAngle2,
            true
        )
    context.stroke()
    
    context.lineWidth = 6
    context.strokeStyle = "#725F48"
    context.beginPath()
    context.arc(
        mapWidth / 2 + arcCenterX,
            mapHeight / 2,
            outerTrackRadius,
            0,
            Math.PI*2,
    )
    context.stroke()
    context.beginPath()
    context.arc(
        mapWidth / 2 - arcCenterX,
            mapHeight / 2,
            outerTrackRadius,
            0,
            Math.PI*2,
    )
    context.stroke()
    context.beginPath()
    context.arc(
        mapWidth / 2 + arcCenterX,
            mapHeight / 2,
            innerTrackRadius,
            0,
            Math.PI*2,
    )
    context.stroke()
    context.beginPath()
    context.arc(
        mapWidth / 2 - arcCenterX,
            mapHeight / 2,
            innerTrackRadius,
            0,
            Math.PI*2,
    )
    context.stroke()
    
 



    return new THREE.CanvasTexture(canvas);
}
function getLeftIsland() {
    const islandLeft = new THREE.Shape()

    islandLeft.absarc( 
        -arcCenterX,
        0,
        innerTrackRadius,
        arcAngle1,-arcAngle1,false
    )

    islandLeft.absarc(
        arcCenterX,
        0,
        outerTrackRadius,
        Math.PI + arcAngle2,
        Math.PI - arcAngle2,true
    )
    return islandLeft
} 
function getMiddleIsland() {
    const islandMiddle = new THREE.Shape()

    islandMiddle.absarc( 
        -arcCenterX,
        0,
        innerTrackRadius,
        arcAngle3,-arcAngle3,true
    )

    islandMiddle.absarc(
        arcCenterX,
        0,
        innerTrackRadius,
        Math.PI + arcAngle3,
        Math.PI - arcAngle3,true
    )
    return islandMiddle
} 
function getRightIsland() {
    const islandRight = new THREE.Shape()

    islandRight.absarc( 
        arcCenterX,
        0,
        innerTrackRadius,
        Math.PI - arcAngle1 ,(Math.PI + arcAngle1),true
    )

    islandRight.absarc(
        -arcCenterX,
        0,
        outerTrackRadius,
        -arcAngle2,
        arcAngle2, false
    )
    return islandRight
} 
function getOuterField(mapWidth,mapHeight) {
    const field = new THREE.Shape()

field.moveTo(-mapWidth/2,-mapHeight/2)
field.lineTo(0,-mapHeight/2)



    field.absarc( 
        -arcCenterX,
        0,
        outerTrackRadius,
        -arcAngle4 ,arcAngle4,true
    )

    field.absarc(
        arcCenterX,
        0,
        outerTrackRadius,
        Math.PI-arcAngle4,
        Math.PI+arcAngle4, true
    )
    
    field.lineTo(0,-mapHeight/2)
    field.lineTo(mapWidth/2,-mapHeight/2)
    field.lineTo(mapWidth/2,mapHeight/2)
    field.lineTo(-mapWidth/2,mapHeight/2)

    return field
}
function renderMap(mapWidth,mapHeight) {
    //plane with lines

    const plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(mapWidth,mapHeight),
        new THREE.MeshLambertMaterial({map: getLineMarkings(mapWidth,mapHeight)}))
    plane.receiveShadow = true
    plane.matrixAutoUpdate = false
    scene.add(plane)
    
    //islands
    const islandLeft = getLeftIsland()
    const islandMiddle = getMiddleIsland()
    const islandRight = getRightIsland()
    const outerField = getOuterField(mapWidth,mapHeight)
    
    const curbsTexture = getCurbsTexture(mapWidth,mapHeight)
    curbsTexture.offset =  new THREE.Vector2(0.5,0.5)
    curbsTexture.repeat.set(1/mapWidth,1/mapHeight)

    const fieldGeometry = new THREE.ExtrudeBufferGeometry([islandLeft,islandMiddle,islandRight,outerField],{depth: 6 , bevelEnabled:false})
    const fieldMesh = new THREE.Mesh(fieldGeometry, [
        new THREE.MeshLambertMaterial({color: !config.curbs && 0x67c240 , map: config.curbs && curbsTexture}),
        new THREE.MeshLambertMaterial({color: 0x23311c})
    ])
    fieldMesh.receiveShadow = true
    fieldMesh.matrixAutoUpdate = false
    scene.add(fieldMesh)

    positionScoreElement()

    if (config.trees) {
        const tree1 = Tree();
        tree1.position.x = arcCenterX * 1.2;
        scene.add(tree1);

        const tree15 = Tree();
        tree15.position.x = arcCenterX * 1.6;
        tree15.position.y = arcCenterX * 0.4;
        scene.add(tree15);
        
        const tree16 = Tree();
        tree16.position.x = arcCenterX * 1.4;
        tree16.position.y = -arcCenterX * 0.6;
        scene.add(tree16);
    
        const tree2 = Tree();
        tree2.position.y = arcCenterX * 1.9;
        tree2.position.x = arcCenterX * 1.3;
        scene.add(tree2);
    
        const tree3 = Tree();
        tree3.position.x = arcCenterX * 0.8;
        tree3.position.y = arcCenterX * 2;
        scene.add(tree3);
    
        const tree4 = Tree();
        tree4.position.x = arcCenterX * 1.8;
        tree4.position.y = arcCenterX * 2;
        scene.add(tree4);
    
        const tree5 = Tree();
        tree5.position.x = -arcCenterX * 1;
        tree5.position.y = arcCenterX * 2;
        scene.add(tree5);
    
        const tree6 = Tree();
        tree6.position.x = -arcCenterX * 2;
        tree6.position.y = arcCenterX * 1.8;
        scene.add(tree6);
    
        const tree7 = Tree();
        tree7.position.x = arcCenterX * 0.8;
        tree7.position.y = -arcCenterX * 2;
        scene.add(tree7);
    
        const tree8 = Tree();
        tree8.position.x = arcCenterX * 1.8;
        tree8.position.y = -arcCenterX * 2;
        scene.add(tree8);
    
        const tree9 = Tree();
        tree9.position.x = -arcCenterX * 1;
        tree9.position.y = -arcCenterX * 2;
        scene.add(tree9);
    
        const tree10 = Tree();
        tree10.position.x = -arcCenterX * 2;
        tree10.position.y = -arcCenterX * 1.8;
        scene.add(tree10);
    
        const tree11 = Tree();
        tree11.position.x = arcCenterX * 0.6;
        tree11.position.y = -arcCenterX * 2.3;
        scene.add(tree11);
    
        const tree12 = Tree();
        tree12.position.x = arcCenterX * 1.5;
        tree12.position.y = -arcCenterX * 2.4;
        scene.add(tree12);
    
        const tree13 = Tree();
        tree13.position.x = -arcCenterX * 0.7;
        tree13.position.y = -arcCenterX * 2.4;
        scene.add(tree13);
    
        const tree14 = Tree();
        tree14.position.x = -arcCenterX * 1.5;
        tree14.position.y = -arcCenterX * 1.8;
        scene.add(tree14);

       

        
      }
}
function Car() {
    const car = new THREE.Group()

    const color = pickRandom (vehicleColors)

    const backWheel = Wheel()
    backWheel.position.x = -18
    car.add(backWheel)

    const frontWheel = Wheel()
    frontWheel.position.x = 18
    car.add(frontWheel)


    const main = new THREE.Mesh(
        new THREE.BoxBufferGeometry(60,30,15),
        new THREE.MeshLambertMaterial({ color })
    )
    main.position.z = 12
    main.castShadow - true
    main.receiveShadow = true
    car.add(main)

    const carFrontTexture = getCarFrontTexture()
    carFrontTexture.center = new THREE.Vector2(0.5,0.5)
    carFrontTexture.rotation = Math.PI /2

    const carBackTexture = getCarFrontTexture()
    carBackTexture.center = new THREE.Vector2(0.5,0.5)
    carBackTexture.rotation = -Math.PI /2

    const carRightSideTexture = getCarSideTexture()

    const carLeftSideTexture = getCarSideTexture()
    carLeftSideTexture.flipY = false

    const window = new THREE.Mesh(
        new THREE.BoxBufferGeometry(33,24,12),[
        new THREE.MeshLambertMaterial({map: carFrontTexture}),
        new THREE.MeshLambertMaterial({map: carBackTexture}),
        new THREE.MeshLambertMaterial({map: carLeftSideTexture}),
        new THREE.MeshLambertMaterial({map: carRightSideTexture}),
        new THREE.MeshLambertMaterial({color : 0xffffff}),
        new THREE.MeshLambertMaterial({color : 0xffffff}),
    ])
   
    window.position.z= 25.5
    window.position.x = -6
    window.castShadow= true
    window.receiveShadow = true
    car.add(window)

  return car
}
function Wheel() {
    const wheel = new THREE.Mesh(
        new THREE.BoxBufferGeometry(12,33,12),
        new THREE.MeshLambertMaterial({color: 0x333333})
    )
    wheel.position.z = 6;
    return wheel
}
function getCarFrontTexture() {
    const canvas = document.createElement("canvas")
    canvas.width = 64
    canvas.height = 32
    const context = canvas.getContext("2d")
    
    context.fillStyle = "#ffffff"
    context.fillRect(0,0,64,32)
    
    context.fillStyle = "#666666"
    context.fillRect(8,8,48,24)

    return new THREE.CanvasTexture(canvas)
}
function getCarSideTexture() {
    const canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 32
    const context = canvas.getContext("2d")

    context.fillStyle = "#ffffff"
    context.fillRect(0,0,128,32)

    context.fillStyle = "#666666"
    context.fillRect(10,8,38,24)
    context.fillRect(58,8,60,24)

    return new THREE.CanvasTexture(canvas)
}
function Tree() {
    const tree = new THREE.Group()
    
    const treeHeights = [45,60,75]
    const height = pickRandom(treeHeights)
    
    const leaves = new THREE.Mesh(
        new THREE.SphereBufferGeometry(height/2 ,30,30),
        new THREE.MeshLambertMaterial({color: 0x498c2c})
        )
    leaves.position.z = height/2 + 30
    leaves.castShadow = true
    leaves.receiveShadow = false
    tree.add(leaves)
    
    const bark = new THREE.Mesh(
        new THREE.BoxBufferGeometry(15,15,30),
        new THREE.MeshLambertMaterial({color: 0x4b3f2f})
    )
    bark.position.z = 10
    bark.castShadow = true
    bark.receiveShadow = true
    bark.matrixAutoUpdate = false
    tree.add(bark)

    return tree
}
function Truck() {
    const truck = new THREE.Group()
    const color = pickRandom(vehicleColors)

    const base = new THREE.Mesh(
        new THREE.BoxBufferGeometry(100,25,5),
        new THREE.MeshLambertMaterial({color: 0xb4c6fc})
    )
    base.position.z = 10
    truck.add(base)

    const cargo = new THREE.Mesh(
        new THREE.BoxBufferGeometry(75,35,40),
        new THREE.MeshLambertMaterial({color: 0xffffff})
    )
    cargo.position.x = -15
    cargo.position.z = 30
    cargo.castShadow = true
    cargo.receiveShadow = true
    truck.add(cargo)

    const backWheel = Wheel()
    backWheel.position.x = -30
    truck.add(backWheel)

    const middleWheel = Wheel()
    middleWheel.position.x = 10
    truck.add(middleWheel)

    const frontWheel = Wheel()
    frontWheel.position.x = 38
    truck.add(frontWheel)
    
    const truckFrontTexture = getTruckFrontTexture()
        truckFrontTexture.center = new THREE.Vector2(0.5,0.5)
        truckFrontTexture.rotation = Math.PI /2 

    const truckLeftTexture = getTruckSideTexture();
        truckLeftTexture.flipY = false;
      
    const truckRightTexture = getTruckSideTexture();
      
    const cabin = new THREE.Mesh(new THREE.BoxBufferGeometry(25, 30, 30), [
          new THREE.MeshLambertMaterial({ color, map: truckFrontTexture }),
          new THREE.MeshLambertMaterial({ color }), // back
          new THREE.MeshLambertMaterial({ color, map: truckLeftTexture }),
          new THREE.MeshLambertMaterial({ color, map: truckRightTexture }),
          new THREE.MeshLambertMaterial({ color }), // top
          new THREE.MeshLambertMaterial({ color }) // bottom
        ]);
    cabin.position.x = 40;
    cabin.position.z = 20;
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    truck.add(cabin);
 
    return truck
}
function getTruckFrontTexture() {
    const canvas = document.createElement("canvas")
    canvas.width = 32
    canvas.height = 32
    const context = canvas.getContext("2d")

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 32, 32);
  
    context.fillStyle = "#666666";
    context.fillRect(0, 5, 32, 10);
  
    return new THREE.CanvasTexture(canvas);
    
}
function getTruckSideTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");
  
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 32, 32);
  
    context.fillStyle = "#666666";
    context.fillRect(17, 5, 15, 10);
  
    return new THREE.CanvasTexture(canvas);
}
window.addEventListener("keydown", function (event) {
    if (event.key == "ArrowUp"){
        startGame()
        accelerate = true
        return
    }
    if (event.key == "ArrowDown") {
        decelerate = true
        return
    }
    if (event.key == 'R' || event.key == 'r') {
        reset()
        return
    }
})
window.addEventListener("keyup", function (event) {
    if (event.key == "ArrowUp"){
        accelerate = false
        return
    }
    if (event.key == "ArrowDown") {
        decelerate = false
        return
    }
})
accelerateButton.addEventListener("mousedown", function () {
    startGame();
    accelerate = true;
});
  decelerateButton.addEventListener("mousedown", function () {
    startGame();
    decelerate = true;
});
  accelerateButton.addEventListener("mouseup", function () {
    accelerate = false;
});
  decelerateButton.addEventListener("mouseup", function () {
    decelerate = false;
});

function animation(timestamp) {
    if(!lastTimeStamp){
        lastTimeStamp = timestamp
        return
    }
    
    const timeDelta = timestamp - lastTimeStamp

    movePlayerCar(timeDelta)

    const laps = Math.floor(Math.abs(playerAngleMoved)/(Math.PI*2))
    if (laps != score){
    score = laps
    scoreElement.innerText = score 

}

    if (otherVehicles.length < (laps + 1)/5 ) {
        addVehicle()
    }

    moveOtherVehicles(timeDelta)

    hitDetection()
    

    renderer.render(scene,camera)
    lastTimeStamp = timestamp


}

function getHitZonePosition(center,angle,clockwise,distance) {
    const directionAngle = angle + (clockwise?-Math.PI/2:Math.PI/2)
return{
    x: center.x + Math.cos(directionAngle) * distance,
    y: center.y + Math.sin(directionAngle) * distance,
      }
}





function hitDetection() {
    const playerHitZone1 = getHitZonePosition(playerCar.position,playerAngleInitial,true,15)
    const playerHitZone2 = getHitZonePosition(playerCar.position,playerAngleInitial,true,-15)

    const hit = otherVehicles.some((vehicle) => {
        if (vehicle.type == "car") {
            const vehicleHitZone1 = getHitZonePosition(vehicle.mesh.position,vehicle.angle,vehicle.clockwise,15)
            const vehicleHitZone2 = getHitZonePosition(vehicle.mesh.position,vehicle.angle,vehicle.clockwise,-15)
        if (getDistance(playerHitZone1,vehicleHitZone1)<40) return true
        if (getDistance(playerHitZone1,vehicleHitZone2)<40) return true
        if (getDistance(playerHitZone2,vehicleHitZone1)<40) return true
        }
        if (vehicle.type == "truck"){
            const vehicleHitZone1 = getHitZonePosition(vehicle.mesh.position,vehicle.angle,vehicle.clockwise,35)
            const vehicleHitZone2 = getHitZonePosition(vehicle.mesh.position,vehicle.angle,vehicle.clockwise,-35)
            const vehicleHitZone3 = getHitZonePosition(vehicle.mesh.position,vehicle.angle,vehicle.clockwise,0)
        if (getDistance(playerHitZone1, vehicleHitZone1) < 40) return true;
        if (getDistance(playerHitZone1, vehicleHitZone2) < 40) return true;
        if (getDistance(playerHitZone1, vehicleHitZone3) < 40) return true;
        if (getDistance(playerHitZone2, vehicleHitZone1) < 40) return true;
        }

    })
    if (hit) {
        if (resultsElement) resultsElement.style.display = "flex";
        renderer.setAnimationLoop(null); // Stop animation loop
      }
}



function movePlayerCar(timeDelta) {
    const playerSpeed = getPlayerSpeed()
    playerAngleMoved -= playerSpeed * timeDelta

    const totalPlayerAngle = playerAngleInitial + playerAngleMoved

    
    const playerX = Math.cos(totalPlayerAngle) * trackRadius - arcCenterX
    const playerY = Math.sin(totalPlayerAngle) * trackRadius

    playerCar.position.x = playerX
    playerCar.position.y = playerY
    playerCar.rotation.z = totalPlayerAngle - Math.PI /2 
}

function moveOtherVehicles(timeDelta) {
    otherVehicles.forEach((vehicle) => {
        if(vehicle.clockwise)
        {vehicle.angle -= speed * timeDelta * vehicle.speed}
        else
        {vehicle.angle += speed * timeDelta * vehicle.speed}
    

    const vehicleX = Math.cos(vehicle.angle) * trackRadius + arcCenterX
    const vehicleY = Math.sin(vehicle.angle) * trackRadius
    const rotation = vehicle.angle + (vehicle.clockwise ? -Math.PI /2:Math.PI /2)

    vehicle.mesh.position.x = vehicleX
    vehicle.mesh.position.y = vehicleY
    vehicle.mesh.rotation.z = rotation
   })
}







function addVehicle() {
    const vehicleTypes = ["car","truck"]

    const type = pickRandom(vehicleTypes)
    const mesh = type == "car"? Car(): Truck()
    scene.add(mesh)

    const clockwise = Math.random() >= 0.5
    const angle = clockwise ? Math.PI/2 : -Math.PI/2

    const speed = getVehicleSpeed(type)

    otherVehicles.push({mesh,type,speed,clockwise,angle})
}
function getVehicleSpeed(type) {
    if (type == "car"){
        const minSpeed = 1
        const maxSpeed = 2
        return minSpeed + Math.random()*(maxSpeed-minSpeed)
    }
    if (type == "truck"){
        const minSpeed = 0.6
        const maxSpeed = 1.5
        return minSpeed + Math.random()*(maxSpeed-minSpeed)
    }
}
function getPlayerSpeed() {
    if(accelerate) return speed *2
    if(decelerate) return speed *0.5
    return speed
}

window.addEventListener("resize", () => {
    console.log("resize", window.innerWidth, window.innerHeight);
  
    // Adjust camera
    const newAspectRatio = window.innerWidth / window.innerHeight;
    const adjustedCameraHeight = cameraWidth / newAspectRatio;
  
    camera.top = adjustedCameraHeight / 2;
    camera.bottom = adjustedCameraHeight / -2;
    camera.updateProjectionMatrix(); // Must be called after change
  
    positionScoreElement();
  
    // Reset renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
})




