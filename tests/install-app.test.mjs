import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createInstallHelp,installDevice,isInstalledApp,renderInstallGuide} from '../src/install-app.js';
import {renderTitle} from '../src/theme-screens.js';
import {titleHTML} from '../src/smf-tour/view.js';
import {createTourProfile} from '../src/smf-tour/model.js';

test('selects device guidance without inferring install support from the browser name',()=>{
  assert.equal(installDevice({userAgent:'iPhone'}),'ios');
  assert.equal(installDevice({platform:'MacIntel',maxTouchPoints:5}),'ios');
  assert.equal(installDevice({userAgent:'Android'}),'android');
  assert.equal(installDevice({platform:'MacIntel',maxTouchPoints:0}),'desktop');
  assert.equal(isInstalledApp({standalone:true}),true);
  assert.equal(isInstalledApp({},true),true);
  assert.equal(isInstalledApp({userAgent:'Android'}),false);
});

test('manual guidance is available for phones and desktops on either title menu',()=>{
  for(const html of [renderTitle('neon-field-trip'),titleHTML(createTourProfile())]){
    assert.match(html,/data-action="install"[^>]*aria-haspopup="dialog"/);
  }
  assert.match(renderInstallGuide('ios'),/Add to Home Screen.*Open as Web App/);
  assert.match(renderInstallGuide('android'),/Install and create shortcut/);
  assert.match(renderInstallGuide('desktop'),/Install page as app.*Install this site as an app.*Add to Dock/s);
});

test('edition manifests have distinct identities and keep launches within their deployment paths',async()=>{
  const {assetsForEdition,manifestForEdition}=await import('../build/edition-assets.js');
  const generic=manifestForEdition('generic');
  const festival=manifestForEdition('smf');
  assert.equal(generic.name,'Festival Side Quest');
  assert.equal(festival.name,'Shambhala Side Quest');
  assert.notEqual(generic.id,festival.id);

  for(const [id,manifest,path] of [['generic',generic,'/side-quest/'],['smf',festival,'/side-quest/smf/']]){
    const manifestUrl=new URL('manifest.webmanifest',`https://example.test${path}`);
    assert.equal(new URL(manifest.start_url,manifestUrl).pathname,path);
    assert.equal(new URL(manifest.scope,manifestUrl).pathname,path);
    assert.equal(manifest.display,'standalone');
    assert.equal(manifest.orientation,'any');
    assert.deepEqual(manifest.icons.map(icon=>icon.sizes),['192x192','512x512']);
    assert.ok(manifest.icons.every(icon=>assetsForEdition(id).includes(icon.src.slice(2))));
  }
});

test('captures a browser install event without prompting and releases listeners on dispose',()=>{
  const browser=new EventTarget();
  const displayMode=new EventTarget();
  const classes=new Set();
  browser.navigator={};
  browser.matchMedia=()=>displayMode;
  browser.document={documentElement:{classList:{
    toggle:(name,active)=>active?classes.add(name):classes.delete(name),
    remove:name=>classes.delete(name),
  }}};
  const help=createInstallHelp(browser);
  const offered=new Event('beforeinstallprompt',{cancelable:true});
  let prompts=0;
  offered.prompt=()=>{prompts++;};
  browser.dispatchEvent(offered);
  assert.equal(offered.defaultPrevented,true);
  assert.equal(prompts,0);
  browser.dispatchEvent(new Event('appinstalled'));
  assert.equal(classes.has('installed-app'),true);

  help.dispose();
  assert.equal(classes.has('installed-app'),false);
  browser.dispatchEvent(new Event('appinstalled'));
  assert.equal(classes.has('installed-app'),false);
});

test('dev middleware serves the edition manifest as JSON with the manifest MIME type',async()=>{
  const {editionAssetsPlugin}=await import('../build/edition-assets.js');
  let handle;
  editionAssetsPlugin('smf').configureServer({middlewares:{use:callback=>{handle=callback;}}});
  const headers={};
  let response;
  await handle({url:'/manifest.webmanifest'},{
    setHeader:(name,value)=>{headers[name]=value;},
    end:value=>{response=value;},
  },()=>assert.fail('Manifest skipped the edition asset handler.'));
  assert.equal(headers['Content-Type'],'application/manifest+json');
  assert.equal(JSON.parse(response).name,'Shambhala Side Quest');
});

