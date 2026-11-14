import {animateAvatar,createAvatar,resetAvatarMotion,setAvatarMotion} from './Avatar.js';
import {drawPlayerBass} from './bass-feedback.js';
import {sanitizeControlPreferences} from './control-preferences.js';
import {controlInstructions} from './control-settings-view.js';
import {createPixelPickup,updatePixelPickup} from './pixel-art/items.js';
import {pixelEllipse} from './pixel-art/shapes.js';

const essentials=[
  {id:'sparks',title:'Catch sparks',description:'Move over glowing sparks. Catch them close together to build a combo.'},
  {id:'pass',title:'Smooth pass',description:'Slip close to a dancer without touching them to earn points.'},
  {id:'bass',title:'Bass Head',description:'Charge near speakers. At 25%, tap Bass Head or press B to ride through the pressure.'},
];

const controlSummary={
  tap:'Tap or click a spot to move.',
  swipe:'Swipe and release to move.',
  stick:'Touch anywhere and steer with the thumbstick.',
};

export function renderHowToPlay({controls,tips=[],startAction=''}={}){
  const mode=sanitizeControlPreferences(controls).mode;
  const demo='<button type="button" class="menu-button how-to-show" data-action="show-demo" aria-haspopup="dialog">Show me</button>';
  return `<section class="how-to-play" aria-label="How to play">
    ${startAction?`<div class="how-to-actions">${startAction}${demo}</div>`:''}
    <p class="how-to-controls">${controlSummary[mode]} WASD or arrows also work.</p>
    <ul class="how-to-essentials">${essentials.map(({id,title,description})=>`<li class="how-to-essential"><span class="how-to-icon how-to-icon-${id}" aria-hidden="true"></span><div><strong>${title}</strong><p>${description}</p></div></li>`).join('')}</ul>
    ${startAction?'':demo}
    <details class="how-to-tips"><summary>Advanced tips</summary><p><strong>Movement.</strong> ${controlInstructions(controls)}</p>${tips.join('')}</details>
  </section>`;
}

const WIDTH=420,HEIGHT=200;
const demoSteps=[essentials[0],essentials[1],{id:'bump',title:'Mind your space'},essentials[2]];
const durations=[3500,4000,3000,4500];
const moveHint={
  tap:'Tap or click ahead to move through the sparks.',
  swipe:'Swipe and release toward the sparks.',
  stick:'Push the thumbstick toward the sparks.',
};
const crowdOutfit={onesie:'moth',hat:'headphones',appearance:{skinTone:'rich',hair:'curls',face:'smile'}};
const endText=['Three sparks in a row build a combo.','A close pass earns points.','Bumps slow you down. Find a clear route.','While active, sparks in the bass zone earn double points.'];

let activeDemo;

function drawFloor(scene){
  const g=scene.add.graphics();
  g.fillStyle(0x252545).fillRect(12,12,396,176);
  g.lineStyle(2,0x45466c).strokeRect(12,12,396,176);
  g.lineStyle(1,0x383858);
  for(let x=33;x<400;x+=23)g.lineBetween(x,14,x,187);
  for(let y=30;y<185;y+=23)g.lineBetween(14,y,406,y);
  g.fillStyle(0x927db7).fillRect(18,18,14,2).fillRect(18,20,2,8).fillRect(388,180,14,2).fillRect(400,172,2,8);
}

function drawSpeaker(g){
  g.fillStyle(0x171827).fillRect(324,61,45,74);
  g.fillStyle(0x55557b).fillRect(328,65,37,66);
  g.fillStyle(0x202033).fillRect(331,71,31,25).fillRect(331,101,31,24);
  g.lineStyle(3,0x9d84bf).strokePoints(pixelEllipse(347,83,21,19),true).strokePoints(pixelEllipse(347,113,21,17),true);
  g.fillStyle(0xf1c085).fillRect(345,82,4,4).fillRect(345,111,4,4);
}

