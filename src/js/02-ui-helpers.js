/* ---------- UI helpers ---------- */
const site=()=>SITES[state.site];
function el(h){const t=document.createElement("template");t.innerHTML=h.trim();return t.content.firstChild}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function scrollBottom(){if(state.holdTop&&Date.now()<state.holdTop){feed.scrollTop=0;return}feed.scrollTop=feed.scrollHeight}
function push(node){feed.appendChild(node);scrollBottom();requestAnimationFrame(scrollBottom);setTimeout(scrollBottom,250);setTimeout(scrollBottom,700);if(state.onboarded||!state.judge)THR.sched();return node}
