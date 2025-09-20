// assets/js/main.js

const PAGE_SIZE = 5; // change to 3 if you want
let currentPage = 1;
const postsListEl = document.getElementById('posts-list');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const showMoreBtn = document.getElementById('show-more-btn');
const postContentEl = document.getElementById('postContent');
const audioPlayer = document.getElementById("audioPlayer");

// ---------------- Render Posts ----------------
function renderPosts(page=1, append=false){
  const start = (page-1)*PAGE_SIZE;
  const slice = window.POSTS.slice(start, start+PAGE_SIZE);
  const html = slice.map(p => `
    <article class="post-card">
      <a href="javascript:void(0)" onclick="loadPost('${p.path}')">
        <img loading="lazy" src="${p.image}" alt="${p.title}">
        <h3>${p.title}</h3>
        <p class="excerpt">${p.excerpt}</p>
        <time>${p.date}</time>
      </a>
      <div class="card-actions">
        <button onclick='shareUrl("${p.path}", "${p.title}")'>Share</button>
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

prevBtn.addEventListener('click', ()=>{
  if(currentPage>1){
    currentPage--;
    renderPosts(currentPage);
  }
});
nextBtn.addEventListener('click', ()=>{
  const totalPages=Math.ceil(window.POSTS.length/PAGE_SIZE);
  if(currentPage<totalPages){
    currentPage++;
    renderPosts(currentPage);
  }
});
showMoreBtn.addEventListener('click', ()=>{
  currentPage++;
  renderPosts(currentPage, true);
});

// ---------------- Share ----------------
async function shareUrl(url, title){
  const full = location.origin + url;
  if(navigator.share){
    try{
      await navigator.share({title, url: full});
    }catch(e){ console.log('Share cancelled', e); }
  } else {
    try {
      await navigator.clipboard.writeText(full);
      alert('✅ Link copied to clipboard');
    } catch (err) {
      prompt('Copy this link:', full);
    }
  }
}

// ---------------- Audio Player ----------------
function tryPlayAudio() {
  if (!audioPlayer.src || audioPlayer.src.trim() === "") {
    alert("⚠️ First Select Post\n\n👉 Please open a post before playing audio.");
    return;
  }
  audioPlayer.play();
}

// ---------------- Load Post ----------------
function loadPost(postFile) {
  fetch(postFile)
    .then(response => response.text())
    .then(data => {
      postContentEl.innerHTML = data;

      // Extract text for TTS
      const text = postContentEl.innerText.trim();
      if(text){
        const audioUrl = generateTTS(text); // from tts.js
        audioPlayer.src = audioUrl;
      }
      window.scrollTo({ top: postContentEl.offsetTop - 20, behavior: 'smooth' });

      console.log("✅ Post loaded + audio ready");
    })
    .catch(err => {
      console.error(err);
      alert("❌ Failed to load post");
    });
}

// ---------------- Notification ----------------
async function askNotifyPermission(){
  if(!("Notification" in window)) return;
  if(Notification.permission === 'default') await Notification.requestPermission();
}
askNotifyPermission();

function showLocalNotification(title, body){
  if(Notification.permission === 'granted'){
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

// ---------------- Init ----------------
renderPosts(1);
