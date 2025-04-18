import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const EQUIPMENT_TYPES = {
  "Turret Truck": { aisleWidth: 72, intersectingAisle: 96 },
  "Counterbalance Forklift": { aisleWidth: 144, intersectingAisle: 144 },
  "Reach Truck": { aisleWidth: 108, intersectingAisle: 120 },
  "Aisle Master 33NE": { aisleWidth: 72, intersectingAisle: 96 },
};

function Warehouse3DView({ inputs, numberOfRackRows, rackCountPerRow, rackLengthFt, rackDepthFt, aisleFt, intersectingFt }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = 400;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    const rackMaterial = new THREE.MeshStandardMaterial({ color: 0x5555ff });
    const rackGeometry = new THREE.BoxGeometry(rackLengthFt, 5, rackDepthFt);

    for (let row = 0; row < numberOfRackRows; row++) {
      for (let col = 0; col < rackCountPerRow; col++) {
        const rack = new THREE.Mesh(rackGeometry, rackMaterial);
        rack.position.set(
          col * (rackLengthFt + aisleFt),
          2.5,
          row * (rackDepthFt + intersectingFt)
        );
        scene.add(rack);
      }
    }

    camera.position.set(50, 100, 150);
    camera.lookAt(scene.position);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
  }, [inputs, numberOfRackRows, rackCountPerRow, rackLengthFt, rackDepthFt, aisleFt, intersectingFt]);

  return <div ref={mountRef} style={{ width: '100%', height: '400px' }} />;
}

// Write this code to file

export default function WarehousePlanner() {
  ...
}


