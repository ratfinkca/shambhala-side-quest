const deviceLabels={ios:'iPhone / iPad',android:'Android',desktop:'Desktop'};
const instructions={
  ios:'<p>In <strong>Safari</strong>, open Share → Add to Home Screen. Turn on Open as Web App if shown, then tap Add.</p>',
  android:'<p>In <strong>Chrome</strong>, open ⋮ → Install and create shortcut → Install. On older versions, look for Add to Home screen.</p>',
  desktop:'<p><strong>Chrome:</strong> ⋮ → Cast, save, and share → Install page as app.</p><p><strong>Edge:</strong> ⋯ → More tools → Apps → Install this site as an app.</p><p><strong>Safari on Mac:</strong> File → Add to Dock.</p>',
};

export function installDevice(navigator){
  const {userAgent='',platform='',maxTouchPoints=0}=navigator;
  if(/iPhone|iPad|iPod/i.test(userAgent)||(platform==='MacIntel'&&maxTouchPoints>1))return 'ios';
  if(/Android/i.test(userAgent)||navigator.userAgentData?.platform==='Android')return 'android';
  return 'desktop';
}

export function isInstalledApp(navigator,standalone=false){
  return standalone||navigator.standalone===true;
}

export function renderInstallGuide(device){
  return instructions[device]??instructions.desktop;
}

export function createInstallHelp(win=window){
  const doc=win.document;
  const displayMode=win.matchMedia('(display-mode: standalone), (display-mode: window-controls-overlay)');
  let dialog,opener,promptEvent,installed=false,disposed=false;
  const isInstalled=()=>installed||isInstalledApp(win.navigator,displayMode.matches);

  function sync(){
    doc.documentElement.classList.toggle('installed-app',isInstalled());
    if(!dialog)return;
    const promptButton=dialog.querySelector('[data-install-prompt]');
    if(doc.activeElement===promptButton&&(!promptEvent||isInstalled())){
      dialog.querySelector('[data-install-close]').focus({preventScroll:true});
    }
    promptButton.hidden=!promptEvent||isInstalled();
  }

  function deferPrompt(event){
    if(isInstalled()||typeof event.prompt!=='function')return;
    event.preventDefault();
    promptEvent=event;
    sync();
  }

  function confirmInstall(){
    if(disposed)return;
    installed=true;
    promptEvent=null;
    close();
    sync();
  }

  async function promptInstall(){
    if(!promptEvent||isInstalled())return;
    const event=promptEvent;
    promptEvent=null;
    // Firefox and Safari use the manual instructions. Chromium supplies a
    // fresh event if the user dismisses and can be prompted again.
    try{
      const pending=event.prompt();
      sync();
      const result=await pending;
      const choice=await (event.userChoice??result);
      if(choice?.outcome==='accepted')confirmInstall();
    }catch{
      if(!disposed)sync();
    }
  }

  function close(){
    if(!dialog)return;
    const current=dialog;
    dialog=null;
    if(current.open)current.close();
    current.remove();
    const focusTarget=isInstalled()?doc.querySelector('[data-action="festival"], [data-action="start"], [data-action="resume"]'):opener;
    if(focusTarget?.isConnected)focusTarget.focus({preventScroll:true});
    opener=null;
  }

  function open(){
    if(disposed||dialog||isInstalled())return;
    opener=doc.querySelector('[data-action="install"]')??doc.activeElement;
    const current=doc.createElement('dialog');
    current.className='install-sheet';
    current.setAttribute('aria-labelledby','install-title');
    current.innerHTML=`<h2 id="install-title">Install app</h2>
      <label class="install-device" for="install-device">Device
        <select id="install-device" aria-label="Device">${Object.entries(deviceLabels).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select>
      </label>
      <div class="install-steps" aria-live="polite"></div>
      <p class="install-note">Play requires an internet connection.</p>
      <div class="install-actions">
        <button type="button" data-install-prompt hidden>Install now</button>
        <button type="button" data-install-close autofocus>Close</button>
      </div>`;
    dialog=current;
    const select=current.querySelector('select');
    const steps=current.querySelector('.install-steps');
    select.value=installDevice(win.navigator);
    steps.innerHTML=renderInstallGuide(select.value);
    select.addEventListener('change',()=>{steps.innerHTML=renderInstallGuide(select.value);});
    current.querySelector('[data-install-prompt]').addEventListener('click',promptInstall);
    current.querySelector('[data-install-close]').addEventListener('click',close);
    current.addEventListener('keydown',event=>{if(event.key==='Escape')event.stopPropagation();});
    current.addEventListener('cancel',event=>{event.preventDefault();close();});
    current.addEventListener('close',()=>{if(dialog===current)close();});
    (doc.fullscreenElement??doc.body).append(current);
    sync();
    current.showModal();
  }

  win.addEventListener('beforeinstallprompt',deferPrompt);
  win.addEventListener('appinstalled',confirmInstall);
  win.addEventListener('pagehide',close);
  displayMode.addEventListener('change',sync);
  sync();
  return {open,dispose(){
    disposed=true;
    close();
    promptEvent=null;
    win.removeEventListener('beforeinstallprompt',deferPrompt);
    win.removeEventListener('appinstalled',confirmInstall);
    win.removeEventListener('pagehide',close);
    displayMode.removeEventListener('change',sync);
    doc.documentElement.classList.remove('installed-app');
  }};
}
