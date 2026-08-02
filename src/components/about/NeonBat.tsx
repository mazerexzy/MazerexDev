import { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Подключаем модель так же, как мы делали в других файлах
import batPath from '../../assets/models/AnimatedBat.glb?url';

export default function NeonBat(props: any) {
  const group = useRef<THREE.Group>(null);
  
  // Загружаем саму модель и её анимации
  const { nodes, animations } = useGLTF(batPath) as any;
  const { actions } = useAnimations(animations, group);

  // 🔥 СОЗДАЕМ ИДЕАЛЬНЫЕ МАТЕРИАЛЫ КОДОМ
  const bodyMaterial = new THREE.MeshStandardMaterial({
      color: '#0a0a0a',   // Глубокий темный цвет
      roughness: 0.8,     // Матовое худи, не блестит
      metalness: 0.1,
  });

  const eyeMaterial = new THREE.MeshStandardMaterial({
      color: '#b829ff',         // Фиолетово-розовый неон
      emissive: '#b829ff',      // Светящийся эффект
      emissiveIntensity: 5,     // Сила свечения
      toneMapped: false,        // Чтобы цвет не тускнел
  });

  // Запускаем анимацию дыхания/сидения
  useEffect(() => {
    const actionNames = Object.keys(actions);
    if (actionNames.length > 0 && actions[actionNames[0]]) {
        actions[actionNames[0]]?.play();
    }
  }, [actions]);

  // 🔥 ЗАСТАВЛЯЕМ ГОЛОВУ СЛЕДИТЬ ЗА КУРСОРОМ
  useFrame((state) => {
      if (nodes.mixamorigHead) {
          // Вычисляем, куда смотрит мышка
          const targetX = (state.pointer.x * Math.PI) / 4; 
          const targetY = (state.pointer.y * Math.PI) / 4; 

          // Плавно поворачиваем голову (используем lerp для мягкости)
          nodes.mixamorigHead.rotation.y = THREE.MathUtils.lerp(nodes.mixamorigHead.rotation.y, targetX, 0.05);
          nodes.mixamorigHead.rotation.x = THREE.MathUtils.lerp(nodes.mixamorigHead.rotation.x, -targetY, 0.05);
          
          // Чуть-чуть поворачиваем шею, чтобы выглядело реалистично
          if (nodes.mixamorigNeck) {
              nodes.mixamorigNeck.rotation.y = THREE.MathUtils.lerp(nodes.mixamorigNeck.rotation.y, targetX * 0.5, 0.05);
              nodes.mixamorigNeck.rotation.x = THREE.MathUtils.lerp(nodes.mixamorigNeck.rotation.x, -targetY * 0.5, 0.05);
          }
      }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        {/* Корень скелета */}
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]}>
          <group name="tripo_node_b20e3fb6-484e-4537-ae33-b3bc365fc323">
            
            {/* ТЕЛО: Применяем наш черный матовый материал */}
            <skinnedMesh
              geometry={nodes['tripo_node_b20e3fb6-484e-4537-ae33-b3bc365fc323mesh'].geometry}
              material={bodyMaterial} 
              skeleton={nodes['tripo_node_b20e3fb6-484e-4537-ae33-b3bc365fc323mesh'].skeleton}
            />
            
            {/* ГЛАЗА/ДЕТАЛИ: Применяем неоновый светящийся материал */}
            <skinnedMesh
              geometry={nodes['tripo_node_b20e3fb6-484e-4537-ae33-b3bc365fc323mesh_1'].geometry}
              material={eyeMaterial} 
              skeleton={nodes['tripo_node_b20e3fb6-484e-4537-ae33-b3bc365fc323mesh_1'].skeleton}
            />
          </group>
          <primitive object={nodes.mixamorigHips} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(batPath);