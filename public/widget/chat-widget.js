"use strict";(()=>{var z={CLOSED:"conversation_closed"},r={ACTIVE:"active",HANDOFF_REQUESTED:"handoff_requested",QUEUED:"queued",HUMAN_ACTIVE:"human_active",ESCALATED:"escalated",CLOSED:"closed"};function we(W){switch(W){case"handoff_requested":return r.HANDOFF_REQUESTED;case"queued":return r.QUEUED;case"human_active":return r.HUMAN_ACTIVE;case"escalated":return r.ESCALATED;case"resolved":case"closed":return r.CLOSED;default:return r.ACTIVE}}(function(){"use strict";let W=document.currentScript,T=W?.getAttribute("data-api-key")??"",I=(W?.getAttribute("data-api-url")??window.location.origin).replace(/\/$/,"");if(!T)return;let b={botName:"Support",welcomeMessage:"Hi there! How can we help you today?",brandColor:"#6366f1",widgetPosition:"right",poweredBy:!0,typingIndicators:!0,aiShowSources:!1,aiCollectFeedback:!0,requireEmail:!1,identityVerification:!1,officeHoursEnabled:!1,officeHoursSchedule:null,officeHoursAutoReply:!1,autoTranslate:!1,detectLanguage:!1,language:"en",guidance:[]},k=!1,ie="home",g=null,h=[],M=!1,X=xe(),H=localStorage.getItem("__cw_email")||"",Z=localStorage.getItem("__cw_name")||"",Q=!1,U=null,P=null,l=r.ACTIVE,O=!1,R=null,J=!1,q=0,ae=!1,se=[],ee=new Set(JSON.parse(localStorage.getItem("__cw_ob_dismissed")||"[]")),re=new Set,p={banners:[],tooltips:[],chatPopups:[],tours:[],checklists:[],posts:[]},C=0,E=null,me=Date.now(),ce=parseInt(localStorage.getItem("__cw_visit_count")||"0",10)+1,te=parseInt(sessionStorage.getItem("__cw_session_count")||"0",10);sessionStorage.getItem("__cw_session_started")||(te++,sessionStorage.setItem("__cw_session_started","1"),sessionStorage.setItem("__cw_session_count",String(te))),localStorage.setItem("__cw_visit_count",String(ce));function xe(){let e="__cw_uid",n=localStorage.getItem(e);return n||(n="anon_"+Math.random().toString(36).slice(2,10),localStorage.setItem(e,n)),n}function d(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function L(){return"msg_"+Date.now()+"_"+Math.random().toString(36).slice(2,6)}function ve(e){return new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}function ye(e,n){let o=parseInt(e.replace("#",""),16),t=Math.max(0,(o>>16)-n),a=Math.max(0,(o>>8&255)-n),i=Math.max(0,(o&255)-n);return"#"+(t<<16|a<<8|i).toString(16).padStart(6,"0")}function ke(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}function V(e){return we(typeof e=="string"?e:null)}async function Ee(){try{let e=await fetch(`${I}/api/widget/config`,{headers:{"x-tenant-api-key":T}});if(e.ok){let n=await e.json();b={...b,...n}}}catch{}Q=!b.requireEmail||!!H}function Se(e){return e.type==="all"||!e.rules||e.rules.length===0?!0:e.rules.every(n=>{let{field:o,operator:t,value:a}=n,i="";switch(o.toLowerCase().replace(/\s+/g,"_")){case"current_page_url":case"page_url":i=window.location.href;break;case"time_on_current_page":case"time_on_page":i=Math.floor((Date.now()-me)/1e3);break;case"visit_count":i=ce;break;case"session_count":i=te;break;case"browser_language":i=navigator.language||"";break;case"user_type":i=H?"User":"Visitors";break;default:return!0}let c=String(i).toLowerCase(),u=a.toLowerCase(),x=typeof i=="number"?i:parseFloat(c),f=parseFloat(u.replace(/[^0-9.]/g,""));switch(t){case"is":return c===u;case"is not":case"is_not":return c!==u;case"contains":return c.includes(u);case"greater than":case"greater_than":return!isNaN(x)&&!isNaN(f)&&x>f;case"less than":case"less_than":return!isNaN(x)&&!isNaN(f)&&x<f;default:return!0}})}async function Te(){try{let e=await fetch(`${I}/api/widget/outbound`,{headers:{"x-tenant-api-key":T}});e.ok&&(se=(await e.json()).messages||[])}catch{}}function de(){p={banners:[],tooltips:[],chatPopups:[],tours:[],checklists:[],posts:[]};for(let e of se)if(!ee.has(e.id)&&Se(e.audience))switch(e.channel){case"banner":p.banners.push(e);break;case"tooltip":p.tooltips.push(e);break;case"chat":p.chatPopups.push(e);break;case"product-tour":p.tours.push(e);break;case"checklist":p.checklists.push(e);break;case"post":case"news":case"survey":p.posts.push(e);break}}function w(e,n){n==="impression"&&re.has(e)||(n==="impression"&&re.add(e),n==="dismiss"&&(ee.add(e),localStorage.setItem("__cw_ob_dismissed",JSON.stringify([...ee]))),fetch(`${I}/api/widget/outbound/track`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${T}`},body:JSON.stringify({messageId:e,event:n,userId:X,metadata:{url:window.location.href}})}).catch(()=>{}))}function Ce(){let e=b.brandColor,n=b.widgetPosition,o=ye(e,20),t=document.createElement("style");t.id="cw-styles",t.textContent=`
/* Reset */
#cw-root, #cw-root * { box-sizing: border-box; margin: 0; padding: 0; }
#cw-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #1f2937; }

/* Bubble */
#cw-bubble {
  position: fixed; bottom: 24px; ${n}: 24px;
  width: 60px; height: 60px; border-radius: 50%;
  background: ${e}; color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 24px rgba(0,0,0,.18), 0 1px 4px rgba(0,0,0,.06);
  z-index: 99999; transition: all .3s cubic-bezier(.4,0,.2,1);
}
#cw-bubble:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(0,0,0,.22); }
#cw-bubble:active { transform: scale(.96); }
#cw-bubble svg { width: 28px; height: 28px; transition: transform .3s; }
#cw-bubble.open svg { transform: rotate(90deg); }

/* Unread badge */
#cw-badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 20px; height: 20px; border-radius: 10px;
  background: #ef4444; color: #fff; font-size: 11px; font-weight: 700;
  display: none; align-items: center; justify-content: center;
  padding: 0 5px; border: 2px solid #fff;
}
#cw-badge.show { display: flex; }

/* Panel */
#cw-panel {
  position: fixed; bottom: 100px; ${n}: 24px;
  width: 400px; max-width: calc(100vw - 48px);
  height: 600px; max-height: calc(100vh - 124px);
  border-radius: 16px; background: #fff;
  box-shadow: 0 24px 80px rgba(0,0,0,.14), 0 4px 16px rgba(0,0,0,.06);
  z-index: 99999; overflow: hidden;
  display: flex; flex-direction: column;
  opacity: 0; transform: translateY(20px) scale(.96);
  pointer-events: none;
  transition: all .35s cubic-bezier(.4,0,.2,1);
}
#cw-panel.open {
  opacity: 1; transform: translateY(0) scale(1); pointer-events: auto;
}

/* Header */
#cw-header {
  background: linear-gradient(135deg, ${e} 0%, ${o} 100%);
  color: #fff; padding: 20px 20px 16px; position: relative; flex-shrink: 0;
}
#cw-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
#cw-bot-info { display: flex; align-items: center; gap: 10px; }
#cw-bot-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,.2); display: flex;
  align-items: center; justify-content: center;
  font-size: 16px; font-weight: 600; flex-shrink: 0;
}
#cw-bot-name { font-size: 16px; font-weight: 700; }
#cw-bot-status { font-size: 12px; opacity: .85; display: flex; align-items: center; gap: 5px; margin-top: 1px; }
#cw-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; display: inline-block; }
#cw-close {
  background: rgba(255,255,255,.15); border: none; color: #fff;
  cursor: pointer; width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s; flex-shrink: 0;
}
#cw-close:hover { background: rgba(255,255,255,.25); }
#cw-close svg { width: 18px; height: 18px; }

/* Screens container */
#cw-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }

/* Home screen */
#cw-home { flex: 1; display: flex; flex-direction: column; padding: 24px 20px; overflow-y: auto; }
#cw-home.hidden { display: none; }
.cw-welcome-text { font-size: 15px; color: #4b5563; margin-bottom: 24px; line-height: 1.6; }
#cw-start-btn {
  width: 100%; padding: 14px; border: none; border-radius: 12px;
  background: ${e}; color: #fff; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all .2s; display: flex;
  align-items: center; justify-content: center; gap: 8px;
}
#cw-start-btn:hover { background: ${o}; transform: translateY(-1px); box-shadow: 0 4px 16px ${e}44; }
#cw-start-btn:active { transform: translateY(0); }
#cw-start-btn svg { width: 20px; height: 20px; }
.cw-home-topics { margin-top: 20px; }
.cw-home-topics-title { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #9ca3af; font-weight: 600; margin-bottom: 10px; }
.cw-topic-btn {
  width: 100%; padding: 12px 14px; border: 1px solid #e5e7eb;
  border-radius: 10px; background: #fff; color: #374151;
  font-size: 14px; cursor: pointer; text-align: left;
  transition: all .2s; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;
}
.cw-topic-btn:hover { border-color: ${e}; background: ${e}08; color: ${e}; }
.cw-topic-icon { width: 32px; height: 32px; border-radius: 8px; background: ${e}10; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cw-topic-icon svg { width: 16px; height: 16px; fill: ${e}; }

/* Email screen */
#cw-email-screen { flex: 1; display: none; flex-direction: column; padding: 24px 20px; }
#cw-email-screen.active { display: flex; }
.cw-email-icon { width: 56px; height: 56px; border-radius: 16px; background: ${e}10; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.cw-email-icon svg { width: 28px; height: 28px; fill: ${e}; }
.cw-email-title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 6px; color: #111827; }
.cw-email-desc { font-size: 13px; color: #6b7280; text-align: center; margin-bottom: 24px; line-height: 1.5; }
.cw-field { margin-bottom: 14px; }
.cw-field label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 5px; }
.cw-field input {
  width: 100%; padding: 10px 14px; border: 1.5px solid #d1d5db;
  border-radius: 10px; font-size: 14px; outline: none;
  transition: all .2s; background: #f9fafb; font-family: inherit;
}
.cw-field input:focus { border-color: ${e}; background: #fff; box-shadow: 0 0 0 3px ${e}18; }
.cw-field input.error { border-color: #ef4444; }
.cw-field-error { font-size: 12px; color: #ef4444; margin-top: 4px; display: none; }
#cw-email-submit {
  width: 100%; padding: 12px; border: none; border-radius: 10px;
  background: ${e}; color: #fff; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all .2s; margin-top: 4px; font-family: inherit;
}
#cw-email-submit:hover { background: ${o}; }
#cw-email-submit:disabled { opacity: .5; cursor: not-allowed; }

/* Chat screen */
#cw-chat { flex: 1; display: none; flex-direction: column; overflow: hidden; }
#cw-chat.active { display: flex; }

/* Messages */
#cw-messages {
  flex: 1; overflow-y: auto; padding: 16px 16px 8px;
  display: flex; flex-direction: column; gap: 4px;
  scroll-behavior: smooth;
}
#cw-messages::-webkit-scrollbar { width: 4px; }
#cw-messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }

/* Message row */
.cw-msg-row { display: flex; gap: 8px; max-width: 88%; align-items: flex-end; margin-bottom: 2px; }
.cw-msg-row.user { flex-direction: row-reverse; align-self: flex-end; }
.cw-msg-row.assistant { align-self: flex-start; }

/* Avatar */
.cw-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: ${e}; color: #fff; font-size: 12px;
  font-weight: 700; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0;
}
.cw-avatar.user-av { background: #6b7280; }

/* Bubble */
.cw-bubble {
  padding: 10px 14px; border-radius: 18px; font-size: 14px;
  line-height: 1.55; word-break: break-word; position: relative;
  animation: cw-fade-in .25s ease-out;
}
@keyframes cw-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.cw-bubble.user {
  background: ${e}; color: #fff; border-bottom-right-radius: 6px;
}
.cw-bubble.assistant {
  background: #f3f4f6; color: #1f2937; border-bottom-left-radius: 6px;
}
.cw-bubble.system {
  background: transparent; color: #9ca3af;
  font-size: 13px; text-align: center; align-self: center;
  padding: 8px 12px; max-width: 100%;
}

/* Streaming cursor */
.cw-bubble.streaming::after {
  content: '\u258B'; color: ${e}; animation: cw-blink .8s steps(2) infinite; margin-left: 1px;
}
@keyframes cw-blink { 50% { opacity: 0; } }

/* Message meta */
.cw-meta { font-size: 11px; color: #9ca3af; padding: 2px 4px 0; display: flex; align-items: center; gap: 4px; }
.cw-meta.user { justify-content: flex-end; }
.cw-check { width: 12px; height: 12px; }
.cw-check.read { fill: #3b82f6; }
.cw-check.sent { fill: #9ca3af; }

/* Citations */
.cw-citations { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 4px 0; }
.cw-cite {
  font-size: 11px; padding: 3px 8px; border-radius: 6px;
  background: ${e}10; color: ${e}; border: 1px solid ${e}22;
  cursor: default; display: inline-flex; align-items: center; gap: 3px;
}
.cw-cite svg { width: 10px; height: 10px; fill: ${e}; }

/* Typing indicator */
#cw-typing {
  display: none; align-items: center; gap: 8px; padding: 0 16px 8px;
}
#cw-typing.show { display: flex; }
.cw-typing-avatar { width: 28px; height: 28px; border-radius: 50%; background: ${e}; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; }
.cw-typing-dots { display: flex; gap: 4px; padding: 10px 14px; background: #f3f4f6; border-radius: 18px; border-bottom-left-radius: 6px; }
.cw-typing-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #9ca3af;
  animation: cw-typing-bounce 1.4s ease-in-out infinite;
}
.cw-typing-dot:nth-child(2) { animation-delay: .15s; }
.cw-typing-dot:nth-child(3) { animation-delay: .3s; }
@keyframes cw-typing-bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

/* Input area */
#cw-input-area {
  border-top: 1px solid #f0f0f0; padding: 12px 14px;
  display: flex; gap: 8px; align-items: flex-end; background: #fff;
}
#cw-input {
  flex: 1; border: 1.5px solid #e5e7eb; border-radius: 12px;
  padding: 10px 14px; font-size: 14px; outline: none;
  resize: none; min-height: 40px; max-height: 120px;
  line-height: 1.45; font-family: inherit;
  transition: all .2s; background: #f9fafb;
}
#cw-input:focus { border-color: ${e}; background: #fff; box-shadow: 0 0 0 3px ${e}18; }
#cw-input::placeholder { color: #9ca3af; }
#cw-send {
  width: 40px; height: 40px; border-radius: 12px;
  background: ${e}; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .2s;
}
#cw-send:hover { background: ${o}; transform: scale(1.05); }
#cw-send:active { transform: scale(.95); }
#cw-send:disabled { opacity: .4; cursor: default; transform: none; }
#cw-send svg { width: 18px; height: 18px; fill: #fff; }

/* CSAT */
#cw-csat {
  display: none; padding: 16px 20px; border-top: 1px solid #f0f0f0;
  text-align: center; animation: cw-fade-in .3s ease-out;
}
#cw-csat.show { display: block; }
#cw-csat p { font-size: 14px; color: #374151; margin-bottom: 12px; font-weight: 600; }
.cw-stars { display: flex; justify-content: center; gap: 8px; }
.cw-star {
  width: 36px; height: 36px; cursor: pointer; background: none;
  border: none; padding: 0; transition: all .2s; border-radius: 8px;
}
.cw-star:hover { transform: scale(1.25); }
.cw-star svg { width: 36px; height: 36px; }
.cw-star .star-fill { fill: #d1d5db; transition: fill .15s; }
.cw-star.active .star-fill { fill: #f59e0b; }
.cw-star.hovered .star-fill { fill: #fbbf24; }
#cw-csat-thanks { display: none; font-size: 14px; color: #059669; font-weight: 600; padding: 8px 0; }

/* Footer */
#cw-footer {
  text-align: center; font-size: 11px; color: #b0b0b0;
  padding: 6px 0 10px; background: #fff;
}
#cw-footer a { color: #b0b0b0; text-decoration: none; }
#cw-footer a:hover { color: #888; }

/* Responsive */
@media (max-width: 480px) {
  #cw-panel {
    width: 100vw; height: 100vh; max-height: 100vh;
    bottom: 0; ${n}: 0; border-radius: 0;
  }
  #cw-bubble { bottom: 16px; ${n}: 16px; }
}

/* Accessibility */
#cw-root *:focus-visible { outline: 2px solid ${e}; outline-offset: 2px; }

/* \u2500\u2500 Handoff / Queue / Closed States \u2500\u2500 */
#cw-handoff-bar {
  display: none; padding: 10px 16px; text-align: center;
  border-top: 1px solid #f0f0f0; background: #fefce8;
}
#cw-handoff-bar.show { display: block; }
#cw-handoff-bar p { font-size: 13px; color: #854d0e; margin: 0 0 4px; }
#cw-handoff-bar .cw-queue-pos { font-weight: 700; color: ${e}; }

#cw-handoff-btn {
  display: none; width: calc(100% - 32px); margin: 0 16px 8px;
  padding: 8px 14px; border: 1.5px solid #e5e7eb;
  border-radius: 10px; background: #fff; color: #374151;
  font-size: 13px; cursor: pointer; text-align: center;
  transition: all .2s; font-family: inherit;
}
#cw-handoff-btn:hover { border-color: ${e}; background: ${e}08; color: ${e}; }
#cw-handoff-btn.show { display: block; }

#cw-closed-bar {
  display: none; padding: 16px; text-align: center;
  border-top: 1px solid #f0f0f0; background: #f9fafb;
}
#cw-closed-bar.show { display: block; }
#cw-closed-bar p { font-size: 13px; color: #6b7280; margin: 0 0 10px; }
#cw-new-chat-btn {
  padding: 8px 20px; border: none; border-radius: 10px;
  background: ${e}; color: #fff; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .2s; font-family: inherit;
}
#cw-new-chat-btn:hover { background: ${o}; }

