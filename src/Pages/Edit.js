import React, {useState, useEffect} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import * as THREE from 'three';

// --- HTML components ---
import Navbar from '../components/html/Navbar';
import SpaceReminder from '../components/html/SpaceReminder';
import { Attribute } from '../components/html/Attribute';
import { WallMenu } from '../components/html/WallMenu';
import { Confirm } from '../components/html/Confirm';

// --- 3D environment components ---
import { Ground } from '../components/environment/Ground';
import { FPVControls } from '../components/environment/FPVControls';
import { Player } from '../components/environment/Player';
import { Room } from '../components/rooms/Room';

// --- Hooks ---
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useStore } from '../hooks/objStore'; 

// --- Pointer Image ---
import pointer from '../images/cursor.png';

// ---------------- Camera Controls ----------------
let pos = [0,1,0];

// --- Orthographic Projection ---
const MakeOrtho = ({scale}) => {
     const vec = new THREE.Vector3();

     // Measurement Scale
     let zoom;
     if(scale === 'metric'){
          zoom = 10;
     }else{
          zoom = 20;
     }

     const { moveForward, moveBackward, moveLeft, moveRight} = useKeyboardControls();

     if (moveLeft? pos[0]-=1:null);
     if (moveRight? pos[0]+=1:null);
     if (moveBackward? pos[2]+=1:null);
     if (moveForward? pos[2]-=1:null);

     useFrame((state) => {
          const step = 1;
          const x = pos[0];
          const y = 100;
          const z = pos[2];
          state.camera.position.lerp(vec.set(x, y, z), step);
          state.camera.lookAt(x,0,z);
          state.camera.updateProjectionMatrix();
     });
     return(
          <>
               <OrthographicCamera makeDefault zoom={zoom} />
          </>
     );
}

// --- Perspective Projection
const MakePersp = ({scale}) =>{
     // Measurement Scale
     let userPos
     if(scale === 'metric'){
          userPos = [0,6,10];
     }else{
          userPos = [0,5.42,10];
     }
     return(
          <>
               <Player position={userPos} />
               <FPVControls />
               <PerspectiveCamera makeDefault />
          </>
     )
}

