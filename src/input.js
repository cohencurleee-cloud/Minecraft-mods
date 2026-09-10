export class Input {
  constructor(canvas,ui){
    this.canvas=canvas;this.ui=ui;this.keys=new Set();this.lookDX=0;this.lookDY=0;this.moveX=0;this.moveY=0;this.jumpQueued=false;this.breakHeld=false;this.placeQueued=false;this.mobile=matchMedia('(pointer:coarse)').matches;
    addEventListener('keydown',e=>{this.keys.add(e.code);if(e.code==='Space'){e.preventDefault();this.jumpQueued=true}});
    addEventListener('keyup',e=>this.keys.delete(e.code));
    addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas){this.lookDX+=e.movementX;this.lookDY+=e.movementY}});
    canvas.addEventListener('mousedown',e=>{if(document.pointerLockElement!==canvas&&!this.mobile){canvas.requestPointerLock();return}if(e.button===0)this.breakHeld=true;if(e.button===2)this.placeQueued=true});
    addEventListener('mouseup',e=>{if(e.button===0)this.breakHeld=false});canvas.addEventListener('contextmenu',e=>e.preventDefault());
    if(this.mobile)this.bindTouch();
  }
  bindTouch(){
    const joy=this.ui.joystick,stick=this.ui.stick,look=this.ui.lookZone;let joyId=null,origin=null,lookId=null,last=null;
    const updateJoy=(t)=>{const dx=t.clientX-origin.x,dy=t.clientY-origin.y,max=42,d=Math.hypot(dx,dy)||1,s=Math.min(1,max/d);const x=dx*s,y=dy*s;stick.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;this.moveX=x/max;this.moveY=y/max};
    joy.addEventListener('touchstart',e=>{const t=e.changedTouches[0];joyId=t.identifier;const r=joy.getBoundingClientRect();origin={x:r.left+r.width/2,y:r.top+r.height/2};updateJoy(t)},{passive:false});
    joy.addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===joyId)updateJoy(t);e.preventDefault()},{passive:false});
    const endJoy=e=>{for(const t of e.changedTouches)if(t.identifier===joyId){joyId=null;this.moveX=this.moveY=0;stick.style.transform='translate(-50%,-50%)'}};joy.addEventListener('touchend',endJoy);joy.addEventListener('touchcancel',endJoy);
    look.addEventListener('touchstart',e=>{const t=e.changedTouches[0];lookId=t.identifier;last={x:t.clientX,y:t.clientY}},{passive:false});
    look.addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===lookId){this.lookDX+=(t.clientX-last.x)*1.3;this.lookDY+=(t.clientY-last.y)*1.3;last={x:t.clientX,y:t.clientY}}e.preventDefault()},{passive:false});
    const endLook=e=>{for(const t of e.changedTouches)if(t.identifier===lookId){lookId=null;last=null}};look.addEventListener('touchend',endLook);look.addEventListener('touchcancel',endLook);
    this.ui.jumpBtn.addEventListener('touchstart',e=>{e.preventDefault();this.jumpQueued=true},{passive:false});
    this.ui.breakBtn.addEventListener('touchstart',e=>{e.preventDefault();this.breakHeld=true},{passive:false});this.ui.breakBtn.addEventListener('touchend',()=>this.breakHeld=false);
    this.ui.placeBtn.addEventListener('touchstart',e=>{e.preventDefault();this.placeQueued=true},{passive:false});
  }
  consumeLook(){const a=[this.lookDX,this.lookDY];this.lookDX=this.lookDY=0;return a}
  axis(){let x=this.moveX,y=this.moveY;if(this.keys.has('KeyA'))x-=1;if(this.keys.has('KeyD'))x+=1;if(this.keys.has('KeyW'))y-=1;if(this.keys.has('KeyS'))y+=1;const l=Math.hypot(x,y);return l>1?[x/l,y/l]:[x,y]}
  consumeJump(){const v=this.jumpQueued;this.jumpQueued=false;return v}
  consumePlace(){const v=this.placeQueued;this.placeQueued=false;return v}
}
