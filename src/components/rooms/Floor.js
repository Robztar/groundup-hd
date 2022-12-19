import React from 'react';
import * as THREE from 'three';

import * as textures from '../../textures';

export const Floor = ({ ...props }) =>{
     const objInstance = props.instance;
     const conversion = props.conversion;
     let height = props.height * conversion;

     // Floor thickness = 10.16cm = 0.102m = 4in (dimTemp = 0.034)
     const thickness = 0.034 * conversion;
     let dimensions = [
          objInstance.dimTemp[0]*conversion,
          thickness,
          objInstance.dimTemp[2]*conversion
     ];
     height -= thickness;

     let box = new THREE.BoxBufferGeometry(dimensions[0],dimensions[1],dimensions[2]);

     let floorTexture = textures[objInstance.texture];
     floorTexture.repeat.set(dimensions[0],dimensions[2]);

     return (
          <>
               <mesh position={[0,height,0]} >
                    <primitive object={box} attach="geometry" />
                    <meshStandardMaterial 
                         attach="material" 
                         color={objInstance.color} 
                         map={floorTexture}
                         opacity={objInstance.texture === 'glass'? 0.6 : 1}
                         transparent={true}
                    />
               </mesh>
          </>
     )
}