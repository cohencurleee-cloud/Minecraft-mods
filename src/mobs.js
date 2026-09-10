import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';
export class MobManager {
  constructor(scene,world,player){this.scene=scene;this.world=world;this.player=player;this.mobs=[];this.root=new THREE.Group();scene.add(this.root);this.spawnInitial()}
  createMob(x,z,type='stalker'){
    const g=new THREE.Group(),bodyMat=new THREE.MeshLambertMaterial({color:type==='stalker'?0x465266:0x7ccf72}),eyeMat=new THREE.MeshBasicMaterial({color:0xff667b});
    const body=new THREE.Mesh(new THREE.BoxGeometry(.72,.82,.5),bodyMat);body.position.y=.78;g.add(body);const head=new THREE.Mesh(new THREE.BoxGeometry(.58,.55,.54),bodyMat);head.position.set(0,1.42,0);g.add(head);for(const sx of [-1,1]){const eye=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,.03),eyeMat);eye.position.set(sx*.15,1.48,-.285);g.add(eye)}
    const y=this.world.surfaceY(Math.floor(x),Math.floor(z))+1;g.position.set(x,y,z);this.root.add(g);this.mobs.push({group:g,health:40,dir:Math.random()*Math.PI*2,timer:0,contactCooldown:0,speed:1.25,type});
  }
  spawnInitial(){for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,r=12+Math.random()*20;const x=Math.max(2,Math.min(this.world.w-3,32+Math.cos(a)*r)),z=Math.max(2,Math.min(this.world.d-3,32+Math.sin(a)*r));this.createMob(x,z)}}
  update(dt,time){
    for(const m of [...this.mobs]){const p=m.group.position,to=this.player.pos.clone().sub(p);to.y=0;const dist=to.length();m.timer-=dt;m.contactCooldown-=dt;if(dist<8){m.dir=Math.atan2(to.x,to.z);m.speed=1.75}else if(m.timer<=0){m.timer=2+Math.random()*4;m.dir+=(-1+Math.random()*2)*1.7;m.speed=.6+Math.random()*.8}
      const nx=p.x+Math.sin(m.dir)*m.speed*dt,nz=p.z+Math.cos(m.dir)*m.speed*dt;if(nx>1&&nz>1&&nx<this.world.w-2&&nz<this.world.d-2){const sy=this.world.surfaceY(Math.floor(nx),Math.floor(nz))+1;if(Math.abs(sy-p.y)<1.3){p.x=nx;p.z=nz;p.y=THREE.MathUtils.damp(p.y,sy,12,dt)}}m.group.rotation.y=m.dir;m.group.children[0].rotation.z=Math.sin(time*5+m.dir)*.035;if(dist<1.15&&m.contactCooldown<=0){m.contactCooldown=1.1;this.player.damage(8)}
    }
  }
  raycast(raycaster){const intersections=raycaster.intersectObjects(this.root.children,true);for(const item of intersections){if(item.distance>5.2)continue;let g=item.object;while(g.parent&&g.parent!==this.root)g=g.parent;const mob=this.mobs.find(m=>m.group===g);if(mob)return {hit:item,mob}}return null}
  hit(mob,damage=18){mob.health-=damage;mob.group.position.add(new THREE.Vector3().subVectors(mob.group.position,this.player.pos).setY(.15).normalize().multiplyScalar(.45));if(mob.health<=0){this.root.remove(mob.group);this.mobs.splice(this.mobs.indexOf(mob),1)}}
}
