import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';
export class Player {
  constructor(camera,world,input,mods){this.camera=camera;this.world=world;this.input=input;this.mods=mods;this.pos=new THREE.Vector3(32,20,32);this.vel=new THREE.Vector3();this.yaw=0;this.pitch=0;this.radius=.31;this.height=1.75;this.eye=1.58;this.grounded=false;this.health=100;this.sprint=0;}
  load(save){if(save?.pos&&save.pos.length===3)this.pos.fromArray(save.pos);if(Number.isFinite(save?.yaw))this.yaw=save.yaw;if(Number.isFinite(save?.pitch))this.pitch=save.pitch;if(Number.isFinite(save?.health))this.health=save.health}
  update(dt){
    const [dx,dy]=this.input.consumeLook();this.yaw-=dx*.00215;this.pitch-=dy*.00215;this.pitch=Math.max(-1.52,Math.min(1.52,this.pitch));
    const [ax,ay]=this.input.axis();const speed=5.3*this.mods.effect('moveSpeed',1)*(this.input.keys.has('ShiftLeft')?1.45:1);const sy=Math.sin(this.yaw),cy=Math.cos(this.yaw);const wishX=ax*cy+ay*sy,wishZ=-ax*sy+ay*cy;const accel=this.grounded?18:7;
    this.vel.x=THREE.MathUtils.damp(this.vel.x,wishX*speed,accel,dt);this.vel.z=THREE.MathUtils.damp(this.vel.z,wishZ*speed,accel,dt);
    if(this.input.consumeJump()&&this.grounded){this.vel.y=7.1*this.mods.effect('jumpScale',1);this.grounded=false}
    this.vel.y-=20.5*this.mods.effect('gravityScale',1)*dt;this.vel.y=Math.max(this.vel.y,-28);
    this.moveAxis('x',this.vel.x*dt);this.grounded=false;this.moveAxis('y',this.vel.y*dt);this.moveAxis('z',this.vel.z*dt);
    if(this.pos.y<-8){this.damage(20);this.respawn()}
    this.camera.position.set(this.pos.x,this.pos.y+this.eye,this.pos.z);this.camera.rotation.order='YXZ';this.camera.rotation.set(this.pitch,this.yaw,0);
  }
  collides(p){
    const minX=Math.floor(p.x-this.radius),maxX=Math.floor(p.x+this.radius),minY=Math.floor(p.y),maxY=Math.floor(p.y+this.height-.001),minZ=Math.floor(p.z-this.radius),maxZ=Math.floor(p.z+this.radius);
    for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++)for(let z=minZ;z<=maxZ;z++)if(this.world.registry.get(this.world.get(x,y,z)).solid)return true;return false;
  }
  moveAxis(axis,delta){if(!delta)return;const next=this.pos.clone();next[axis]+=delta;if(!this.collides(next)){this.pos.copy(next);return}const step=Math.sign(delta)*.02;let moved=0;while(Math.abs(moved+step)<=Math.abs(delta)){const t=this.pos.clone();t[axis]+=step;if(this.collides(t))break;this.pos.copy(t);moved+=step}if(axis==='y'){if(delta<0)this.grounded=true;this.vel.y=0}else this.vel[axis]=0}
  intersectsBlock(x,y,z){return this.pos.x+this.radius>x&&this.pos.x-this.radius<x+1&&this.pos.y+this.height>y&&this.pos.y<y+1&&this.pos.z+this.radius>z&&this.pos.z-this.radius<z+1}
  damage(n){this.health=Math.max(0,this.health-n);window.dispatchEvent(new CustomEvent('vf:damage',{detail:n}));if(this.health<=0)this.respawn()}
  respawn(){const y=this.world.surfaceY(32,32)+1.01;this.pos.set(32,y,32);this.vel.set(0,0,0);this.health=100}
  save(){return {pos:this.pos.toArray(),yaw:this.yaw,pitch:this.pitch,health:this.health}}
}
