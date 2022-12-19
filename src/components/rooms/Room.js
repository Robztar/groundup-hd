import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

import { MinSelect } from './MinSelect';
import { Resizer } from './Resizer';

import { Floor } from './Floor';
import { Wall } from './Wall';

import { useStore } from '../../hooks/objStore';

export const Room = ({ unique }) =>{
     const ref = useRef();
     const [ objects, projects, ortho,
          setPos, 
          setActive,
     ] = 
     useStore((state) => [ state.objects, state.projects, state.ortho,
          state.setPos,
          state.setActive,
     ]);
     
     let objInstance = objects.find(o => o.key === unique);
     let scale;
     let conversion;

     let prevPos = [0,0,0];

     if(objInstance){
          let projInstance = projects.find(p => p.key === objInstance.projId);
          scale = projInstance.scale;
          conversion = projInstance.conversion;

          prevPos = objInstance.pos;
          prevPos[1] = 0;
     }

     let mouseLoc = {x:prevPos[0], y:prevPos[1], z:prevPos[2]};

     // Mouse-move Funtionality
     function onMouseMove(event) {
          if(ortho){
               mouseLoc.x = (event.clientX / window.innerWidth) * 2 - 1;
               mouseLoc.z = - (event.clientY / window.innerHeight) * 2 + 1;
     
               mouseLoc.x = Math.round(mouseLoc.x * window.innerWidth* 1.25)/100;
               mouseLoc.z = Math.round(mouseLoc.z * window.innerHeight *-1.25)/100;
     
               mouseLoc.x = +mouseLoc.x.toFixed(1);
               mouseLoc.z = +mouseLoc.z.toFixed(1);

               // Metric Scale
               if(scale === 'metric'){
                    mouseLoc.x *= 4;
                    mouseLoc.z *= 4;
               }else{
                    mouseLoc.x *= 2;
                    mouseLoc.z *= 2;
               }
          }
     }

     useFrame((state) => {
          ref.current.position.set(mouseLoc.x, mouseLoc.y, mouseLoc.z);
     });

     const toggleActive = () =>{
          if(objInstance.active === 'none'){
               setActive(unique);
          }else{
               setActive('');
          }
     }

     if (objInstance) {
          let rotY = THREE.Math.degToRad(objInstance.rotationY);
          return (
               <group
                    ref = {ref}
                    rotation={[0,rotY,0]}
                    className={'object-box'}
                    onPointerDown={(event) =>{
                         event.stopPropagation();
                         document.addEventListener('mousemove', onMouseMove);
                    }} 
                    onPointerUp={(event) =>{
                         event.stopPropagation();
                         document.removeEventListener('mousemove',onMouseMove);
                         var [x,y,z] = [mouseLoc.x,mouseLoc.y,mouseLoc.z];
                         setPos([x,y,z], unique);
                    }}
                    onClick={() => {
                         toggleActive();
                    }}
               >
                    {/* Ceiling - off on ortho mode */}
                    {ortho? null:
                         <Floor 
                              instance={objInstance}
                              conversion={conversion}
                              height={objInstance.wallDimTempY[0]}
                         />
                    }
                    {/* Floor */}
                    <Floor
                         instance={objInstance}
                         conversion={conversion}
                         height={0}
                    />
                    {/* Left */}
                    <Wall
                         instance={objInstance}
                         unique={unique}
                         rotY={0}
                         conversion={conversion}
                         ortho={ortho}
                         wallNo={0}
                    />

                    {/* Right */}
                    <Wall
                         instance={objInstance}
                         unique={unique}
                         rotY={0}
                         conversion={conversion}
                         ortho={ortho}
                         wallNo={1}
                    />
                    
                    {/* Bottom */}
                    <Wall
                         instance={objInstance}
                         unique={unique}
                         rotY={Math.PI/2}
                         conversion={conversion}
                         ortho={ortho}
                         wallNo={2}
                    />
                    
                    {/* Top */}
                    <Wall
                         instance={objInstance}
                         unique={unique}
                         rotY={Math.PI/2}
                         conversion={conversion}
                         ortho={ortho}
                         wallNo={3}
                    />
                    
                    <Html>
                         <MinSelect unique={unique} instance={objInstance} />
                         <Resizer unique={unique} instance={objInstance} />
                    </Html>
               </group>
          );
     }else{
          return null;
     }
}