function installHarness(){
  const browser=new EventTarget(),displayMode=new EventTarget(),classes=new Set(),dialogs=[];
  displayMode.matches=false;
  const doc={activeElement:null,documentElement:{classList:{
    toggle:(name,active)=>active?classes.add(name):classes.delete(name),
    remove:name=>classes.delete(name),
  }}};
  const node=()=>Object.assign(new EventTarget(),{
    hidden:false,isConnected:true,focus(){doc.activeElement=this;},
  });
  const opener=node(),play=node();
  doc.activeElement=opener;
  doc.querySelector=selector=>selector==='[data-action="install"]'?opener:play;
  doc.body={append:element=>{element.isConnected=true;}};
  doc.createElement=()=>{
    const children=new Map(['select','.install-steps','[data-install-prompt]','[data-install-close]'].map(selector=>[selector,node()]));
    const dialog=Object.assign(node(),{
      open:false,setAttribute(){},querySelector:selector=>children.get(selector),
      showModal(){this.open=true;children.get('[data-install-close]').focus();},
      close(){this.open=false;this.dispatchEvent(new Event('close'));},
      remove(){this.isConnected=false;},
    });
    dialogs.push(dialog);return dialog;
  };
  browser.document=doc;browser.navigator={};browser.matchMedia=()=>displayMode;
  const help=createInstallHelp(browser);
  function offer(outcome){
    let resolveChoice,prompts=0;
    const event=new Event('beforeinstallprompt',{cancelable:true});
    event.userChoice=new Promise(resolve=>{resolveChoice=resolve;});
    event.prompt=()=>{prompts++;return event.userChoice;};
    browser.dispatchEvent(event);
    return {event,get prompts(){return prompts;},resolve:()=>resolveChoice({outcome})};
  }
  return {browser,doc,classes,dialogs,opener,play,help,offer};
}
const settlePrompt=()=>new Promise(resolve=>setImmediate(resolve));

test('native prompt is one-shot and dismissal leaves manual help available until a new offer',async()=>{
  const h=installHarness();
  try{
    h.help.open();
    const dialog=h.dialogs.at(-1),button=dialog.querySelector('[data-install-prompt]');
    assert.equal(button.hidden,true,'manual instructions work without native capability');
    const first=h.offer('dismissed');
    assert.equal(first.event.defaultPrevented,true);assert.equal(first.prompts,0);
    assert.equal(button.hidden,false);
    button.focus();button.dispatchEvent(new Event('click'));
    assert.equal(first.prompts,1);assert.equal(button.hidden,true);
    assert.equal(h.doc.activeElement,dialog.querySelector('[data-install-close]'));
    button.dispatchEvent(new Event('click'));assert.equal(first.prompts,1);
    first.resolve();await settlePrompt();
    assert.equal(dialog.open,true);assert.equal(h.classes.has('installed-app'),false);
    const second=h.offer('dismissed');assert.equal(button.hidden,false);
    button.dispatchEvent(new Event('click'));second.resolve();await settlePrompt();
    assert.equal(second.prompts,1);
  }finally{h.help.dispose();}
});

test('successful native installation closes help and focuses a visible title action',async()=>{
  const h=installHarness();
  try{
    const offered=h.offer('accepted');h.help.open();
    const dialog=h.dialogs.at(-1);
    dialog.querySelector('[data-install-prompt]').dispatchEvent(new Event('click'));
    offered.resolve();await settlePrompt();
    assert.equal(h.classes.has('installed-app'),true);
    assert.equal(dialog.isConnected,false);assert.equal(h.doc.activeElement,h.play);
    h.help.open();assert.equal(h.dialogs.length,1,'installed app does not reopen the helper');
  }finally{h.help.dispose();}
});

test('disposing a pending native prompt ignores its late result and removes event hooks',async()=>{
  const h=installHarness(),offered=h.offer('accepted');h.help.open();
  const dialog=h.dialogs.at(-1);
  dialog.querySelector('[data-install-prompt]').dispatchEvent(new Event('click'));
  h.help.dispose();offered.resolve();await settlePrompt();
  assert.equal(dialog.isConnected,false);assert.equal(h.classes.has('installed-app'),false);
  assert.equal(h.doc.activeElement,h.opener);
  const after=h.offer('accepted');assert.equal(after.event.defaultPrevented,false);
  h.browser.dispatchEvent(new Event('appinstalled'));
  assert.equal(h.classes.has('installed-app'),false);
});

test('a rejected native prompt keeps manual help usable even if userChoice never settles',async()=>{
  const h=installHarness();
  try{
    const offered=h.offer('dismissed');
    offered.event.prompt=()=>Promise.reject(new Error('Native install prompt is no longer available'));
    h.help.open();
    const dialog=h.dialogs.at(-1),button=dialog.querySelector('[data-install-prompt]');
    button.dispatchEvent(new Event('click'));
    await settlePrompt();
    assert.equal(dialog.open,true);assert.equal(button.hidden,true);
    assert.equal(h.classes.has('installed-app'),false);
    dialog.querySelector('[data-install-close]').dispatchEvent(new Event('click'));
    assert.equal(dialog.isConnected,false);assert.equal(h.doc.activeElement,h.opener);
  }finally{h.help.dispose();}
});
