// assets/js/tts.js
window.TTS = (function(){
  const synth = window.speechSynthesis;
  let currentUtter = null;
  function speak(text){
    if(!('speechSynthesis' in window)){ alert('TTS not supported'); return; }
    if(synth.speaking) synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN'; // change as needed
    u.rate = 1;
    u.onend = ()=>{ /* UI updates if needed */ };
    synth.speak(u);
    currentUtter = u;
  }
  function stop(){ if(synth.speaking) synth.cancel(); }
  return { speak, stop };
})();