export default function Edit() {
     const [projects, objects, 
          addObj, 
          switchOrtho, 
          switchScale, 
          switchConv, 
          saveProjects, 
          saveWorld, 
          saveFixtures, 
          delProjWorld,
          delProjFixes,
     ] = useStore((state) => [ state.projects, state.objects,
          state.addObj,
          state.switchOrtho,
          state.switchScale,
          state.switchConv,
          state.saveProjects,
          state.saveWorld,
          state.saveFixtures,
          state.delProjWorld,
          state.delProjFixes,
     ]);

     // --- Query String for Project ID
     const [queryId, setQueryId] = useState('');
     useEffect(() => {
          if(window.location.search){
               let qSearch = window.location.search.substring(1);
               let qParts = qSearch.split('=');
               setQueryId(qParts[1]);
          }
     },[]);

     let projInstance = projects.find(p => p.key === queryId);
     let projKey;
     let projName = 'Project Name';
     let gridLen;
     let gridBoxCount;

     let scale = 'metric';
     if(projInstance){
          projKey = projInstance.key;
          scale = projInstance.scale;
          projName = projInstance.name;
     }
     const makeMetric = () => {
          switchScale('metric', projKey);
          switchConv(12, projKey);
     }
     const makeImperial = () => {
          switchScale('imperial', projKey);
          switchConv(10, projKey);
     }
     if(scale === 'metric'){
          gridLen = 256;
          gridBoxCount = 64;
     }else if(scale === 'imperial'){
          gridLen = 208;
          gridBoxCount = 104;
     }
     
     const [isOrtho, setCam] = useState(true);
     const toggleCam = () => {
          setCam((active) => !active);
          switchOrtho(!isOrtho);
     }

     const addNew = (e) =>{
          const shape = e.target.getAttribute("data-shape");
          const objType = e.target.getAttribute("data-type");
          if(!isOrtho){
               toggleCam();
          }
          toggleClass();
          addObj(projKey, shape, objType);
     }

     const [isActive, setActive] = useState(false);
     const toggleClass = () => setActive(!isActive);

     const [settings, setSettings] = useState(false);
     const toggleSettings = () => setSettings(!settings);

     const [popMenu, setPopMenu] = useState(false);
     const togglePop = () => setPopMenu(!popMenu);

     const saveScene = () =>{
          saveProjects();
          saveFixtures();
          saveWorld();
     }
     const resetScene = () =>{
          delProjWorld(projKey);
          delProjFixes(projKey);
          saveFixtures();
          saveWorld();
          togglePop();
     }
     useEffect(() => {
          const interval = setInterval(()=>{
               saveScene();
          }, 5000);
          return () => clearInterval(interval);
     },[]);

     return (
          <div className='canvas-cont'>
               <Canvas shadowMap sRGB className='canvas'>
                    <Sky sunPosition={[100, 20, 100]} />
                    <ambientLight intensity={0.25} />
                    <pointLight castShadow intensity={0.7} position={[100, 100, 100]} />
                    {/* Measurement Scale */}
                    {isOrtho? <gridHelper args={[gridLen, gridBoxCount, `yellow`, `gray`]} /> : null}
                    <Physics gravity={[0, 0, 0]}>
                         {isOrtho? <MakeOrtho scale={scale} /> : <MakePersp scale={scale} />}
                         <Ground position={[0, -0.5, 0]} scale={scale} />
                    </Physics>
                    {objects.map(({key, shape, objType, projId}) =>{
                         if(projId === projKey){
                              if(objType === 'room'){
                                   return(
                                        <Room 
                                             key = {key}
                                             unique = {key}
                                             setShape={shape}
                                        />
                                   )
                              }
                         }
                         return null;
                    })}
               </Canvas>

               <Navbar projName={projName} saveScene={saveScene} />

               {/* Select Menu */}
               <div className={`top drop-menu ${isActive ? 'active' : ''}`} > 
                    <div className={`exham extgl ${isActive ? 'active' : ''}`} onClick={toggleClass}>
                         <div className="tripbar"></div>
                    </div>
                    {/* Objects Menu */}
                    <div className={`object-menu ${isActive ? 'active' : ''}`}>
                         <div 
                              className="object-li" 
                              onClick={addNew} 
                              data-type={'room'} 
                              data-shape={"rect"}
                         >Room</div>
                    </div>
               </div>
               {isOrtho? null : <SpaceReminder />}

               {/* Object instance Attribute Menu */}
               <Attribute />
               {/* Object instance  Wall Menu */}
               <WallMenu />
               
               {/* Settings Menu */}
               <div className={`top set-menu-cont ${settings ? 'active' : ''}`} > 
                    {/* Setting Icon */}
                    <i className={`fas fa-cog set-icon ${settings ? 'active' : ''}`} onClick={toggleSettings}></i>
                    {/* Settings Menu */}
                    <div className={`set-menu ${settings ? 'active' : ''}`}>
                         {/* Set Scale */}
                         <div className="set-li set-scale">
                              <p className={`set-n set-metric ${scale === 'metric' ? 'active' : ''}`} onClick={makeMetric}>Metric</p>
                              <p className={`set-n set-imperial ${scale === 'imperial' ? 'active' : ''}`} onClick={makeImperial}>Imperial</p>
                         </div>
                         {/* Reset Project */}
                         <div className="set-li set-reset">
                              <p className="set-n" onClick={togglePop}>Reset</p>
                              <i className='fas fa-trash-alt set-n' onClick={togglePop}></i>
                         </div>
                    </div>
               </div>

               {/* Confirm Reset */}
               <Confirm 
                    popMenu={popMenu}
                    togglePop={togglePop}
                    resetScene={resetScene}
                    task={'erase'}
               />

               {/* Switch Camera Mode */}
               <div className="switch-cont">
                    <div className="switch">
                         {isOrtho? 
                              <div className="selector" id="three-d" onClick={toggleCam}>3D</div> 
                              : 
                              <div className="selector" id="two-d" onClick={toggleCam}>2D</div>
                         }
                    </div>
               </div>
               {isOrtho ? null: 
                    <div className='pointer'>
                         <img src={pointer} alt='pointer' />
                    </div>
               }
          </div>
     );
}