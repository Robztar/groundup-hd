import * as THREE from 'three';

import { useStore } from '../../hooks/objStore';
import * as textures from '../../textures';

export const Fixtures = ({ ...props }) =>{
     let fixId = props.fixId;
     let objInstance = props.objInstance;
     let wallNo = props.wallNo;
     let ortho = props.ortho;
     const conversion = props.conversion;

     const [ fixtures ] = useStore((state) => [ state.fixtures ]);
     
     let fixInstance = fixtures.find(o => o.key === fixId);
     

     let box;
     let dimensions;

     if(fixInstance){
          let category = fixInstance.type[0];

          // Default width (thickness) = 8in = 20.32cm = 0.203m (dimTemp = 0.069)
          dimensions = [
               (objInstance.wallDimTempX[wallNo] + 0.001)*conversion, //thickness
               fixInstance.dimTemp[1]*conversion, //height
               fixInstance.dimTemp[2]*conversion, //length
          ];

          let fixColor = fixInstance.color;
          let fixTexture = textures[fixInstance.texture];
          let wallHeight = objInstance.wallDimTempY[wallNo] * conversion;

          const Door = () =>{
               // adjust Y axis position
               let prevPos = [
                    fixInstance.pos[0],
                    (dimensions[1] - wallHeight) / 2,
                    fixInstance.pos[2]
               ];

               if(ortho){
                    prevPos[1] = dimensions[1]/2;
               }

               box = new THREE.BoxBufferGeometry(dimensions[0],dimensions[1],dimensions[2]);
               
               return(
                    <>
                         <mesh position={prevPos}>
                              <primitive object={box} attach="geometry" />
                              <meshStandardMaterial 
                                   attach="material" 
                                   color={fixColor}
                                   map={fixTexture}
                                   transparent={true}
                              />
                         </mesh>
                    </>
               )
          }
     
          const Window = () =>{
               let prevPos = [
                    fixInstance.pos[0],
                    fixInstance.pos[1],
                    fixInstance.pos[2]
               ];
               if(ortho){
                    prevPos[1] = dimensions[1]/2;
               }
               box = new THREE.BoxBufferGeometry(dimensions[0],dimensions[1],dimensions[2]);
               
               return(
                    <>
                         <mesh position={prevPos}>
                              <primitive object={box} attach="geometry" />
                              <meshStandardMaterial 
                                   attach="material" 
                                   color={fixColor}
                                   map={textures[fixTexture]}
                                   transparent={true}
                              />
                         </mesh>
                    </>
               )
          }


          if(category === 'Door'){
               return (
                    <>
                         <Door />
                    </>
               );
          }else if(category === 'Window'){
               return (
                    <>
                         <Window />
                    </>
               );
          }else{
               return null;
          }
     }else{
          return null;
     }
}