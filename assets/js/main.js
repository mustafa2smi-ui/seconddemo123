// diagnostic: show visible error if POSTS missing or empty
if(!window.POSTS || !Array.isArray(window.POSTS) || window.POSTS.length===0){
  document.body.insertAdjacentHTML('afterbegin',
    '<div style="background:#ffdddd;color:#900;padding:10px;text-align:center;">Debug: No posts found (check /assets/js/posts.js and script order).</div>');
}
// assets/js/main.js
const PAGE_SIZE = 5; // change to 3 if you want
let currentPage = 1;
const postsListEl = document.getElementById('posts-list');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const showMoreBtn = document.getElementById('show-more-btn');

function renderPosts(page=1, append=false){
  const start = (page-1)*PAGE_SIZE;
  const slice = window.POSTS.slice(start, start+PAGE_SIZE);
  const html = slice.map(p => `
    <article class="post-card">
      <a href="${p.path}" class="post-link">
        <img loading="lazy" src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p class="excerpt">${p.excerpt}</p>
        <time>${p.date}</time>
      </a>
      <div class="card-actions">
        <button onclick='shareUrl("${p.path}", "${p.title}")'>Share</button>
        <button onclick='triggerTTSForPath("${p.path}")'>Play</button>
      </div>
    </article>`).join('');
  if(append) postsListEl.insertAdjacentHTML('beforeend', html);
  else postsListEl.innerHTML = html;
  updateNav();
}

function updateNav(){
  const totalPages = Math.ceil(window.POSTS.length / PAGE_SIZE) || 1;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

prevBtn.addEventListener('click', ()=>{ if(currentPage>1){ currentPage--; renderPosts(currentPage); }});
nextBtn.addEventListener('click', ()=>{ const totalPages=Math.ceil(window.POSTS.length/PAGE_SIZE); if(currentPage<totalPages){ currentPage++; renderPosts(currentPage); }});
showMoreBtn.addEventListener('click', ()=>{ currentPage++; renderPosts(currentPage, true); });

// share function
async function shareUrl(url, title){
  const full = location.origin + url;
  if(navigator.share){
    try{
      await navigator.share({title, url: full});
    }catch(e){ console.log('Share cancelled', e); }
  } else {
    // fallback copy
    try {
      await navigator.clipboard.writeText(full);
      alert('Link copied to clipboard');
    } catch (err) {
      prompt('Copy this link:', full);
    }
  }
}

// Trigger site-wide TTS by reading remote post (fetch and read)
async function triggerTTSForPath(path){
  try{
    const res = await fetch(path);
    const html = await res.text();
    // simple extraction: grab <article id="article"> or body text fallback
    const tmp = document.createElement('div'); tmp.innerHTML = html;
    const article = tmp.querySelector('#article') || tmp.querySelector('article') || tmp.querySelector('main') || tmp;
    const text = (article && article.innerText) ? (tmp.querySelector('h1')?.innerText || '') + "\n" + article.innerText : tmp.innerText;
    window.TTS && window.TTS.speak(text);
  }catch(e){ console.error(e); alert('Failed to fetch post for audio.'); }
}

// Request notification permission (simple)
async function askNotifyPermission(){
  if(!("Notification" in window)) return;
  if(Notification.permission === 'default') await Notification.requestPermission();
}
askNotifyPermission();

// show simple notification while user is on site
function showLocalNotification(title, body){
  if(Notification.permission === 'granted'){
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}
// Audio Player Reference
const audioPlayer = document.getElementById("audioPlayer");

// Play attempt check
function tryPlayAudio() {
  if (!audioPlayer.src || audioPlayer.src.trim() === "") {
    alert("⚠️ First Select Post");
    return;
  }
  audioPlayer.play();
}

// Post load hone par audio set karo
function loadPost(postFile) {
  fetch(postFile)
    .then(response => response.text())
    .then(data => {
      document.getElementById("postContent").innerHTML = data;

      // Example: Post ka text audio ke liye set karo
      const text = document.getElementById("postContent").innerText;
      const audioUrl = generateTTS(text); // tts.js function
      audioPlayer.src = audioUrl;

      console.log("✅ Post loaded + audio ready");
    });
}
// init
renderPosts(1);
