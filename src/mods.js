const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class ModManager {
  constructor(registry){
    this.registry=registry; this.mods=[]; this.listeners=new Set(); this.customBlocks=[];
    this.addBuiltin('low-gravity','Low Gravity','Floatier jumps and 42% gravity.',{gravityScale:.42,jumpScale:1.2});
    this.addBuiltin('haste','Haste','Break blocks much faster.',{breakSpeed:3.2});
    this.addBuiltin('night-vision','Night Vision','Boosts ambient light after sunset.',{nightVision:1});
    this.addBuiltin('speed','Overdrive','Faster sprint and movement.',{moveSpeed:1.45});
    this.addBuiltin('neon-pack','Neon Pack','Unlocks luminous building blocks.',{neonPack:1});
    this.restore();
  }
  addBuiltin(id,name,description,effects){ this.mods.push({id,name,description,effects,builtin:true,enabled:false}); }
  restore(){
    try{ const saved=JSON.parse(localStorage.getItem('vf_mods')||'{}'); for(const m of this.mods)m.enabled=!!saved[m.id]; }catch{}
  }
  save(){ const out={}; for(const m of this.mods)out[m.id]=m.enabled; localStorage.setItem('vf_mods',JSON.stringify(out)); }
  toggle(id){ const m=this.mods.find(x=>x.id===id); if(!m)return; m.enabled=!m.enabled; this.save(); this.emit(); }
  effect(name,base=1){ let v=base; for(const m of this.mods) if(m.enabled && m.effects?.[name]!=null){ const e=m.effects[name]; if(typeof e==='number') v*=e; } return v; }
  flag(name){ return this.mods.some(m=>m.enabled && m.effects?.[name]); }
  onChange(fn){ this.listeners.add(fn); }
  emit(){ for(const fn of this.listeners)fn(); }
  async importJSON(file){
    const raw=JSON.parse(await file.text());
    if(!raw || typeof raw.name!=='string') throw new Error('Missing mod name');
    const id='custom-'+raw.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,32)+'-'+Date.now().toString(36);
    const effects={};
    if(raw.effects){
      if(raw.effects.gravityScale!=null)effects.gravityScale=clamp(Number(raw.effects.gravityScale),.2,2);
      if(raw.effects.jumpScale!=null)effects.jumpScale=clamp(Number(raw.effects.jumpScale),.5,2.5);
      if(raw.effects.moveSpeed!=null)effects.moveSpeed=clamp(Number(raw.effects.moveSpeed),.5,2);
      if(raw.effects.breakSpeed!=null)effects.breakSpeed=clamp(Number(raw.effects.breakSpeed),.5,5);
      if(raw.effects.nightVision)effects.nightVision=1;
    }
    const blockIds=[];
    for(const b of (Array.isArray(raw.blocks)?raw.blocks:[]).slice(0,12)){
      if(typeof b.name!=='string'||!/^#[0-9a-f]{6}$/i.test(b.color||''))continue;
      blockIds.push(this.registry.register({name:b.name.slice(0,20),color:b.color,hardness:clamp(Number(b.hardness||1),.2,8),emissive:!!b.emissive}));
    }
    const mod={id,name:raw.name.slice(0,32),description:String(raw.description||'Imported mod').slice(0,120),effects,blockIds,builtin:false,enabled:true};
    this.mods.push(mod); this.emit(); return mod;
  }
  enabledBlockIds(){ const ids=[]; for(const m of this.mods)if(m.enabled&&m.blockIds)ids.push(...m.blockIds); if(this.flag('neonPack'))ids.push(this.registry.id('Glow')); return [...new Set(ids)]; }
}
