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

export default function WarehousePlanner() {
  const [inputs, setInputs] = useState({
    buildingLength: 200,
    buildingWidth: 100,
    ceilingHeight: 30,
    palletWidth: 40,
    palletDepth: 48,
    palletsPerLevel: 2,
    rackBeamLength: 96,
    rackDepth: 48,
    equipmentType: "Reach Truck",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: name === "equipmentType" ? value : parseFloat(value) || "" }));
  };

  const handleSave = () => {
    localStorage.setItem("warehousePlan", JSON.stringify(inputs));
    alert("Plan saved successfully!");
  };

  const handleLoad = () => {
    const savedPlan = localStorage.getItem("warehousePlan");
    if (savedPlan) {
      setInputs(JSON.parse(savedPlan));
      alert("Plan loaded successfully!");
    } else {
      alert("No saved plan found.");
    }
  };

  const equipment = EQUIPMENT_TYPES[inputs.equipmentType];
  const rackLengthFt = inputs.rackBeamLength / 12;
  const rackDepthFt = inputs.rackDepth / 12;
  const aisleFt = equipment.aisleWidth / 12;
  const intersectingFt = equipment.intersectingAisle / 12;

  const usableLength = inputs.buildingLength - aisleFt;
  const usableWidth = inputs.buildingWidth - intersectingFt;

  const rackCountPerRow = Math.floor(usableLength / (rackLengthFt + aisleFt));
  const numberOfRackRows = Math.floor(usableWidth / (rackDepthFt + intersectingFt));
  const totalRacks = rackCountPerRow * numberOfRackRows;
  const totalPallets = totalRacks * inputs.palletsPerLevel;

  const sqftUsed = totalRacks * (inputs.rackBeamLength * inputs.rackDepth) / 144;
  const totalSqft = inputs.buildingLength * inputs.buildingWidth;
  const sqftUnused = totalSqft - sqftUsed;

  const wallClearanceWarnings = [];
  if ((rackCountPerRow * (rackLengthFt + aisleFt)) > inputs.buildingLength) {
    wallClearanceWarnings.push("Rack layout exceeds building length.");
  }
  if ((numberOfRackRows * (rackDepthFt + intersectingFt)) > inputs.buildingWidth) {
    wallClearanceWarnings.push("Rack layout exceeds building width.");
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Warehouse Inputs</h2>
        {Object.entries(inputs).map(([key, value]) => (
          key !== "equipmentType" ? (
            <div key={key}>
              <label className="block font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type="number"
                name={key}
                value={value}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          ) : null
        ))}
        <div>
          <label className="block font-medium">Equipment Type</label>
          <select
            name="equipmentType"
            value={inputs.equipmentType}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            {Object.keys(EQUIPMENT_TYPES).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save Plan</button>
          <button onClick={handleLoad} className="px-4 py-2 bg-green-600 text-white rounded">Load Plan</button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Results</h2>
        <p>Total Racks: {totalRacks}</p>
        <p>Total Pallets: {totalPallets}</p>
        <p>Used Sq Ft: {sqftUsed.toFixed(2)}</p>
        <p>Unused Sq Ft: {sqftUnused.toFixed(2)}</p>
        {wallClearanceWarnings.length > 0 && (
          <div className="text-red-600 font-medium">
            {wallClearanceWarnings.map((msg, idx) => (
              <p key={idx}>{msg}</p>
            ))}
          </div>
        )}
        <Warehouse3DView
          inputs={inputs}
          numberOfRackRows={numberOfRackRows}
          rackCountPerRow={rackCountPerRow}
          rackLengthFt={rackLengthFt}
          rackDepthFt={rackDepthFt}
          aisleFt={aisleFt}
          intersectingFt={intersectingFt}
        />
      </div>
    </div>
  );
}
export default WarehousePlanner;