/* Human agent badge in message */
.cw-agent-badge {
  display: inline-block; font-size: 10px; padding: 1px 6px;
  border-radius: 4px; background: #dcfce7; color: #166534;
  margin-bottom: 2px; font-weight: 600;
}
.cw-avatar.human-agent { background: #16a34a; }
.cw-bubble.system {
  text-align: center; font-style: italic; font-size: 12px;
  color: #6b7280; padding: 6px 12px; background: transparent;
  border-radius: 0; margin: 8px auto; max-width: 80%;
}

/* \u2500\u2500 Outbound: Banner \u2500\u2500 */
.cw-ob-banner {
  position: fixed; left: 0; right: 0; z-index: 99998;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 12px 20px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  font-size: 14px; line-height: 1.4; color: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,.15); transition: transform .3s ease, opacity .3s ease;
}
.cw-ob-banner.top { top: 0; }
.cw-ob-banner.bottom { bottom: 0; }
.cw-ob-banner.info { background: #3b82f6; }
.cw-ob-banner.warning { background: #f59e0b; color: #1a1a1a; }
.cw-ob-banner.success { background: #22c55e; }
.cw-ob-banner.error { background: #ef4444; }
.cw-ob-banner-body { flex: 1; text-align: center; }
.cw-ob-banner-title { font-weight: 600; margin-bottom: 2px; }
.cw-ob-banner-cta {
  display: inline-block; padding: 6px 16px; border-radius: 6px;
  background: rgba(255,255,255,.2); color: inherit; text-decoration: none;
  font-size: 13px; font-weight: 600; white-space: nowrap; transition: background .2s;
}
.cw-ob-banner-cta:hover { background: rgba(255,255,255,.35); }
.cw-ob-banner-close {
  background: none; border: none; color: inherit; cursor: pointer;
  padding: 4px; opacity: .7; transition: opacity .2s; font-size: 18px; line-height: 1;
}
.cw-ob-banner-close:hover { opacity: 1; }

/* \u2500\u2500 Outbound: Tooltip \u2500\u2500 */
.cw-ob-beacon {
  position: absolute; z-index: 99997; width: 14px; height: 14px;
  border-radius: 50%; cursor: pointer;
}
.cw-ob-beacon-dot {
  width: 14px; height: 14px; border-radius: 50%; background: var(--cw-brand,#6366f1);
}
.cw-ob-beacon-pulse {
  position: absolute; top: -4px; left: -4px; width: 22px; height: 22px;
  border-radius: 50%; background: var(--cw-brand,#6366f1); opacity: .4;
  animation: cw-pulse 2s ease-in-out infinite;
}
@keyframes cw-pulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.5);opacity:0} }
.cw-ob-tooltip-pop {
  position: absolute; z-index: 99997; width: 280px; padding: 16px;
  background: #fff; border-radius: 10px; box-shadow: 0 8px 30px rgba(0,0,0,.15);
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  font-size: 13px; color: #1a1a1a; line-height: 1.5;
}
.cw-ob-tooltip-pop h4 { margin: 0 0 6px; font-size: 14px; font-weight: 600; }
.cw-ob-tooltip-pop p { margin: 0 0 10px; color: #4b5563; }
.cw-ob-tooltip-close {
  position: absolute; top: 8px; right: 8px; background: none; border: none;
  cursor: pointer; color: #9ca3af; font-size: 16px; line-height: 1;
}
.cw-ob-tooltip-close:hover { color: #374151; }
.cw-ob-tooltip-cta {
  display: inline-block; padding: 6px 14px; border-radius: 6px;
  background: var(--cw-brand,#6366f1); color: #fff; text-decoration: none;
  font-size: 13px; font-weight: 600; transition: opacity .2s;
}
.cw-ob-tooltip-cta:hover { opacity: .85; }

/* \u2500\u2500 Outbound: Proactive Chat Popup \u2500\u2500 */
.cw-ob-chat-popup {
  position: fixed; z-index: 99997; width: 320px;
  background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.18);
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  overflow: hidden; animation: cw-popup-in .3s ease;
}
.cw-ob-chat-popup.right { right: 24px; bottom: 90px; }
.cw-ob-chat-popup.left { left: 24px; bottom: 90px; }
@keyframes cw-popup-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.cw-ob-chat-popup-header {
  display: flex; align-items: center; gap: 10px; padding: 14px 16px;
  background: var(--cw-brand,#6366f1); color: #fff;
}
.cw-ob-chat-popup-avatar {
  width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.2);
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;
}
.cw-ob-chat-popup-name { font-weight: 600; font-size: 14px; }
.cw-ob-chat-popup-body { padding: 16px; font-size: 14px; color: #374151; line-height: 1.5; }
.cw-ob-chat-popup-actions { display: flex; gap: 8px; padding: 0 16px 14px; }
.cw-ob-chat-popup-cta {
  flex: 1; padding: 8px 0; text-align: center; border-radius: 8px;
  background: var(--cw-brand,#6366f1); color: #fff; border: none; cursor: pointer;
  font-size: 13px; font-weight: 600; transition: opacity .2s;
}
.cw-ob-chat-popup-cta:hover { opacity: .85; }
.cw-ob-chat-popup-dismiss {
  padding: 8px 14px; text-align: center; border-radius: 8px;
  background: #f3f4f6; color: #6b7280; border: none; cursor: pointer;
  font-size: 13px; transition: background .2s;
}
.cw-ob-chat-popup-dismiss:hover { background: #e5e7eb; }

/* \u2500\u2500 Outbound: Product Tour \u2500\u2500 */
.cw-ob-tour-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 100001; background: rgba(0,0,0,.45);
  pointer-events: auto; transition: opacity .3s;
}
.cw-ob-tour-highlight {
  position: absolute; z-index: 100002; border-radius: 6px;
  box-shadow: 0 0 0 4000px rgba(0,0,0,.45); pointer-events: none;
  transition: top .3s, left .3s, width .3s, height .3s;
}
.cw-ob-tour-popover {
  position: absolute; z-index: 100003; width: 320px; padding: 20px;
  background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.2);
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  animation: cw-popup-in .3s ease;
}
.cw-ob-tour-popover h4 { margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #1a1a1a; }
.cw-ob-tour-popover p { margin: 0 0 16px; font-size: 13px; color: #4b5563; line-height: 1.5; }
.cw-ob-tour-nav { display: flex; align-items: center; justify-content: space-between; }
.cw-ob-tour-step-count { font-size: 12px; color: #9ca3af; }
.cw-ob-tour-btns { display: flex; gap: 8px; }
.cw-ob-tour-btn {
  padding: 6px 14px; border-radius: 6px; border: none; cursor: pointer;
  font-size: 13px; font-weight: 600; transition: opacity .2s;
}
.cw-ob-tour-btn.secondary { background: #f3f4f6; color: #374151; }
.cw-ob-tour-btn.secondary:hover { background: #e5e7eb; }
.cw-ob-tour-btn.primary { background: var(--cw-brand,#6366f1); color: #fff; }
.cw-ob-tour-btn.primary:hover { opacity: .85; }
.cw-ob-tour-close {
  position: absolute; top: 10px; right: 10px; background: none; border: none;
  cursor: pointer; color: #9ca3af; font-size: 18px; line-height: 1;
}
.cw-ob-tour-close:hover { color: #374151; }

/* \u2500\u2500 Outbound: Checklist \u2500\u2500 */
.cw-ob-checklist {
  position: fixed; z-index: 99997; width: 300px;
  background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.18);
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  overflow: hidden; animation: cw-popup-in .3s ease;
}
.cw-ob-checklist.right { right: 24px; bottom: 90px; }
.cw-ob-checklist.left { left: 24px; bottom: 90px; }
.cw-ob-checklist-header {
  padding: 14px 16px 10px; display: flex; align-items: center; justify-content: space-between;
}
.cw-ob-checklist-header h4 { margin: 0; font-size: 15px; font-weight: 600; color: #1a1a1a; }
.cw-ob-checklist-close {
  background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 16px; line-height: 1;
}
.cw-ob-checklist-close:hover { color: #374151; }
.cw-ob-checklist-progress {
  margin: 0 16px 12px; height: 4px; border-radius: 2px; background: #e5e7eb; overflow: hidden;
}
.cw-ob-checklist-bar {
  height: 100%; border-radius: 2px; background: var(--cw-brand,#6366f1); transition: width .3s ease;
}
.cw-ob-checklist-items { padding: 0 8px 12px; }
.cw-ob-checklist-item {
  display: flex; align-items: center; gap: 10px; padding: 8px;
  border-radius: 8px; cursor: pointer; transition: background .2s;
  font-size: 13px; color: #374151;
}
.cw-ob-checklist-item:hover { background: #f9fafb; }
.cw-ob-checklist-item.done { color: #9ca3af; text-decoration: line-through; }
.cw-ob-checklist-check {
  width: 18px; height: 18px; border-radius: 50%; border: 2px solid #d1d5db;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: border-color .2s, background .2s;
}
.cw-ob-checklist-item.done .cw-ob-checklist-check {
  border-color: var(--cw-brand,#6366f1); background: var(--cw-brand,#6366f1);
}

/* \u2500\u2500 Outbound: Post / Announcement Modal \u2500\u2500 */
.cw-ob-post-backdrop {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 100000; background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  animation: cw-fade-in .2s ease;
}
@keyframes cw-fade-in { from{opacity:0} to{opacity:1} }
.cw-ob-post {
  width: 460px; max-width: 90vw; max-height: 80vh; overflow-y: auto;
  background: #fff; border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.25);
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
  animation: cw-popup-in .3s ease;
}
.cw-ob-post-header {
  padding: 20px 24px 0; display: flex; align-items: flex-start; justify-content: space-between;
}
.cw-ob-post-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #1a1a1a; line-height: 1.3; }
.cw-ob-post-close {
  background: none; border: none; cursor: pointer; color: #9ca3af;
  font-size: 20px; line-height: 1; flex-shrink: 0; margin-left: 12px;
}
.cw-ob-post-close:hover { color: #374151; }
.cw-ob-post-body {
  padding: 12px 24px 20px; font-size: 14px; line-height: 1.6; color: #374151;
}
.cw-ob-post-actions { padding: 0 24px 20px; }
.cw-ob-post-cta {
  display: inline-block; padding: 10px 24px; border-radius: 8px;
  background: var(--cw-brand,#6366f1); color: #fff; text-decoration: none;
  font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: opacity .2s;
}
.cw-ob-post-cta:hover { opacity: .85; }
`,document.head.appendChild(t)}function Ie(){let e=b.botName.charAt(0).toUpperCase(),n=document.createElement("div");n.id="cw-root",n.innerHTML=`
      <button id="cw-bubble" aria-label="Open chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span id="cw-badge"></span>
      </button>
      <div id="cw-panel" role="dialog" aria-label="Chat">
        <div id="cw-header">
          <div id="cw-header-top">
            <div id="cw-bot-info">
              <div id="cw-bot-avatar">${d(e)}</div>
              <div>
                <div id="cw-bot-name">${d(b.botName)}</div>
                <div id="cw-bot-status"><span id="cw-status-dot"></span> Online</div>
              </div>
            </div>
            <button id="cw-close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div id="cw-body">
          <div id="cw-home">
            <p class="cw-welcome-text">${d(b.welcomeMessage)}</p>
            <button id="cw-start-btn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>
              Start a conversation
            </button>
            <div class="cw-home-topics" id="cw-topics"></div>
          </div>
          <div id="cw-email-screen">
            <div class="cw-email-icon">
              <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <div class="cw-email-title">Before we chat</div>
            <div class="cw-email-desc">Enter your details so we can give you the best support experience.</div>
            <div class="cw-field">
              <label for="cw-name-input">Name</label>
              <input id="cw-name-input" type="text" placeholder="Your name" autocomplete="name" />
            </div>
            <div class="cw-field">
              <label for="cw-email-input">Email <span style="color:#ef4444">*</span></label>
              <input id="cw-email-input" type="email" placeholder="you@example.com" autocomplete="email" required />
              <div class="cw-field-error" id="cw-email-error">Please enter a valid email address</div>
            </div>
            <button id="cw-email-submit">Continue to chat</button>
          </div>
          <div id="cw-chat">
            <div id="cw-messages"></div>
            <div id="cw-typing">
              <div class="cw-typing-avatar">${d(e)}</div>
              <div class="cw-typing-dots">
                <div class="cw-typing-dot"></div>
                <div class="cw-typing-dot"></div>
                <div class="cw-typing-dot"></div>
              </div>
            </div>
            <div id="cw-csat">
              <p>How was your experience?</p>
              <div class="cw-stars" id="cw-stars"></div>
              <div id="cw-csat-thanks">Thank you for your feedback!</div>
            </div>
            <div id="cw-handoff-bar">
              <p>You're in queue \u2014 position <span class="cw-queue-pos" id="cw-queue-pos">\u2026</span></p>
              <p style="font-size:11px;color:#a16207">A human agent will be with you shortly.</p>
            </div>
            <div id="cw-closed-bar">
              <p>This conversation has been closed.</p>
              <button id="cw-new-chat-btn">Start a new conversation</button>
            </div>
            <button id="cw-handoff-btn">\u{1F64B} Talk to a person</button>
            <div id="cw-input-area">
              <textarea id="cw-input" rows="1" placeholder="Type your message\u2026" aria-label="Message"></textarea>
              <button id="cw-send" aria-label="Send" disabled>
                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
        ${b.poweredBy?'<div id="cw-footer">Powered by <a href="#">SWEO</a></div>':""}
      </div>
    `,document.body.appendChild(n)}function B(e){ie=e;let n=document.getElementById("cw-home"),o=document.getElementById("cw-email-screen"),t=document.getElementById("cw-chat");n.className=e==="home"?"":"hidden",n.style.display=e==="home"?"flex":"none",o.className=e==="email"?"active":"",t.className=e==="chat"?"active":""}function $(){let e=document.getElementById("cw-messages");if(h.length===0){e.innerHTML="";return}let n=b.botName.charAt(0).toUpperCase(),o="",t="";for(let a=0;a<h.length;a++){let i=h[a],s=a===h.length-1,c=i.role!==t;if(t=i.role,i.role==="system"){o+=`<div class="cw-bubble system">${d(i.content)}</div>`;continue}let u=s&&i.role==="assistant"&&M,x=i.senderType==="human_agent",f=i.role==="assistant"?`<div class="cw-avatar${x?" human-agent":""}">${x?"&#128100;":d(n)}</div>`:'<div class="cw-avatar user-av"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>';if(o+=`<div class="cw-msg-row ${i.role}">`,c?o+=f:o+='<div style="width:28px;flex-shrink:0"></div>',o+="<div>",x&&c&&(o+='<span class="cw-agent-badge">Agent</span>'),o+=`<div class="cw-bubble ${i.role}${u?" streaming":""}">${d(i.content)}</div>`,i.citations&&i.citations.length>0&&b.aiShowSources){o+='<div class="cw-citations">';for(let y of i.citations)o+=`<span class="cw-cite"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/></svg> ${d(y.title)}</span>`;o+="</div>"}if(o+=`<div class="cw-meta ${i.role}">${ve(i.timestamp)}`,i.role==="user"&&i.status){let y=i.status==="read"?"read":"sent";o+=`<svg class="cw-check ${y}" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>`}o+="</div></div></div>"}e.innerHTML=o,e.scrollTop=e.scrollHeight}function Le(){if(!b.typingIndicators)return;ae=!0;let e=document.getElementById("cw-typing");e&&e.classList.add("show")}function A(){ae=!1;let e=document.getElementById("cw-typing");e&&e.classList.remove("show")}function le(){let e=document.getElementById("cw-badge");e&&(q>0&&!k?(e.textContent=q>9?"9+":String(q),e.classList.add("show")):e.classList.remove("show"))}function pe(e){if(document.getElementById("cw-ob-banner-"+e.id))return;let o=e.content.position||"top",t=e.content.style||"info",a=document.createElement("div");a.id="cw-ob-banner-"+e.id,a.className=`cw-ob-banner ${o} ${t}`,a.innerHTML=`
      <div class="cw-ob-banner-body">
        ${e.content.subject?`<div class="cw-ob-banner-title">${d(e.content.subject)}</div>`:""}
        <div>${d(e.content.body)}</div>
      </div>
      ${e.content.ctaUrl?`<a class="cw-ob-banner-cta" href="${d(e.content.ctaUrl)}" target="_blank" rel="noopener">${d(e.content.ctaText||"Learn more")}</a>`:""}
      <button class="cw-ob-banner-close" aria-label="Dismiss">&times;</button>
    `,a.querySelector(".cw-ob-banner-close").addEventListener("click",()=>{a.remove(),w(e.id,"dismiss")});let i=a.querySelector(".cw-ob-banner-cta");i&&i.addEventListener("click",()=>w(e.id,"click")),document.body.appendChild(a),w(e.id,"impression")}function ue(e){let n=e.content.selector;if(!n)return;let o=document.querySelector(n);if(!o||document.getElementById("cw-ob-beacon-"+e.id))return;let a=o.getBoundingClientRect(),i=document.createElement("div");i.id="cw-ob-beacon-"+e.id,i.className="cw-ob-beacon",i.style.cssText=`top:${a.top+window.scrollY+a.height/2-7}px;left:${a.left+window.scrollX+a.width+6}px;`,i.innerHTML='<div class="cw-ob-beacon-pulse"></div><div class="cw-ob-beacon-dot"></div>';let s=!1;i.addEventListener("click",()=>{if(s)return;s=!0;let c=document.createElement("div");c.id="cw-ob-tooltip-pop-"+e.id,c.className="cw-ob-tooltip-pop";let u=i.getBoundingClientRect();c.style.cssText=`top:${u.bottom+window.scrollY+8}px;left:${u.left+window.scrollX-130}px;`,c.innerHTML=`
        <button class="cw-ob-tooltip-close" aria-label="Close">&times;</button>
        ${e.title?`<h4>${d(e.title)}</h4>`:""}
        <p>${d(e.content.body)}</p>
        ${e.content.ctaUrl?`<a class="cw-ob-tooltip-cta" href="${d(e.content.ctaUrl)}" target="_blank" rel="noopener">${d(e.content.ctaText||"Learn more")}</a>`:""}
      `,c.querySelector(".cw-ob-tooltip-close").addEventListener("click",()=>{c.remove(),i.remove(),w(e.id,"dismiss")});let x=c.querySelector(".cw-ob-tooltip-cta");x&&x.addEventListener("click",()=>w(e.id,"click")),document.body.appendChild(c),w(e.id,"impression")}),document.body.appendChild(i)}function fe(e){if(document.getElementById("cw-ob-chat-popup-"+e.id))return;let o=b.widgetPosition||"right",t=document.createElement("div");t.id="cw-ob-chat-popup-"+e.id,t.className=`cw-ob-chat-popup ${o}`;let a=b.botName.charAt(0).toUpperCase();t.innerHTML=`
      <div class="cw-ob-chat-popup-header">
        <div class="cw-ob-chat-popup-avatar">${d(a)}</div>
        <div class="cw-ob-chat-popup-name">${d(b.botName)}</div>
      </div>
      <div class="cw-ob-chat-popup-body">${d(e.content.body)}</div>
      <div class="cw-ob-chat-popup-actions">
        <button class="cw-ob-chat-popup-cta">${d(e.content.ctaText||"Reply")}</button>
        <button class="cw-ob-chat-popup-dismiss">Dismiss</button>
      </div>
    `,t.querySelector(".cw-ob-chat-popup-cta").addEventListener("click",()=>{t.remove(),w(e.id,"click"),k=!0,B("chat");let i=document.getElementById("cw-panel");i&&i.classList.add("open");let s=document.getElementById("cw-bubble");s&&s.classList.add("open")}),t.querySelector(".cw-ob-chat-popup-dismiss").addEventListener("click",()=>{t.remove(),w(e.id,"dismiss")}),document.body.appendChild(t),w(e.id,"impression")}function oe(){if(!E||!E.content.steps)return;let e=E.content.steps;if(C>=e.length){K();return}let n=e[C],o=document.querySelector(n.selector);document.getElementById("cw-ob-tour-highlight")?.remove(),document.getElementById("cw-ob-tour-popover")?.remove();let t=document.getElementById("cw-ob-tour-overlay");if(t||(t=document.createElement("div"),t.id="cw-ob-tour-overlay",t.className="cw-ob-tour-overlay",t.addEventListener("click",a=>{a.target===t&&K()}),document.body.appendChild(t)),o)o.scrollIntoView({behavior:"smooth",block:"center"}),setTimeout(()=>{let a=o.getBoundingClientRect(),i=document.createElement("div");i.id="cw-ob-tour-highlight",i.className="cw-ob-tour-highlight",i.style.cssText=`top:${a.top+window.scrollY-4}px;left:${a.left+window.scrollX-4}px;width:${a.width+8}px;height:${a.height+8}px;`,document.body.appendChild(i);let s=document.createElement("div");s.id="cw-ob-tour-popover",s.className="cw-ob-tour-popover";let c=a.bottom+window.scrollY+12,u=Math.max(10,a.left+window.scrollX-20);s.style.cssText=`top:${c}px;left:${u}px;`,s.innerHTML=be(n,e.length),document.body.appendChild(s),ge(s)},300);else{let a=document.createElement("div");a.id="cw-ob-tour-popover",a.className="cw-ob-tour-popover",a.style.cssText="top:50%;left:50%;transform:translate(-50%,-50%);position:fixed;",a.innerHTML=be(n,e.length),document.body.appendChild(a),ge(a)}}function be(e,n){return`
      <button class="cw-ob-tour-close" aria-label="Close tour">&times;</button>
      <h4>${d(e.title)}</h4>
      <p>${d(e.body)}</p>
      <div class="cw-ob-tour-nav">
        <span class="cw-ob-tour-step-count">${C+1} of ${n}</span>
        <div class="cw-ob-tour-btns">
          ${C>0?'<button class="cw-ob-tour-btn secondary" data-tour="back">Back</button>':""}
          <button class="cw-ob-tour-btn primary" data-tour="next">${C===n-1?"Done":"Next"}</button>
        </div>
      </div>
    `}function ge(e){e.querySelector(".cw-ob-tour-close").addEventListener("click",()=>{K(),E&&w(E.id,"dismiss")});let n=e.querySelector('[data-tour="next"]');n&&n.addEventListener("click",()=>{C++,E&&E.content.steps&&C>=E.content.steps.length?(w(E.id,"click"),K()):oe()});let o=e.querySelector('[data-tour="back"]');o&&o.addEventListener("click",()=>{C>0&&(C--,oe())})}function K(){document.getElementById("cw-ob-tour-overlay")?.remove(),document.getElementById("cw-ob-tour-highlight")?.remove(),document.getElementById("cw-ob-tour-popover")?.remove(),E&&w(E.id,"dismiss"),E=null,C=0}function $e(e){E||!e.content.steps||e.content.steps.length===0||(E=e,C=0,w(e.id,"impression"),oe())}function _e(e){if(document.getElementById("cw-ob-checklist-"+e.id)||!e.content.items||e.content.items.length===0)return;let o=b.widgetPosition||"right",t="__cw_ob_cl_"+e.id,a=new Set(JSON.parse(localStorage.getItem(t)||"[]")),i=document.createElement("div");i.id="cw-ob-checklist-"+e.id,i.className=`cw-ob-checklist ${o}`;function s(){let c=e.content.items,u=c.filter(f=>a.has(f.id)).length,x=Math.round(u/c.length*100);i.innerHTML=`
        <div class="cw-ob-checklist-header">
          <h4>${d(e.title)}</h4>
          <button class="cw-ob-checklist-close" aria-label="Close">&times;</button>
        </div>
        <div class="cw-ob-checklist-progress"><div class="cw-ob-checklist-bar" style="width:${x}%"></div></div>
        <div class="cw-ob-checklist-items">
          ${c.map(f=>{let y=a.has(f.id);return`<div class="cw-ob-checklist-item${y?" done":""}" data-item-id="${d(f.id)}">
              <div class="cw-ob-checklist-check">${y?'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>':""}</div>
              <span>${d(f.label)}</span>
            </div>`}).join("")}
        </div>
      `,i.querySelector(".cw-ob-checklist-close").addEventListener("click",()=>{i.remove(),w(e.id,"dismiss")}),i.querySelectorAll(".cw-ob-checklist-item").forEach(f=>{f.addEventListener("click",()=>{let y=f.dataset.itemId;if(a.has(y))a.delete(y);else{a.add(y);let N=c.find(G=>G.id===y);N?.url&&window.open(N.url,"_blank","noopener")}localStorage.setItem(t,JSON.stringify([...a])),s(),w(e.id,"click")})})}s(),document.body.appendChild(i),w(e.id,"impression")}function Me(e){if(document.getElementById("cw-ob-post-"+e.id))return;let o=document.createElement("div");o.id="cw-ob-post-"+e.id,o.className="cw-ob-post-backdrop",o.innerHTML=`
      <div class="cw-ob-post">
        <div class="cw-ob-post-header">
          <h3>${d(e.title)}</h3>
          <button class="cw-ob-post-close" aria-label="Close">&times;</button>
        </div>
        <div class="cw-ob-post-body">${d(e.content.body)}</div>
        ${e.content.ctaUrl?`
          <div class="cw-ob-post-actions">
            <a class="cw-ob-post-cta" href="${d(e.content.ctaUrl)}" target="_blank" rel="noopener">${d(e.content.ctaText||"Learn more")}</a>
          </div>
        `:""}
      </div>
    `,o.querySelector(".cw-ob-post-close").addEventListener("click",()=>{o.remove(),w(e.id,"dismiss")}),o.addEventListener("click",a=>{a.target===o&&(o.remove(),w(e.id,"dismiss"))});let t=o.querySelector(".cw-ob-post-cta");t&&t.addEventListener("click",()=>w(e.id,"click")),document.body.appendChild(o),w(e.id,"impression")}function Be(){de(),p.banners.length>0&&pe(p.banners[0]);for(let e of p.tooltips)ue(e);p.chatPopups.length>0&&setTimeout(()=>{!k&&p.chatPopups.length>0&&fe(p.chatPopups[0])},3e3),p.tours.length>0&&$e(p.tours[0]),p.checklists.length>0&&_e(p.checklists[0]),p.posts.length>0&&setTimeout(()=>{p.posts.length>0&&Me(p.posts[0])},5e3)}let Ae=null;function ze(){Be(),Ae=setInterval(()=>{de(),p.banners.length>0&&!document.getElementById("cw-ob-banner-"+p.banners[0].id)&&pe(p.banners[0]);for(let e of p.tooltips)ue(e);!k&&p.chatPopups.length>0&&!document.getElementById("cw-ob-chat-popup-"+p.chatPopups[0].id)&&fe(p.chatPopups[0])},1e4)}function Oe(){let e=document.getElementById("cw-stars");if(e)for(let n=1;n<=5;n++){let o=document.createElement("button");o.className="cw-star",o.setAttribute("aria-label",`${n} star`),o.dataset.score=String(n),o.innerHTML='<svg viewBox="0 0 24 24"><path class="star-fill" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>',e.appendChild(o),o.addEventListener("mouseenter",()=>{e.querySelectorAll(".cw-star").forEach(t=>{let a=+t.dataset.score;t.classList.toggle("hovered",a<=n)})}),o.addEventListener("mouseleave",()=>{e.querySelectorAll(".cw-star").forEach(t=>t.classList.remove("hovered"))}),o.addEventListener("click",()=>Ne(n))}}async function Ne(e){if(J||!g)return;J=!0;let n=document.getElementById("cw-stars"),o=document.getElementById("cw-csat-thanks");n.querySelectorAll(".cw-star").forEach(t=>{t.classList.toggle("active",+t.dataset.score<=e),t.classList.remove("hovered"),t.style.pointerEvents="none"});try{await fetch(`${I}/api/conversations/csat`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${T}`},body:JSON.stringify({conversationId:g,score:e})})}catch{}setTimeout(()=>{n.style.display="none",o.style.display="block"},400)}function he(){return l===r.CLOSED||O}function j(){if(J||!g||!b.aiCollectFeedback||!he())return;let e=document.getElementById("cw-csat");e&&e.classList.add("show")}function S(){let e=document.getElementById("cw-handoff-btn"),n=document.getElementById("cw-handoff-bar"),o=document.getElementById("cw-closed-bar"),t=document.getElementById("cw-input-area"),a=document.getElementById("cw-queue-pos");switch(e?.classList.remove("show"),n?.classList.remove("show"),o?.classList.remove("show"),t&&(t.style.display="flex"),l){case r.ACTIVE:h.length>0&&e&&e.classList.add("show");break;case r.HANDOFF_REQUESTED:case r.QUEUED:n?.classList.add("show"),t&&(t.style.display="none"),a&&(a.textContent=R!==null?String(R):"\u2026");break;case r.HUMAN_ACTIVE:t&&(t.style.display="flex");break;case r.CLOSED:o?.classList.add("show"),t&&(t.style.display="none"),j();break;case r.ESCALATED:n?.classList.add("show"),t&&(t.style.display="none");break}}async function De(){if(g&&!(l!==r.ACTIVE&&l!==r.ESCALATED)){l=r.HANDOFF_REQUESTED,S();try{let e=await fetch(`${I}/api/chat/handoff`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${T}`},body:JSON.stringify({conversationId:g,reason:"Customer requested to speak with a human agent"})});if(!e.ok){let o=await e.json().catch(()=>({})),t=V(o.status??r.ACTIVE);l=t,S(),(t===r.QUEUED||t===r.HUMAN_ACTIVE)&&F(),h.push({id:L(),role:"system",content:o.error??"Could not connect to an agent right now. Please try again.",timestamp:Date.now()}),$();return}let n=await e.json();l=r.QUEUED,R=n.queuePosition??null,S(),F(),h.push({id:L(),role:"system",content:"You've been connected to our support queue. A human agent will be with you shortly.",timestamp:Date.now()}),$()}catch{l=r.ACTIVE,S()}}}function He(){g=null,h=[],l=r.ACTIVE,O=!1,R=null,J=!1,M=!1,Y(),sessionStorage.removeItem("__cw_convo");let e=document.getElementById("cw-messages");e&&(e.innerHTML=""),S(),B("home")}async function ne(e){let n=document.getElementById("cw-input"),o=document.getElementById("cw-send"),t=e||n.value.trim();if(!t||M)return;if(l===r.HUMAN_ACTIVE){e||(n.value="",n.style.height="auto"),o.disabled=!0;let s={id:L(),role:"user",content:t,timestamp:Date.now(),status:"sending"};h.push(s),$();try{let c=await fetch(`${I}/api/chat/message`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${T}`},body:JSON.stringify({message:t,conversationId:g,userId:X,channel:"web"})});if(c.status===409){let u=await c.json().catch(()=>({}));l=r.CLOSED,O=!0,S(),Y(),j(),h.push({id:L(),role:"system",content:u.error??"This conversation has been closed.",timestamp:Date.now(),eventType:z.CLOSED}),s.status="sent";return}if(!c.ok){s.status="sent",h.push({id:L(),role:"system",content:"Failed to deliver message to the agent.",timestamp:Date.now()});return}s.status="sent"}catch{s.status="sent",h.push({id:L(),role:"system",content:"Failed to deliver message to the agent.",timestamp:Date.now()})}finally{$(),o.disabled=!1}return}if(l!==r.ACTIVE)return;e||(n.value="",n.style.height="auto"),o.disabled=!0,M=!0;let a={id:L(),role:"user",content:t,timestamp:Date.now(),status:"sending"};h.push(a),$(),Le();let i={id:L(),role:"assistant",content:"",timestamp:Date.now()};try{let s={message:t,conversationId:g,userId:X,channel:"web"};H&&(s.userEmail=H),Z&&(s.userName=Z);let c=await fetch(`${I}/api/chat/stream`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${T}`},body:JSON.stringify(s)});if(!c.ok){let N=await c.json().catch(()=>({error:"Request failed"}));A(),a.status="sent",i.content=N.error??"Something went wrong. Please try again.",i.timestamp=Date.now(),h.push(i),M=!1,$();return}a.status="sent",h.push(i);let u=c.body?.getReader(),x=new TextDecoder,f="",y=!0;if(!u)throw new Error("No response body");for(;;){let{done:N,value:G}=await u.read();if(N)break;f+=x.decode(G,{stream:!0});let v=f.split(`
`);f=v.pop()??"";for(let _ of v){if(!_.startsWith("data: "))continue;let D=_.slice(6).trim();if(!(!D||D==="[DONE]"))try{let m=JSON.parse(D);m.type==="delta"?(y&&(A(),y=!1),i.content+=m.content,i.timestamp=Date.now(),$()):m.type==="done"?(g=m.conversationId??g,g&&sessionStorage.setItem("__cw_convo",g),m.citations&&(i.citations=m.citations),A(),m.status&&(l=V(m.status)),S(),he()&&j()):m.type==="escalated"?(A(),i.content=m.message??"I've connected you with a human agent. They'll be with you shortly.",g=m.conversationId??g,g&&sessionStorage.setItem("__cw_convo",g),l=r.QUEUED,S(),F()):m.type==="status"?(A(),m.status&&(l=V(m.status)),m.message&&(i.content=m.message),S(),(l===r.QUEUED||l===r.HUMAN_ACTIVE)&&F()):m.type==="blocked"?(A(),i.content=m.message??"That request was blocked by our policies."):m.type==="error"&&(A(),i.content=m.message??"An error occurred. Please try again.")}catch{}}}}catch{A(),i.content="Unable to connect. Please check your internet and try again.",h.includes(i)||h.push(i)}finally{M=!1,$(),o.disabled=!1}}function F(){U||(P=new Date().toISOString(),U=setInterval(Ue,3e3))}function Y(){U&&(clearInterval(U),U=null)}async function Ue(){if(!(!g||M))try{let e=`${I}/api/chat/messages?conversationId=${encodeURIComponent(g)}`;P&&(e+=`&after=${encodeURIComponent(P)}`);let n=await fetch(e,{headers:{Authorization:`Bearer ${T}`}});if(!n.ok)return;let o=await n.json();if(o.conversationStatus&&o.conversationStatus!==l&&(l=V(o.conversationStatus),S(),l===r.CLOSED&&(Y(),j())),o.messages&&o.messages.length>0){let t=!1;for(let a of o.messages){if(!h.some(s=>s.content===a.content&&s.role===a.role&&s.id===a.id)){let s=a.eventType===z.CLOSED?z.CLOSED:void 0;h.push({id:a.id||L(),role:a.role,content:a.content,timestamp:a.createdAt?new Date(a.createdAt).getTime():Date.now(),senderType:a.senderType||void 0,eventType:s}),t=!0,s===z.CLOSED&&(O=!0),!k&&a.role==="assistant"&&(q++,le())}a.createdAt>(P||"")&&(P=a.createdAt)}O&&l!==r.CLOSED&&(l=r.CLOSED,S(),Y(),j()),t&&$()}if(l===r.QUEUED)try{let t=await fetch(`${I}/api/chat/queue-status?conversationId=${encodeURIComponent(g)}`,{headers:{Authorization:`Bearer ${T}`}});t.ok&&(R=(await t.json()).queuePosition??null,S())}catch{}}catch{}}function Pe(){let e=document.getElementById("cw-bubble"),n=document.getElementById("cw-panel"),o=document.getElementById("cw-close"),t=document.getElementById("cw-input"),a=document.getElementById("cw-send"),i=document.getElementById("cw-start-btn");function s(){k=!k,n.classList.toggle("open",k),e.classList.toggle("open",k),k&&(q=0,le(),ie==="chat"&&setTimeout(()=>t.focus(),100))}e.addEventListener("click",s),o.addEventListener("click",s),i.addEventListener("click",()=>{b.requireEmail&&!Q?B("email"):(B("chat"),setTimeout(()=>t.focus(),100))});let c=document.getElementById("cw-email-submit"),u=document.getElementById("cw-email-input"),x=document.getElementById("cw-name-input"),f=document.getElementById("cw-email-error");c?.addEventListener("click",()=>{let v=u.value.trim(),_=x.value.trim();if(!ke(v)){u.classList.add("error"),f.style.display="block";return}u.classList.remove("error"),f.style.display="none",H=v,Z=_,Q=!0,localStorage.setItem("__cw_email",v),_&&localStorage.setItem("__cw_name",_),B("chat"),setTimeout(()=>t.focus(),100)}),u?.addEventListener("input",()=>{u.classList.remove("error"),f.style.display="none"}),u?.addEventListener("keydown",v=>{v.key==="Enter"&&(v.preventDefault(),c?.click())}),t.addEventListener("input",()=>{a.disabled=!t.value.trim()||M,t.style.height="auto",t.style.height=Math.min(t.scrollHeight,120)+"px"}),t.addEventListener("keydown",v=>{v.key==="Enter"&&!v.shiftKey&&(v.preventDefault(),ne())}),a.addEventListener("click",()=>ne()),document.getElementById("cw-handoff-btn")?.addEventListener("click",()=>De()),document.getElementById("cw-new-chat-btn")?.addEventListener("click",()=>He()),document.getElementById("cw-topics")?.addEventListener("click",v=>{let _=v.target.closest(".cw-topic-btn");if(!_)return;let D=_.dataset.topic;D&&(b.requireEmail&&!Q?B("email"):(B("chat"),setTimeout(()=>ne(D),200)))}),document.addEventListener("keydown",v=>{v.key==="Escape"&&k&&s()}),window.__sweoWidget={open(){k||s()},close(){k&&s()},toggle:s,isOpen(){return k},destroy(){Y(),document.getElementById("cw-root")?.remove(),document.getElementById("cw-styles")?.remove(),delete window.__sweoWidget}},window.dispatchEvent(new CustomEvent("sweo:widget:ready"))}function Re(){let e=document.getElementById("cw-topics");if(!e)return;let n=[];if(b.guidance&&b.guidance.length>0&&b.guidance.filter(i=>i.category==="content_sources").slice(0,3).forEach(i=>n.push({name:i.name})),n.length===0)return;let o=['<svg viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1z"/></svg>','<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>','<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>'],t='<div class="cw-home-topics-title">Common topics</div>';n.forEach((a,i)=>{t+=`<button class="cw-topic-btn" data-topic="${d(a.name)}">
          <div class="cw-topic-icon">${o[i%o.length]}</div>
          <span>${d(a.name)}</span>
        </button>`}),e.innerHTML=t}async function qe(){await Ee(),Ce(),Ie(),Oe(),Re(),Pe(),await Te(),ze();let e=sessionStorage.getItem("__cw_convo");if(e){g=e;try{let n=await fetch(`${I}/api/chat/messages?conversationId=${encodeURIComponent(g)}`,{headers:{Authorization:`Bearer ${T}`}});if(n.ok){let o=await n.json();o.conversationStatus&&(l=V(o.conversationStatus)),o.messages&&o.messages.length>0&&(h=o.messages.map(t=>({id:t.id||L(),role:t.role,content:t.content,timestamp:t.createdAt?new Date(t.createdAt).getTime():Date.now(),senderType:t.senderType||void 0,eventType:t.eventType===z.CLOSED?z.CLOSED:void 0})),O=h.some(t=>t.eventType===z.CLOSED),O&&l!==r.CLOSED&&(l=r.CLOSED),B("chat"),$(),S(),(l===r.HUMAN_ACTIVE||l===r.QUEUED||l===r.ESCALATED||l===r.HANDOFF_REQUESTED)&&F())}}catch{}}}qe()})();})();
