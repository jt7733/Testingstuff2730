'use strict';

(() => {
  const A=window.JVS_APP,$=A.$,$$=A.$$;

  async function prepareMicView(){
    $('#secureContextNotice').textContent=window.isSecureContext?'Secure HTTPS page detected. Microphone permission can work here.':'This page is not secure. Microphone access will be blocked until opened from HTTPS.';
    try{const devices=await A.AUDIO.enumerateInputs();const select=$('#inputDeviceSelect');select.innerHTML='<option value="">Default microphone</option>'+devices.map((d,i)=>`<option value="${A.escapeHtml(d.deviceId)}">${A.escapeHtml(d.label||`Microphone ${i+1}`)}</option>`).join('');select.value=A.state.micDevice||''}catch{}
  }
  async function runMicCheck(){
    const button=$('#runMicCheckButton'),result=$('#micResult');button.disabled=true;result.classList.add('hidden');
    try{
      const data=await A.AUDIO.runMicCheck(A.state.micDevice,text=>$('#micInstruction').textContent=text,frame=>$('#micLevel').style.width=`${Math.min(100,frame.rms*700)}%`);
      A.state.lastMicResult={...data,date:Date.now()};A.saveState();result.className='result-card '+(data.recommendations.length===1&&data.recommendations[0].startsWith('Keep')?'good':'warning');result.innerHTML=`<h3>${A.escapeHtml(data.recommendations[0])}</h3>${data.recommendations.slice(1).map(x=>`<p>${A.escapeHtml(x)}</p>`).join('')}<p><small>Room level and device gain vary. This is guidance, not an exact distance measurement.</small></p>`;result.classList.remove('hidden');$('#micInstruction').textContent='Check complete.';await prepareMicView()
    }catch(error){result.className='result-card warning';result.innerHTML=`<h3>Microphone could not start.</h3><p>${A.escapeHtml(A.micErrorText(error))}</p>`;result.classList.remove('hidden')}
    button.disabled=false
  }

  function renderFixer(){$('#fixerOptions').innerHTML=Object.entries(A.DATA.fixes).map(([key,fix])=>`<button class="fixer-option" data-fix="${key}" type="button">${A.escapeHtml(fix.label)}</button>`).join('')}
  function selectFix(key){A.currentFixKey=key;const f=A.DATA.fixes[key];$$('.fixer-option').forEach(b=>b.classList.toggle('selected',b.dataset.fix===key));$('#fixerResult').classList.remove('hidden');$('#fixerResultTitle').textContent=f.title;$('#fixerExplanation').textContent=f.explanation;$('#fixerDo').textContent=f.do;$('#fixerFeel').textContent=f.feel;$('#fixerAvoid').textContent=f.avoid;$('#fixerPhrase').innerHTML=A.formatPhrase(f.phrase)}
  function hearFix(){const f=A.DATA.fixes[A.currentFixKey];if(f)A.AUDIO.speak(`${f.title} ${f.explanation} Do this: ${f.do} Notice: ${f.feel} Avoid: ${f.avoid} Try: ${f.phrase}`)}
  function applyFix(){if(!A.session){A.toast('Start a coaching session first.');return}A.session.appliedFix=A.DATA.fixes[A.currentFixKey];A.session.stage=1;A.renderCoach();A.setView('coach');A.AUDIO.speak(`Use this correction. ${A.buildSpokenInstruction()}`)}

  async function saveCurrentClip(){
    if(!A.currentRecording?.blob||!A.db){A.toast('There is no recording to save.');return}
    const ex=A.currentExercise(),id=`clip-${Date.now()}`;await A.dbPut({id,createdAt:Date.now(),name:ex?.title||'Voice practice',type:A.currentRecording.type,blob:A.currentRecording.blob,metrics:A.currentRecording.metrics});A.state.savedClipIds.push(id);A.saveState();A.toast('Saved privately on this device.');$('#saveClipButton').disabled=true;$('#saveReviewClipButton').disabled=true;A.renderSavedCount()
  }
  async function renderProgress(){
    $('#progressSessions').textContent=A.state.sessions.length;$('#progressMinutes').textContent=Math.round(A.state.totalMinutes);$('#progressAttempts').textContent=A.state.attempts.length;
    const recent=[...A.state.sessions].reverse().slice(0,8);$('#recentSessions').innerHTML=recent.length?recent.map(s=>`<div class="history-item"><strong>${A.escapeHtml(s.title)}</strong><span>${A.escapeHtml(A.formatDate(s.date))}</span><p>${s.completed} exercises · ${Math.round(s.minutes)} minutes${s.listenOnly?' · listening session':''}</p></div>`).join(''):'<div class="history-item">No sessions yet.</div>';
    const clips=(await A.dbGetAll().catch(()=>[])).sort((a,b)=>b.createdAt-a.createdAt);$('#savedClips').innerHTML=clips.length?clips.map(c=>`<div class="history-item"><strong>${A.escapeHtml(c.name)}</strong><span>${A.escapeHtml(A.formatDate(c.createdAt))}</span><audio controls src="${URL.createObjectURL(c.blob)}"></audio></div>`).join(''):'<div class="history-item">No saved clips yet.</div>'
  }
  function exportProgress(){const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),progress:A.state},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='julie-voice-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  async function deleteAll(){if(!confirm('Delete all local progress and saved recordings? This cannot be undone.'))return;A.state={...A.defaultState};A.saveState();await A.dbClear().catch(()=>{});A.renderHome();renderProgress();A.toast('All local data deleted.')}

  function wire(){
    $$('[data-open-view]').forEach(b=>b.addEventListener('click',()=>A.setView(b.dataset.openView)));
    $('#startSessionButton').addEventListener('click',()=>A.openCheckin(5));$('#quickSessionButton').addEventListener('click',()=>A.openCheckin(3));
    [$('#energyChoices'),$('#breathChoices'),$('#throatChoices')].forEach(group=>group.addEventListener('click',e=>{const b=e.target.closest('.choice');if(!b)return;A.chooseInGroup(group,b.dataset.value);A.updateCheckinWarning()}));
    $('#beginCoachButton').addEventListener('click',A.beginSession);$('#hearInstructionButton').addEventListener('click',()=>A.AUDIO.speak(A.buildSpokenInstruction()));$('#mainCoachButton').addEventListener('click',A.nextCoachStage);$('#tooHardButton').addEventListener('click',A.makeEasier);$('#recordButton').addEventListener('click',A.toggleRecording);$('#replayButton').addEventListener('click',()=>$('#playback').play());$('#saveClipButton').addEventListener('click',saveCurrentClip);$('#skipExerciseButton').addEventListener('click',A.finishExercise);
    $('#restButton').addEventListener('click',A.startRest);$('#openFixerFromCoach').addEventListener('click',()=>A.setView('fixer'));$$('[data-rest]').forEach(b=>b.addEventListener('click',()=>A.setRestTimer(Number(b.dataset.rest))));$('#resumeButton').addEventListener('click',()=>{A.setView('coach');A.AUDIO.speak(A.buildSpokenInstruction())});$('#finishEarlyButton').addEventListener('click',A.finishSession);
    $('#effortChoices').addEventListener('click',e=>{const b=e.target.closest('.choice');if(!b)return;A.chooseInGroup($('#effortChoices'),b.dataset.value);A.reviewChoice.effort=b.dataset.value;A.updateReviewFeedback()});$('#alignmentChoices').addEventListener('click',e=>{const b=e.target.closest('.choice');if(!b)return;A.chooseInGroup($('#alignmentChoices'),b.dataset.value);A.reviewChoice.alignment=b.dataset.value;A.updateReviewFeedback()});$('#saveReviewClipButton').addEventListener('click',saveCurrentClip);$('#acceptAttemptButton').addEventListener('click',A.acceptAttempt);$('#tryAgainButton').addEventListener('click',()=>{A.setView('coach');$('#coachStatus').textContent='Try the same size again—not a more extreme version.'});
    $('#inputDeviceSelect').addEventListener('change',e=>{A.state.micDevice=e.target.value;A.AUDIO.setDevice(A.state.micDevice);A.AUDIO.stopStream();A.saveState()});$('#runMicCheckButton').addEventListener('click',runMicCheck);
    $('#fixerOptions').addEventListener('click',e=>{const b=e.target.closest('[data-fix]');if(b)selectFix(b.dataset.fix)});$('#hearFixButton').addEventListener('click',hearFix);$('#applyFixButton').addEventListener('click',applyFix);$('#fixerBackButton').addEventListener('click',()=>A.setView(A.session?'coach':'home'));
    $('#exportButton').addEventListener('click',exportProgress);$('#deleteDataButton').addEventListener('click',deleteAll);
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();A.installPrompt=e;$('#installButton').classList.remove('hidden')});$('#installButton').addEventListener('click',async()=>{if(!A.installPrompt){A.toast('Use your browser menu and choose Install app or Add to Home screen.');return}A.installPrompt.prompt();await A.installPrompt.userChoice;A.installPrompt=null;$('#installButton').classList.add('hidden')});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)A.AUDIO.stopSpeech()})
  }

  async function init(){try{A.db=await A.openDB()}catch{A.db=null}A.AUDIO.setDevice(A.state.micDevice);renderFixer();wire();A.renderHome();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{})}
  A.prepareMicView=prepareMicView;A.renderProgress=renderProgress;
  document.addEventListener('DOMContentLoaded',init);
})();