export function openHowToDemo({controls}={}){
  activeDemo?.();
  const opener=document.querySelector('[data-action="show-demo"]')??document.activeElement;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const dialog=document.createElement('dialog');
  dialog.className='how-to-demo';
  dialog.setAttribute('aria-labelledby','how-to-demo-title');
  dialog.innerHTML=`<h2 id="how-to-demo-title">Dancefloor demo</h2>
    <div class="how-to-demo-stage" aria-hidden="true"></div>
    <div class="how-to-demo-caption" role="status"><strong></strong><p></p></div>
    <div class="how-to-demo-actions">
      <button type="button" data-demo-next hidden>Next</button>
      <button type="button" data-demo-replay>Replay</button>
      <button type="button" data-demo-close autofocus>Close</button>
    </div>`;
  const stage=dialog.querySelector('.how-to-demo-stage');
  const caption=dialog.querySelector('.how-to-demo-caption');
  const captionTitle=caption.querySelector('strong');
  const captionCopy=caption.querySelector('p');
  const next=dialog.querySelector('[data-demo-next]');
  const replay=dialog.querySelector('[data-demo-replay]');
  const close=dialog.querySelector('[data-demo-close]');
  const mode=sanitizeControlPreferences(controls).mode;
  const instructions=[moveHint[mode],'Curve around the dancer. Leave a little space.','Touching a dancer interrupts your flow.', 'Charge near the speaker, then tap Bass Head or press B.'];
  let game,draw,step=0,elapsed=0,finished=false,closed=false;

  function updateCaption(showResult=false){
    const {title}=demoSteps[step];
    const description=showResult?endText[step]:instructions[step];
    if(captionTitle.textContent!==title)captionTitle.textContent=title;
    if(captionCopy.textContent!==description)captionCopy.textContent=description;
  }

  function selectStep(index){
    step=index;
    elapsed=0;
    finished=false;
    next.hidden=!motion.matches||step===demoSteps.length-1;
    updateCaption(motion.matches);
    draw?.(motion.matches?durations[step]:0,true);
  }

  function tick(delta){
    if(closed||finished||motion.matches)return;
    elapsed=Math.min(durations[step],elapsed+delta);
    draw(elapsed);
    if(elapsed<durations[step])return;
    if(step===demoSteps.length-1){finished=true;return;}
    selectStep(step+1);
  }

  function cleanUp(){
    if(closed)return;
    closed=true;
    if(activeDemo===cleanUp)activeDemo=null;
    document.removeEventListener('visibilitychange',onVisibility);
    window.removeEventListener('pagehide',cleanUp);
    motion.removeEventListener('change',onMotion);
    game?.destroy(true);
    if(dialog.open)dialog.close();
    dialog.remove();
    if(opener?.isConnected)opener.focus({preventScroll:true});
  }

  function onVisibility(){
    if(document.hidden)cleanUp();
  }

  function onMotion(){
    const hadNextFocus=document.activeElement===next;
    selectStep(step);
    if(hadNextFocus&&next.hidden)replay.focus({preventScroll:true});
  }

  dialog.addEventListener('keydown',event=>{if(event.key==='Escape')event.stopPropagation();});
  dialog.addEventListener('cancel',event=>{event.preventDefault();cleanUp();});
  dialog.addEventListener('close',cleanUp);
  replay.addEventListener('click',()=>selectStep(0));
  next.addEventListener('click',()=>{
    selectStep(step+1);
    if(next.hidden)replay.focus({preventScroll:true});
  });
  close.addEventListener('click',cleanUp);
  motion.addEventListener('change',onMotion);
  document.addEventListener('visibilitychange',onVisibility);
  window.addEventListener('pagehide',cleanUp);
  (document.fullscreenElement??document.body).append(dialog);
  dialog.showModal();
  activeDemo=cleanUp;
  selectStep(0);

  import('phaser').then(({default:Phaser})=>{
    if(closed)return;
    game=new Phaser.Game({
      type:Phaser.CANVAS,parent:stage,width:WIDTH,height:HEIGHT,backgroundColor:'#171628',
      audio:{noAudio:true},input:{keyboard:false,mouse:false,touch:false,gamepad:false},
      pixelArt:true,banner:false,autoFocus:false,fps:{target:30},
      callbacks:{postBoot(){
        const onblur=window.onblur,onfocus=window.onfocus;
        // Phaser assigns global focus properties after postBoot. The dancefloor
        // already owns them, and this short-lived scene closes when hidden.
        queueMicrotask(()=>{window.onblur=onblur;window.onfocus=onfocus;});
      }},
      scene:{
        create(){
          if(closed)return;
          drawFloor(this);
          const floor=this.add.graphics();
          const sparks=[128,205,282].map(x=>createPixelPickup(this,'spark',{scale:.65}).setPosition(x,113));
          const bassSpark=createPixelPickup(this,'spark',{scale:.65}).setPosition(280,117);
          const dancer=createAvatar(this,crowdOutfit,{dancing:true,phase:260}).setPosition(204,106).setScale(1.45);
          const player=createAvatar(this).setScale(1.45);
          const aura=this.add.graphics();
          const meter=this.add.text(28,24,'',{fontFamily:'Silkscreen, monospace',fontSize:'14px',color:'#ffdc9f'});
          draw=(time,reset=false)=>{
            const reduced=motion.matches;
            floor.clear();
            aura.clear();
            dancer.setVisible(step===1||step===2);
            meter.setVisible(step===3);
            const progress=Math.min(1,time/(durations[step]-720));
            let x=58,y=119,speed=0;
            if(step===0){
              x+=progress*265;
              speed=125;
              sparks.forEach(spark=>{
                spark.setVisible(x<spark.x);
                updatePixelPickup(spark,time,reduced);
              });
              if(x>282)updateCaption(true);
            }else{
              sparks.forEach(spark=>spark.setVisible(false));
            }
            bassSpark.setVisible(step===3&&time<3200);
            if(step===1){
              x+=progress*265;
              y+=Math.sin(progress*Math.PI)*27;
              speed=116;
              floor.lineStyle(2,0xd0a9fc,.68).strokePoints(pixelEllipse(204,114,74,54),true);
              animateAvatar(dancer,time,reduced);
              if(reduced){x=222;y=147;}
              if(x>235)updateCaption(true);
            }
            if(step===2){
              const contact=time>=1300;
              x=58+Math.min(1,time/1300)*108;y=114;speed=contact?0:90;
              if(contact&&!reduced)x-=Math.sin(Math.min(time-1300,400)/400*Math.PI)*6;
              floor.lineStyle(2,contact?0xff758e:0xd0a9fc,.8).strokePoints(pixelEllipse(204,114,74,54),true);
              if(contact){floor.fillStyle(0xff758e).fillRect(201,58,5,14).fillRect(201,76,5,5);updateCaption(true);}
              animateAvatar(dancer,time,reduced);
            }
            if(step===3){
              const charged=time>=2500;
              const power=Math.min(40,Math.max(0,Math.floor((time-1150)/34)));
              x+=Math.min(1,time/1400)*163+Math.min(1,Math.max(0,(time-2500)/820))*83;
              speed=time<1400||time>2500&&time<3320?100:0;
              floor.lineStyle(2,0x9c735a,.56).strokePoints(pixelEllipse(345,102,237,162),true);
              drawSpeaker(floor);
              aura.setPosition(Math.round(x),Math.round(y));
              drawPlayerBass(aura,{activeMs:charged?1000:0,exposureMs:power*100},x>210?.7:1,time,reduced);
              meter.setText(charged?'BASS HEAD · ACTIVE':`BASS HEAD · ${power}%`);
              updatePixelPickup(bassSpark,time,reduced);
              if(charged)updateCaption(true);
            }
            if(reduced&&step===0)sparks.forEach(spark=>spark.setVisible(true));
            if(reset)resetAvatarMotion(player,{x,y,elapsed:time});
            player.setPosition(Math.round(x),Math.round(y));
            setAvatarMotion(player,{x,y,speed:progress===1?0:speed,elapsed:time});
            animateAvatar(player,time,reduced);
          };
          selectStep(step);
        },
        update(_time,delta){if(draw)tick(delta);},
      },
    });
  }).catch(()=>{
    if(closed)return;
    stage.hidden=true;
    captionTitle.textContent='Demo unavailable';
    captionCopy.textContent='Close to return to the illustrated controls.';
    next.hidden=true;
    replay.hidden=true;
  });
  return cleanUp;
}
