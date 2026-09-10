import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';
export class Particles {
  constructor(scene){this.scene=scene;this.items=[];this.geo=new THREE.BoxGeometry(.09,.09,.09)}
  burst(pos,color,count=10){for(let i=0;i<count;i++){const mat=new THREE.MeshBasicMaterial({color});const mesh=new THREE.Mesh(this.geo,mat);mesh.position.copy(pos).addScalar(.5).add(new THREE.Vector3((Math.random()-.5)*.45,(Math.random()-.5)*.45,(Math.random()-.5)*.45));this.scene.add(mesh);this.items.push({mesh,vel:new THREE.Vector3((Math.random()-.5)*3,Math.random()*3,(Math.random()-.5)*3),life:.5+Math.random()*.35})}}
  update(dt){for(const p of [...this.items]){p.life-=dt;p.vel.y-=9*dt;p.mesh.position.addScaledVector(p.vel,dt);p.mesh.rotation.x+=dt*5;p.mesh.rotation.y+=dt*4;p.mesh.scale.setScalar(Math.max(0,p.life*1.4));if(p.life<=0){this.scene.remove(p.mesh);p.mesh.material.dispose();this.items.splice(this.items.indexOf(p),1)}}}
}
