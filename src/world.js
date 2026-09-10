import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';
const FACES=[
  {n:[1,0,0],v:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]]},
  {n:[-1,0,0],v:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]]},
  {n:[0,1,0],v:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]]},
  {n:[0,-1,0],v:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]]},
  {n:[0,0,1],v:[[1,0,1],[1,1,1],[0,1,1],[0,0,1]]},
  {n:[0,0,-1],v:[[0,0,0],[0,1,0],[1,1,0],[1,0,0]]}
];
const hash=(x,z,s)=>{let n=(x*374761393+z*668265263+s*1442695041)|0;n=(n^(n>>13))*1274126177;n^=n>>16;return (n>>>0)/4294967295};
const smooth=t=>t*t*(3-2*t);
export class World {
  constructor(scene,registry,seed=1337){
    this.scene=scene;this.registry=registry;this.seed=seed;this.w=64;this.h=32;this.d=64;this.chunkSize=16;this.data=new Uint16Array(this.w*this.h*this.d);this.group=new THREE.Group();scene.add(this.group);this.meshes=[];this.editMap=new Map();this.isGenerating=false;
    this.opaqueMat=new THREE.MeshLambertMaterial({vertexColors:true});
    this.transMat=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.72,depthWrite:false});
    this.glowMat=new THREE.MeshStandardMaterial({vertexColors:true,emissive:0x75ffd8,emissiveIntensity:.7,roughness:.55});
  }
  idx(x,y,z){return x+this.w*(z+this.d*y)}
  inBounds(x,y,z){return x>=0&&x<this.w&&y>=0&&y<this.h&&z>=0&&z<this.d}
  get(x,y,z){if(!this.inBounds(x,y,z))return y<0?this.registry.id('Stone'):0;return this.data[this.idx(x,y,z)]}
  set(x,y,z,id,record=true){if(!this.inBounds(x,y,z))return;this.data[this.idx(x,y,z)]=id;if(record&&!this.isGenerating)this.editMap.set(`${x},${y},${z}`,id)}
  noise2(x,z){
    const x0=Math.floor(x),z0=Math.floor(z),tx=smooth(x-x0),tz=smooth(z-z0);
    const a=hash(x0,z0,this.seed),b=hash(x0+1,z0,this.seed),c=hash(x0,z0+1,this.seed),d=hash(x0+1,z0+1,this.seed);
    return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a,b,tx),THREE.MathUtils.lerp(c,d,tx),tz);
  }
  fbm(x,z){let v=0,a=.55,f=.055,sum=0;for(let i=0;i<5;i++){v+=this.noise2(x*f,z*f)*a;sum+=a;a*=.52;f*=2.03}return v/sum}
  generate(savedEdits){
    this.isGenerating=true;this.data.fill(0);const grass=this.registry.id('Grass'),dirt=this.registry.id('Dirt'),stone=this.registry.id('Stone'),sand=this.registry.id('Sand'),water=this.registry.id('Water'),wood=this.registry.id('Wood'),leaves=this.registry.id('Leaves');
    const sea=10;
    for(let x=0;x<this.w;x++)for(let z=0;z<this.d;z++){
      const n=this.fbm(x,z),ridge=Math.abs(this.noise2(x*.022+100,z*.022+100)-.5);let top=Math.floor(7+n*13+ridge*4);top=Math.min(this.h-6,Math.max(4,top));
      for(let y=0;y<=top;y++){let id=stone;if(y>top-4)id=dirt;if(y===top)id=top<=sea+1?sand:grass;this.set(x,y,z,id,false)}
      for(let y=top+1;y<=sea;y++)this.set(x,y,z,water,false);
    }
    for(let x=3;x<this.w-3;x++)for(let z=3;z<this.d-3;z++){
      if(hash(x,z,this.seed+91)>.982){let y=this.surfaceY(x,z);if(this.get(x,y,z)===grass&&y>11){const h=3+Math.floor(hash(x,z,this.seed+92)*3);for(let i=1;i<=h;i++)this.set(x,y+i,z,wood,false);for(let ox=-2;ox<=2;ox++)for(let oz=-2;oz<=2;oz++)for(let oy=h-1;oy<=h+1;oy++)if(Math.abs(ox)+Math.abs(oz)+(oy===h+1?1:0)<4&&this.get(x+ox,y+oy,z+oz)===0)this.set(x+ox,y+oy,z+oz,leaves,false)}
      }
    }
    if(savedEdits)for(const [k,id] of Object.entries(savedEdits)){const [x,y,z]=k.split(',').map(Number);this.set(x,y,z,id,false);this.editMap.set(k,id)}
    this.isGenerating=false;this.rebuildAll();
  }
  surfaceY(x,z){for(let y=this.h-1;y>=0;y--){const b=this.registry.get(this.get(x,y,z));if(b.solid)return y}return 0}
  clearMeshes(){for(const m of this.meshes){m.geometry.dispose();this.group.remove(m)}this.meshes.length=0}
  rebuildAll(){this.clearMeshes();for(let cx=0;cx<this.w;cx+=this.chunkSize)for(let cz=0;cz<this.d;cz+=this.chunkSize)this.rebuildChunk(cx,cz)}
  rebuildNear(x,z){
    const cs=this.chunkSize,cx=Math.floor(x/cs)*cs,cz=Math.floor(z/cs)*cs;const targets=new Set([`${cx},${cz}`]);if(x%cs===0)targets.add(`${cx-cs},${cz}`);if(x%cs===cs-1)targets.add(`${cx+cs},${cz}`);if(z%cs===0)targets.add(`${cx},${cz-cs}`);if(z%cs===cs-1)targets.add(`${cx},${cz+cs}`);
    for(const key of targets){const [tx,tz]=key.split(',').map(Number);if(tx<0||tz<0||tx>=this.w||tz>=this.d)continue;for(const m of [...this.meshes])if(m.userData.cx===tx&&m.userData.cz===tz){m.geometry.dispose();this.group.remove(m);this.meshes.splice(this.meshes.indexOf(m),1)}this.rebuildChunk(tx,tz)}
  }
  rebuildChunk(cx,cz){
    const buckets={opaque:{p:[],n:[],c:[]},trans:{p:[],n:[],c:[]},glow:{p:[],n:[],c:[]}};
    for(let x=cx;x<Math.min(cx+this.chunkSize,this.w);x++)for(let z=cz;z<Math.min(cz+this.chunkSize,this.d);z++)for(let y=0;y<this.h;y++){
      const id=this.get(x,y,z),b=this.registry.get(id);if(!b.visible)continue;const bucket=b.emissive?buckets.glow:(b.transparent?buckets.trans:buckets.opaque);const col=new THREE.Color(b.color);
      for(const f of FACES){const nb=this.registry.get(this.get(x+f.n[0],y+f.n[1],z+f.n[2]));const show=!nb.visible || (b.transparent&&id!==this.get(x+f.n[0],y+f.n[1],z+f.n[2])) || (!b.transparent&&nb.transparent);if(!show)continue;const order=[0,1,2,0,2,3];for(const i of order){const v=f.v[i];bucket.p.push(x+v[0],y+v[1],z+v[2]);bucket.n.push(...f.n);const shade=f.n[1]===1?1:f.n[1]===-1?.62:(f.n[0]!==0?.82:.74);bucket.c.push(col.r*shade,col.g*shade,col.b*shade)}}
    }
    const make=(bucket,mat,type)=>{if(!bucket.p.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(bucket.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(bucket.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(bucket.c,3));g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.userData={world:true,cx,cz,type};this.group.add(m);this.meshes.push(m)};
    make(buckets.opaque,this.opaqueMat,'opaque');make(buckets.trans,this.transMat,'trans');make(buckets.glow,this.glowMat,'glow');
  }
  breakAt(x,y,z){if(!this.inBounds(x,y,z))return 0;const id=this.get(x,y,z),b=this.registry.get(id);if(id===0||b.water)return 0;this.set(x,y,z,0,true);this.rebuildNear(x,z);return id}
  placeAt(x,y,z,id){if(!this.inBounds(x,y,z)||this.get(x,y,z)!==0)return false;this.set(x,y,z,id,true);this.rebuildNear(x,z);return true}
  serializeEdits(){return Object.fromEntries(this.editMap)}
}
