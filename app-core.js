'use strict';

window.JVS_APP = (() => {
  const DATA=window.JVS_DATA,AUDIO=window.JVS_AUDIO;
  const APP_KEY='julieVoiceStudio2State';
  const DB_NAME='JulieVoiceStudio2Audio';
  const STORE='clips';
  const defaultState={dayIndex:0,totalMinutes:0,sessions:[],attempts:[],savedClipIds:[],micDevice:'',lastMicResult:null};
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  let db=null;
  let state=loadState();
  let session=null;
  let currentRecording=null;
  let reviewChoice={effort:null,alignment:null};
  let currentFixKey=null;
  let restInterval=0;
  let installPrompt=null;

  function loadState(){try{return {...defaultState,...JSON.parse(localStorage.getItem(APP_KEY)||'{}')}}catch{return {...defaultState}}}
  function saveState(){try{localStorage.setItem(APP_KEY,JSON.stringify(state))}catch{toast('Progress could not be saved on this device.')}}
  function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
  function formatDate(ts){return new Intl.DateTimeFormat('en-AU',{dateStyle:'medium',timeStyle:'short'}).format(new Date(ts))}
  function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),3000)}
  function formatPhrase(p){return escapeHtml(p).replaceAll(' / ',' <span class="breath-mark" aria-label="pause">/</span> ')}

  function openDB(){return new Promise((resolve,reject)=>{if(!indexedDB){reject(new Error('no-indexeddb'));return}const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
  function dbPut(record){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
  function dbGetAll(){return new Promise((resolve,reject)=>{if(!db){resolve([]);return}const r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
  function dbClear(){return new Promise((resolve,reject)=>{if(!db){resolve();return}const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}

  function setView(name){
    if(name==='coach'&&!session){toast('Start a session from Home first.');name='home'}
    $$('.view').forEach(v=>v.classList.toggle('active',v.id===`${name}View`));
    $$('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.openView===name));
    if(name==='home')renderHome();
    if(name==='progress')renderProgress();
    if(name==='mic')prepareMicView();
    window.scrollTo({top:0,behavior:'smooth'});$('#main').focus({preventScroll:true});
  }

  function renderHome(){
    const day=DATA.days[state.dayIndex%DATA.days.length];
    $('#todayTitle').textContent=day.title;$('#todayDescription').textContent=day.description;$('#dayBadge').textContent=`Day ${state.dayIndex%7+1}`;
    $('#sessionCount').textContent=state.sessions.length;$('#practiceMinutes').textContent=Math.round(state.totalMinutes);renderSavedCount();
  }
  async function renderSavedCount(){const clips=await dbGetAll().catch(()=>[]);$('#savedCount').textContent=clips.length}
  function chooseInGroup(container,value){$$('.choice',container).forEach(b=>b.classList.toggle('selected',b.dataset.value===value));container.dataset.selected=value}
  function checkinValue(id,fallback){return $(`#${id}`).dataset.selected||fallback}

  function openCheckin(length){
    session={length,listenOnly:false,startedAt:Date.now(),exerciseIndex:0,stage:0,completed:0,attempts:[],appliedFix:null,dayIndex:state.dayIndex%7};
    chooseInGroup($('#energyChoices'),'3');chooseInGroup($('#breathChoices'),'comfortable');chooseInGroup($('#throatChoices'),'comfortable');updateCheckinWarning();setView('checkin')
  }
  function updateCheckinWarning(){
    const breath=checkinValue('breathChoices','comfortable'),throat=checkinValue('throatChoices','comfortable'),el=$('#checkinWarning');
    if(breath==='difficult'||throat==='sore'){el.classList.remove('hidden');el.textContent='Today will switch to listening and mental rehearsal. If this persists or feels medically unsafe, stop and seek appropriate care.'}else el.classList.add('hidden')
  }
  function beginSession(){
    const energy=Number(checkinValue('energyChoices','3')),breath=checkinValue('breathChoices','comfortable'),throat=checkinValue('throatChoices','comfortable');
    session.checkin={energy,breath,throat};session.listenOnly=breath==='difficult'||throat==='sore';
    session.exercises=DATA.days[session.dayIndex].exercises.slice(0,session.length===3?3:4);
    if(energy<=2&&session.exercises.length>3)session.exercises=session.exercises.slice(0,3);
    renderCoach();setView('coach');AUDIO.speak(buildSpokenInstruction());
  }

  function currentExercise(){return session?.exercises?.[session.exerciseIndex]}
  function smallestPhrase(phrase){return phrase.split('/')[0].split('…')[0].trim()||phrase}
  function focusLabel(f){return ({ease:'ease rather than force',breath:'a clear planned pause',ending:'a clear final word',weight:'lighter weight without whispering',resonance:'a smaller forward shape',pitch:'a tiny comfortable lift',intonation:'one natural point of movement',integration:'one small change that still feels like you'})[f]||'comfort'}
  function stages(ex){const a=session.appliedFix;return[
    {label:'Step 1 of 4',title:'Set up comfortably.',instruction:ex.setup,do:'Use only the breath you comfortably have.',feel:'Nothing should pull or squeeze.',avoid:'A maximum breath or bracing your stomach.',phrase:'Comfortable position + one ordinary breath',icon:'🫧'},
    {label:'Step 2 of 4',title:'Find the smallest useful version.',instruction:ex.find,do:a?.do||ex.do,feel:a?.feel||ex.feel,avoid:a?.avoid||ex.avoid,phrase:smallestPhrase(a?.phrase||ex.phrase),icon:ex.icon},
    {label:'Step 3 of 4',title:'Build it in short pieces.',instruction:ex.build,do:ex.do,feel:ex.feel,avoid:ex.avoid,phrase:a?.phrase||ex.phrase,icon:ex.icon},
    {label:'Step 4 of 4',title:session.listenOnly?'Rehearse without speaking.':'Record one comfortable attempt.',instruction:session.listenOnly?'Read the phrase silently and imagine the chosen quality. There is no need to test your voice today.':'Say it once. Stop immediately if your throat tightens or your breathing feels unsafe.',do:`Focus on ${focusLabel(ex.focus)}.`,feel:'Easy enough that you could use it again.',avoid:'Trying to prove that it sounds feminine.',phrase:a?.phrase||ex.phrase,icon:'🎙️'}
  ]}
  function buildSpokenInstruction(){const s=stages(currentExercise())[session.stage];return `${s.title} ${s.instruction} Do this: ${s.do} Notice: ${s.feel}`}

  function renderCoach(){
    const ex=currentExercise(),s=stages(ex)[session.stage];
    $('#coachSkill').textContent=ex.skill;$('#coachCounter').textContent=`Exercise ${session.exerciseIndex+1} of ${session.exercises.length}`;$('#sessionProgress').style.width=`${((session.exerciseIndex+session.stage/4)/session.exercises.length)*100}%`;
    $('#coachIcon').textContent=s.icon;$('#coachStepLabel').textContent=s.label;$('#coachTitle').textContent=s.title;$('#coachInstruction').textContent=s.instruction;$('#doCue').textContent=s.do;$('#feelCue').textContent=s.feel;$('#avoidCue').textContent=s.avoid;$('#practicePhrase').innerHTML=formatPhrase(s.phrase);
    $('#coachStatus').textContent='';$('#playback').classList.add('hidden');$('#replayButton').classList.add('hidden');$('#saveClipButton').classList.add('hidden');currentRecording=null;
    const final=session.stage===3;$('#recordButton').classList.toggle('hidden',!final||session.listenOnly);$('#mainCoachButton').classList.toggle('hidden',final&&!session.listenOnly);$('#mainCoachButton').textContent=final?'Complete silent practice':'I’m ready — next';$('#tooHardButton').textContent=session.stage>0?'Make it easier':'Use a shorter session';
  }
  function nextCoachStage(){if(session.stage<3){session.stage++;renderCoach();AUDIO.speak(buildSpokenInstruction());return}if(session.listenOnly)finishExercise()}
  function makeEasier(){
    if(session.stage>1){session.stage=1;renderCoach();$('#coachStatus').textContent='Made smaller. One word or sound is enough.';AUDIO.speak('Let us make it smaller. Use only the tiny practice target. That still counts.');return}
    if(session.stage===1){const ex=currentExercise();session.appliedFix={do:'Use only the first sound or word.',feel:'Easy and brief.',avoid:'Repeating until it deteriorates.',phrase:smallestPhrase(ex.phrase)};renderCoach();toast('The task is now reduced to its smallest part.');return}
    toast('You are already at the easiest setup step.')
  }

  function micErrorText(error){
    if(error?.message==='secure-context')return 'Microphone requires this app to be opened from its HTTPS address in Chrome or Safari.';
    if(error?.name==='NotAllowedError')return 'Microphone permission is blocked. Allow it in the browser site settings, then reload.';
    return 'The microphone could not start. Check browser permission and the selected input.'
  }
  async function toggleRecording(){
    const button=$('#recordButton');
    try{
      if(AUDIO.isRecording()){
        button.disabled=true;currentRecording=await AUDIO.stopRecording();button.disabled=false;button.textContent='● Record one attempt';$('#playback').src=currentRecording.url;$('#playback').classList.remove('hidden');$('#replayButton').classList.remove('hidden');$('#saveClipButton').classList.remove('hidden');$('#coachStatus').textContent='Recorded. Listen for ease—not perfection.';setTimeout(openReview,250);return
      }
      await AUDIO.startRecording(state.micDevice,frame=>{$('#coachStatus').textContent=Math.min(100,frame.rms*700)<8?'Recording… keep your ordinary volume.':'Recording one comfortable attempt…'});button.textContent='■ Stop recording';$('#coachStatus').textContent='Recording…'
    }catch(error){button.disabled=false;button.textContent='● Record one attempt';$('#coachStatus').textContent=micErrorText(error)}
  }

  function openReview(){
    if(!currentRecording)return;reviewChoice={effort:null,alignment:null};$$('#effortChoices .choice,#alignmentChoices .choice').forEach(b=>b.classList.remove('selected'));$('#reviewPlayback').src=currentRecording.url;renderMetrics(currentRecording.metrics);setView('review')
  }
  function renderMetrics(m){
    const lines=[];if(m.duration)lines.push(['Phrase length',`${m.duration.toFixed(1)} seconds`]);if(m.medianPitch)lines.push(['Approximate centre',`${Math.round(m.medianPitch)} Hz — not a gender score`]);if(m.stability!=null)lines.push(['Pitch steadiness',`${Math.round(m.stability)}%`]);if(m.endingRatio!=null)lines.push(['Ending level',m.endingRatio>.7?'Stayed fairly clear':'Dropped near the end']);$('#metricList').innerHTML=lines.map(([a,b])=>`<dt>${escapeHtml(a)}</dt><dd>${escapeHtml(b)}</dd>`).join('')
  }
  function updateReviewFeedback(){
    const {effort,alignment}=reviewChoice;let h='That gave us useful information.',t='Choose how it felt and the coaching will respond honestly.';
    if(effort==='strained'){h='That attempt was too demanding.';t='Do not repeat it at the same setting. Come down, shorten the phrase and use less effort.'}
    else if(effort==='easy'&&alignment==='closer'){h='That was a useful attempt.';t='It was comfortable and closer to your goal. Repeat the same size—not a more extreme version.'}
    else if(effort==='easy'){h='Comfort is a strong base.';t='Now change only one quality: slightly lighter, slightly more forward, or a clearer ending.'}
    else if(alignment==='wrong'){h='Do not chase that version.';t='It felt wrong. Use the sound fixer or return to a smaller version that still feels like you.'}
    else if(effort&&alignment){h='You are gathering real feedback.';t='Keep the next change small. More extreme is not automatically more feminine.'}
    $('#analysisHeadline').textContent=h;$('#analysisText').textContent=t
  }
  function acceptAttempt(){const ex=currentExercise();session.attempts.push({time:Date.now(),exercise:ex.title,focus:ex.focus,effort:reviewChoice.effort,alignment:reviewChoice.alignment,metrics:currentRecording?.metrics||null});finishExercise()}
  function finishExercise(){session.completed++;session.stage=0;session.appliedFix=null;session.exerciseIndex++;if(session.exerciseIndex>=session.exercises.length){finishSession();return}renderCoach();setView('coach');AUDIO.speak(`Next exercise. ${buildSpokenInstruction()}`)}
  function finishSession(){
    const minutes=Math.max(1,(Date.now()-session.startedAt)/60000);const record={id:Date.now(),date:Date.now(),dayIndex:session.dayIndex,title:DATA.days[session.dayIndex].title,minutes,completed:session.completed,attempts:session.attempts,checkin:session.checkin,listenOnly:session.listenOnly};
    state.sessions.push(record);state.attempts.push(...session.attempts);state.totalMinutes+=minutes;if(!session.listenOnly&&session.completed>=session.exercises.length)state.dayIndex=(state.dayIndex+1)%7;saveState();
    $('#completeSummary').textContent=session.listenOnly?'You completed a safe listening session. Protecting your voice was the correct decision.':`You completed ${session.completed} short exercises in ${Math.round(minutes)} minutes.`;$('#completeStats').innerHTML=`<div><strong>Focus:</strong> ${escapeHtml(DATA.days[session.dayIndex].title)}</div><div><strong>Attempts:</strong> ${session.attempts.length}</div><div><strong>Next:</strong> ${escapeHtml(DATA.days[state.dayIndex].title)}</div>`;session=null;currentRecording=null;AUDIO.stopSpeech();setView('complete')
  }

  function startRest(){AUDIO.stopSpeech();if(AUDIO.isRecording())AUDIO.stopRecording().catch(()=>{});clearInterval(restInterval);$('#restTimer').textContent='Rest as long as you need.';setView('rest')}
  function setRestTimer(seconds){clearInterval(restInterval);if(!seconds){$('#restTimer').textContent='Rest as long as you need.';return}let left=seconds;$('#restTimer').textContent=`${left} seconds`;restInterval=setInterval(()=>{left--;$('#restTimer').textContent=left>0?`${left} seconds`:'Rest complete. Resume only if you feel ready.';if(left<=0)clearInterval(restInterval)},1000)}

  return {
    DATA,AUDIO,$,$$,defaultState,get state(){return state},set state(v){state=v},get session(){return session},get currentRecording(){return currentRecording},get currentFixKey(){return currentFixKey},set currentFixKey(v){currentFixKey=v},get installPrompt(){return installPrompt},set installPrompt(v){installPrompt=v},get db(){return db},set db(v){db=v},get reviewChoice(){return reviewChoice},
    saveState,escapeHtml,formatDate,toast,formatPhrase,openDB,dbPut,dbGetAll,dbClear,setView,renderHome,renderSavedCount,chooseInGroup,checkinValue,openCheckin,updateCheckinWarning,beginSession,currentExercise,buildSpokenInstruction,renderCoach,nextCoachStage,makeEasier,micErrorText,toggleRecording,openReview,updateReviewFeedback,acceptAttempt,finishExercise,finishSession,startRest,setRestTimer
  };
})();
