export class UI {
  constructor(registry,mods){
    const $=id=>document.getElementById(id);Object.assign(this,{boot:$('boot'),playBtn:$('playBtn'),hud:$('hud'),modsBtn:$('modsBtn'),modPanel:$('modPanel'),closeMods:$('closeMods'),modList:$('modList'),modFile:$('modFile'),hotbar:$('hotbar'),statusPill:$('statusPill'),coords:$('coords'),healthFill:$('healthFill'),healthText:$('healthText'),breakRing:$('breakRing'),toastEl:$('toast'),pause:$('pause'),damageFlash:$('damageFlash'),joystick:$('joystick'),stick:$('stick'),lookZone:$('lookZone'),jumpBtn:$('jumpBtn'),breakBtn:$('breakBtn'),placeBtn:$('placeBtn')});
    this.registry=registry;this.mods=mods;this.selected=0;this.hotbarIds=[];this.toastTimer=0;this.renderMods();mods.onChange(()=>{this.renderMods();this.refreshHotbar()});
    this.modsBtn.onclick=()=>this.modPanel.classList.add('open');this.closeMods.onclick=()=>this.modPanel.classList.remove('open');
    this.modFile.onchange=async()=>{const f=this.modFile.files?.[0];if(!f)return;try{const m=await mods.importJSON(f);this.renderMods();this.refreshHotbar();this.toast(`Loaded ${m.name}`)}catch(e){this.toast('Invalid mod.json')}this.modFile.value=''};
    addEventListener('vf:damage',()=>{this.damageFlash.style.opacity='1';setTimeout(()=>this.damageFlash.style.opacity='0',90)});
  }
  renderMods(){this.modList.innerHTML='';for(const m of this.mods.mods){const card=document.createElement('div');card.className='mod-card';card.innerHTML=`<div class="mod-row"><div class="mod-icon">${m.builtin?'M':'+'}</div><div class="mod-info"><strong>${m.name}</strong><small>${m.description}</small></div><button class="switch ${m.enabled?'on':''}" aria-label="toggle"></button></div>`;card.querySelector('button').onclick=()=>this.mods.toggle(m.id);this.modList.append(card)}}
  refreshHotbar(){const defaults=['Grass','Dirt','Stone','Sand','Wood','Brick','Obsidian'].map(n=>this.registry.id(n));this.hotbarIds=[...defaults,...this.mods.enabledBlockIds()].slice(0,9);if(this.selected>=this.hotbarIds.length)this.selected=0;this.renderHotbar()}
  renderHotbar(){this.hotbar.innerHTML='';this.hotbarIds.forEach((id,i)=>{const b=this.registry.get(id),el=document.createElement('button');el.className='slot'+(i===this.selected?' active':'');el.innerHTML=`<span class="slot-num">${i+1}</span><span class="slot-color" style="background:${b.color}"></span><span class="slot-name">${b.name}</span>`;el.onclick=()=>{this.selected=i;this.renderHotbar()};this.hotbar.append(el)})}
  select(i){if(i>=0&&i<this.hotbarIds.length){this.selected=i;this.renderHotbar()}}
  selectedBlock(){return this.hotbarIds[this.selected]??1}
  health(v){this.healthText.textContent=Math.round(v);this.healthFill.style.width=`${v}%`}
  breakProgress(p){this.breakRing.style.setProperty('--progress',`${Math.round(p*100)}%`);this.breakRing.style.opacity=p>0?'1':'0'}
  toast(msg){clearTimeout(this.toastTimer);this.toastEl.textContent=msg;this.toastEl.classList.add('show');this.toastTimer=setTimeout(()=>this.toastEl.classList.remove('show'),1700)}
}
