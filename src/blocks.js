export class BlockRegistry {
  constructor(){ this.blocks=[]; this.byName=new Map(); this.seedDefaults(); }
  seedDefaults(){
    this.register({name:'Air',color:'#000000',solid:false,transparent:true,hardness:0,visible:false});
    this.register({name:'Grass',color:'#67b85a',side:'#7a5a36',hardness:1.0});
    this.register({name:'Dirt',color:'#825f3c',hardness:.8});
    this.register({name:'Stone',color:'#7e8791',hardness:2.1});
    this.register({name:'Sand',color:'#d9c47e',hardness:.65});
    this.register({name:'Wood',color:'#93643a',hardness:1.5});
    this.register({name:'Leaves',color:'#3f8d50',hardness:.35,transparent:true});
    this.register({name:'Water',color:'#3b86d9',hardness:99,solid:false,transparent:true,water:true});
    this.register({name:'Brick',color:'#a84d43',hardness:1.8});
    this.register({name:'Obsidian',color:'#2b2338',hardness:6});
    this.register({name:'Glow',color:'#50ffd2',hardness:1.2,emissive:true});
  }
  register(def){
    const id=this.blocks.length;
    const block={id,solid:true,transparent:false,hardness:1,visible:true,emissive:false,...def};
    this.blocks.push(block); this.byName.set(block.name.toLowerCase(),id); return id;
  }
  get(id){ return this.blocks[id]||this.blocks[0]; }
  id(name){ return this.byName.get(String(name).toLowerCase()) ?? 0; }
}
