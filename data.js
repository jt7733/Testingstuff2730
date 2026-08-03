'use strict';

window.JVS_DATA = (() => {
  const days = [
    {
      title: 'Ease and breath pacing',
      description: 'Build a comfortable base and finish phrases before your breath is empty.',
      exercises: [
        { skill:'Comfort', icon:'🫧', title:'Settle the voice', why:'Remove unnecessary effort before changing anything.', setup:'Head supported, jaw loose, and one ordinary breath.', find:'Let out a tiny, easy “mmm” for about one second.', build:'Repeat it once, then add “me” without getting louder.', phrase:'Mmm… me.', do:'Keep the sound small and stop early.', feel:'Easy vibration without throat squeeze.', avoid:'A huge breath or a long sustained hum.', focus:'ease' },
        { skill:'Breath pacing', icon:'⏸️', title:'Stop before empty', why:'Your pauses should sound planned, not like failure.', setup:'Use an ordinary breath. Do not fill to maximum.', find:'Say “pretty good” and stop.', build:'Add a second breath group only after a comfortable pause.', phrase:'I’m feeling pretty good / today.', do:'Pause at the slash and take another normal breath.', feel:'The last word stays clear.', avoid:'Squeezing out “today” on empty air.', focus:'breath' },
        { skill:'Clear endings', icon:'🔹', title:'Keep the final word', why:'Low air can make the end of a phrase disappear.', setup:'Choose a shorter sentence than you think you need.', find:'Say only “sounds nice”.', build:'Keep “nice” as clear as the first word.', phrase:'That sounds really nice.', do:'Spend less air at the beginning.', feel:'The ending stays present.', avoid:'Starting loud and fading away.', focus:'ending' },
        { skill:'Real speech', icon:'💬', title:'Your voice, slightly lighter', why:'The goal is not a character—it is your own voice with less heaviness.', setup:'Use your normal speaking pitch.', find:'Say “yeah” with ten percent less weight.', build:'Carry that into one boring sentence.', phrase:'Yeah, that makes sense.', do:'Stay close to your usual voice.', feel:'Familiar, but a little easier and lighter.', avoid:'Jumping into a high, breathy performance.', focus:'weight' }
      ]
    },
    {
      title: 'Forward resonance',
      description: 'Explore a brighter sound near the lips and front teeth without forcing pitch.',
      exercises: [
        { skill:'Resonance', icon:'👄', title:'Find a small forward buzz', why:'A forward shape can sound brighter without needing a very high pitch.', setup:'Jaw loose, lips softly together.', find:'Make a tiny “mmm” and notice the lips.', build:'Open into “mee” while keeping the same small feeling.', phrase:'Mmm… mee.', do:'Imagine the sound landing behind the front teeth.', feel:'A light buzz near the lips.', avoid:'Trying to drag the voice physically up the throat.', focus:'resonance' },
        { skill:'Resonance', icon:'✨', title:'Carry it into a word', why:'The useful skill is keeping the brighter shape after the hum ends.', setup:'Start with one easy “mmm”.', find:'Say “maybe” immediately after it.', build:'Reduce the hum until the word can start forward by itself.', phrase:'Mmm… maybe.', do:'Keep the first syllable small and clear.', feel:'The word starts near the front of the mouth.', avoid:'Pinching the nose or sounding deliberately nasal.', focus:'resonance' },
        { skill:'Short phrase', icon:'🌤️', title:'Keep brightness through a phrase', why:'The sound often falls back when a sentence gets longer.', setup:'Use only the first breath group initially.', find:'Say “maybe we can”.', build:'Add the second group after a pause.', phrase:'Maybe we can / try that.', do:'Restart the forward shape after the pause.', feel:'Both groups begin clearly.', avoid:'Forcing the whole sentence in one breath.', focus:'resonance' },
        { skill:'Real speech', icon:'💬', title:'Friendly greeting', why:'A practical greeting should feel natural, not performed.', setup:'Do not aim for your highest voice.', find:'Say “Hi” with a small smile.', build:'Keep the rest conversational.', phrase:'Hi / how are you today?', do:'Use a small smile and light first word.', feel:'Friendly and clear.', avoid:'A breathy “girly” character voice.', focus:'integration' }
      ]
    },
    {
      title: 'Lighter vocal weight',
      description: 'Reduce thickness while keeping the sound clear—not whispery.',
      exercises: [
        { skill:'Vocal weight', icon:'🪶', title:'Ten percent lighter', why:'A small reduction in heaviness is more usable than a dramatic fake voice.', setup:'Use your normal pitch and volume.', find:'Say “yeah” normally, then ten percent lighter.', build:'Keep the consonant clear.', phrase:'Yeah.', do:'Make the sound smaller, not quieter.', feel:'Clear but less thick.', avoid:'Whispering or leaking lots of air.', focus:'weight' },
        { skill:'Vocal weight', icon:'🔸', title:'Light but connected', why:'Breathiness can disguise heaviness but becomes tiring and unstable.', setup:'Start with “vvv” to create clear vibration.', find:'Move from “vvv” into “very”.', build:'Keep the voice connected through the word.', phrase:'Vvv… very.', do:'Use less air and clearer consonants.', feel:'Light, clean vibration.', avoid:'A soft whisper with no core sound.', focus:'weight' },
        { skill:'Contrast', icon:'↔️', title:'Choose the useful version', why:'Hearing contrast helps you notice weight rather than guessing.', setup:'Say the phrase once normally.', find:'Say it again slightly lighter.', build:'Choose the version that still feels like you.', phrase:'I know.', do:'Change only one thing: vocal weight.', feel:'The second version is easier, not weaker.', avoid:'Changing pitch, volume and accent all at once.', focus:'weight' },
        { skill:'Real speech', icon:'💬', title:'Natural reaction', why:'Short reactions are good places to practise a lighter default.', setup:'Picture a real conversation.', find:'Say only “really?”.', build:'Let it rise slightly without becoming a squeak.', phrase:'Really? / You think so?', do:'Keep it light and conversational.', feel:'Curious, not performed.', avoid:'Overdoing a stereotyped girly voice.', focus:'integration' }
      ]
    },
    {
      title: 'Comfortable pitch',
      description: 'Lift your speaking centre slightly without falsetto, strain or chasing a number.',
      exercises: [
        { skill:'Pitch', icon:'↗️', title:'A tiny lift', why:'A small sustainable change works better than jumping high.', setup:'Begin at your ordinary speaking pitch.', find:'Say “mm-hm” just slightly above your baseline.', build:'Keep the throat as relaxed as before.', phrase:'Mm-hm.', do:'Think one small step, not a leap.', feel:'Slightly higher but still connected.', avoid:'Falsetto, squeaking or throat squeeze.', focus:'pitch' },
        { skill:'Pitch', icon:'🎈', title:'Carry the lift into a word', why:'The pitch should stay conversational rather than becoming a single high note.', setup:'Use the tiny “mm-hm” as a starting cue.', find:'Say “maybe” at the same comfortable centre.', build:'Let the word move naturally rather than staying flat.', phrase:'Maybe.', do:'Keep the beginning easy and clear.', feel:'A modest lift with no strain.', avoid:'Trying to sound dramatically female in one word.', focus:'pitch' },
        { skill:'Pitch and weight', icon:'🪶', title:'Higher is not enough', why:'Pitch without lighter weight often sounds forced.', setup:'Choose a comfortable slightly raised centre.', find:'Add ten percent lighter weight.', build:'Keep clear consonants.', phrase:'That sounds nice.', do:'Use a small pitch lift plus lighter weight.', feel:'Connected and easy.', avoid:'High and breathy.', focus:'integration' },
        { skill:'Real speech', icon:'💬', title:'Short conversational line', why:'Use the voice in a phrase you might actually say.', setup:'Break at the slash if needed.', find:'Practise the first group.', build:'Add the second after a normal breath.', phrase:'I’ll have a look / in a minute.', do:'Let the important word move slightly.', feel:'Normal speech with a lighter centre.', avoid:'Holding one artificial pitch throughout.', focus:'pitch' }
      ]
    },
    {
      title: 'Intonation and expression',
      description: 'Use gentle pitch movement and emphasis without turning speech into a caricature.',
      exercises: [
        { skill:'Intonation', icon:'〰️', title:'Move one important word', why:'Natural feminine speech often uses more varied emphasis, but not constant sing-song movement.', setup:'Say the sentence normally first.', find:'Emphasise only “really”.', build:'Let the rest settle naturally.', phrase:'That sounds really nice.', do:'Lift one important word slightly.', feel:'Expression without performance.', avoid:'Making every word bounce.', focus:'intonation' },
        { skill:'Question shape', icon:'❓', title:'A gentle question', why:'Questions can rise without becoming squeaky.', setup:'Use a comfortable pitch centre.', find:'Say “really?” with a small rise.', build:'Keep the start clear and the ending easy.', phrase:'Really? / You think so?', do:'Use a gentle rise at the question.', feel:'Curious and natural.', avoid:'A huge pitch jump on the final word.', focus:'intonation' },
        { skill:'Warm statement', icon:'☀️', title:'Let a statement settle', why:'Not every feminine sentence needs an upward ending.', setup:'Choose a warm, calm tone.', find:'Emphasise “glad”.', build:'Let the final word settle rather than disappear.', phrase:'I’m really glad you came.', do:'Use warmth and one clear emphasis.', feel:'Friendly and grounded.', avoid:'Forcing every sentence upward.', focus:'intonation' },
        { skill:'Professional speech', icon:'💼', title:'Confident and feminine', why:'A feminine voice can still sound direct and competent.', setup:'Use a clear, ordinary volume.', find:'Keep “thanks” light and forward.', build:'Use planned breath groups.', phrase:'Thanks for sending that / I’ll review it today.', do:'Stay clear and measured.', feel:'Confident without heaviness.', avoid:'Becoming tiny or apologetic.', focus:'integration' }
      ]
    },
    {
      title: 'Real-life voice',
      description: 'Use the skills in partner, gaming, medical and everyday phrases.',
      exercises: [
        { skill:'Partner', icon:'💗', title:'Relaxed home voice', why:'Your ordinary voice matters more than a glamorous performance.', setup:'Picture speaking to Sammy at home.', find:'Use a warm, light “hey”.', build:'Pause naturally if needed.', phrase:'Hey / do you want to watch something?', do:'Keep it relaxed and familiar.', feel:'Like you, not a character.', avoid:'Trying to make every word cute.', focus:'integration' },
        { skill:'Gaming', icon:'🎮', title:'Fast useful phrase', why:'Your feminine voice should survive normal interests and excitement.', setup:'Do not take a huge preparatory breath.', find:'Say the first short command.', build:'Add the second phrase after a pause.', phrase:'Give me a second / and I’ll join.', do:'Keep consonants clear and light.', feel:'Quick but not squeezed.', avoid:'Dropping into a heavy voice under pressure.', focus:'integration' },
        { skill:'Doctor', icon:'🩺', title:'Clear personal statement', why:'You need a voice that remains understandable during serious conversations.', setup:'Use short planned groups.', find:'Practise “I want to discuss something personal”.', build:'Add the second group only if comfortable.', phrase:'I want to discuss something personal / about my gender.', do:'Use calm clarity over high pitch.', feel:'Steady and honest.', avoid:'Running out of breath at the important word.', focus:'breath' },
        { skill:'Everyday', icon:'☕', title:'Ordinary Julie', why:'The goal includes boring daily life, not only glamorous moments.', setup:'Imagine a normal afternoon.', find:'Say the first group naturally.', build:'Keep the ending clear.', phrase:'I’m working from home / this afternoon.', do:'Use your own accent and rhythm.', feel:'Comfortably feminine, not staged.', avoid:'Copying someone else’s personality.', focus:'integration' }
      ]
    },
    {
      title: 'Review and choose your voice',
      description: 'Compare what felt useful and choose the qualities you want to keep developing.',
      exercises: [
        { skill:'Review', icon:'🎧', title:'Find your easiest cue', why:'The best cue is the one your body can repeat without strain.', setup:'Think back to the week.', find:'Choose one cue: small smile, forward buzz, lighter weight or shorter phrase.', build:'Use only that cue in the sentence.', phrase:'Hi / this is my voice.', do:'Change one thing only.', feel:'Repeatable and recognisable.', avoid:'Trying to prove everything at once.', focus:'integration' },
        { skill:'Review', icon:'🔁', title:'Repeat your best word', why:'A reliable word can become an anchor for conversation.', setup:'Choose “maybe”, “really”, “hello” or another favourite.', find:'Say it once comfortably.', build:'Repeat after a full rest.', phrase:'Maybe.', do:'Match the easiest version—not the highest.', feel:'Consistent and calm.', avoid:'Repeating rapidly until it deteriorates.', focus:'integration' },
        { skill:'Conversation', icon:'💬', title:'Twenty-second practice', why:'The final aim is conversation, not isolated sounds.', setup:'Use short groups and pause whenever needed.', find:'Start with one sentence.', build:'Add a second only if the voice stays easy.', phrase:'I had a pretty good day / and I’m taking it easy tonight.', do:'Protect the last word of each group.', feel:'Natural, clear and sustainable.', avoid:'Pushing through fatigue to finish.', focus:'breath' },
        { skill:'Choice', icon:'⭐', title:'Keep what feels like you', why:'There is no single correct feminine voice.', setup:'Use the quality you liked best this week.', find:'Say the phrase once.', build:'Listen back without hunting for perfection.', phrase:'This feels more like me.', do:'Notice one thing you want to keep.', feel:'Recognition rather than performance.', avoid:'Judging the entire voice from one recording.', focus:'integration' }
      ]
    }
  ];

  const fixes = {
    deep: { label:'Still sounds too deep', title:'Do not jump higher—make the space smaller.', explanation:'A dark sound is often more about resonance and weight than pitch alone.', do:'Start with a tiny “mmm”, then open into “me” while keeping the front-of-mouth feeling.', feel:'A light buzz near the lips and a slightly smaller sound.', avoid:'Yanking the voice upward or using falsetto.', phrase:'Mmm… me.' },
    breathy: { label:'Too breathy or weak', title:'Use less leaking air and clearer consonants.', explanation:'Breathiness can feel feminine at first, but too much makes the voice weak and tiring.', do:'Try “vvv” before the word and keep the vibration connected.', feel:'A clean core to the sound.', avoid:'Whispering or pushing more breath.', phrase:'Vvv… very.' },
    nasal: { label:'Too nasal', title:'Keep brightness, but open the mouth slightly.', explanation:'Forward resonance is not the same as squeezing sound through the nose.', do:'Relax the nose area, open the jaw a little and aim the word through the lips.', feel:'Brightness at the front without a pinched tone.', avoid:'Closing the mouth or forcing a nose buzz.', phrase:'Maybe.' },
    strained: { label:'Strained or too high', title:'Come down and make it smaller.', explanation:'Strain means the current target is not sustainable.', do:'Return close to your normal pitch and keep only the lighter weight.', feel:'The throat releases and the sound reconnects.', avoid:'Chasing a number or proving you can go higher.', phrase:'Hello.' },
    breath: { label:'Running out of breath', title:'Shorter is stronger.', explanation:'Your C4 breath pattern needs planned groups rather than forcing long sentences.', do:'Stop at the slash, breathe normally, then begin the next group clearly.', feel:'The last word remains as clear as the first.', avoid:'Using every bit of air before pausing.', phrase:'That sounds lovely / today.' },
    fake: { label:'Sounds fake or like a character', title:'Move only ten percent.', explanation:'Changing pitch, weight, resonance and personality at once creates a performed voice.', do:'Use your ordinary accent and pitch, then reduce heaviness slightly.', feel:'Mostly like you, with one small useful change.', avoid:'Copying a stereotyped “girly” character.', phrase:'Yeah, that makes sense.' },
    flat: { label:'Too flat or monotone', title:'Move one important word.', explanation:'You do not need to make the whole sentence sing-song.', do:'Choose one word and lift or lengthen it slightly.', feel:'One clear point of expression.', avoid:'Bouncing every word.', phrase:'That sounds REALLY nice.' },
    drop: { label:'Drops at the end', title:'Spend less air at the beginning.', explanation:'The voice may become heavy or disappear when the breath is nearly empty.', do:'Start smaller and pause earlier.', feel:'The final word stays present.', avoid:'Beginning loudly and squeezing the ending.', phrase:'Pretty good / today.' },
    buzz: { label:'Cannot feel the forward buzz', title:'Try vibration before humming.', explanation:'Some people notice “vvv” or “zzz” more easily than “mmm”.', do:'Make a tiny “vvv” for one second, then open into “vee”.', feel:'Vibration around the lips or front teeth.', avoid:'Pushing harder when the feeling is subtle.', phrase:'Vvv… vee.' },
    quiet: { label:'Microphone says I am too quiet', title:'Move the device—not your voice.', explanation:'A badly positioned microphone should not dictate your breathing or volume.', do:'Move the microphone slightly closer and keep your ordinary voice.', feel:'No extra physical effort.', avoid:'Shouting for the meter.', phrase:'Hi, this is my comfortable voice.' }
  };

  return { days, fixes };
})();
