!function(){try{var e="u">typeof window?window:"u">typeof global?global:"u">typeof globalThis?globalThis:"u">typeof self?self:{},t=(new e.Error).stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="999af3e9-e443-4315-bdd6-338d82d5b1b7",e._sentryDebugIdIdentifier="sentry-dbid-999af3e9-e443-4315-bdd6-338d82d5b1b7")}catch(e){}}();"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9479],{3341:(e,t,i)=>{i.d(t,{Bk:()=>r,CQ:()=>u,DI:()=>m,Ek:()=>o,J9:()=>c,QW:()=>f,Vw:()=>v,Y_:()=>g,aQ:()=>p,bq:()=>function e(t=document){var i;let a=null==t?void 0:t.activeElement;return a?null!=(i=e(a.shadowRoot))?i:a:null},dm:()=>E,kg:()=>n,l5:()=>h,pK:()=>b,qg:()=>d,tA:()=>k,u0:()=>l,vT:()=>A,xf:()=>s});var a=i(83074);function n(e){let t={};for(let i of e)t[i.name]=i.value;return t}function r(e){var t;return null!=(t=s(e))?t:u(e,"media-controller")}function s(e){var t;let{MEDIA_CONTROLLER:i}=a.Ex,n=e.getAttribute(i);if(n)return null==(t=h(e))?void 0:t.getElementById(n)}let o=(e,t,i=".value")=>{let a=e.querySelector(i);a&&(a.textContent=t)},l=(e,t)=>{let i,a;return(i=`slot[name="${t}"]`,!(a=e.shadowRoot.querySelector(i))?[]:a.children)[0]},d=(e,t)=>!!e&&!!t&&(null!=e&&!!e.contains(t)||d(e,t.getRootNode().host)),u=(e,t)=>{if(!e)return null;let i=e.closest(t);return i||u(e.getRootNode().host,t)};function h(e){var t;let i=null==(t=null==e?void 0:e.getRootNode)?void 0:t.call(e);return i instanceof ShadowRoot||i instanceof Document?i:null}function c(e,{depth:t=3,checkOpacity:i=!0,checkVisibilityCSS:a=!0}={}){if(e.checkVisibility)return e.checkVisibility({checkOpacity:i,checkVisibilityCSS:a});let n=e;for(;n&&t>0;){let e=getComputedStyle(n);if(i&&"0"===e.opacity||a&&"hidden"===e.visibility||"none"===e.display)return!1;n=n.parentElement,t--}return!0}function m(e,t,i,a){let n=a.x-i.x,r=a.y-i.y,s=n*n+r*r;return 0===s?0:Math.max(0,Math.min(1,((e-i.x)*n+(t-i.y)*r)/s))}function p(e,t){let i=function(e,t){var i,a;let n;for(n of null!=(i=e.querySelectorAll("style:not([media])"))?i:[]){let e;try{e=null==(a=n.sheet)?void 0:a.cssRules}catch{continue}for(let i of null!=e?e:[])if(t(i.selectorText))return i}}(e,e=>e===t);return i||v(e,t)}function v(e,t){var i,a;let n=null!=(i=e.querySelectorAll("style:not([media])"))?i:[],r=null==n?void 0:n[n.length-1];return(null==r?void 0:r.sheet)?(null==r||r.sheet.insertRule(`${t}{}`,r.sheet.cssRules.length),null==(a=r.sheet.cssRules)?void 0:a[r.sheet.cssRules.length-1]):(console.warn("Media Chrome: No style sheet found on style tag of",e),{style:{setProperty:()=>{},removeProperty:()=>"",getPropertyValue:()=>""}})}function E(e,t,i=NaN){let a=e.getAttribute(t);return null!=a?+a:i}function b(e,t,i){let a=+i;if(null==i||Number.isNaN(a)){e.hasAttribute(t)&&e.removeAttribute(t);return}E(e,t,void 0)!==a&&e.setAttribute(t,`${a}`)}function g(e,t){return e.hasAttribute(t)}function f(e,t,i){if(null==i){e.hasAttribute(t)&&e.removeAttribute(t);return}g(e,t)!=i&&e.toggleAttribute(t,i)}function A(e,t,i=null){var a;return null!=(a=e.getAttribute(t))?a:i}function k(e,t,i){if(null==i){e.hasAttribute(t)&&e.removeAttribute(t);return}let a=`${i}`;A(e,t,void 0)!==a&&e.setAttribute(t,a)}},10574:(e,t,i)=>{let a,n;i.d(t,{M:()=>N});var r=i(84411),s=i(83074),o=i(3341);let l="exitFullscreen"in r.Al?"exitFullscreen":"webkitExitFullscreen"in r.Al?"webkitExitFullscreen":"webkitCancelFullScreen"in r.Al?"webkitCancelFullScreen":void 0,d="fullscreenElement"in r.Al?"fullscreenElement":"webkitFullscreenElement"in r.Al?"webkitFullscreenElement":void 0,u="fullscreenEnabled"in r.Al?"fullscreenEnabled":"webkitFullscreenEnabled"in r.Al?"webkitFullscreenEnabled":void 0;var h=i(42324);let c=()=>{var e,t;return a||(a=null==(t=null==(e=r.Al)?void 0:e.createElement)?void 0:t.call(e,"video"))},m=async(e=c())=>{if(!e)return!1;let t=e.volume;e.volume=t/2+.1;let i=new AbortController,a=await Promise.race([p(e,i.signal),v(e,t)]);return i.abort(),a},p=(e,t)=>new Promise(i=>{e.addEventListener("volumechange",()=>i(!0),{signal:t})}),v=async(e,t)=>{for(let i=0;i<10;i++){if(e.volume===t)return!1;await (0,h.cb)(10)}return e.volume!==t},E=/.*Version\/.*Safari\/.*/.test(r.Au.navigator.userAgent),b=(e=c())=>(!r.Au.matchMedia("(display-mode: standalone)").matches||!E)&&"function"==typeof(null==e?void 0:e.requestPictureInPicture),g=(e=c())=>(e=>{let{documentElement:t,media:i}=e;return!!(null==t?void 0:t[u])||i&&"webkitSupportsFullscreen"in i})({documentElement:r.Al,media:e}),f=g(),A=b(),k=!!r.Au.WebKitPlaybackTargetAvailabilityEvent,y=!!r.Au.chrome;var C=i(22440);let w=e=>(0,C.aI)(e.media,e=>[s.Up.SUBTITLES,s.Up.CAPTIONS].includes(e.kind)).sort((e,t)=>e.kind>=t.kind?1:-1),I=e=>(0,C.aI)(e.media,e=>e.mode===s.lr.SHOWING&&[s.Up.SUBTITLES,s.Up.CAPTIONS].includes(e.kind)),T=(e,t)=>{let i=w(e),a=I(e),n=!!a.length;if(i.length){if(!1===t||n&&!0!==t)(0,C.ip)(s.lr.DISABLED,i,a);else if(!0===t||!n&&!1!==t){let t=i[0],{options:n}=e;if(!(null==n?void 0:n.noSubtitlesLangPref)){let e=globalThis.localStorage.getItem("media-chrome-pref-subtitles-lang"),a=e?[e,...globalThis.navigator.languages]:globalThis.navigator.languages,n=i.filter(e=>a.some(t=>e.language.toLowerCase().startsWith(t.split("-")[0]))).sort((e,t)=>a.findIndex(t=>e.language.toLowerCase().startsWith(t.split("-")[0]))-a.findIndex(e=>t.language.toLowerCase().startsWith(e.split("-")[0])));n[0]&&(t=n[0])}let{language:r,label:o,kind:l}=t;(0,C.ip)(s.lr.DISABLED,i,a),(0,C.ip)(s.lr.SHOWING,i,[{language:r,label:o,kind:l}])}}},_=(e,t)=>e===t||null!=e&&null!=t&&typeof e==typeof t&&(!!("number"==typeof e&&Number.isNaN(e)&&Number.isNaN(t))||"object"==typeof e&&(Array.isArray(e)?S(e,t):Object.entries(e).every(([e,i])=>e in t&&_(i,t[e])))),S=(e,t)=>{let i=Array.isArray(e),a=Array.isArray(t);return i===a&&(!i&&!a||e.length===t.length&&e.every((e,i)=>_(e,t[i])))},M=Object.values(s.U4),L=m().then(e=>n=e),R=async(...e)=>{await Promise.all(e.filter(e=>e).map(async e=>{if(!("localName"in e&&e instanceof r.Au.HTMLElement))return;let t=e.localName;if(!t.includes("-"))return;let i=r.Au.customElements.get(t);i&&e instanceof i||(await r.Au.customElements.whenDefined(t),r.Au.customElements.upgrade(e))}))},x={mediaError:{get(e,t){let{media:i}=e;if((null==t?void 0:t.type)!=="playing")return null==i?void 0:i.error},mediaEvents:["emptied","error","playing"]},mediaErrorCode:{get(e,t){var i;let{media:a}=e;if((null==t?void 0:t.type)!=="playing")return null==(i=null==a?void 0:a.error)?void 0:i.code},mediaEvents:["emptied","error","playing"]},mediaErrorMessage:{get(e,t){var i,a;let{media:n}=e;if((null==t?void 0:t.type)!=="playing")return null!=(a=null==(i=null==n?void 0:n.error)?void 0:i.message)?a:""},mediaEvents:["emptied","error","playing"]},mediaWidth:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.videoWidth)?t:0},mediaEvents:["resize"]},mediaHeight:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.videoHeight)?t:0},mediaEvents:["resize"]},mediaPaused:{get(e){var t;let{media:i}=e;return null==(t=null==i?void 0:i.paused)||t},set(e,t){var i;let{media:a}=t;a&&(e?a.pause():null==(i=a.play())||i.catch(()=>{}))},mediaEvents:["play","playing","pause","emptied"]},mediaHasPlayed:{get(e,t){let{media:i}=e;return!!i&&(t?"playing"===t.type:!i.paused)},mediaEvents:["playing","emptied"]},mediaEnded:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.ended)&&t},mediaEvents:["seeked","ended","emptied"]},mediaPlaybackRate:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.playbackRate)?t:1},set(e,t){let{media:i}=t;!i||Number.isFinite(+e)&&(i.playbackRate=+e)},mediaEvents:["ratechange","loadstart"]},mediaMuted:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.muted)&&t},set(e,t){let{media:i}=t;if(i){try{r.Au.localStorage.setItem("media-chrome-pref-muted",e?"true":"false")}catch(e){console.debug("Error setting muted pref",e)}i.muted=e}},mediaEvents:["volumechange"],stateOwnersUpdateHandlers:[(e,t)=>{let{options:{noMutedPref:i}}=t,{media:a}=t;if(a&&!a.muted&&!i)try{let i="true"===r.Au.localStorage.getItem("media-chrome-pref-muted");x.mediaMuted.set(i,t),e(i)}catch(e){console.debug("Error getting muted pref",e)}}]},mediaVolume:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.volume)?t:1},set(e,t){let{media:i}=t;if(i){try{null==e?r.Au.localStorage.removeItem("media-chrome-pref-volume"):r.Au.localStorage.setItem("media-chrome-pref-volume",e.toString())}catch(e){console.debug("Error setting volume pref",e)}Number.isFinite(+e)&&(i.volume=+e)}},mediaEvents:["volumechange"],stateOwnersUpdateHandlers:[(e,t)=>{let{options:{noVolumePref:i}}=t;if(!i)try{let{media:i}=t;if(!i)return;let a=r.Au.localStorage.getItem("media-chrome-pref-volume");if(null==a)return;x.mediaVolume.set(+a,t),e(+a)}catch(e){console.debug("Error getting volume pref",e)}}]},mediaVolumeLevel:{get(e){let{media:t}=e;return void 0===(null==t?void 0:t.volume)?"high":t.muted||0===t.volume?"off":t.volume<.5?"low":t.volume<.75?"medium":"high"},mediaEvents:["volumechange"]},mediaCurrentTime:{get(e){var t;let{media:i}=e;return null!=(t=null==i?void 0:i.currentTime)?t:0},set(e,t){let{media:i}=t;i&&(0,h.gf)(e)&&(i.currentTime=e)},mediaEvents:["timeupdate","loadedmetadata"]},mediaDuration:{get(e){let{media:t,options:{defaultDuration:i}={}}=e;return i&&(!t||!t.duration||Number.isNaN(t.duration)||!Number.isFinite(t.duration))?i:Number.isFinite(null==t?void 0:t.duration)?t.duration:NaN},mediaEvents:["durationchange","loadedmetadata","emptied"]},mediaLoading:{get(e){let{media:t}=e;return(null==t?void 0:t.readyState)<3},mediaEvents:["waiting","playing","emptied"]},mediaSeekable:{get(e){var t;let{media:i}=e;if(!(null==(t=null==i?void 0:i.seekable)?void 0:t.length))return;let a=i.seekable.start(0),n=i.seekable.end(i.seekable.length-1);if(a||n)return[Number(a.toFixed(3)),Number(n.toFixed(3))]},mediaEvents:["loadedmetadata","emptied","progress","seekablechange"]},mediaBuffered:{get(e){var t;let{media:i}=e,a=null!=(t=null==i?void 0:i.buffered)?t:[];return Array.from(a).map((e,t)=>[Number(a.start(t).toFixed(3)),Number(a.end(t).toFixed(3))])},mediaEvents:["progress","emptied"]},mediaStreamType:{get(e){let{media:t,options:{defaultStreamType:i}={}}=e,a=[s.U4.LIVE,s.U4.ON_DEMAND].includes(i)?i:void 0;if(!t)return a;let{streamType:n}=t;if(M.includes(n))return n===s.U4.UNKNOWN?a:n;let r=t.duration;return r===1/0?s.U4.LIVE:Number.isFinite(r)?s.U4.ON_DEMAND:a},mediaEvents:["emptied","durationchange","loadedmetadata","streamtypechange"]},mediaTargetLiveWindow:{get(e){let{media:t}=e;if(!t)return NaN;let{targetLiveWindow:i}=t,a=x.mediaStreamType.get(e);return(null==i||Number.isNaN(i))&&a===s.U4.LIVE?0:i},mediaEvents:["emptied","durationchange","loadedmetadata","streamtypechange","targetlivewindowchange"]},mediaTimeIsLive:{get(e){let{media:t,options:{liveEdgeOffset:i=10}={}}=e;if(!t)return!1;if("number"==typeof t.liveEdgeStart)return!Number.isNaN(t.liveEdgeStart)&&t.currentTime>=t.liveEdgeStart;if(x.mediaStreamType.get(e)!==s.U4.LIVE)return!1;let a=t.seekable;if(!a)return!0;if(!a.length)return!1;let n=a.end(a.length-1)-i;return t.currentTime>=n},mediaEvents:["playing","timeupdate","progress","waiting","emptied"]},mediaSubtitlesList:{get:e=>w(e).map(({kind:e,label:t,language:i})=>({kind:e,label:t,language:i})),mediaEvents:["loadstart"],textTracksEvents:["addtrack","removetrack"]},mediaSubtitlesShowing:{get:e=>I(e).map(({kind:e,label:t,language:i})=>({kind:e,label:t,language:i})),mediaEvents:["loadstart"],textTracksEvents:["addtrack","removetrack","change"],stateOwnersUpdateHandlers:[(e,t)=>{var i,a;let{media:n,options:r}=t;if(!n)return;let o=e=>{var i;r.defaultSubtitles&&(e&&![s.Up.CAPTIONS,s.Up.SUBTITLES].includes(null==(i=null==e?void 0:e.track)?void 0:i.kind)||T(t,!0))};return n.addEventListener("loadstart",o),null==(i=n.textTracks)||i.addEventListener("addtrack",o),null==(a=n.textTracks)||a.addEventListener("removetrack",o),()=>{var e,t;n.removeEventListener("loadstart",o),null==(e=n.textTracks)||e.removeEventListener("addtrack",o),null==(t=n.textTracks)||t.removeEventListener("removetrack",o)}}]},mediaChaptersCues:{get(e){var t;let{media:i}=e;if(!i)return[];let[a]=(0,C.aI)(i,{kind:s.Up.CHAPTERS});return Array.from(null!=(t=null==a?void 0:a.cues)?t:[]).map(({text:e,startTime:t,endTime:i})=>({text:e,startTime:t,endTime:i}))},mediaEvents:["loadstart","loadedmetadata"],textTracksEvents:["addtrack","removetrack","change"],stateOwnersUpdateHandlers:[(e,t)=>{var i;let{media:a}=t;if(!a)return;let n=a.querySelector('track[kind="chapters"][default][src]'),r=null==(i=a.shadowRoot)?void 0:i.querySelector(':is(video,audio) > track[kind="chapters"][default][src]');return null==n||n.addEventListener("load",e),null==r||r.addEventListener("load",e),()=>{null==n||n.removeEventListener("load",e),null==r||r.removeEventListener("load",e)}}]},mediaIsPip:{get(e){var t,i;let{media:a,documentElement:n}=e;if(!a||!n||!n.pictureInPictureElement)return!1;if(n.pictureInPictureElement===a)return!0;if(n.pictureInPictureElement instanceof HTMLMediaElement)return!!(null==(t=a.localName)?void 0:t.includes("-"))&&(0,o.qg)(a,n.pictureInPictureElement);if(n.pictureInPictureElement.localName.includes("-")){let e=n.pictureInPictureElement.shadowRoot;for(;null==e?void 0:e.pictureInPictureElement;){if(e.pictureInPictureElement===a)return!0;e=null==(i=e.pictureInPictureElement)?void 0:i.shadowRoot}}return!1},set(e,t){let{media:i}=t;if(i)if(e){if(!r.Al.pictureInPictureEnabled)return void console.warn("MediaChrome: Picture-in-picture is not enabled");if(!i.requestPictureInPicture)return void console.warn("MediaChrome: The current media does not support picture-in-picture");let e=()=>{console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a readyState > 0.")};i.requestPictureInPicture().catch(t=>{if(11===t.code){if(!i.src)return void console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a src set.");if(0===i.readyState&&"none"===i.preload){let t=()=>{i.removeEventListener("loadedmetadata",a),i.preload="none"},a=()=>{i.requestPictureInPicture().catch(e),t()};i.addEventListener("loadedmetadata",a),i.preload="metadata",setTimeout(()=>{0===i.readyState&&e(),t()},1e3)}else throw t}else throw t})}else r.Al.pictureInPictureElement&&r.Al.exitPictureInPicture()},mediaEvents:["enterpictureinpicture","leavepictureinpicture"]},mediaRenditionList:{get(e){var t;let{media:i}=e;return[...null!=(t=null==i?void 0:i.videoRenditions)?t:[]].map(e=>({...e}))},mediaEvents:["emptied","loadstart"],videoRenditionsEvents:["addrendition","removerendition"]},mediaRenditionSelected:{get(e){var t,i,a;let{media:n}=e;return null==(a=null==(i=null==n?void 0:n.videoRenditions)?void 0:i[null==(t=n.videoRenditions)?void 0:t.selectedIndex])?void 0:a.id},set(e,t){let{media:i}=t;if(!(null==i?void 0:i.videoRenditions))return void console.warn("MediaController: Rendition selection not supported by this media.");let a=Array.prototype.findIndex.call(i.videoRenditions,t=>t.id==e);i.videoRenditions.selectedIndex!=a&&(i.videoRenditions.selectedIndex=a)},mediaEvents:["emptied"],videoRenditionsEvents:["addrendition","removerendition","change"]},mediaAudioTrackList:{get(e){var t;let{media:i}=e;return[...null!=(t=null==i?void 0:i.audioTracks)?t:[]]},mediaEvents:["emptied","loadstart"],audioTracksEvents:["addtrack","removetrack"]},mediaAudioTrackEnabled:{get(e){var t,i;let{media:a}=e;return null==(i=[...null!=(t=null==a?void 0:a.audioTracks)?t:[]].find(e=>e.enabled))?void 0:i.id},set(e,t){let{media:i}=t;if(!(null==i?void 0:i.audioTracks))return void console.warn("MediaChrome: Audio track selection not supported by this media.");for(let t of i.audioTracks)t.enabled=e==t.id},mediaEvents:["emptied"],audioTracksEvents:["addtrack","removetrack","change"]},mediaIsFullscreen:{get:e=>(e=>{var t;let{media:i,documentElement:a,fullscreenElement:n=i}=e;if(!i||!a)return!1;let r=(e=>{let{documentElement:t,media:i}=e,a=null==t?void 0:t[d];return!a&&"webkitDisplayingFullscreen"in i&&"webkitPresentationMode"in i&&i.webkitDisplayingFullscreen&&i.webkitPresentationMode===s.br.FULLSCREEN?i:a})(e);if(!r)return!1;if(r===n||r===i)return!0;if(r.localName.includes("-")){let e=r.shadowRoot;if(!(d in e))return(0,o.qg)(r,n);for(;null==e?void 0:e[d];){if(e[d]===n)return!0;e=null==(t=e[d])?void 0:t.shadowRoot}}return!1})(e),set(e,t){e?(e=>{var t;let{media:i,fullscreenElement:a}=e,n=a&&"requestFullscreen"in a?"requestFullscreen":a&&"webkitRequestFullScreen"in a?"webkitRequestFullScreen":void 0;if(n){let e=null==(t=a[n])?void 0:t.call(a);if(e instanceof Promise)return e.catch(()=>{})}else(null==i?void 0:i.webkitEnterFullscreen)?i.webkitEnterFullscreen():(null==i?void 0:i.requestFullscreen)&&i.requestFullscreen()})(t):(e=>{var t;let{documentElement:i}=e;if(l){let e=null==(t=null==i?void 0:i[l])?void 0:t.call(i);if(e instanceof Promise)return e.catch(()=>{})}})(t)},rootEvents:["fullscreenchange","webkitfullscreenchange"],mediaEvents:["webkitbeginfullscreen","webkitendfullscreen","webkitpresentationmodechanged"]},mediaIsCasting:{get(e){var t;let{media:i}=e;return!!(null==i?void 0:i.remote)&&(null==(t=i.remote)?void 0:t.state)!=="disconnected"&&!!i.remote.state},set(e,t){var i,a;let{media:n}=t;if(n&&(!e||(null==(i=n.remote)?void 0:i.state)==="disconnected")&&(e||(null==(a=n.remote)?void 0:a.state)==="connected")){if("function"!=typeof n.remote.prompt)return void console.warn("MediaChrome: Casting is not supported in this environment");n.remote.prompt().catch(()=>{})}},remoteEvents:["connect","connecting","disconnect"]},mediaIsAirplaying:{get:()=>!1,set(e,t){let{media:i}=t;if(i){if(!(i.webkitShowPlaybackTargetPicker&&r.Au.WebKitPlaybackTargetAvailabilityEvent))return void console.warn("MediaChrome: received a request to select AirPlay but AirPlay is not supported in this environment");i.webkitShowPlaybackTargetPicker()}},mediaEvents:["webkitcurrentplaybacktargetiswirelesschanged"]},mediaFullscreenUnavailable:{get(e){let{media:t}=e;if(!f||!g(t))return s.CY.UNSUPPORTED}},mediaPipUnavailable:{get(e){let{media:t}=e;if(!A||!b(t))return s.CY.UNSUPPORTED}},mediaVolumeUnavailable:{get(e){let{media:t}=e;if(!1===n||(null==t?void 0:t.volume)==void 0)return s.CY.UNSUPPORTED},stateOwnersUpdateHandlers:[e=>{null==n&&L.then(t=>e(t?void 0:s.CY.UNSUPPORTED))}]},mediaCastUnavailable:{get(e,{availability:t="not-available"}={}){var i;let{media:a}=e;return y&&(null==(i=null==a?void 0:a.remote)?void 0:i.state)?null!=t&&"available"!==t?s.CY.UNAVAILABLE:void 0:s.CY.UNSUPPORTED},stateOwnersUpdateHandlers:[(e,t)=>{var i;let{media:a}=t;if(a)return a.disableRemotePlayback||a.hasAttribute("disableremoteplayback")||null==(i=null==a?void 0:a.remote)||i.watchAvailability(t=>{e({availability:t?"available":"not-available"})}).catch(t=>{"NotSupportedError"===t.name?e({availability:null}):e({availability:"not-available"})}),()=>{var e;null==(e=null==a?void 0:a.remote)||e.cancelWatchAvailability().catch(()=>{})}}]},mediaAirplayUnavailable:{get:(e,t)=>k?(null==t?void 0:t.availability)==="not-available"?s.CY.UNAVAILABLE:void 0:s.CY.UNSUPPORTED,mediaEvents:["webkitplaybacktargetavailabilitychanged"],stateOwnersUpdateHandlers:[(e,t)=>{var i;let{media:a}=t;if(a)return a.disableRemotePlayback||a.hasAttribute("disableremoteplayback")||null==(i=null==a?void 0:a.remote)||i.watchAvailability(t=>{e({availability:t?"available":"not-available"})}).catch(t=>{"NotSupportedError"===t.name?e({availability:null}):e({availability:"not-available"})}),()=>{var e;null==(e=null==a?void 0:a.remote)||e.cancelWatchAvailability().catch(()=>{})}}]},mediaRenditionUnavailable:{get(e){var t;let{media:i}=e;return(null==i?void 0:i.videoRenditions)?(null==(t=i.videoRenditions)?void 0:t.length)?void 0:s.CY.UNAVAILABLE:s.CY.UNSUPPORTED},mediaEvents:["emptied","loadstart"],videoRenditionsEvents:["addrendition","removerendition"]},mediaAudioTrackUnavailable:{get(e){var t,i;let{media:a}=e;return(null==a?void 0:a.audioTracks)?(null!=(i=null==(t=a.audioTracks)?void 0:t.length)?i:0)<=1?s.CY.UNAVAILABLE:void 0:s.CY.UNSUPPORTED},mediaEvents:["emptied","loadstart"],audioTracksEvents:["addtrack","removetrack"]}},D={[s.a8.MEDIA_PREVIEW_REQUEST](e,t,{detail:i}){var a,n,r;let o,l,{media:d}=t,u=null!=i?i:void 0;if(d&&null!=u){let[e]=(0,C.aI)(d,{kind:s.Up.METADATA,label:"thumbnails"}),t=Array.prototype.find.call(null!=(a=null==e?void 0:e.cues)?a:[],(e,t,i)=>0===t?e.endTime>u:t===i.length-1?e.startTime<=u:e.startTime<=u&&e.endTime>u);if(t){let e=/'^(?:[a-z]+:)?\/\//i.test(t.text)||null==(n=null==d?void 0:d.querySelector('track[label="thumbnails"]'))?void 0:n.src,i=new URL(t.text,e);l=new URLSearchParams(i.hash).get("#xywh").split(",").map(e=>+e),o=i.href}}let h=e.mediaDuration.get(t),c=null==(r=e.mediaChaptersCues.get(t).find((e,t,i)=>t===i.length-1&&h===e.endTime?e.startTime<=u&&e.endTime>=u:e.startTime<=u&&e.endTime>u))?void 0:r.text;return null!=i&&null==c&&(c=""),{mediaPreviewTime:u,mediaPreviewImage:o,mediaPreviewCoords:l,mediaPreviewChapter:c}},[s.a8.MEDIA_PAUSE_REQUEST](e,t){e.mediaPaused.set(!0,t)},[s.a8.MEDIA_PLAY_REQUEST](e,t){var i,a,n,r;let o=e.mediaStreamType.get(t)===s.U4.LIVE,l=!(null==(i=t.options)?void 0:i.noAutoSeekToLive),d=e.mediaTargetLiveWindow.get(t)>0;if(o&&l&&!d){let i=null==(a=e.mediaSeekable.get(t))?void 0:a[1];if(i){let a=null!=(r=null==(n=t.options)?void 0:n.seekToLiveOffset)?r:0;e.mediaCurrentTime.set(i-a,t)}}e.mediaPaused.set(!1,t)},[s.a8.MEDIA_PLAYBACK_RATE_REQUEST](e,t,{detail:i}){e.mediaPlaybackRate.set(i,t)},[s.a8.MEDIA_MUTE_REQUEST](e,t){e.mediaMuted.set(!0,t)},[s.a8.MEDIA_UNMUTE_REQUEST](e,t){e.mediaVolume.get(t)||e.mediaVolume.set(.25,t),e.mediaMuted.set(!1,t)},[s.a8.MEDIA_VOLUME_REQUEST](e,t,{detail:i}){i&&e.mediaMuted.get(t)&&e.mediaMuted.set(!1,t),e.mediaVolume.set(i,t)},[s.a8.MEDIA_SEEK_REQUEST](e,t,{detail:i}){e.mediaCurrentTime.set(i,t)},[s.a8.MEDIA_SEEK_TO_LIVE_REQUEST](e,t){var i,a,n;let r=null==(i=e.mediaSeekable.get(t))?void 0:i[1];if(Number.isNaN(Number(r)))return;let s=null!=(n=null==(a=t.options)?void 0:a.seekToLiveOffset)?n:0;e.mediaCurrentTime.set(r-s,t)},[s.a8.MEDIA_SHOW_SUBTITLES_REQUEST](e,t,{detail:i}){var a;let{options:n}=t,o=w(t),l=(0,C.C2)(i),d=null==(a=l[0])?void 0:a.language;d&&!n.noSubtitlesLangPref&&r.Au.localStorage.setItem("media-chrome-pref-subtitles-lang",d),(0,C.ip)(s.lr.SHOWING,o,l)},[s.a8.MEDIA_DISABLE_SUBTITLES_REQUEST](e,t,{detail:i}){let a=w(t);(0,C.ip)(s.lr.DISABLED,a,null!=i?i:[])},[s.a8.MEDIA_TOGGLE_SUBTITLES_REQUEST](e,t,{detail:i}){T(t,i)},[s.a8.MEDIA_RENDITION_REQUEST](e,t,{detail:i}){e.mediaRenditionSelected.set(i,t)},[s.a8.MEDIA_AUDIO_TRACK_REQUEST](e,t,{detail:i}){e.mediaAudioTrackEnabled.set(i,t)},[s.a8.MEDIA_ENTER_PIP_REQUEST](e,t){e.mediaIsFullscreen.get(t)&&e.mediaIsFullscreen.set(!1,t),e.mediaIsPip.set(!0,t)},[s.a8.MEDIA_EXIT_PIP_REQUEST](e,t){e.mediaIsPip.set(!1,t)},[s.a8.MEDIA_ENTER_FULLSCREEN_REQUEST](e,t){e.mediaIsPip.get(t)&&e.mediaIsPip.set(!1,t),e.mediaIsFullscreen.set(!0,t)},[s.a8.MEDIA_EXIT_FULLSCREEN_REQUEST](e,t){e.mediaIsFullscreen.set(!1,t)},[s.a8.MEDIA_ENTER_CAST_REQUEST](e,t){e.mediaIsFullscreen.get(t)&&e.mediaIsFullscreen.set(!1,t),e.mediaIsCasting.set(!0,t)},[s.a8.MEDIA_EXIT_CAST_REQUEST](e,t){e.mediaIsCasting.set(!1,t)},[s.a8.MEDIA_AIRPLAY_REQUEST](e,t){e.mediaIsAirplaying.set(!0,t)}},N=({media:e,fullscreenElement:t,documentElement:i,stateMediator:a=x,requestMap:n=D,options:r={},monitorStateOwnersOnlyWithSubscriptions:s=!0})=>{let o,l=[],d={options:{...r}},u=Object.freeze({mediaPreviewTime:void 0,mediaPreviewImage:void 0,mediaPreviewCoords:void 0,mediaPreviewChapter:void 0}),h=e=>{void 0==e||_(e,u)||(u=Object.freeze({...u,...e}),l.forEach(e=>e(u)))},c=()=>{h(Object.entries(a).reduce((e,[t,{get:i}])=>(e[t]=i(d),e),{}))},m={},p=async(e,t)=>{var i,n,r,u,p,v,E,b,g,f,A,k,y,C,w,I;let T=!!o;if(o={...d,...null!=o?o:{},...e},T)return;await R(...Object.values(e));let _=l.length>0&&0===t&&s,S=d.media!==o.media,M=(null==(i=d.media)?void 0:i.textTracks)!==(null==(n=o.media)?void 0:n.textTracks),L=(null==(r=d.media)?void 0:r.videoRenditions)!==(null==(u=o.media)?void 0:u.videoRenditions),x=(null==(p=d.media)?void 0:p.audioTracks)!==(null==(v=o.media)?void 0:v.audioTracks),D=(null==(E=d.media)?void 0:E.remote)!==(null==(b=o.media)?void 0:b.remote),N=d.documentElement!==o.documentElement,P=!!d.media&&(S||_),U=!!(null==(g=d.media)?void 0:g.textTracks)&&(M||_),G=!!(null==(f=d.media)?void 0:f.videoRenditions)&&(L||_),O=!!(null==(A=d.media)?void 0:A.audioTracks)&&(x||_),W=!!(null==(k=d.media)?void 0:k.remote)&&(D||_),$=!!d.documentElement&&(N||_),H=P||U||G||O||W||$,B=0===l.length&&1===t&&s,V=!!o.media&&(S||B),q=!!(null==(y=o.media)?void 0:y.textTracks)&&(M||B),Q=!!(null==(C=o.media)?void 0:C.videoRenditions)&&(L||B),F=!!(null==(w=o.media)?void 0:w.audioTracks)&&(x||B),Y=!!(null==(I=o.media)?void 0:I.remote)&&(D||B),j=!!o.documentElement&&(N||B),K=V||q||Q||F||Y||j;if(!(H||K)){Object.entries(o).forEach(([e,t])=>{d[e]=t}),c(),o=void 0;return}Object.entries(a).forEach(([e,{get:t,mediaEvents:i=[],textTracksEvents:a=[],videoRenditionsEvents:n=[],audioTracksEvents:r=[],remoteEvents:s=[],rootEvents:l=[],stateOwnersUpdateHandlers:u=[]}])=>{let c;m[e]||(m[e]={});let p=i=>{h({[e]:t(d,i)})};c=m[e].mediaEvents,i.forEach(t=>{c&&P&&(d.media.removeEventListener(t,c),m[e].mediaEvents=void 0),V&&(o.media.addEventListener(t,p),m[e].mediaEvents=p)}),c=m[e].textTracksEvents,a.forEach(t=>{var i,a;c&&U&&(null==(i=d.media.textTracks)||i.removeEventListener(t,c),m[e].textTracksEvents=void 0),q&&(null==(a=o.media.textTracks)||a.addEventListener(t,p),m[e].textTracksEvents=p)}),c=m[e].videoRenditionsEvents,n.forEach(t=>{var i,a;c&&G&&(null==(i=d.media.videoRenditions)||i.removeEventListener(t,c),m[e].videoRenditionsEvents=void 0),Q&&(null==(a=o.media.videoRenditions)||a.addEventListener(t,p),m[e].videoRenditionsEvents=p)}),c=m[e].audioTracksEvents,r.forEach(t=>{var i,a;c&&O&&(null==(i=d.media.audioTracks)||i.removeEventListener(t,c),m[e].audioTracksEvents=void 0),F&&(null==(a=o.media.audioTracks)||a.addEventListener(t,p),m[e].audioTracksEvents=p)}),c=m[e].remoteEvents,s.forEach(t=>{var i,a;c&&W&&(null==(i=d.media.remote)||i.removeEventListener(t,c),m[e].remoteEvents=void 0),Y&&(null==(a=o.media.remote)||a.addEventListener(t,p),m[e].remoteEvents=p)}),c=m[e].rootEvents,l.forEach(t=>{c&&$&&(d.documentElement.removeEventListener(t,c),m[e].rootEvents=void 0),j&&(o.documentElement.addEventListener(t,p),m[e].rootEvents=p)});let v=m[e].stateOwnersUpdateHandlers;u.forEach(t=>{v&&H&&v(),K&&(m[e].stateOwnersUpdateHandlers=t(p,o))})}),Object.entries(o).forEach(([e,t])=>{d[e]=t}),c(),o=void 0};return p({media:e,fullscreenElement:t,documentElement:i,options:r}),{dispatch(e){let{type:t,detail:i}=e;n[t]&&null==u.mediaErrorCode?h(n[t](a,d,e)):"mediaelementchangerequest"===t?p({media:i}):"fullscreenelementchangerequest"===t?p({fullscreenElement:i}):"documentelementchangerequest"===t?p({documentElement:i}):"optionschangerequest"===t&&Object.entries(null!=i?i:{}).forEach(([e,t])=>{d.options[e]=t})},getState:()=>u,subscribe:e=>(p({},l.length+1),l.push(e),e(u),()=>{let t=l.indexOf(e);t>=0&&(p({},l.length-1),l.splice(t,1))})}}},14450:(e,t,i)=>{i.d(t,{d:()=>o});var a=i(66595),n=i(38275),r=i(94811),s=i(73372);function o(e){let t=(0,s.M)(()=>(0,a.OQ)(e)),{isStatic:i}=(0,n.useContext)(r.Q);if(i){let[,i]=(0,n.useState)(e);(0,n.useEffect)(()=>t.on("change",i),[])}return t}},15923:(e,t,i)=>{i.d(t,{A:()=>y,T:()=>k});var a,n,r,s,o,l,d,u=i(83074),h=i(3341),c=i(84411),m=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},p=(e,t,i)=>(m(e,t,"read from private field"),i?i.call(e):t.get(e)),v=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},E=(e,t,i,a)=>(m(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);let b="tooltipplacement",g="disabled",f="notooltip",A=c.Al.createElement("template");A.innerHTML=`
<style>
  :host {
    position: relative;
    font: var(--media-font,
      var(--media-font-weight, bold)
      var(--media-font-size, 14px) /
      var(--media-text-content-height, var(--media-control-height, 24px))
      var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
    color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
    background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
    padding: var(--media-button-padding, var(--media-control-padding, 10px));
    justify-content: var(--media-button-justify-content, center);
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    box-sizing: border-box;
    transition: background .15s linear;
    pointer-events: auto;
    cursor: var(--media-cursor, pointer);
    -webkit-tap-highlight-color: transparent;
  }

  
  :host(:focus-visible) {
    box-shadow: inset 0 0 0 2px rgb(27 127 204 / .9);
    outline: 0;
  }
  
  :host(:where(:focus)) {
    box-shadow: none;
    outline: 0;
  }

  :host(:hover) {
    background: var(--media-control-hover-background, rgba(50 50 70 / .7));
  }

  svg, img, ::slotted(svg), ::slotted(img) {
    width: var(--media-button-icon-width);
    height: var(--media-button-icon-height, var(--media-control-height, 24px));
    transform: var(--media-button-icon-transform);
    transition: var(--media-button-icon-transition);
    fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
    vertical-align: middle;
    max-width: 100%;
    max-height: 100%;
    min-width: 100%;
  }

  media-tooltip {
    
    max-width: 0;
    overflow-x: clip;
    opacity: 0;
    transition: opacity .3s, max-width 0s 9s;
  }

  :host(:hover) media-tooltip,
  :host(:focus-visible) media-tooltip {
    max-width: 100vw;
    opacity: 1;
    transition: opacity .3s;
  }

  :host([notooltip]) slot[name="tooltip"] {
    display: none;
  }
</style>

<slot name="tooltip">
  <media-tooltip part="tooltip" aria-hidden="true">
    <slot name="tooltip-content"></slot>
  </media-tooltip>
</slot>
`;class k extends c.Au.HTMLElement{constructor(e={}){var t;if(super(),v(this,l),v(this,a,void 0),this.preventClick=!1,this.tooltipEl=null,this.tooltipContent="",v(this,n,e=>{this.preventClick||this.handleClick(e),setTimeout(p(this,r),0)}),v(this,r,()=>{var e,t;null==(t=null==(e=this.tooltipEl)?void 0:e.updateXOffset)||t.call(e)}),v(this,s,e=>{let{key:t}=e;this.keysUsed.includes(t)?this.preventClick||this.handleClick(e):this.removeEventListener("keyup",p(this,s))}),v(this,o,e=>{let{metaKey:t,altKey:i,key:a}=e;t||i||!this.keysUsed.includes(a)?this.removeEventListener("keyup",p(this,s)):this.addEventListener("keyup",p(this,s),{once:!0})}),!this.shadowRoot){this.attachShadow({mode:"open"});const i=A.content.cloneNode(!0);this.nativeEl=i;let a=e.slotTemplate;a||((a=c.Al.createElement("template")).innerHTML=`<slot>${e.defaultContent||""}</slot>`),e.tooltipContent&&(i.querySelector('slot[name="tooltip-content"]').innerHTML=null!=(t=e.tooltipContent)?t:"",this.tooltipContent=e.tooltipContent),this.nativeEl.appendChild(a.content.cloneNode(!0)),this.shadowRoot.appendChild(i)}this.tooltipEl=this.shadowRoot.querySelector("media-tooltip")}static get observedAttributes(){return["disabled",b,u.Ex.MEDIA_CONTROLLER]}enable(){this.addEventListener("click",p(this,n)),this.addEventListener("keydown",p(this,o)),this.tabIndex=0}disable(){this.removeEventListener("click",p(this,n)),this.removeEventListener("keydown",p(this,o)),this.removeEventListener("keyup",p(this,s)),this.tabIndex=-1}attributeChangedCallback(e,t,i){var n,s,o,l,d;e===u.Ex.MEDIA_CONTROLLER?(t&&(null==(s=null==(n=p(this,a))?void 0:n.unassociateElement)||s.call(n,this),E(this,a,null)),i&&this.isConnected&&(E(this,a,null==(o=this.getRootNode())?void 0:o.getElementById(i)),null==(d=null==(l=p(this,a))?void 0:l.associateElement)||d.call(l,this))):"disabled"===e&&i!==t?null==i?this.enable():this.disable():e===b&&this.tooltipEl&&i!==t&&(this.tooltipEl.placement=i),p(this,r).call(this)}connectedCallback(){var e,t,i;let{style:n}=(0,h.aQ)(this.shadowRoot,":host");n.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),this.hasAttribute("disabled")?this.disable():this.enable(),this.setAttribute("role","button");let r=this.getAttribute(u.Ex.MEDIA_CONTROLLER);r&&(E(this,a,null==(e=this.getRootNode())?void 0:e.getElementById(r)),null==(i=null==(t=p(this,a))?void 0:t.associateElement)||i.call(t,this)),c.Au.customElements.whenDefined("media-tooltip").then(()=>{var e,t;return(e=l,t=d,m(this,e,"access private method"),t).call(this)})}disconnectedCallback(){var e,t;this.disable(),null==(t=null==(e=p(this,a))?void 0:e.unassociateElement)||t.call(e,this),E(this,a,null),this.removeEventListener("mouseenter",p(this,r)),this.removeEventListener("focus",p(this,r)),this.removeEventListener("click",p(this,n))}get keysUsed(){return["Enter"," "]}get tooltipPlacement(){return(0,h.vT)(this,b)}set tooltipPlacement(e){(0,h.tA)(this,b,e)}get mediaController(){return(0,h.vT)(this,u.Ex.MEDIA_CONTROLLER)}set mediaController(e){(0,h.tA)(this,u.Ex.MEDIA_CONTROLLER,e)}get disabled(){return(0,h.Y_)(this,g)}set disabled(e){(0,h.QW)(this,g,e)}get noTooltip(){return(0,h.Y_)(this,f)}set noTooltip(e){(0,h.QW)(this,f,e)}handleClick(e){}}a=new WeakMap,n=new WeakMap,r=new WeakMap,s=new WeakMap,o=new WeakMap,l=new WeakSet,d=function(){this.addEventListener("mouseenter",p(this,r)),this.addEventListener("focus",p(this,r)),this.addEventListener("click",p(this,n));let e=this.tooltipPlacement;e&&this.tooltipEl&&(this.tooltipEl.placement=e)},c.Au.customElements.get("media-chrome-button")||c.Au.customElements.define("media-chrome-button",k);var y=k},22440:(e,t,i)=>{i.d(t,{C2:()=>s,PH:()=>o,VV:()=>c,W5:()=>r,aI:()=>h,ip:()=>u,mc:()=>l});var a=i(83074);let n=(e="")=>{let[t,i,n]=e.split(":"),r=n?decodeURIComponent(n):void 0;return{kind:"cc"===t?a.Up.CAPTIONS:a.Up.SUBTITLES,language:i,label:r}},r=(e="",t={})=>((e="")=>e.split(/\s+/))(e).map(e=>{let i=n(e);return{...t,...i}}),s=e=>e?Array.isArray(e)?e.map(e=>"string"==typeof e?n(e):e):"string"==typeof e?r(e):[e]:[],o=({kind:e,label:t,language:i}={kind:"subtitles"})=>t?`${"captions"===e?"cc":"sb"}:${i}:${encodeURIComponent(t)}`:i,l=(e=[])=>Array.prototype.map.call(e,o).join(" "),d=e=>{let t=Object.entries(e).map(([e,t])=>i=>i[e]===t);return e=>t.every(t=>t(e))},u=(e,t=[],i=[])=>{let a=s(i).map(d);Array.from(t).filter(e=>a.some(t=>t(e))).forEach(t=>{t.mode=e})},h=(e,t=()=>!0)=>{if(!(null==e?void 0:e.textTracks))return[];let i="function"==typeof t?t:d(t);return Array.from(e.textTracks).filter(i)},c=e=>{var t;return!!(null==(t=e.mediaSubtitlesShowing)?void 0:t.length)||e.hasAttribute(a.GC.MEDIA_SUBTITLES_SHOWING)}},22762:(e,t,i)=>{let a;i.d(t,{A:()=>O});var n=i(38275);let r=["abort","canplay","canplaythrough","durationchange","emptied","encrypted","ended","error","loadeddata","loadedmetadata","loadstart","pause","play","playing","progress","ratechange","seeked","seeking","stalled","suspend","timeupdate","volumechange","waiting","waitingforkey","resize","enterpictureinpicture","leavepictureinpicture","webkitbeginfullscreen","webkitendfullscreen","webkitpresentationmodechanged"],s=["autopictureinpicture","disablepictureinpicture","disableremoteplayback","autoplay","controls","controlslist","crossorigin","loop","muted","playsinline","poster","preload","src"];function o(e){return`
    <style>
      :host {
        display: inline-flex;
        line-height: 0;
        flex-direction: column;
        justify-content: end;
      }

      audio {
        width: 100%;
      }
    </style>
    <slot name="media">
      <audio${u(e)}></audio>
    </slot>
    <slot></slot>
  `}function l(e){return`
    <style>
      :host {
        display: inline-block;
        line-height: 0;
      }

      video {
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
        min-height: 100%;
        object-fit: var(--media-object-fit, contain);
        object-position: var(--media-object-position, 50% 50%);
      }

      video::-webkit-media-text-track-container {
        transform: var(--media-webkit-text-track-transform);
        transition: var(--media-webkit-text-track-transition);
      }
    </style>
    <slot name="media">
      <video${u(e)}></video>
    </slot>
    <slot></slot>
  `}function d(e,{tag:t,is:i}){let a=globalThis.document?.createElement?.(t,{is:i}),n=a?function(e){let t=[];for(let i=Object.getPrototypeOf(e);i&&i!==HTMLElement.prototype;i=Object.getPrototypeOf(i)){let e=Object.getOwnPropertyNames(i);t.push(...e)}return t}(a):[];return class d extends e{static getTemplateHTML=t.endsWith("audio")?o:l;static shadowRootOptions={mode:"open"};static Events=r;static #e=!1;static get observedAttributes(){return d.#t(),[...a?.constructor?.observedAttributes??[],...s]}static #t(){if(this.#e)return;this.#e=!0;let e=new Set(this.observedAttributes);for(let t of(e.delete("muted"),n))if(!(t in this.prototype))if("function"==typeof a[t])this.prototype[t]=function(...e){return this.#i(),(()=>{if(this.call)return this.call(t,...e);let i=this.nativeEl?.[t];return i?.apply(this.nativeEl,e)})()};else{let i={get(){this.#i();let i=t.toLowerCase();if(e.has(i)){let e=this.getAttribute(i);return null!==e&&(""===e||e)}return this.get?.(t)??this.nativeEl?.[t]}};t!==t.toUpperCase()&&(i.set=function(i){this.#i();let a=t.toLowerCase();e.has(a)?!0===i||!1===i||null==i?this.toggleAttribute(a,!!i):this.setAttribute(a,i):this.set?this.set(t,i):this.nativeEl&&(this.nativeEl[t]=i)}),Object.defineProperty(this.prototype,t,i)}}#a=!1;#n=null;#r=new Map;#s;get;set;call;get nativeEl(){return this.#i(),this.#n??this.querySelector(":scope > [slot=media]")??this.querySelector(t)??this.shadowRoot?.querySelector(t)??null}set nativeEl(e){this.#n=e}get defaultMuted(){return this.hasAttribute("muted")}set defaultMuted(e){this.toggleAttribute("muted",e)}get src(){return this.getAttribute("src")}set src(e){this.setAttribute("src",`${e}`)}get preload(){return this.getAttribute("preload")??this.nativeEl?.preload}set preload(e){this.setAttribute("preload",`${e}`)}#i(){this.#a||(this.#a=!0,this.init())}init(){if(!this.shadowRoot){this.attachShadow({mode:"open"});let e=function(e){let t={};for(let i of e)t[i.name]=i.value;return t}(this.attributes);i&&(e.is=i),t&&(e.part=t),this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e)}for(let e of(this.nativeEl.muted=this.hasAttribute("muted"),n))this.#o(e);for(let e of(this.#s=new MutationObserver(this.#l.bind(this)),this.shadowRoot.addEventListener("slotchange",this),this.#d(),this.constructor.Events))this.shadowRoot?.addEventListener(e,this,!0)}handleEvent(e){"slotchange"===e.type?this.#d():e.target===this.nativeEl&&this.dispatchEvent(new CustomEvent(e.type,{detail:e.detail}))}#d(){let e=new Map(this.#r),t=this.shadowRoot?.querySelector("slot:not([name])");(t?.assignedElements({flatten:!0}).filter(e=>["track","source"].includes(e.localName))).forEach(t=>{e.delete(t);let i=this.#r.get(t);i||(i=t.cloneNode(),this.#r.set(t,i),this.#s?.observe(t,{attributes:!0})),this.nativeEl?.append(i),this.#u(i)}),e.forEach((e,t)=>{e.remove(),this.#r.delete(t)})}#l(e){for(let t of e)if("attributes"===t.type){let{target:e,attributeName:i}=t,a=this.#r.get(e);a&&i&&(a.setAttribute(i,e.getAttribute(i)??""),this.#u(a))}}#u(e){e&&"track"===e.localName&&e.default&&("chapters"===e.kind||"metadata"===e.kind)&&"disabled"===e.track.mode&&(e.track.mode="hidden")}#o(e){if(Object.prototype.hasOwnProperty.call(this,e)){let t=this[e];delete this[e],this[e]=t}}attributeChangedCallback(e,t,i){this.#i(),this.#h(e,t,i)}#h(e,t,i){["id","class"].includes(e)||!d.observedAttributes.includes(e)&&this.constructor.observedAttributes.includes(e)||(null===i?this.nativeEl?.removeAttribute(e):this.nativeEl?.getAttribute(e)!==i&&this.nativeEl?.setAttribute(e,i))}connectedCallback(){this.#i()}}}function u(e){let t="";for(let i in e){if(!s.includes(i))continue;let a=e[i];""===a?t+=` ${i}`:t+=` ${i}="${a}"`}return t}let h=d(globalThis.HTMLElement??class{},{tag:"video"});d(globalThis.HTMLElement??class{},{tag:"audio"});class c extends Event{track;constructor(e,t){super(e),this.track=t.track}}let m=new WeakMap;function p(e){var t,i;let a;return m.get(e)??(t=e,i={},(a=m.get(t))||m.set(t,a={}),Object.assign(a,i))}function v(e,t){let i=e.videoTracks;p(t).media=e,p(t).renditionSet||(p(t).renditionSet=new Set);let a=p(i).trackSet;a.add(t);let n=a.size-1;n in b.prototype||Object.defineProperty(b.prototype,n,{get(){return[...p(this).trackSet][n]}}),queueMicrotask(()=>{i.dispatchEvent(new c("addtrack",{track:t}))})}function E(e){let t=p(e).media?.videoTracks;t&&(p(t).trackSet.delete(e),queueMicrotask(()=>{t.dispatchEvent(new c("removetrack",{track:e}))}))}class b extends EventTarget{#c;#m;#p;constructor(){super(),p(this).trackSet=new Set}get #v(){return p(this).trackSet}[Symbol.iterator](){return this.#v.values()}get length(){return this.#v.size}getTrackById(e){return[...this.#v].find(t=>t.id===e)??null}get selectedIndex(){return[...this.#v].findIndex(e=>e.selected)}get onaddtrack(){return this.#c}set onaddtrack(e){this.#c&&(this.removeEventListener("addtrack",this.#c),this.#c=void 0),"function"==typeof e&&(this.#c=e,this.addEventListener("addtrack",e))}get onremovetrack(){return this.#m}set onremovetrack(e){this.#m&&(this.removeEventListener("removetrack",this.#m),this.#m=void 0),"function"==typeof e&&(this.#m=e,this.addEventListener("removetrack",e))}get onchange(){return this.#p}set onchange(e){this.#p&&(this.removeEventListener("change",this.#p),this.#p=void 0),"function"==typeof e&&(this.#p=e,this.addEventListener("change",e))}}class g extends Event{rendition;constructor(e,t){super(e),this.rendition=t.rendition}}function f(e){return[...p(e).media.videoTracks].filter(e=>e.selected).flatMap(e=>[...p(e).renditionSet])}class A extends EventTarget{#E;#b;#p;[Symbol.iterator](){return f(this).values()}get length(){return f(this).length}getRenditionById(e){return f(this).find(t=>`${t.id}`==`${e}`)??null}get selectedIndex(){return f(this).findIndex(e=>e.selected)}set selectedIndex(e){for(let[t,i]of f(this).entries())i.selected=t===e}get onaddrendition(){return this.#E}set onaddrendition(e){this.#E&&(this.removeEventListener("addrendition",this.#E),this.#E=void 0),"function"==typeof e&&(this.#E=e,this.addEventListener("addrendition",e))}get onremoverendition(){return this.#b}set onremoverendition(e){this.#b&&(this.removeEventListener("removerendition",this.#b),this.#b=void 0),"function"==typeof e&&(this.#b=e,this.addEventListener("removerendition",e))}get onchange(){return this.#p}set onchange(e){this.#p&&(this.removeEventListener("change",this.#p),this.#p=void 0),"function"==typeof e&&(this.#p=e,this.addEventListener("change",e))}}class k{src;id;width;height;bitrate;frameRate;codec;#g=!1;get selected(){return this.#g}set selected(e){if(this.#g!==e){var t;let i;this.#g=e,t=this,(i=p(t).media.videoRenditions)&&!p(i).changeRequested&&(p(i).changeRequested=!0,queueMicrotask(()=>{delete p(i).changeRequested,p(t).track.selected&&i.dispatchEvent(new Event("change"))}))}}}class y{id;kind;label="";language="";sourceBuffer;#g=!1;addRendition(e,t,i,a,n,r){var s;let o,l,d,u=new k;return u.src=e,u.width=t,u.height=i,u.frameRate=r,u.bitrate=n,u.codec=a,s=this,o=p(s).media.videoRenditions,p(u).media=p(s).media,p(u).track=s,(l=p(s).renditionSet).add(u),(d=l.size-1)in A.prototype||Object.defineProperty(A.prototype,d,{get(){return f(this)[d]}}),queueMicrotask(()=>{s.selected&&o.dispatchEvent(new g("addrendition",{rendition:u}))}),u}removeRendition(e){let t,i;t=p(e).media.videoRenditions,i=p(e).track,p(i).renditionSet.delete(e),queueMicrotask(()=>{p(e).track.selected&&t.dispatchEvent(new g("removerendition",{rendition:e}))})}get selected(){return this.#g}set selected(e){this.#g===e||(this.#g=e,!0===e&&function(e){let t=p(e).media.videoTracks??[],i=!1;for(let a of t)a!==e&&(a.selected=!1,i=!0);if(i){if(p(t).changeRequested)return;p(t).changeRequested=!0,queueMicrotask(()=>{delete p(t).changeRequested,t.dispatchEvent(new Event("change"))})}}(this))}}function C(e){return[...p(e).media.audioTracks].filter(e=>e.enabled).flatMap(e=>[...p(e).renditionSet])}class w extends EventTarget{#E;#b;#p;[Symbol.iterator](){return C(this).values()}get length(){return C(this).length}getRenditionById(e){return C(this).find(t=>`${t.id}`==`${e}`)??null}get selectedIndex(){return C(this).findIndex(e=>e.selected)}set selectedIndex(e){for(let[t,i]of C(this).entries())i.selected=t===e}get onaddrendition(){return this.#E}set onaddrendition(e){this.#E&&(this.removeEventListener("addrendition",this.#E),this.#E=void 0),"function"==typeof e&&(this.#E=e,this.addEventListener("addrendition",e))}get onremoverendition(){return this.#b}set onremoverendition(e){this.#b&&(this.removeEventListener("removerendition",this.#b),this.#b=void 0),"function"==typeof e&&(this.#b=e,this.addEventListener("removerendition",e))}get onchange(){return this.#p}set onchange(e){this.#p&&(this.removeEventListener("change",this.#p),this.#p=void 0),"function"==typeof e&&(this.#p=e,this.addEventListener("change",e))}}class I{src;id;bitrate;codec;#g=!1;get selected(){return this.#g}set selected(e){if(this.#g!==e){var t;let i;this.#g=e,t=this,(i=p(t).media.audioRenditions)&&!p(i).changeRequested&&(p(i).changeRequested=!0,queueMicrotask(()=>{delete p(i).changeRequested,p(t).track.enabled&&i.dispatchEvent(new Event("change"))}))}}}function T(e,t){let i=e.audioTracks;p(t).media=e,p(t).renditionSet||(p(t).renditionSet=new Set);let a=p(i).trackSet;a.add(t);let n=a.size-1;n in S.prototype||Object.defineProperty(S.prototype,n,{get(){return[...p(this).trackSet][n]}}),queueMicrotask(()=>{i.dispatchEvent(new c("addtrack",{track:t}))})}function _(e){let t=p(e).media?.audioTracks;t&&(p(t).trackSet.delete(e),queueMicrotask(()=>{t.dispatchEvent(new c("removetrack",{track:e}))}))}class S extends EventTarget{#c;#m;#p;constructor(){super(),p(this).trackSet=new Set}get #v(){return p(this).trackSet}[Symbol.iterator](){return this.#v.values()}get length(){return this.#v.size}getTrackById(e){return[...this.#v].find(t=>t.id===e)??null}get onaddtrack(){return this.#c}set onaddtrack(e){this.#c&&(this.removeEventListener("addtrack",this.#c),this.#c=void 0),"function"==typeof e&&(this.#c=e,this.addEventListener("addtrack",e))}get onremovetrack(){return this.#m}set onremovetrack(e){this.#m&&(this.removeEventListener("removetrack",this.#m),this.#m=void 0),"function"==typeof e&&(this.#m=e,this.addEventListener("removetrack",e))}get onchange(){return this.#p}set onchange(e){this.#p&&(this.removeEventListener("change",this.#p),this.#p=void 0),"function"==typeof e&&(this.#p=e,this.addEventListener("change",e))}}class M{id;kind;label="";language="";sourceBuffer;#f=!1;addRendition(e,t,i){var a;let n,r,s,o=new I;return o.src=e,o.codec=t,o.bitrate=i,a=this,n=p(a).media.audioRenditions,p(o).media=p(a).media,p(o).track=a,(r=p(a).renditionSet).add(o),(s=r.size-1)in w.prototype||Object.defineProperty(w.prototype,s,{get(){return C(this)[s]}}),queueMicrotask(()=>{a.enabled&&n.dispatchEvent(new g("addrendition",{rendition:o}))}),o}removeRendition(e){let t,i;t=p(e).media.audioRenditions,i=p(e).track,p(i).renditionSet.delete(e),queueMicrotask(()=>{p(e).track.enabled&&t.dispatchEvent(new g("removerendition",{rendition:e}))})}get enabled(){return this.#f}set enabled(e){if(this.#f!==e){let t;this.#f=e,(t=p(this).media.audioTracks)&&!p(t).changeRequested&&(p(t).changeRequested=!0,queueMicrotask(()=>{delete p(t).changeRequested,t.dispatchEvent(new Event("change"))}))}}}let L=x(globalThis.HTMLMediaElement,"video"),R=x(globalThis.HTMLMediaElement,"audio");function x(e,t){if(e?.prototype)return Object.getOwnPropertyDescriptor(e.prototype,`${t}Tracks`)?.get}var D=i(72293);let N=(a=function(e){if(!e?.prototype)return e;let t=x(e,"video");(!t||`${t}`.includes("[native code]"))&&Object.defineProperty(e.prototype,"videoTracks",{get(){var e=this;let t=p(e).videoTracks;if(!t&&(t=new b,p(e).videoTracks=t,L)){let i=L.call(e.nativeEl??e);for(let t of i)v(e,t);i.addEventListener("change",()=>{t.dispatchEvent(new Event("change"))}),i.addEventListener("addtrack",a=>{if([...t].some(e=>e instanceof y)){for(let e of i)E(e);return}v(e,a.track)}),i.addEventListener("removetrack",e=>{E(e.track)})}return t}});let i=x(e,"audio");(!i||`${i}`.includes("[native code]"))&&Object.defineProperty(e.prototype,"audioTracks",{get(){var e=this;let t=p(e).audioTracks;if(!t&&(t=new S,p(e).audioTracks=t,R)){let i=R.call(e.nativeEl??e);for(let t of i)T(e,t);i.addEventListener("change",()=>{t.dispatchEvent(new Event("change"))}),i.addEventListener("addtrack",a=>{if([...t].some(e=>e instanceof M)){for(let e of i)_(e);return}T(e,a.track)}),i.addEventListener("removetrack",e=>{_(e.track)})}return t}}),"addVideoTrack"in e.prototype||(e.prototype.addVideoTrack=function(e,t="",i=""){let a=new y;return a.kind=e,a.label=t,a.language=i,v(this,a),a}),"removeVideoTrack"in e.prototype||(e.prototype.removeVideoTrack=E),"addAudioTrack"in e.prototype||(e.prototype.addAudioTrack=function(e,t="",i=""){let a=new M;return a.kind=e,a.label=t,a.language=i,T(this,a),a}),"removeAudioTrack"in e.prototype||(e.prototype.removeAudioTrack=_),"videoRenditions"in e.prototype||Object.defineProperty(e.prototype,"videoRenditions",{get(){return a(this)}});let a=e=>{let t=p(e).videoRenditions;return t||(p(t=new A).media=e,p(e).videoRenditions=t),t};"audioRenditions"in e.prototype||Object.defineProperty(e.prototype,"audioRenditions",{get(){return n(this)}});let n=e=>{let t=p(e).audioRenditions;return t||(p(t=new w).media=e,p(e).audioRenditions=t),t};return e}(h),class extends a{static shadowRootOptions={...a.shadowRootOptions};static getTemplateHTML=e=>{let{src:t,...i}=e;return a.getTemplateHTML(i)};#A=null;#k=null;constructor(){super(),this.#o("config")}get config(){return this.#k}set config(e){this.#k=e}attributeChangedCallback(e,t,i){"src"!==e&&super.attributeChangedCallback(e,t,i),"src"===e&&t!=i&&this.load()}#y(){var e,t;null==(e=this.#A)||e.remove(),null==(t=this.nativeEl)||t.removeEventListener("webkitcurrentplaybacktargetiswirelesschanged",this.#C),this.api&&(this.api.detachMedia(),this.api.destroy(),this.api=null)}async load(){var e;if(this.#y(),this.src){if(D.Ay.isSupported()){switch(this.api=new D.Ay({liveDurationInfinity:!0,autoStartLoad:!1,...this.config}),await Promise.resolve(),this.api.loadSource(this.src),this.api.attachMedia(this.nativeEl),this.nativeEl.preload){case"none":{let e=()=>this.api.startLoad();this.nativeEl.addEventListener("play",e,{once:!0}),this.api.on(D.Ay.Events.DESTROYING,()=>{this.nativeEl.removeEventListener("play",e)});break}case"metadata":{let e=this.api.config.maxBufferLength,t=this.api.config.maxBufferSize;this.api.config.maxBufferLength=1,this.api.config.maxBufferSize=1;let i=()=>{this.api.config.maxBufferLength=e,this.api.config.maxBufferSize=t};this.nativeEl.addEventListener("play",i,{once:!0}),this.api.on(D.Ay.Events.DESTROYING,()=>{this.nativeEl.removeEventListener("play",i)}),this.api.startLoad();break}default:this.api.startLoad()}this.nativeEl.webkitCurrentPlaybackTargetIsWireless&&this.api.stopLoad(),this.nativeEl.addEventListener("webkitcurrentplaybacktargetiswirelesschanged",this.#C),this.#A=document.createElement("source"),this.#A.setAttribute("type","application/x-mpegURL"),this.#A.setAttribute("src",this.src),this.nativeEl.disableRemotePlayback=!1,this.nativeEl.append(this.#A);let t=new WeakMap;this.api.on(D.Ay.Events.MANIFEST_PARSED,(e,i)=>{n();let a=this.videoTracks.getTrackById("main");for(let[e,n]of(a||((a=this.addVideoTrack("main")).id="main",a.selected=!0),i.levels.entries())){let i=a.addRendition(n.url[0],n.width,n.height,n.videoCodec,n.bitrate);t.set(n,`${e}`),i.id=`${e}`}for(let[e,t]of i.audioTracks.entries()){let i=t.default?"main":"alternative",a=this.addAudioTrack(i,t.name,t.lang);a.id=`${e}`,t.default&&(a.enabled=!0)}}),this.audioTracks.addEventListener("change",()=>{var e;let t=+(null==(e=[...this.audioTracks].find(e=>e.enabled))?void 0:e.id),i=this.api.audioTracks.map(e=>e.id);t!=this.api.audioTrack&&i.includes(t)&&(this.api.audioTrack=t)}),this.api.on(D.Ay.Events.LEVELS_UPDATED,(e,i)=>{let a=this.videoTracks[this.videoTracks.selectedIndex??0];if(!a)return;let n=i.levels.map(e=>t.get(e));for(let e of this.videoRenditions)e.id&&!n.includes(e.id)&&a.removeRendition(e)});let i=e=>{let t=e.target.selectedIndex;t!=this.api.nextLevel&&a(t)},a=e=>{let t=this.currentTime,i=!1,a=(e,t)=>{i||=!Number.isFinite(t.endOffset)};this.api.on(D.Ay.Events.BUFFER_FLUSHING,a),this.api.nextLevel=e,this.api.off(D.Ay.Events.BUFFER_FLUSHING,a),i||this.api.trigger(D.Ay.Events.BUFFER_FLUSHING,{startOffset:t+10,endOffset:1/0,type:"video"})};null==(e=this.videoRenditions)||e.addEventListener("change",i);let n=()=>{for(let e of this.videoTracks)this.removeVideoTrack(e);for(let e of this.audioTracks)this.removeAudioTrack(e)};this.api.once(D.Ay.Events.DESTROYING,n);return}await Promise.resolve(),this.nativeEl.canPlayType("application/vnd.apple.mpegurl")&&(this.nativeEl.src=this.src)}}#C=()=>{var e,t,i;(null==(e=this.nativeEl)?void 0:e.webkitCurrentPlaybackTargetIsWireless)?null==(t=this.api)||t.stopLoad():null==(i=this.api)||i.startLoad()};#o(e){if(Object.prototype.hasOwnProperty.call(this,e)){let t=this[e];delete this[e],this[e]=t}}});globalThis.customElements&&!globalThis.customElements.get("hls-video")&&globalThis.customElements.define("hls-video",N);var P=new Set(["style","children","ref","key","suppressContentEditableWarning","suppressHydrationWarning","dangerouslySetInnerHTML"]),U={className:"class",htmlFor:"for"};function G(e,t,i){var a;e[t]=i,null==i&&t in((null==(a=globalThis.HTMLElement)?void 0:a.prototype)??{})&&e.removeAttribute(t)}var O=function({react:e,tagName:t,elementClass:i,events:a,displayName:n,toAttributeName:r=function(e){return e.toLowerCase()},toAttributeValue:s=function(e){return"boolean"==typeof e?e?"":void 0:"function"==typeof e?void 0:"object"!=typeof e||null===e?e:void 0}}){let o=Number.parseInt(e.version)>=19,l=e.forwardRef((n,l)=>{var d,u;let h=e.useRef(null),c=e.useRef(new Map),m={},p={},v={},E={};for(let[e,t]of Object.entries(n)){if(P.has(e)){v[e]=t;continue}let a=r(U[e]??e);if(e in i.prototype&&!(e in((null==(d=globalThis.HTMLElement)?void 0:d.prototype)??{}))&&!(null==(u=i.observedAttributes)?void 0:u.some(e=>e===a))){E[e]=t;continue}if(e.startsWith("on")){m[e]=t;continue}let n=s(t);a&&null!=n&&(p[a]=String(n),o||(v[a]=n)),a&&o&&(v[a]=t)}if("u">typeof window){for(let t in m){let i=m[t],n=t.endsWith("Capture"),r=((null==a?void 0:a[t])??t.slice(2).toLowerCase()).slice(0,n?-7:void 0);e.useLayoutEffect(()=>{let e=null==h?void 0:h.current;if(e&&"function"==typeof i)return e.addEventListener(r,i,n),()=>{e.removeEventListener(r,i,n)}},[null==h?void 0:h.current,i])}e.useLayoutEffect(()=>{if(null===h.current)return;let e=new Map;for(let t in E)G(h.current,t,E[t]),c.current.delete(t),e.set(t,E[t]);for(let[e,t]of c.current)G(h.current,e,void 0);c.current=e})}if("u"<typeof window&&(null==i?void 0:i.getTemplateHTML)&&(null==i?void 0:i.shadowRootOptions)){let{mode:t,delegatesFocus:a}=i.shadowRootOptions;v.children=[e.createElement("template",{shadowrootmode:t,shadowrootdelegatesfocus:a,dangerouslySetInnerHTML:{__html:i.getTemplateHTML(p,n)}}),v.children]}return e.createElement(t,{...v,ref:e.useCallback(e=>{h.current=e,"function"==typeof l?l(e):null!==l&&(l.current=e)},[l])})});return l.displayName=n??i.name,l}({react:n,tagName:"hls-video",elementClass:N})},33908:(e,t,i)=>{i.d(t,{u:()=>l,v:()=>o});var a=i(84411);let n=new WeakMap,r=e=>{let t=n.get(e);return t||n.set(e,t=new Set),t},s=new a.Au.ResizeObserver(e=>{for(let t of e)for(let e of r(t.target))e(t)});function o(e,t){r(e).add(t),s.observe(e)}function l(e,t){let i=r(e);i.delete(t),i.size||s.unobserve(e)}},38591:(e,t,i)=>{i.d(t,{Ay:()=>E,L5:()=>m,ap:()=>c});var a,n=i(15923),r=i(84411),s=i(83074),o=i(43988),l=i(3341),d=i(42716),u=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot read from private field");return i?i.call(e):t.get(e)};let h="rates",c=[1,1.2,1.5,1.7,2],m=1,p=r.Al.createElement("template");p.innerHTML=`
  <style>
    :host {
      min-width: 5ch;
      padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
    }
  </style>
  <slot name="icon"></slot>
`;class v extends n.T{constructor(e={}){super({slotTemplate:p,tooltipContent:(0,d.t)("Playback rate"),...e}),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,a,new o.M(this,h,{defaultValue:c})),this.container=this.shadowRoot.querySelector('slot[name="icon"]'),this.container.innerHTML=`${m}x`}static get observedAttributes(){return[...super.observedAttributes,s.GC.MEDIA_PLAYBACK_RATE,h]}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),e===h&&(u(this,a).value=i),e===s.GC.MEDIA_PLAYBACK_RATE){let e=i?+i:NaN,t=Number.isNaN(e)?m:e;this.container.innerHTML=`${t}x`,this.setAttribute("aria-label",(0,d.t)("Playback rate {playbackRate}",{playbackRate:t}))}}get rates(){return u(this,a)}set rates(e){e?Array.isArray(e)&&(u(this,a).value=e.join(" ")):u(this,a).value=""}get mediaPlaybackRate(){return(0,l.dm)(this,s.GC.MEDIA_PLAYBACK_RATE,m)}set mediaPlaybackRate(e){(0,l.pK)(this,s.GC.MEDIA_PLAYBACK_RATE,e)}handleClick(){var e,t;let i=Array.from(this.rates.values(),e=>+e).sort((e,t)=>e-t),a=null!=(t=null!=(e=i.find(e=>e>this.mediaPlaybackRate))?e:i[0])?t:m,n=new r.Au.CustomEvent(s.a8.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:a});this.dispatchEvent(n)}}a=new WeakMap,r.Au.customElements.get("media-playback-rate-button")||r.Au.customElements.define("media-playback-rate-button",v);var E=v},42324:(e,t,i)=>{function a(e){return null==e?void 0:e.map(r).join(" ")}function n(e){return null==e?void 0:e.split(/\s+/).map(s)}function r(e){if(e){let{id:t,width:i,height:a}=e;return[t,i,a].filter(e=>null!=e).join(":")}}function s(e){if(e){let[t,i,a]=e.split(":");return{id:t,width:+i,height:+a}}}function o(e){return null==e?void 0:e.map(d).join(" ")}function l(e){return null==e?void 0:e.split(/\s+/).map(u)}function d(e){if(e){let{id:t,kind:i,language:a,label:n}=e;return[t,i,a,n].filter(e=>null!=e).join(":")}}function u(e){if(e){let[t,i,a,n]=e.split(":");return{id:t,kind:i,language:a,label:n}}}function h(e){return"number"==typeof e&&!Number.isNaN(e)&&Number.isFinite(e)}i.d(t,{Br:()=>o,MT:()=>n,SF:()=>a,cb:()=>c,gf:()=>h,j3:()=>l});let c=e=>new Promise(t=>setTimeout(t,e))},42716:(e,t,i)=>{var a;i.d(t,{x:()=>o,t:()=>l});let n={"Start airplay":"Start airplay","Stop airplay":"Stop airplay",Audio:"Audio",Captions:"Captions","Enable captions":"Enable captions","Disable captions":"Disable captions","Start casting":"Start casting","Stop casting":"Stop casting","Enter fullscreen mode":"Enter fullscreen mode","Exit fullscreen mode":"Exit fullscreen mode",Mute:"Mute",Unmute:"Unmute","Enter picture in picture mode":"Enter picture in picture mode","Exit picture in picture mode":"Exit picture in picture mode",Play:"Play",Pause:"Pause","Playback rate":"Playback rate","Playback rate {playbackRate}":"Playback rate {playbackRate}",Quality:"Quality","Seek backward":"Seek backward","Seek forward":"Seek forward",Settings:"Settings","audio player":"audio player","video player":"video player",volume:"volume",seek:"seek","closed captions":"closed captions","current playback rate":"current playback rate","playback time":"playback time","media loading":"media loading",settings:"settings","audio tracks":"audio tracks",quality:"quality",play:"play",pause:"pause",mute:"mute",unmute:"unmute",live:"live","start airplay":"start airplay","stop airplay":"stop airplay","start casting":"start casting","stop casting":"stop casting","enter fullscreen mode":"enter fullscreen mode","exit fullscreen mode":"exit fullscreen mode","enter picture in picture mode":"enter picture in picture mode","exit picture in picture mode":"exit picture in picture mode","seek to live":"seek to live","playing live":"playing live","seek back {seekOffset} seconds":"seek back {seekOffset} seconds","seek forward {seekOffset} seconds":"seek forward {seekOffset} seconds","Network Error":"Network Error","Decode Error":"Decode Error","Source Not Supported":"Source Not Supported","Encryption Error":"Encryption Error","A network error caused the media download to fail.":"A network error caused the media download to fail.","A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.":"A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.","An unsupported error occurred. The server or network failed, or your browser does not support this format.":"An unsupported error occurred. The server or network failed, or your browser does not support this format.","The media is encrypted and there are no keys to decrypt it.":"The media is encrypted and there are no keys to decrypt it."},r={en:n},s=(null==(a=globalThis.navigator)?void 0:a.language.split("-")[0])||"en",o=e=>{s=e},l=(e,t={})=>{var i;return((null==(i=r[s])?void 0:i[e])||n[e]).replace(/\{(\w+)\}/g,(e,i)=>void 0!==t[i]?String(t[i]):`{${i}}`)}},43902:(e,t,i)=>{i.d(t,{fU:()=>s,ss:()=>r});var a=i(42324);let n=[{singular:"hour",plural:"hours"},{singular:"minute",plural:"minutes"},{singular:"second",plural:"seconds"}],r=e=>{if(!(0,a.gf)(e))return"";let t=Math.abs(e),i=t!==e,r=new Date(0,0,0,0,0,t,0),s=[r.getHours(),r.getMinutes(),r.getSeconds()].map((e,t)=>{let i;return e&&(i=1===e?n[t].singular:n[t].plural,`${e} ${i}`)}).filter(e=>e).join(", ");return`${s}${i?" remaining":""}`};function s(e,t){let i=!1;e<0&&(i=!0,e=0-e);let a=Math.floor((e=e<0?0:e)%60),n=Math.floor(e/60%60),r=Math.floor(e/3600),s=Math.floor(t/60%60),o=Math.floor(t/3600);return(isNaN(e)||e===1/0)&&(r=n=a="0"),n=(((r=r>0||o>0?r+":":"")||s>=10)&&n<10?"0"+n:n)+":",(i?"-":"")+r+n+(a=a<10?"0"+a:a)}Object.freeze({length:0,start(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0},end(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0}})},43988:(e,t,i)=>{i.d(t,{M:()=>m});var a,n,r,s,o,l,d=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},u=(e,t,i)=>(d(e,t,"read from private field"),i?i.call(e):t.get(e)),h=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},c=(e,t,i,a)=>(d(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);class m{constructor(e,t,{defaultValue:i}={defaultValue:void 0}){h(this,o),h(this,a,void 0),h(this,n,void 0),h(this,r,void 0),h(this,s,new Set),c(this,a,e),c(this,n,t),c(this,r,new Set(i))}[Symbol.iterator](){return u(this,o,l).values()}get length(){return u(this,o,l).size}get value(){var e;return null!=(e=[...u(this,o,l)].join(" "))?e:""}set value(e){var t;e!==this.value&&(c(this,s,new Set),this.add(...null!=(t=null==e?void 0:e.split(" "))?t:[]))}toString(){return this.value}item(e){return[...u(this,o,l)][e]}values(){return u(this,o,l).values()}forEach(e,t){u(this,o,l).forEach(e,t)}add(...e){var t,i;e.forEach(e=>u(this,s).add(e)),(""!==this.value||(null==(t=u(this,a))?void 0:t.hasAttribute(`${u(this,n)}`)))&&(null==(i=u(this,a))||i.setAttribute(`${u(this,n)}`,`${this.value}`))}remove(...e){var t;e.forEach(e=>u(this,s).delete(e)),null==(t=u(this,a))||t.setAttribute(`${u(this,n)}`,`${this.value}`)}contains(e){return u(this,o,l).has(e)}toggle(e,t){if(void 0!==t)if(t)return this.add(e),!0;else return this.remove(e),!1;return this.contains(e)?(this.remove(e),!1):(this.add(e),!0)}replace(e,t){return this.remove(e),this.add(t),e===t}}a=new WeakMap,n=new WeakMap,r=new WeakMap,s=new WeakMap,o=new WeakSet,l=function(){return u(this,s).size?u(this,s):u(this,r)}},52135:(e,t,i)=>{i.d(t,{v:()=>s});var a=i(38275);let n=e=>{let t,i=new Set,a=(e,a)=>{let n="function"==typeof e?e(t):e;if(!Object.is(n,t)){let e=t;t=(null!=a?a:"object"!=typeof n||null===n)?n:Object.assign({},t,n),i.forEach(i=>i(t,e))}},n=()=>t,r={setState:a,getState:n,getInitialState:()=>s,subscribe:e=>(i.add(e),()=>i.delete(e))},s=t=e(a,n,r);return r},r=e=>{let t=e?n(e):n,i=e=>(function(e,t=e=>e){let i=a.useSyncExternalStore(e.subscribe,()=>t(e.getState()),()=>t(e.getInitialState()));return a.useDebugValue(i),i})(t,e);return Object.assign(i,t),i},s=e=>e?r(e):r},55420:(e,t,i)=>{i.d(t,{a0:()=>o});let a=new Set(["style","children","ref","key","suppressContentEditableWarning","suppressHydrationWarning","dangerouslySetInnerHTML"]),n={className:"class",htmlFor:"for"};function r(e){return e.toLowerCase()}function s(e){return"boolean"==typeof e?e?"":void 0:"function"==typeof e?void 0:"object"!=typeof e||null===e?e:void 0}function o({react:e,tagName:t,elementClass:i,events:o,displayName:d,toAttributeName:u=r,toAttributeValue:h=s}){let c=Number.parseInt(e.version)>=19,m=e.forwardRef((r,s)=>{let d=e.useRef(null),m=e.useRef(new Map),p={},v={},E={},b={};for(let[e,t]of Object.entries(r)){if(a.has(e)){E[e]=t;continue}let r=u(n[e]??e);if(e in i.prototype&&!(e in(globalThis.HTMLElement?.prototype??{}))&&!i.observedAttributes?.some(e=>e===r)){b[e]=t;continue}if(e.startsWith("on")){p[e]=t;continue}let s=h(t);r&&null!=s&&(v[r]=String(s),c||(E[r]=s)),r&&c&&(E[r]=t)}if("u">typeof window){for(let t in p){let i=p[t],a=t.endsWith("Capture"),n=(o?.[t]??t.slice(2).toLowerCase()).slice(0,a?-7:void 0);e.useLayoutEffect(()=>{let e=d?.current;if(e&&"function"==typeof i)return e.addEventListener(n,i,a),()=>{e.removeEventListener(n,i,a)}},[d?.current,i])}e.useLayoutEffect(()=>{if(null===d.current)return;let e=new Map;for(let t in b)l(d.current,t,b[t]),m.current.delete(t),e.set(t,b[t]);for(let[e,t]of m.current)l(d.current,e,void 0);m.current=e})}if("u"<typeof window&&i?.getTemplateHTML&&i?.shadowRootOptions){let{mode:t,delegatesFocus:a}=i.shadowRootOptions;E.children=[e.createElement("template",{shadowrootmode:t,shadowrootdelegatesfocus:a,dangerouslySetInnerHTML:{__html:i.getTemplateHTML(v)}}),E.children]}return e.createElement(t,{...E,ref:e.useCallback(e=>{d.current=e,"function"==typeof s?s(e):null!==s&&(s.current=e)},[s])})});return m.displayName=d??i.name,m}function l(e,t,i){e[t]=i,null==i&&t in(globalThis.HTMLElement?.prototype??{})&&e.removeAttribute(t)}},63059:(e,t,i)=>{i.d(t,{Ci:()=>nk,Ph:()=>ny,xX:()=>nA,Ic:()=>nC,OB:()=>nw,aH:()=>nI,WY:()=>nT,nN:()=>n_,WW:()=>nS,td:()=>nM});var a,n,r,s,o,l,d,u,h,c,m,p,v,E,b,g,f,A,k,y,C,w,I,T,_,S,M,L,R,x,D,N,P,U,G,O,W,$,H,B,V,q,Q,F,Y,j,K,Z,z,X,J,ee,et,ei,ea,en,er,es,eo,el,ed,eu,eh,ec,em,ep,ev,eE,eb,eg,ef,eA,ek,ey,eC,ew,eI,eT,e_,eS,eM,eL,eR,ex,eD,eN,eP,eU,eG,eO,eW,e$,eH,eB,eV,eq,eQ,eF,eY,ej,eK,eZ,ez,eX,eJ,e0,e1,e2,e3,e4,e5,e8,e7,e9,e6,te,tt,ti,ta=i(38275),tn=i(55420),tr=i(83074),ts=i(43902),to=i(42716),tl=i(84411),td=i(33908),tu=i(3341),th=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},tc=(e,t,i)=>(th(e,t,"read from private field"),i?i.call(e):t.get(e)),tm=(e,t,i,a)=>(th(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);let tp=tl.Al.createElement("template");tp.innerHTML=`
<style>
  :host {
    display: var(--media-control-display, var(--media-gesture-receiver-display, inline-block));
    box-sizing: border-box;
  }
</style>
`;class tv extends tl.Au.HTMLElement{constructor(e={}){if(super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,a,void 0),!this.shadowRoot){const t=this.attachShadow({mode:"open"}),i=tp.content.cloneNode(!0);this.nativeEl=i;let a=e.slotTemplate;a||((a=tl.Al.createElement("template")).innerHTML=`<slot>${e.defaultContent||""}</slot>`),this.nativeEl.appendChild(a.content.cloneNode(!0)),t.appendChild(i)}}static get observedAttributes(){return[tr.Ex.MEDIA_CONTROLLER,tr.GC.MEDIA_PAUSED]}attributeChangedCallback(e,t,i){var n,r,s,o,l;e===tr.Ex.MEDIA_CONTROLLER&&(t&&(null==(r=null==(n=tc(this,a))?void 0:n.unassociateElement)||r.call(n,this),tm(this,a,null)),i&&this.isConnected&&(tm(this,a,null==(s=this.getRootNode())?void 0:s.getElementById(i)),null==(l=null==(o=tc(this,a))?void 0:o.associateElement)||l.call(o,this)))}connectedCallback(){var e,t,i,n,r,s;let o;this.tabIndex=-1,this.setAttribute("aria-hidden","true"),tm(this,a,(r=this,(o=r.getAttribute(tr.Ex.MEDIA_CONTROLLER))?null==(s=r.getRootNode())?void 0:s.getElementById(o):(0,tu.CQ)(r,"media-controller"))),this.getAttribute(tr.Ex.MEDIA_CONTROLLER)&&(null==(t=null==(e=tc(this,a))?void 0:e.associateElement)||t.call(e,this)),null==(i=tc(this,a))||i.addEventListener("pointerdown",this),null==(n=tc(this,a))||n.addEventListener("click",this)}disconnectedCallback(){var e,t,i,n;this.getAttribute(tr.Ex.MEDIA_CONTROLLER)&&(null==(t=null==(e=tc(this,a))?void 0:e.unassociateElement)||t.call(e,this)),null==(i=tc(this,a))||i.removeEventListener("pointerdown",this),null==(n=tc(this,a))||n.removeEventListener("click",this),tm(this,a,null)}handleEvent(e){var t;let i=null==(t=e.composedPath())?void 0:t[0];if(["video","media-controller"].includes(null==i?void 0:i.localName)){if("pointerdown"===e.type)this._pointerType=e.pointerType;else if("click"===e.type){let{clientX:t,clientY:i}=e,{left:a,top:n,width:r,height:s}=this.getBoundingClientRect(),o=t-a,l=i-n;if(o<0||l<0||o>r||l>s||0===r&&0===s)return;let{pointerType:d=this._pointerType}=e;if(this._pointerType=void 0,d===tr.Np.TOUCH)return void this.handleTap(e);if(d===tr.Np.MOUSE)return void this.handleMouseClick(e)}}}get mediaPaused(){return(0,tu.Y_)(this,tr.GC.MEDIA_PAUSED)}set mediaPaused(e){(0,tu.QW)(this,tr.GC.MEDIA_PAUSED,e)}handleTap(e){}handleMouseClick(e){let t=this.mediaPaused?tr.a8.MEDIA_PLAY_REQUEST:tr.a8.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new tl.Au.CustomEvent(t,{composed:!0,bubbles:!0}))}}a=new WeakMap,tl.Au.customElements.get("media-gesture-receiver")||tl.Au.customElements.define("media-gesture-receiver",tv);var tE=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},tb=(e,t,i)=>(tE(e,t,"read from private field"),i?i.call(e):t.get(e)),tg=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},tf=(e,t,i,a)=>(tE(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),tA=(e,t,i)=>(tE(e,t,"access private method"),i);let tk="audio",ty="autohide",tC="breakpoints",tw="gesturesdisabled",tI="keyboardcontrol",tT="noautohide",t_="userinactive",tS="autohideovercontrols",tM=tl.Al.createElement("template");tM.innerHTML=`
  <style>
    
    :host([${tr.GC.MEDIA_IS_FULLSCREEN}]) ::slotted([slot=media]) {
      outline: none;
    }

    :host {
      box-sizing: border-box;
      position: relative;
      display: inline-block;
      line-height: 0;
      background-color: var(--media-background-color, #000);
    }

    :host(:not([${tk}])) [part~=layer]:not([part~=media-layer]) {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      display: flex;
      flex-flow: column nowrap;
      align-items: start;
      pointer-events: none;
      background: none;
    }

    slot[name=media] {
      display: var(--media-slot-display, contents);
    }

    
    :host([${tk}]) slot[name=media] {
      display: var(--media-slot-display, none);
    }

    
    :host([${tk}]) [part~=layer][part~=gesture-layer] {
      height: 0;
      display: block;
    }

    
    :host(:not([${tk}])[${tw}]) ::slotted([slot=gestures-chrome]),
    :host(:not([${tk}])[${tw}]) media-gesture-receiver[slot=gestures-chrome] {
      display: none;
    }

    
    ::slotted(:not([slot=media]):not([slot=poster]):not(media-loading-indicator):not([role=dialog]):not([hidden])) {
      pointer-events: auto;
    }

    :host(:not([${tk}])) *[part~=layer][part~=centered-layer] {
      align-items: center;
      justify-content: center;
    }

    :host(:not([${tk}])) ::slotted(media-gesture-receiver[slot=gestures-chrome]),
    :host(:not([${tk}])) media-gesture-receiver[slot=gestures-chrome] {
      align-self: stretch;
      flex-grow: 1;
    }

    slot[name=middle-chrome] {
      display: inline;
      flex-grow: 1;
      pointer-events: none;
      background: none;
    }

    
    ::slotted([slot=media]),
    ::slotted([slot=poster]) {
      width: 100%;
      height: 100%;
    }

    
    :host(:not([${tk}])) .spacer {
      flex-grow: 1;
    }

    
    :host(:-webkit-full-screen) {
      
      width: 100% !important;
      height: 100% !important;
    }

    
    ::slotted(:not([slot=media]):not([slot=poster]):not([${tT}]):not([hidden]):not([role=dialog])) {
      opacity: 1;
      transition: var(--media-control-transition-in, opacity 0.25s);
    }

    
    :host([${t_}]:not([${tr.GC.MEDIA_PAUSED}]):not([${tr.GC.MEDIA_IS_AIRPLAYING}]):not([${tr.GC.MEDIA_IS_CASTING}]):not([${tk}])) ::slotted(:not([slot=media]):not([slot=poster]):not([${tT}]):not([role=dialog])) {
      opacity: 0;
      transition: var(--media-control-transition-out, opacity 1s);
    }

    :host([${t_}]:not([${tT}]):not([${tr.GC.MEDIA_PAUSED}]):not([${tr.GC.MEDIA_IS_CASTING}]):not([${tk}])) ::slotted([slot=media]) {
      cursor: none;
    }

    :host([${t_}][${tS}]:not([${tT}]):not([${tr.GC.MEDIA_PAUSED}]):not([${tr.GC.MEDIA_IS_CASTING}]):not([${tk}])) * {
     --media-cursor: none;
     cursor: none;
    }


    ::slotted(media-control-bar)  {
      align-self: stretch;
    }

    
    :host(:not([${tk}])[${tr.GC.MEDIA_HAS_PLAYED}]) slot[name=poster] {
      display: none;
    }

    ::slotted([role=dialog]) {
      width: 100%;
      height: 100%;
      align-self: center;
    }

    ::slotted([role=menu]) {
      align-self: end;
    }
  </style>

  <slot name="media" part="layer media-layer"></slot>
  <slot name="poster" part="layer poster-layer"></slot>
  <slot name="gestures-chrome" part="layer gesture-layer">
    <media-gesture-receiver slot="gestures-chrome"></media-gesture-receiver>
  </slot>
  <span part="layer vertical-layer">
    <slot name="top-chrome" part="top chrome"></slot>
    <slot name="middle-chrome" part="middle chrome"></slot>
    <slot name="centered-chrome" part="layer centered-layer center centered chrome"></slot>
    
    <slot part="bottom chrome"></slot>
  </span>
  <slot name="dialog" part="layer dialog-layer"></slot>
`;let tL=Object.values(tr.GC);function tR(e,t){var i,a,n;if(!e.isConnected)return;let r=Object.fromEntries((null!=(i=e.getAttribute(tC))?i:"sm:384 md:576 lg:768 xl:960").split(/\s+/).map(e=>e.split(":"))),s=(a=r,n=t,Object.keys(a).filter(e=>n>=parseInt(a[e]))),o=!1;if(Object.keys(r).forEach(t=>{if(s.includes(t)){e.hasAttribute(`breakpoint${t}`)||(e.setAttribute(`breakpoint${t}`,""),o=!0);return}e.hasAttribute(`breakpoint${t}`)&&(e.removeAttribute(`breakpoint${t}`),o=!0)}),o){let t=new CustomEvent(tr.T$.BREAKPOINTS_CHANGE,{detail:s});e.dispatchEvent(t)}e.breakpointsComputed||(e.breakpointsComputed=!0,e.dispatchEvent(new CustomEvent(tr.T$.BREAKPOINTS_COMPUTED,{bubbles:!0,composed:!0})))}class tx extends tl.Au.HTMLElement{constructor(){super(),tg(this,d),tg(this,m),tg(this,v),tg(this,b),tg(this,f),tg(this,k),tg(this,n,0),tg(this,r,null),tg(this,s,null),tg(this,o,void 0),this.breakpointsComputed=!1,tg(this,l,new MutationObserver(tA(this,d,u).bind(this))),tg(this,h,!1),tg(this,c,e=>{tb(this,h)||(setTimeout(()=>{tR(e.target,e.contentRect.width),tf(this,h,!1)},0),tf(this,h,!0))}),this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(tM.content.cloneNode(!0)));const e=this.querySelector(":scope > slot[slot=media]");e&&e.addEventListener("slotchange",()=>{if(!e.assignedElements({flatten:!0}).length){tb(this,r)&&this.mediaUnsetCallback(tb(this,r));return}this.handleMediaUpdated(this.media)})}static get observedAttributes(){return[ty,tw].concat(tL).filter(e=>![tr.GC.MEDIA_RENDITION_LIST,tr.GC.MEDIA_AUDIO_TRACK_LIST,tr.GC.MEDIA_CHAPTERS_CUES,tr.GC.MEDIA_WIDTH,tr.GC.MEDIA_HEIGHT,tr.GC.MEDIA_ERROR,tr.GC.MEDIA_ERROR_MESSAGE].includes(e))}attributeChangedCallback(e,t,i){e.toLowerCase()==ty&&(this.autohide=i)}get media(){let e=this.querySelector(":scope > [slot=media]");return(null==e?void 0:e.nodeName)=="SLOT"&&(e=e.assignedElements({flatten:!0})[0]),e}async handleMediaUpdated(e){e&&(tf(this,r,e),e.localName.includes("-")&&await tl.Au.customElements.whenDefined(e.localName),this.mediaSetCallback(e))}connectedCallback(){var e;tb(this,l).observe(this,{childList:!0,subtree:!0}),(0,td.v)(this,tb(this,c));let t=null!=this.getAttribute(tk)?(0,to.t)("audio player"):(0,to.t)("video player");this.setAttribute("role","region"),this.setAttribute("aria-label",t),this.handleMediaUpdated(this.media),this.setAttribute(t_,""),tR(this,this.getBoundingClientRect().width),this.addEventListener("pointerdown",this),this.addEventListener("pointermove",this),this.addEventListener("pointerup",this),this.addEventListener("mouseleave",this),this.addEventListener("keyup",this),null==(e=tl.Au.window)||e.addEventListener("mouseup",this)}disconnectedCallback(){var e;tb(this,l).disconnect(),(0,td.u)(this,tb(this,c)),this.media&&this.mediaUnsetCallback(this.media),null==(e=tl.Au.window)||e.removeEventListener("mouseup",this)}mediaSetCallback(e){}mediaUnsetCallback(e){tf(this,r,null)}handleEvent(e){switch(e.type){case"pointerdown":tf(this,n,e.timeStamp);break;case"pointermove":tA(this,m,p).call(this,e);break;case"pointerup":tA(this,v,E).call(this,e);break;case"mouseleave":tA(this,b,g).call(this);break;case"mouseup":this.removeAttribute(tI);break;case"keyup":tA(this,k,y).call(this),this.setAttribute(tI,"")}}set autohide(e){let t=Number(e);tf(this,o,isNaN(t)?0:t)}get autohide(){return(void 0===tb(this,o)?2:tb(this,o)).toString()}get breakpoints(){return(0,tu.vT)(this,tC)}set breakpoints(e){(0,tu.tA)(this,tC,e)}get audio(){return(0,tu.Y_)(this,tk)}set audio(e){(0,tu.QW)(this,tk,e)}get gesturesDisabled(){return(0,tu.Y_)(this,tw)}set gesturesDisabled(e){(0,tu.QW)(this,tw,e)}get keyboardControl(){return(0,tu.Y_)(this,tI)}set keyboardControl(e){(0,tu.QW)(this,tI,e)}get noAutohide(){return(0,tu.Y_)(this,tT)}set noAutohide(e){(0,tu.QW)(this,tT,e)}get autohideOverControls(){return(0,tu.Y_)(this,tS)}set autohideOverControls(e){(0,tu.QW)(this,tS,e)}get userInteractive(){return(0,tu.Y_)(this,t_)}set userInteractive(e){(0,tu.QW)(this,t_,e)}}n=new WeakMap,r=new WeakMap,s=new WeakMap,o=new WeakMap,l=new WeakMap,d=new WeakSet,u=function(e){let t=this.media;for(let i of e)if("childList"===i.type){for(let e of i.removedNodes){if("media"!=e.slot||i.target!=this)continue;let a=i.previousSibling&&i.previousSibling.previousElementSibling;if(a&&t){let t="media"!==a.slot;for(;null!==(a=a.previousSibling);)"media"==a.slot&&(t=!1);t&&this.mediaUnsetCallback(e)}else this.mediaUnsetCallback(e)}if(t)for(let e of i.addedNodes)e===t&&this.handleMediaUpdated(t)}},h=new WeakMap,c=new WeakMap,m=new WeakSet,p=function(e){if("mouse"!==e.pointerType&&e.timeStamp-tb(this,n)<250)return;tA(this,f,A).call(this),clearTimeout(tb(this,s));let t=this.hasAttribute(tS);([this,this.media].includes(e.target)||t)&&tA(this,k,y).call(this)},v=new WeakSet,E=function(e){if("touch"===e.pointerType){let t=!this.hasAttribute(t_);[this,this.media].includes(e.target)&&t?tA(this,b,g).call(this):tA(this,k,y).call(this)}else e.composedPath().some(e=>["media-play-button","media-fullscreen-button"].includes(null==e?void 0:e.localName))&&tA(this,k,y).call(this)},b=new WeakSet,g=function(){if(0>tb(this,o)||this.hasAttribute(t_))return;this.setAttribute(t_,"");let e=new tl.Au.CustomEvent(tr.T$.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!0});this.dispatchEvent(e)},f=new WeakSet,A=function(){if(!this.hasAttribute(t_))return;this.removeAttribute(t_);let e=new tl.Au.CustomEvent(tr.T$.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!1});this.dispatchEvent(e)},k=new WeakSet,y=function(){tA(this,f,A).call(this),clearTimeout(tb(this,s));let e=parseInt(this.autohide);e<0||tf(this,s,setTimeout(()=>{tA(this,b,g).call(this)},1e3*e))},tl.Au.customElements.get("media-container")||tl.Au.customElements.define("media-container",tx);var tD=i(43988),tN=i(42324),tP=i(22440),tU=i(10574),tG=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},tO=(e,t,i)=>(tG(e,t,"read from private field"),i?i.call(e):t.get(e)),tW=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},t$=(e,t,i,a)=>(tG(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),tH=(e,t,i)=>(tG(e,t,"access private method"),i);let tB=["ArrowLeft","ArrowRight","Enter"," ","f","m","k","c"],tV="defaultsubtitles",tq="defaultstreamtype",tQ="defaultduration",tF="fullscreenelement",tY="hotkeys",tj="keysused",tK="liveedgeoffset",tZ="seektoliveoffset",tz="noautoseektolive",tX="nohotkeys",tJ="novolumepref",t0="nosubtitleslangpref",t1="nodefaultstore",t2="keyboardforwardseekoffset",t3="keyboardbackwardseekoffset",t4="lang";class t5 extends tx{constructor(){super(),tW(this,M),tW(this,R),tW(this,D),this.mediaStateReceivers=[],this.associatedElementSubscriptions=new Map,tW(this,C,new tD.M(this,tY)),tW(this,w,void 0),tW(this,I,void 0),tW(this,T,void 0),tW(this,_,void 0),tW(this,S,e=>{var t;null==(t=tO(this,I))||t.dispatch(e)}),this.associateElement(this);let e={};t$(this,T,t=>{Object.entries(t).forEach(([t,i])=>{if(t in e&&e[t]===i)return;this.propagateMediaState(t,i);let a=t.toLowerCase(),n=new tl.Au.CustomEvent(tr.nJ[a],{composed:!0,detail:i});this.dispatchEvent(n)}),e=t}),this.enableHotkeys()}static get observedAttributes(){return super.observedAttributes.concat(tX,tY,tq,tV,tQ,t4)}get mediaStore(){return tO(this,I)}set mediaStore(e){var t,i;(tO(this,I)&&(null==(t=tO(this,_))||t.call(this),t$(this,_,void 0)),t$(this,I,e),tO(this,I)||this.hasAttribute(t1))?t$(this,_,null==(i=tO(this,I))?void 0:i.subscribe(tO(this,T))):tH(this,M,L).call(this)}get fullscreenElement(){var e;return null!=(e=tO(this,w))?e:this}set fullscreenElement(e){var t;this.hasAttribute(tF)&&this.removeAttribute(tF),t$(this,w,e),null==(t=tO(this,I))||t.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement})}get defaultSubtitles(){return(0,tu.Y_)(this,tV)}set defaultSubtitles(e){(0,tu.QW)(this,tV,e)}get defaultStreamType(){return(0,tu.vT)(this,tq)}set defaultStreamType(e){(0,tu.tA)(this,tq,e)}get defaultDuration(){return(0,tu.dm)(this,tQ)}set defaultDuration(e){(0,tu.pK)(this,tQ,e)}get noHotkeys(){return(0,tu.Y_)(this,tX)}set noHotkeys(e){(0,tu.QW)(this,tX,e)}get keysUsed(){return(0,tu.vT)(this,tj)}set keysUsed(e){(0,tu.tA)(this,tj,e)}get liveEdgeOffset(){return(0,tu.dm)(this,tK)}set liveEdgeOffset(e){(0,tu.pK)(this,tK,e)}get noAutoSeekToLive(){return(0,tu.Y_)(this,tz)}set noAutoSeekToLive(e){(0,tu.QW)(this,tz,e)}get noVolumePref(){return(0,tu.Y_)(this,tJ)}set noVolumePref(e){(0,tu.QW)(this,tJ,e)}get noSubtitlesLangPref(){return(0,tu.Y_)(this,t0)}set noSubtitlesLangPref(e){(0,tu.QW)(this,t0,e)}get noDefaultStore(){return(0,tu.Y_)(this,t1)}set noDefaultStore(e){(0,tu.QW)(this,t1,e)}attributeChangedCallback(e,t,i){var a,n,r,s,o,l,d,u;if(super.attributeChangedCallback(e,t,i),e===tX)i!==t&&""===i?(this.hasAttribute(tY)&&console.warn("Media Chrome: Both `hotkeys` and `nohotkeys` have been set. All hotkeys will be disabled."),this.disableHotkeys()):i!==t&&null===i&&this.enableHotkeys();else if(e===tY)tO(this,C).value=i;else if(e===tV&&i!==t)null==(a=tO(this,I))||a.dispatch({type:"optionschangerequest",detail:{defaultSubtitles:this.hasAttribute(tV)}});else if(e===tq)null==(r=tO(this,I))||r.dispatch({type:"optionschangerequest",detail:{defaultStreamType:null!=(n=this.getAttribute(tq))?n:void 0}});else if(e===tK)null==(s=tO(this,I))||s.dispatch({type:"optionschangerequest",detail:{liveEdgeOffset:this.hasAttribute(tK)?+this.getAttribute(tK):void 0,seekToLiveOffset:this.hasAttribute(tZ)?void 0:+this.getAttribute(tK)}});else if(e===tZ)null==(o=tO(this,I))||o.dispatch({type:"optionschangerequest",detail:{seekToLiveOffset:this.hasAttribute(tZ)?+this.getAttribute(tZ):void 0}});else if(e===tz)null==(l=tO(this,I))||l.dispatch({type:"optionschangerequest",detail:{noAutoSeekToLive:this.hasAttribute(tz)}});else if(e===tF){let e=i?null==(d=this.getRootNode())?void 0:d.getElementById(i):void 0;t$(this,w,e),null==(u=tO(this,I))||u.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement})}else e===t4&&i!==t&&(0,to.x)(i)}connectedCallback(){var e,t;tO(this,I)||this.hasAttribute(t1)||tH(this,M,L).call(this),null==(e=tO(this,I))||e.dispatch({type:"documentelementchangerequest",detail:tl.Al}),super.connectedCallback(),tO(this,I)&&!tO(this,_)&&t$(this,_,null==(t=tO(this,I))?void 0:t.subscribe(tO(this,T))),this.enableHotkeys()}disconnectedCallback(){var e,t,i,a;null==(e=super.disconnectedCallback)||e.call(this),tO(this,I)&&(null==(t=tO(this,I))||t.dispatch({type:"documentelementchangerequest",detail:void 0}),null==(i=tO(this,I))||i.dispatch({type:tr.a8.MEDIA_TOGGLE_SUBTITLES_REQUEST,detail:!1})),tO(this,_)&&(null==(a=tO(this,_))||a.call(this),t$(this,_,void 0))}mediaSetCallback(e){var t;super.mediaSetCallback(e),null==(t=tO(this,I))||t.dispatch({type:"mediaelementchangerequest",detail:e}),e.hasAttribute("tabindex")||(e.tabIndex=-1)}mediaUnsetCallback(e){var t;super.mediaUnsetCallback(e),null==(t=tO(this,I))||t.dispatch({type:"mediaelementchangerequest",detail:void 0})}propagateMediaState(e,t){ir(this.mediaStateReceivers,e,t)}associateElement(e){if(!e)return;let{associatedElementSubscriptions:t}=this;if(t.has(e))return;let i=is(e,this.registerMediaStateReceiver.bind(this),this.unregisterMediaStateReceiver.bind(this));Object.values(tr.a8).forEach(t=>{e.addEventListener(t,tO(this,S))}),t.set(e,i)}unassociateElement(e){if(!e)return;let{associatedElementSubscriptions:t}=this;t.has(e)&&(t.get(e)(),t.delete(e),Object.values(tr.a8).forEach(t=>{e.removeEventListener(t,tO(this,S))}))}registerMediaStateReceiver(e){if(!e)return;let t=this.mediaStateReceivers;!(t.indexOf(e)>-1)&&(t.push(e),tO(this,I)&&Object.entries(tO(this,I).getState()).forEach(([t,i])=>{ir([e],t,i)}))}unregisterMediaStateReceiver(e){let t=this.mediaStateReceivers,i=t.indexOf(e);i<0||t.splice(i,1)}enableHotkeys(){this.addEventListener("keydown",tH(this,D,N))}disableHotkeys(){this.removeEventListener("keydown",tH(this,D,N)),this.removeEventListener("keyup",tH(this,R,x))}get hotkeys(){return(0,tu.vT)(this,tY)}set hotkeys(e){(0,tu.tA)(this,tY,e)}keyboardShortcutHandler(e){var t,i,a,n,r;let s,o,l,d=e.target;if(!((null!=(a=null!=(i=null==(t=d.getAttribute(tj))?void 0:t.split(" "))?i:null==d?void 0:d.keysUsed)?a:[]).map(e=>"Space"===e?" ":e).filter(Boolean).includes(e.key)||tO(this,C).contains(`no${e.key.toLowerCase()}`))&&!(" "===e.key&&tO(this,C).contains("nospace")))switch(e.key){case" ":case"k":s=tO(this,I).getState().mediaPaused?tr.a8.MEDIA_PLAY_REQUEST:tr.a8.MEDIA_PAUSE_REQUEST,this.dispatchEvent(new tl.Au.CustomEvent(s,{composed:!0,bubbles:!0}));break;case"m":s="off"===this.mediaStore.getState().mediaVolumeLevel?tr.a8.MEDIA_UNMUTE_REQUEST:tr.a8.MEDIA_MUTE_REQUEST,this.dispatchEvent(new tl.Au.CustomEvent(s,{composed:!0,bubbles:!0}));break;case"f":s=this.mediaStore.getState().mediaIsFullscreen?tr.a8.MEDIA_EXIT_FULLSCREEN_REQUEST:tr.a8.MEDIA_ENTER_FULLSCREEN_REQUEST,this.dispatchEvent(new tl.Au.CustomEvent(s,{composed:!0,bubbles:!0}));break;case"c":this.dispatchEvent(new tl.Au.CustomEvent(tr.a8.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}));break;case"ArrowLeft":{let e=this.hasAttribute(t3)?+this.getAttribute(t3):10;o=Math.max((null!=(n=this.mediaStore.getState().mediaCurrentTime)?n:0)-e,0),l=new tl.Au.CustomEvent(tr.a8.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:o}),this.dispatchEvent(l);break}case"ArrowRight":{let e=this.hasAttribute(t2)?+this.getAttribute(t2):10;o=Math.max((null!=(r=this.mediaStore.getState().mediaCurrentTime)?r:0)+e,0),l=new tl.Au.CustomEvent(tr.a8.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:o}),this.dispatchEvent(l)}}}}C=new WeakMap,w=new WeakMap,I=new WeakMap,T=new WeakMap,_=new WeakMap,S=new WeakMap,M=new WeakSet,L=function(){var e;this.mediaStore=(0,tU.M)({media:this.media,fullscreenElement:this.fullscreenElement,options:{defaultSubtitles:this.hasAttribute(tV),defaultDuration:this.hasAttribute(tQ)?+this.getAttribute(tQ):void 0,defaultStreamType:null!=(e=this.getAttribute(tq))?e:void 0,liveEdgeOffset:this.hasAttribute(tK)?+this.getAttribute(tK):void 0,seekToLiveOffset:this.hasAttribute(tZ)?+this.getAttribute(tZ):this.hasAttribute(tK)?+this.getAttribute(tK):void 0,noAutoSeekToLive:this.hasAttribute(tz),noVolumePref:this.hasAttribute(tJ),noSubtitlesLangPref:this.hasAttribute(t0)}})},R=new WeakSet,x=function(e){let{key:t}=e;tB.includes(t)?this.keyboardShortcutHandler(e):this.removeEventListener("keyup",tH(this,R,x))},D=new WeakSet,N=function(e){let{metaKey:t,altKey:i,key:a}=e;t||i||!tB.includes(a)?this.removeEventListener("keyup",tH(this,R,x)):([" ","ArrowLeft","ArrowRight"].includes(a)&&!(tO(this,C).contains(`no${a.toLowerCase()}`)||" "===a&&tO(this,C).contains("nospace"))&&e.preventDefault(),this.addEventListener("keyup",tH(this,R,x),{once:!0}))};let t8=Object.values(tr.GC),t7=Object.values(tr.LJ),t9=e=>{var t,i,a,n;let{observedAttributes:r}=e.constructor;!r&&(null==(t=e.nodeName)?void 0:t.includes("-"))&&(tl.Au.customElements.upgrade(e),{observedAttributes:r}=e.constructor);let s=null==(n=null==(a=null==(i=null==e?void 0:e.getAttribute)?void 0:i.call(e,tr.Ex.MEDIA_CHROME_ATTRIBUTES))?void 0:a.split)?void 0:n.call(a,/\s+/);return Array.isArray(r||s)?(r||s).filter(e=>t8.includes(e)):[]},t6=e=>{var t,i;return(null==(t=e.nodeName)?void 0:t.includes("-"))&&tl.Au.customElements.get(null==(i=e.nodeName)?void 0:i.toLowerCase())&&!(e instanceof tl.Au.customElements.get(e.nodeName.toLowerCase()))&&tl.Au.customElements.upgrade(e),t7.some(t=>t in e)||!!t9(e).length},ie=e=>{var t;return null==(t=null==e?void 0:e.join)?void 0:t.call(e,":")},it={[tr.GC.MEDIA_SUBTITLES_LIST]:tP.mc,[tr.GC.MEDIA_SUBTITLES_SHOWING]:tP.mc,[tr.GC.MEDIA_SEEKABLE]:ie,[tr.GC.MEDIA_BUFFERED]:e=>null==e?void 0:e.map(ie).join(" "),[tr.GC.MEDIA_PREVIEW_COORDS]:e=>null==e?void 0:e.join(" "),[tr.GC.MEDIA_RENDITION_LIST]:tN.SF,[tr.GC.MEDIA_AUDIO_TRACK_LIST]:tN.Br},ii=async(e,t,i)=>{var a,n;if(e.isConnected||await (0,tN.cb)(0),"boolean"==typeof i||null==i)return(0,tu.QW)(e,t,i);if("number"==typeof i)return(0,tu.pK)(e,t,i);if("string"==typeof i)return(0,tu.tA)(e,t,i);if(Array.isArray(i)&&!i.length)return e.removeAttribute(t);let r=null!=(n=null==(a=it[t])?void 0:a.call(it,i))?n:i;return e.setAttribute(t,r)},ia=(e,t)=>{var i;if(null==(i=e.closest)?void 0:i.call(e,'*[slot="media"]'))return;let a=(e,t)=>{var i,a;t6(e)&&t(e);let{children:n=[]}=null!=e?e:{};[...n,...null!=(a=null==(i=null==e?void 0:e.shadowRoot)?void 0:i.children)?a:[]].forEach(e=>ia(e,t))},n=null==e?void 0:e.nodeName.toLowerCase();n.includes("-")&&!t6(e)?tl.Au.customElements.whenDefined(n).then(()=>{a(e,t)}):a(e,t)},ir=(e,t,i)=>{e.forEach(e=>{if(t in e){e[t]=i;return}let a=t9(e),n=t.toLowerCase();a.includes(n)&&ii(e,n,i)})},is=(e,t,i)=>{ia(e,t);let a=e=>{var i;t(null!=(i=null==e?void 0:e.composedPath()[0])?i:e.target)},n=e=>{var t;i(null!=(t=null==e?void 0:e.composedPath()[0])?t:e.target)};e.addEventListener(tr.a8.REGISTER_MEDIA_STATE_RECEIVER,a),e.addEventListener(tr.a8.UNREGISTER_MEDIA_STATE_RECEIVER,n);let r=[],s=e=>{let a=e.target;"media"!==a.name&&(r.forEach(e=>ia(e,i)),(r=[...a.assignedElements({flatten:!0})]).forEach(e=>ia(e,t)))};e.addEventListener("slotchange",s);let o=new MutationObserver(e=>{e.forEach(e=>{let{addedNodes:a=[],removedNodes:n=[],type:r,target:s,attributeName:o}=e;"childList"===r?(Array.prototype.forEach.call(a,e=>ia(e,t)),Array.prototype.forEach.call(n,e=>ia(e,i))):"attributes"===r&&o===tr.Ex.MEDIA_CHROME_ATTRIBUTES&&(t6(s)?t(s):i(s))})});return o.observe(e,{childList:!0,attributes:!0,subtree:!0}),()=>{ia(e,i),e.removeEventListener("slotchange",s),o.disconnect(),e.removeEventListener(tr.a8.REGISTER_MEDIA_STATE_RECEIVER,a),e.removeEventListener(tr.a8.UNREGISTER_MEDIA_STATE_RECEIVER,n)}};tl.Au.customElements.get("media-controller")||tl.Au.customElements.define("media-controller",t5);var io=i(15923);let il=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.13 3H3.87a.87.87 0 0 0-.87.87v13.26a.87.87 0 0 0 .87.87h3.4L9 16H5V5h16v11h-4l1.72 2h3.4a.87.87 0 0 0 .87-.87V3.87a.87.87 0 0 0-.86-.87Zm-8.75 11.44a.5.5 0 0 0-.76 0l-4.91 5.73a.5.5 0 0 0 .38.83h9.82a.501.501 0 0 0 .38-.83l-4.91-5.73Z"/>
</svg>
`,id=tl.Al.createElement("template");id.innerHTML=`
  <style>
    :host([${tr.GC.MEDIA_IS_AIRPLAYING}]) slot[name=icon] slot:not([name=exit]) {
      display: none !important;
    }

    
    :host(:not([${tr.GC.MEDIA_IS_AIRPLAYING}])) slot[name=icon] slot:not([name=enter]) {
      display: none !important;
    }

    :host([${tr.GC.MEDIA_IS_AIRPLAYING}]) slot[name=tooltip-enter],
    :host(:not([${tr.GC.MEDIA_IS_AIRPLAYING}])) slot[name=tooltip-exit] {
      display: none;
    }
  </style>

  <slot name="icon">
    <slot name="enter">${il}</slot>
    <slot name="exit">${il}</slot>
  </slot>
`;let iu=`
  <slot name="tooltip-enter">${(0,to.t)("start airplay")}</slot>
  <slot name="tooltip-exit">${(0,to.t)("stop airplay")}</slot>
`,ih=e=>{let t=e.mediaIsAirplaying?(0,to.t)("stop airplay"):(0,to.t)("start airplay");e.setAttribute("aria-label",t)};class ic extends io.T{static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_IS_AIRPLAYING,tr.GC.MEDIA_AIRPLAY_UNAVAILABLE]}constructor(e={}){super({slotTemplate:id,tooltipContent:iu,...e})}connectedCallback(){super.connectedCallback(),ih(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===tr.GC.MEDIA_IS_AIRPLAYING&&ih(this)}get mediaIsAirplaying(){return(0,tu.Y_)(this,tr.GC.MEDIA_IS_AIRPLAYING)}set mediaIsAirplaying(e){(0,tu.QW)(this,tr.GC.MEDIA_IS_AIRPLAYING,e)}get mediaAirplayUnavailable(){return(0,tu.vT)(this,tr.GC.MEDIA_AIRPLAY_UNAVAILABLE)}set mediaAirplayUnavailable(e){(0,tu.tA)(this,tr.GC.MEDIA_AIRPLAY_UNAVAILABLE,e)}handleClick(){let e=new tl.Au.CustomEvent(tr.a8.MEDIA_AIRPLAY_REQUEST,{composed:!0,bubbles:!0});this.dispatchEvent(e)}}tl.Au.customElements.get("media-airplay-button")||tl.Au.customElements.define("media-airplay-button",ic);let im=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`,ip=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`,iv=tl.Al.createElement("template");iv.innerHTML=`
  <style>
    :host([aria-checked="true"]) slot[name=off] {
      display: none !important;
    }

    
    :host(:not([aria-checked="true"])) slot[name=on] {
      display: none !important;
    }

    :host([aria-checked="true"]) slot[name=tooltip-enable],
    :host(:not([aria-checked="true"])) slot[name=tooltip-disable] {
      display: none;
    }
  </style>

  <slot name="icon">
    <slot name="on">${im}</slot>
    <slot name="off">${ip}</slot>
  </slot>
`;let iE=`
  <slot name="tooltip-enable">${(0,to.t)("Enable captions")}</slot>
  <slot name="tooltip-disable">${(0,to.t)("Disable captions")}</slot>
`,ib=e=>{e.setAttribute("aria-checked",(0,tP.VV)(e).toString())};class ig extends io.T{static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_SUBTITLES_LIST,tr.GC.MEDIA_SUBTITLES_SHOWING]}constructor(e={}){super({slotTemplate:iv,tooltipContent:iE,...e}),this._captionsReady=!1}connectedCallback(){super.connectedCallback(),this.setAttribute("role","switch"),this.setAttribute("aria-label",(0,to.t)("closed captions")),ib(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===tr.GC.MEDIA_SUBTITLES_SHOWING&&ib(this)}get mediaSubtitlesList(){return iA(this,tr.GC.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(e){ik(this,tr.GC.MEDIA_SUBTITLES_LIST,e)}get mediaSubtitlesShowing(){return iA(this,tr.GC.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(e){ik(this,tr.GC.MEDIA_SUBTITLES_SHOWING,e)}handleClick(){this.dispatchEvent(new tl.Au.CustomEvent(tr.a8.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}))}}let iA=(e,t)=>{let i=e.getAttribute(t);return i?(0,tP.W5)(i):[]},ik=(e,t,i)=>{if(!(null==i?void 0:i.length))return void e.removeAttribute(t);let a=(0,tP.mc)(i);e.getAttribute(t)!==a&&e.setAttribute(t,a)};tl.Au.customElements.get("media-captions-button")||tl.Au.customElements.define("media-captions-button",ig);let iy=tl.Al.createElement("template");iy.innerHTML=`
  <style>
  :host([${tr.GC.MEDIA_IS_CASTING}]) slot[name=icon] slot:not([name=exit]) {
    display: none !important;
  }

  
  :host(:not([${tr.GC.MEDIA_IS_CASTING}])) slot[name=icon] slot:not([name=enter]) {
    display: none !important;
  }

  :host([${tr.GC.MEDIA_IS_CASTING}]) slot[name=tooltip-enter],
    :host(:not([${tr.GC.MEDIA_IS_CASTING}])) slot[name=tooltip-exit] {
      display: none;
    }
  </style>

  <slot name="icon">
    <slot name="enter"><svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/></g></svg></slot>
    <slot name="exit"><svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/><path class="cast_caf_icon_boxfill" d="M5,7 L5,8.63 C8,8.6 13.37,14 13.37,17 L19,17 L19,7 Z"/></g></svg></slot>
  </slot>
`;let iC=`
  <slot name="tooltip-enter">${(0,to.t)("Start casting")}</slot>
  <slot name="tooltip-exit">${(0,to.t)("Stop casting")}</slot>
`,iw=e=>{let t=e.mediaIsCasting?(0,to.t)("stop casting"):(0,to.t)("start casting");e.setAttribute("aria-label",t)};class iI extends io.T{static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_IS_CASTING,tr.GC.MEDIA_CAST_UNAVAILABLE]}constructor(e={}){super({slotTemplate:iy,tooltipContent:iC,...e})}connectedCallback(){super.connectedCallback(),iw(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===tr.GC.MEDIA_IS_CASTING&&iw(this)}get mediaIsCasting(){return(0,tu.Y_)(this,tr.GC.MEDIA_IS_CASTING)}set mediaIsCasting(e){(0,tu.QW)(this,tr.GC.MEDIA_IS_CASTING,e)}get mediaCastUnavailable(){return(0,tu.vT)(this,tr.GC.MEDIA_CAST_UNAVAILABLE)}set mediaCastUnavailable(e){(0,tu.tA)(this,tr.GC.MEDIA_CAST_UNAVAILABLE,e)}handleClick(){let e=this.mediaIsCasting?tr.a8.MEDIA_EXIT_CAST_REQUEST:tr.a8.MEDIA_ENTER_CAST_REQUEST;this.dispatchEvent(new tl.Au.CustomEvent(e,{composed:!0,bubbles:!0}))}}tl.Au.customElements.get("media-cast-button")||tl.Au.customElements.define("media-cast-button",iI);var iT=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},i_=(e,t,i)=>(iT(e,t,"read from private field"),i?i.call(e):t.get(e)),iS=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},iM=(e,t,i,a)=>(iT(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),iL=(e,t,i)=>(iT(e,t,"access private method"),i);let iR="open";class ix extends tl.Au.HTMLElement{constructor(){super(),iS(this,O),iS(this,$),iS(this,B),iS(this,q),iS(this,F),iS(this,j),iS(this,P,!1),iS(this,U,null),iS(this,G,null),this.addEventListener("invoke",this),this.addEventListener("focusout",this),this.addEventListener("keydown",this)}static get observedAttributes(){return[iR,"anchor"]}get open(){return(0,tu.Y_)(this,iR)}set open(e){(0,tu.QW)(this,iR,e)}handleEvent(e){switch(e.type){case"invoke":iL(this,q,Q).call(this,e);break;case"focusout":iL(this,F,Y).call(this,e);break;case"keydown":iL(this,j,K).call(this,e)}}connectedCallback(){iL(this,O,W).call(this),this.role||(this.role="dialog")}attributeChangedCallback(e,t,i){iL(this,O,W).call(this),e===iR&&i!==t&&(this.open?iL(this,$,H).call(this):iL(this,B,V).call(this))}focus(){iM(this,U,(0,tu.bq)());let e=!this.dispatchEvent(new Event("focus",{composed:!0,cancelable:!0})),t=!this.dispatchEvent(new Event("focusin",{composed:!0,bubbles:!0,cancelable:!0}));if(e||t)return;let i=this.querySelector('[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]');null==i||i.focus()}get keysUsed(){return["Escape","Tab"]}}P=new WeakMap,U=new WeakMap,G=new WeakMap,O=new WeakSet,W=function(){if(!i_(this,P)&&(iM(this,P,!0),!this.shadowRoot)){this.attachShadow({mode:"open"});let e=(0,tu.kg)(this.attributes);this.shadowRoot.innerHTML=`
        ${this.constructor.getTemplateHTML(e)}
      `,queueMicrotask(()=>{let{style:e}=(0,tu.aQ)(this.shadowRoot,":host");e.setProperty("transition","display .15s, visibility .15s, opacity .15s ease-in, transform .15s ease-in")})}},$=new WeakSet,H=function(){var e;null==(e=i_(this,G))||e.setAttribute("aria-expanded","true"),this.dispatchEvent(new Event("open",{composed:!0,bubbles:!0})),this.addEventListener("transitionend",()=>this.focus(),{once:!0})},B=new WeakSet,V=function(){var e;null==(e=i_(this,G))||e.setAttribute("aria-expanded","false"),this.dispatchEvent(new Event("close",{composed:!0,bubbles:!0}))},q=new WeakSet,Q=function(e){iM(this,G,e.relatedTarget),(0,tu.qg)(this,e.relatedTarget)||(this.open=!this.open)},F=new WeakSet,Y=function(e){var t;!(0,tu.qg)(this,e.relatedTarget)&&(null==(t=i_(this,U))||t.focus(),i_(this,G)&&i_(this,G)!==e.relatedTarget&&this.open&&(this.open=!1))},j=new WeakSet,K=function(e){var t,i,a,n,r;let{key:s,ctrlKey:o,altKey:l,metaKey:d}=e;o||l||d||this.keysUsed.includes(s)&&(e.preventDefault(),e.stopPropagation(),"Tab"===s?(e.shiftKey?null==(i=null==(t=this.previousElementSibling)?void 0:t.focus)||i.call(t):null==(n=null==(a=this.nextElementSibling)?void 0:a.focus)||n.call(a),this.blur()):"Escape"===s&&(null==(r=i_(this,U))||r.focus(),this.open=!1))},ix.getTemplateHTML=function(e){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        display: var(--media-dialog-display, inline-flex);
        justify-content: center;
        align-items: center;
        
        transition-behavior: allow-discrete;
        visibility: hidden;
        opacity: 0;
        transform: translateY(2px) scale(.99);
        pointer-events: none;
      }

      :host([open]) {
        transition: display .2s, visibility 0s, opacity .2s ease-out, transform .15s ease-out;
        visibility: visible;
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      #content {
        display: flex;
        position: relative;
        box-sizing: border-box;
        width: min(320px, 100%);
        word-wrap: break-word;
        max-height: 100%;
        overflow: auto;
        text-align: center;
        line-height: 1.4;
      }
    </style>
    ${this.getSlotTemplateHTML(e)}
  `},ix.getSlotTemplateHTML=function(e){return`
    <slot id="content"></slot>
  `},tl.Au.customElements.get("media-chrome-dialog")||tl.Au.customElements.define("media-chrome-dialog",ix);var iD=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},iN=(e,t,i)=>(iD(e,t,"read from private field"),i?i.call(e):t.get(e)),iP=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},iU=(e,t,i,a)=>(iD(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),iG=(e,t,i)=>(iD(e,t,"access private method"),i);let iO=tl.Al.createElement("template");iO.innerHTML=`
  <style>
    :host {
      --_focus-box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
      --_media-range-padding: var(--media-range-padding, var(--media-control-padding, 10px));

      box-shadow: var(--_focus-visible-box-shadow, none);
      background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
      height: calc(var(--media-control-height, 24px) + 2 * var(--_media-range-padding));
      display: inline-flex;
      align-items: center;
      
      vertical-align: middle;
      box-sizing: border-box;
      position: relative;
      width: 100px;
      transition: background .15s linear;
      cursor: var(--media-cursor, pointer);
      pointer-events: auto;
      touch-action: none; 
    }

    
    input[type=range]:focus {
      outline: 0;
    }
    input[type=range]:focus::-webkit-slider-runnable-track {
      outline: 0;
    }

    :host(:hover) {
      background: var(--media-control-hover-background, rgb(50 50 70 / .7));
    }

    #leftgap {
      padding-left: var(--media-range-padding-left, var(--_media-range-padding));
    }

    #rightgap {
      padding-right: var(--media-range-padding-right, var(--_media-range-padding));
    }

    #startpoint,
    #endpoint {
      position: absolute;
    }

    #endpoint {
      right: 0;
    }

    #container {
      
      width: var(--media-range-track-width, 100%);
      transform: translate(var(--media-range-track-translate-x, 0px), var(--media-range-track-translate-y, 0px));
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
      min-width: 40px;
    }

    #range {
      
      display: var(--media-time-range-hover-display, block);
      bottom: var(--media-time-range-hover-bottom, -7px);
      height: var(--media-time-range-hover-height, max(100% + 7px, 25px));
      width: 100%;
      position: absolute;
      cursor: var(--media-cursor, pointer);

      -webkit-appearance: none; 
      -webkit-tap-highlight-color: transparent;
      background: transparent; 
      margin: 0;
      z-index: 1;
    }

    @media (hover: hover) {
      #range {
        bottom: var(--media-time-range-hover-bottom, -5px);
        height: var(--media-time-range-hover-height, max(100% + 5px, 20px));
      }
    }

    
    
    #range::-webkit-slider-thumb {
      -webkit-appearance: none;
      background: transparent;
      width: .1px;
      height: .1px;
    }

    
    #range::-moz-range-thumb {
      background: transparent;
      border: transparent;
      width: .1px;
      height: .1px;
    }

    #appearance {
      height: var(--media-range-track-height, 4px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;
      position: absolute;
      
      will-change: transform;
    }

    #track {
      background: var(--media-range-track-background, rgb(255 255 255 / .2));
      border-radius: var(--media-range-track-border-radius, 1px);
      border: var(--media-range-track-border, none);
      outline: var(--media-range-track-outline);
      outline-offset: var(--media-range-track-outline-offset);
      backdrop-filter: var(--media-range-track-backdrop-filter);
      -webkit-backdrop-filter: var(--media-range-track-backdrop-filter);
      box-shadow: var(--media-range-track-box-shadow, none);
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    #progress,
    #pointer {
      position: absolute;
      height: 100%;
      will-change: width;
    }

    #progress {
      background: var(--media-range-bar-color, var(--media-primary-color, rgb(238 238 238)));
      transition: var(--media-range-track-transition);
    }

    #pointer {
      background: var(--media-range-track-pointer-background);
      border-right: var(--media-range-track-pointer-border-right);
      transition: visibility .25s, opacity .25s;
      visibility: hidden;
      opacity: 0;
    }

    @media (hover: hover) {
      :host(:hover) #pointer {
        transition: visibility .5s, opacity .5s;
        visibility: visible;
        opacity: 1;
      }
    }

    #thumb,
    ::slotted([slot=thumb]) {
      width: var(--media-range-thumb-width, 10px);
      height: var(--media-range-thumb-height, 10px);
      transition: var(--media-range-thumb-transition);
      transform: var(--media-range-thumb-transform, none);
      opacity: var(--media-range-thumb-opacity, 1);
      translate: -50%;
      position: absolute;
      left: 0;
      cursor: var(--media-cursor, pointer);
    }

    #thumb {
      border-radius: var(--media-range-thumb-border-radius, 10px);
      background: var(--media-range-thumb-background, var(--media-primary-color, rgb(238 238 238)));
      box-shadow: var(--media-range-thumb-box-shadow, 1px 1px 1px transparent);
      border: var(--media-range-thumb-border, none);
    }

    :host([disabled]) #thumb {
      background-color: #777;
    }

    .segments #appearance {
      height: var(--media-range-segment-hover-height, 7px);
    }

    #track {
      clip-path: url(#segments-clipping);
    }

    #segments {
      --segments-gap: var(--media-range-segments-gap, 2px);
      position: absolute;
      width: 100%;
      height: 100%;
    }

    #segments-clipping {
      transform: translateX(calc(var(--segments-gap) / 2));
    }

    #segments-clipping:empty {
      display: none;
    }

    #segments-clipping rect {
      height: var(--media-range-track-height, 4px);
      y: calc((var(--media-range-segment-hover-height, 7px) - var(--media-range-track-height, 4px)) / 2);
      transition: var(--media-range-segment-transition, transform .1s ease-in-out);
      transform: var(--media-range-segment-transform, scaleY(1));
      transform-origin: center;
    }
  </style>
  <div id="leftgap"></div>
  <div id="container">
    <div id="startpoint"></div>
    <div id="endpoint"></div>
    <div id="appearance">
      <div id="track" part="track">
        <div id="pointer"></div>
        <div id="progress" part="progress"></div>
      </div>
      <slot name="thumb">
        <div id="thumb" part="thumb"></div>
      </slot>
      <svg id="segments"><clipPath id="segments-clipping"></clipPath></svg>
    </div>
    <input id="range" type="range" min="0" max="1" step="any" value="0">
  </div>
  <div id="rightgap"></div>
`;class iW extends tl.Au.HTMLElement{constructor(){super(),iP(this,er),iP(this,eo),iP(this,ed),iP(this,eh),iP(this,em),iP(this,ev),iP(this,eb),iP(this,ef),iP(this,Z,void 0),iP(this,z,void 0),iP(this,X,void 0),iP(this,J,void 0),iP(this,ee,{}),iP(this,et,[]),iP(this,ei,()=>{if(this.range.matches(":focus-visible")){let{style:e}=(0,tu.aQ)(this.shadowRoot,":host");e.setProperty("--_focus-visible-box-shadow","var(--_focus-box-shadow)")}}),iP(this,ea,()=>{let{style:e}=(0,tu.aQ)(this.shadowRoot,":host");e.removeProperty("--_focus-visible-box-shadow")}),iP(this,en,()=>{let e=this.shadowRoot.querySelector("#segments-clipping");e&&e.parentNode.append(e)}),this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(iO.content.cloneNode(!0))),this.container=this.shadowRoot.querySelector("#container"),iU(this,X,this.shadowRoot.querySelector("#startpoint")),iU(this,J,this.shadowRoot.querySelector("#endpoint")),this.range=this.shadowRoot.querySelector("#range"),this.appearance=this.shadowRoot.querySelector("#appearance")}static get observedAttributes(){return["disabled","aria-disabled",tr.Ex.MEDIA_CONTROLLER]}attributeChangedCallback(e,t,i){var a,n,r,s,o;e===tr.Ex.MEDIA_CONTROLLER?(t&&(null==(n=null==(a=iN(this,Z))?void 0:a.unassociateElement)||n.call(a,this),iU(this,Z,null)),i&&this.isConnected&&(iU(this,Z,null==(r=this.getRootNode())?void 0:r.getElementById(i)),null==(o=null==(s=iN(this,Z))?void 0:s.associateElement)||o.call(s,this))):("disabled"===e||"aria-disabled"===e&&t!==i)&&(null==i?(this.range.removeAttribute(e),iG(this,eo,el).call(this)):(this.range.setAttribute(e,i),iG(this,ed,eu).call(this)))}connectedCallback(){var e,t,i;let{style:a}=(0,tu.aQ)(this.shadowRoot,":host");a.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),iN(this,ee).pointer=(0,tu.aQ)(this.shadowRoot,"#pointer"),iN(this,ee).progress=(0,tu.aQ)(this.shadowRoot,"#progress"),iN(this,ee).thumb=(0,tu.aQ)(this.shadowRoot,'#thumb, ::slotted([slot="thumb"])'),iN(this,ee).activeSegment=(0,tu.aQ)(this.shadowRoot,"#segments-clipping rect:nth-child(0)");let n=this.getAttribute(tr.Ex.MEDIA_CONTROLLER);n&&(iU(this,Z,null==(e=this.getRootNode())?void 0:e.getElementById(n)),null==(i=null==(t=iN(this,Z))?void 0:t.associateElement)||i.call(t,this)),this.updateBar(),this.shadowRoot.addEventListener("focusin",iN(this,ei)),this.shadowRoot.addEventListener("focusout",iN(this,ea)),iG(this,eo,el).call(this),(0,td.v)(this.container,iN(this,en))}disconnectedCallback(){var e,t;iG(this,ed,eu).call(this),null==(t=null==(e=iN(this,Z))?void 0:e.unassociateElement)||t.call(e,this),iU(this,Z,null),this.shadowRoot.removeEventListener("focusin",iN(this,ei)),this.shadowRoot.removeEventListener("focusout",iN(this,ea)),(0,td.u)(this.container,iN(this,en))}updatePointerBar(e){var t;null==(t=iN(this,ee).pointer)||t.style.setProperty("width",`${100*this.getPointerRatio(e)}%`)}updateBar(){var e,t;let i=100*this.range.valueAsNumber;null==(e=iN(this,ee).progress)||e.style.setProperty("width",`${i}%`),null==(t=iN(this,ee).thumb)||t.style.setProperty("left",`${i}%`)}updateSegments(e){let t=this.shadowRoot.querySelector("#segments-clipping");if(t.textContent="",this.container.classList.toggle("segments",!!(null==e?void 0:e.length)),!(null==e?void 0:e.length))return;let i=[...new Set([+this.range.min,...e.flatMap(e=>[e.start,e.end]),+this.range.max])];iU(this,et,[...i]);let a=i.pop();for(let[e,n]of i.entries()){let[r,s]=[0===e,e===i.length-1],o=r?"calc(var(--segments-gap) / -1)":`${100*n}%`,l=s?a:i[e+1],d=`calc(${(l-n)*100}%${r||s?"":" - var(--segments-gap)"})`,u=tl.Al.createElementNS("http://www.w3.org/2000/svg","rect"),h=(0,tu.aQ)(this.shadowRoot,`#segments-clipping rect:nth-child(${e+1})`);h.style.setProperty("x",o),h.style.setProperty("width",d),t.append(u)}}getPointerRatio(e){return(0,tu.DI)(e.clientX,e.clientY,iN(this,X).getBoundingClientRect(),iN(this,J).getBoundingClientRect())}get dragging(){return this.hasAttribute("dragging")}handleEvent(e){switch(e.type){case"pointermove":iG(this,ef,eA).call(this,e);break;case"input":this.updateBar();break;case"pointerenter":iG(this,em,ep).call(this,e);break;case"pointerdown":iG(this,eh,ec).call(this,e);break;case"pointerup":iG(this,ev,eE).call(this);break;case"pointerleave":iG(this,eb,eg).call(this)}}get keysUsed(){return["ArrowUp","ArrowRight","ArrowDown","ArrowLeft"]}}Z=new WeakMap,z=new WeakMap,X=new WeakMap,J=new WeakMap,ee=new WeakMap,et=new WeakMap,ei=new WeakMap,ea=new WeakMap,en=new WeakMap,er=new WeakSet,es=function(e){let t=iN(this,ee).activeSegment;if(!t)return;let i=this.getPointerRatio(e),a=iN(this,et).findIndex((e,t,a)=>{let n=a[t+1];return null!=n&&i>=e&&i<=n}),n=`#segments-clipping rect:nth-child(${a+1})`;t.selectorText==n&&t.style.transform||(t.selectorText=n,t.style.setProperty("transform","var(--media-range-segment-hover-transform, scaleY(2))"))},eo=new WeakSet,el=function(){this.hasAttribute("disabled")||(this.addEventListener("input",this),this.addEventListener("pointerdown",this),this.addEventListener("pointerenter",this))},ed=new WeakSet,eu=function(){var e,t;this.removeEventListener("input",this),this.removeEventListener("pointerdown",this),this.removeEventListener("pointerenter",this),null==(e=tl.Au.window)||e.removeEventListener("pointerup",this),null==(t=tl.Au.window)||t.removeEventListener("pointermove",this)},eh=new WeakSet,ec=function(e){var t;iU(this,z,e.composedPath().includes(this.range)),null==(t=tl.Au.window)||t.addEventListener("pointerup",this)},em=new WeakSet,ep=function(e){var t;"mouse"!==e.pointerType&&iG(this,eh,ec).call(this,e),this.addEventListener("pointerleave",this),null==(t=tl.Au.window)||t.addEventListener("pointermove",this)},ev=new WeakSet,eE=function(){var e;null==(e=tl.Au.window)||e.removeEventListener("pointerup",this),this.toggleAttribute("dragging",!1),this.range.disabled=this.hasAttribute("disabled")},eb=new WeakSet,eg=function(){var e,t;this.removeEventListener("pointerleave",this),null==(e=tl.Au.window)||e.removeEventListener("pointermove",this),this.toggleAttribute("dragging",!1),this.range.disabled=this.hasAttribute("disabled"),null==(t=iN(this,ee).activeSegment)||t.style.removeProperty("transform")},ef=new WeakSet,eA=function(e){this.toggleAttribute("dragging",1===e.buttons||"mouse"!==e.pointerType),this.updatePointerBar(e),iG(this,er,es).call(this,e),this.dragging&&("mouse"!==e.pointerType||!iN(this,z))&&(this.range.disabled=!0,this.range.valueAsNumber=this.getPointerRatio(e),this.range.dispatchEvent(new Event("input",{bubbles:!0,composed:!0})))},tl.Au.customElements.get("media-chrome-range")||tl.Au.customElements.define("media-chrome-range",iW);var i$=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},iH=(e,t,i)=>(i$(e,t,"read from private field"),i?i.call(e):t.get(e)),iB=(e,t,i,a)=>(i$(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);let iV=tl.Al.createElement("template");iV.innerHTML=`
  <style>
    :host {
      
      box-sizing: border-box;
      display: var(--media-control-display, var(--media-control-bar-display, inline-flex));
      color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
      --media-loading-indicator-icon-height: 44px;
    }

    ::slotted(media-time-range),
    ::slotted(media-volume-range) {
      min-height: 100%;
    }

    ::slotted(media-time-range),
    ::slotted(media-clip-selector) {
      flex-grow: 1;
    }

    ::slotted([role="menu"]) {
      position: absolute;
    }
  </style>

  <slot></slot>
`;class iq extends tl.Au.HTMLElement{constructor(){super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,ek,void 0),this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(iV.content.cloneNode(!0)))}static get observedAttributes(){return[tr.Ex.MEDIA_CONTROLLER]}attributeChangedCallback(e,t,i){var a,n,r,s,o;e===tr.Ex.MEDIA_CONTROLLER&&(t&&(null==(n=null==(a=iH(this,ek))?void 0:a.unassociateElement)||n.call(a,this),iB(this,ek,null)),i&&this.isConnected&&(iB(this,ek,null==(r=this.getRootNode())?void 0:r.getElementById(i)),null==(o=null==(s=iH(this,ek))?void 0:s.associateElement)||o.call(s,this)))}connectedCallback(){var e,t,i;let a=this.getAttribute(tr.Ex.MEDIA_CONTROLLER);a&&(iB(this,ek,null==(e=this.getRootNode())?void 0:e.getElementById(a)),null==(i=null==(t=iH(this,ek))?void 0:t.associateElement)||i.call(t,this))}disconnectedCallback(){var e,t;null==(t=null==(e=iH(this,ek))?void 0:e.unassociateElement)||t.call(e,this),iB(this,ek,null)}}ek=new WeakMap,tl.Au.customElements.get("media-control-bar")||tl.Au.customElements.define("media-control-bar",iq);var iQ=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},iF=(e,t,i)=>(iQ(e,t,"read from private field"),i?i.call(e):t.get(e)),iY=(e,t,i,a)=>(iQ(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);let ij=tl.Al.createElement("template");ij.innerHTML=`
  <style>
    :host {
      font: var(--media-font,
        var(--media-font-weight, normal)
        var(--media-font-size, 14px) /
        var(--media-text-content-height, var(--media-control-height, 24px))
        var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
      color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
      background: var(--media-text-background, var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7))));
      padding: var(--media-control-padding, 10px);
      display: inline-flex;
      justify-content: center;
      align-items: center;
      vertical-align: middle;
      box-sizing: border-box;
      text-align: center;
      pointer-events: auto;
    }

    
    :host(:focus-visible) {
      box-shadow: inset 0 0 0 2px rgb(27 127 204 / .9);
      outline: 0;
    }

    
    :host(:where(:focus)) {
      box-shadow: none;
      outline: 0;
    }
  </style>
  <slot></slot>
`;class iK extends tl.Au.HTMLElement{constructor(){super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,ey,void 0),this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(ij.content.cloneNode(!0)))}static get observedAttributes(){return[tr.Ex.MEDIA_CONTROLLER]}attributeChangedCallback(e,t,i){var a,n,r,s,o;e===tr.Ex.MEDIA_CONTROLLER&&(t&&(null==(n=null==(a=iF(this,ey))?void 0:a.unassociateElement)||n.call(a,this),iY(this,ey,null)),i&&this.isConnected&&(iY(this,ey,null==(r=this.getRootNode())?void 0:r.getElementById(i)),null==(o=null==(s=iF(this,ey))?void 0:s.associateElement)||o.call(s,this)))}connectedCallback(){var e,t,i;let{style:a}=(0,tu.aQ)(this.shadowRoot,":host");a.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`);let n=this.getAttribute(tr.Ex.MEDIA_CONTROLLER);n&&(iY(this,ey,null==(e=this.getRootNode())?void 0:e.getElementById(n)),null==(i=null==(t=iF(this,ey))?void 0:t.associateElement)||i.call(t,this))}disconnectedCallback(){var e,t;null==(t=null==(e=iF(this,ey))?void 0:e.unassociateElement)||t.call(e,this),iY(this,ey,null)}}ey=new WeakMap,tl.Au.customElements.get("media-text-display")||tl.Au.customElements.define("media-text-display",iK);var iZ=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},iz=(e,t,i)=>(iZ(e,t,"read from private field"),i?i.call(e):t.get(e));class iX extends iK{constructor(){super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,eC,void 0),((e,t,i,a)=>(iZ(e,t,"write to private field"),a?a.call(e,i):t.set(e,i)))(this,eC,this.shadowRoot.querySelector("slot")),iz(this,eC).textContent=(0,ts.fU)(0)}static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_DURATION]}attributeChangedCallback(e,t,i){e===tr.GC.MEDIA_DURATION&&(iz(this,eC).textContent=(0,ts.fU)(+i)),super.attributeChangedCallback(e,t,i)}get mediaDuration(){return(0,tu.dm)(this,tr.GC.MEDIA_DURATION)}set mediaDuration(e){(0,tu.pK)(this,tr.GC.MEDIA_DURATION,e)}}eC=new WeakMap,tl.Au.customElements.get("media-duration-display")||tl.Au.customElements.define("media-duration-display",iX);let iJ={2:(0,to.t)("Network Error"),3:(0,to.t)("Decode Error"),4:(0,to.t)("Source Not Supported"),5:(0,to.t)("Encryption Error")},i0={2:(0,to.t)("A network error caused the media download to fail."),3:(0,to.t)("A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format."),4:(0,to.t)("An unsupported error occurred. The server or network failed, or your browser does not support this format."),5:(0,to.t)("The media is encrypted and there are no keys to decrypt it.")},i1=e=>{var t,i;return 1===e.code?null:{title:null!=(t=iJ[e.code])?t:`Error ${e.code}`,message:null!=(i=i0[e.code])?i:e.message}};var i2=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)};function i3(e){var t;let{title:i,message:a}=null!=(t=i1(e))?t:{},n="";return i&&(n+=`<slot name="error-${e.code}-title"><h3>${i}</h3></slot>`),a&&(n+=`<slot name="error-${e.code}-message"><p>${a}</p></slot>`),n}let i4=[tr.GC.MEDIA_ERROR_CODE,tr.GC.MEDIA_ERROR_MESSAGE];class i5 extends ix{constructor(){super(...arguments),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,ew,null)}static get observedAttributes(){return[...super.observedAttributes,...i4]}formatErrorMessage(e){return this.constructor.formatErrorMessage(e)}attributeChangedCallback(e,t,i){var a;if(super.attributeChangedCallback(e,t,i),!i4.includes(e))return;let n=null!=(a=this.mediaError)?a:{code:this.mediaErrorCode,message:this.mediaErrorMessage};this.open=n.code&&null!==i1(n),this.open&&(this.shadowRoot.querySelector("slot").name=`error-${this.mediaErrorCode}`,this.shadowRoot.querySelector("#content").innerHTML=this.formatErrorMessage(n))}get mediaError(){var e,t;return i2(this,e=ew,"read from private field"),t?t.call(this):e.get(this)}set mediaError(e){var t,i;i2(this,t=ew,"write to private field"),i?i.call(this,e):t.set(this,e)}get mediaErrorCode(){return(0,tu.dm)(this,"mediaerrorcode")}set mediaErrorCode(e){(0,tu.pK)(this,"mediaerrorcode",e)}get mediaErrorMessage(){return(0,tu.vT)(this,"mediaerrormessage")}set mediaErrorMessage(e){(0,tu.tA)(this,"mediaerrormessage",e)}}ew=new WeakMap,i5.getSlotTemplateHTML=function(e){return`
    <style>
      :host {
        background: rgb(20 20 30 / .8);
      }

      #content {
        display: block;
        padding: 1.2em 1.5em;
      }

      h3,
      p {
        margin-block: 0 .3em;
      }
    </style>
    <slot name="error-${e.mediaerrorcode}" id="content">
      ${i3({code:+e.mediaerrorcode,message:e.mediaerrormessage})}
    </slot>
  `},i5.formatErrorMessage=i3,tl.Au.customElements.get("media-error-dialog")||tl.Au.customElements.define("media-error-dialog",i5);let i8=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M16 3v2.5h3.5V9H22V3h-6ZM4 9h2.5V5.5H10V3H4v6Zm15.5 9.5H16V21h6v-6h-2.5v3.5ZM6.5 15H4v6h6v-2.5H6.5V15Z"/>
</svg>`,i7=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M18.5 6.5V3H16v6h6V6.5h-3.5ZM16 21h2.5v-3.5H22V15h-6v6ZM4 17.5h3.5V21H10v-6H4v2.5Zm3.5-11H4V9h6V3H7.5v3.5Z"/>
</svg>`,i9=tl.Al.createElement("template");i9.innerHTML=`
  <style>
    :host([${tr.GC.MEDIA_IS_FULLSCREEN}]) slot[name=icon] slot:not([name=exit]) {
      display: none !important;
    }

    
    :host(:not([${tr.GC.MEDIA_IS_FULLSCREEN}])) slot[name=icon] slot:not([name=enter]) {
      display: none !important;
    }

    :host([${tr.GC.MEDIA_IS_FULLSCREEN}]) slot[name=tooltip-enter],
    :host(:not([${tr.GC.MEDIA_IS_FULLSCREEN}])) slot[name=tooltip-exit] {
      display: none;
    }
  </style>

  <slot name="icon">
    <slot name="enter">${i8}</slot>
    <slot name="exit">${i7}</slot>
  </slot>
`;let i6=`
  <slot name="tooltip-enter">${(0,to.t)("Enter fullscreen mode")}</slot>
  <slot name="tooltip-exit">${(0,to.t)("Exit fullscreen mode")}</slot>
`,ae=e=>{let t=e.mediaIsFullscreen?(0,to.t)("exit fullscreen mode"):(0,to.t)("enter fullscreen mode");e.setAttribute("aria-label",t)};class at extends io.T{static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_IS_FULLSCREEN,tr.GC.MEDIA_FULLSCREEN_UNAVAILABLE]}constructor(e={}){super({slotTemplate:i9,tooltipContent:i6,...e})}connectedCallback(){super.connectedCallback(),ae(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===tr.GC.MEDIA_IS_FULLSCREEN&&ae(this)}get mediaFullscreenUnavailable(){return(0,tu.vT)(this,tr.GC.MEDIA_FULLSCREEN_UNAVAILABLE)}set mediaFullscreenUnavailable(e){(0,tu.tA)(this,tr.GC.MEDIA_FULLSCREEN_UNAVAILABLE,e)}get mediaIsFullscreen(){return(0,tu.Y_)(this,tr.GC.MEDIA_IS_FULLSCREEN)}set mediaIsFullscreen(e){(0,tu.QW)(this,tr.GC.MEDIA_IS_FULLSCREEN,e)}handleClick(){let e=this.mediaIsFullscreen?tr.a8.MEDIA_EXIT_FULLSCREEN_REQUEST:tr.a8.MEDIA_ENTER_FULLSCREEN_REQUEST;this.dispatchEvent(new tl.Au.CustomEvent(e,{composed:!0,bubbles:!0}))}}tl.Au.customElements.get("media-fullscreen-button")||tl.Au.customElements.define("media-fullscreen-button",at);let{MEDIA_TIME_IS_LIVE:ai,MEDIA_PAUSED:aa}=tr.GC,{MEDIA_SEEK_TO_LIVE_REQUEST:an,MEDIA_PLAY_REQUEST:ar}=tr.a8,as=tl.Al.createElement("template");as.innerHTML=`
  <style>
  :host { --media-tooltip-display: none; }
  
  slot[name=indicator] > *,
  :host ::slotted([slot=indicator]) {
    
    min-width: auto;
    fill: var(--media-live-button-icon-color, rgb(140, 140, 140));
    color: var(--media-live-button-icon-color, rgb(140, 140, 140));
  }

  :host([${ai}]:not([${aa}])) slot[name=indicator] > *,
  :host([${ai}]:not([${aa}])) ::slotted([slot=indicator]) {
    fill: var(--media-live-button-indicator-color, rgb(255, 0, 0));
    color: var(--media-live-button-indicator-color, rgb(255, 0, 0));
  }

  :host([${ai}]:not([${aa}])) {
    cursor: var(--media-cursor, not-allowed);
  }

  slot[name=text]{
    text-transform: uppercase;
  }

  </style>

  <slot name="indicator"><svg viewBox="0 0 6 12"><circle cx="3" cy="6" r="2"></circle></svg></slot>
  
  <slot name="spacer">&nbsp;</slot><slot name="text">${(0,to.t)("live")}</slot>
`;let ao=e=>{let t=e.mediaPaused||!e.mediaTimeIsLive,i=t?(0,to.t)("seek to live"):(0,to.t)("playing live");e.setAttribute("aria-label",i),t?e.removeAttribute("aria-disabled"):e.setAttribute("aria-disabled","true")};class al extends io.T{static get observedAttributes(){return[...super.observedAttributes,aa,ai]}constructor(e={}){super({slotTemplate:as,...e})}connectedCallback(){ao(this),super.connectedCallback()}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),ao(this)}get mediaPaused(){return(0,tu.Y_)(this,tr.GC.MEDIA_PAUSED)}set mediaPaused(e){(0,tu.QW)(this,tr.GC.MEDIA_PAUSED,e)}get mediaTimeIsLive(){return(0,tu.Y_)(this,tr.GC.MEDIA_TIME_IS_LIVE)}set mediaTimeIsLive(e){(0,tu.QW)(this,tr.GC.MEDIA_TIME_IS_LIVE,e)}handleClick(){(this.mediaPaused||!this.mediaTimeIsLive)&&(this.dispatchEvent(new tl.Au.CustomEvent(an,{composed:!0,bubbles:!0})),this.hasAttribute(aa)&&this.dispatchEvent(new tl.Au.CustomEvent(ar,{composed:!0,bubbles:!0})))}}tl.Au.customElements.get("media-live-button")||tl.Au.customElements.define("media-live-button",al);var ad=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},au=(e,t,i)=>(ad(e,t,"read from private field"),i?i.call(e):t.get(e)),ah=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},ac=(e,t,i,a)=>(ad(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);let am="loadingdelay",ap="noautohide",av=tl.Al.createElement("template"),aE=`
<svg aria-hidden="true" viewBox="0 0 100 100">
  <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
    <animateTransform
       attributeName="transform"
       attributeType="XML"
       type="rotate"
       dur="1s"
       from="0 50 50"
       to="360 50 50"
       repeatCount="indefinite" />
  </path>
</svg>
`;av.innerHTML=`
<style>
:host {
  display: var(--media-control-display, var(--media-loading-indicator-display, inline-block));
  vertical-align: middle;
  box-sizing: border-box;
  --_loading-indicator-delay: var(--media-loading-indicator-transition-delay, 500ms);
}

#status {
  color: rgba(0,0,0,0);
  width: 0px;
  height: 0px;
}

:host slot[name=icon] > *,
:host ::slotted([slot=icon]) {
  opacity: var(--media-loading-indicator-opacity, 0);
  transition: opacity 0.15s;
}

:host([${tr.GC.MEDIA_LOADING}]:not([${tr.GC.MEDIA_PAUSED}])) slot[name=icon] > *,
:host([${tr.GC.MEDIA_LOADING}]:not([${tr.GC.MEDIA_PAUSED}])) ::slotted([slot=icon]) {
  opacity: var(--media-loading-indicator-opacity, 1);
  transition: opacity 0.15s var(--_loading-indicator-delay);
}

:host #status {
  visibility: var(--media-loading-indicator-opacity, hidden);
  transition: visibility 0.15s;
}

:host([${tr.GC.MEDIA_LOADING}]:not([${tr.GC.MEDIA_PAUSED}])) #status {
  visibility: var(--media-loading-indicator-opacity, visible);
  transition: visibility 0.15s var(--_loading-indicator-delay);
}

svg, img, ::slotted(svg), ::slotted(img) {
  width: var(--media-loading-indicator-icon-width);
  height: var(--media-loading-indicator-icon-height, 100px);
  fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
  vertical-align: middle;
}
</style>

<slot name="icon">${aE}</slot>
<div id="status" role="status" aria-live="polite">${(0,to.t)("media loading")}</div>
`;class ab extends tl.Au.HTMLElement{constructor(){if(super(),ah(this,eI,void 0),ah(this,eT,500),!this.shadowRoot){const e=this.attachShadow({mode:"open"}),t=av.content.cloneNode(!0);e.appendChild(t)}}static get observedAttributes(){return[tr.Ex.MEDIA_CONTROLLER,tr.GC.MEDIA_PAUSED,tr.GC.MEDIA_LOADING,am]}attributeChangedCallback(e,t,i){var a,n,r,s,o;e===am&&t!==i?this.loadingDelay=Number(i):e===tr.Ex.MEDIA_CONTROLLER&&(t&&(null==(n=null==(a=au(this,eI))?void 0:a.unassociateElement)||n.call(a,this),ac(this,eI,null)),i&&this.isConnected&&(ac(this,eI,null==(r=this.getRootNode())?void 0:r.getElementById(i)),null==(o=null==(s=au(this,eI))?void 0:s.associateElement)||o.call(s,this)))}connectedCallback(){var e,t,i;let a=this.getAttribute(tr.Ex.MEDIA_CONTROLLER);a&&(ac(this,eI,null==(e=this.getRootNode())?void 0:e.getElementById(a)),null==(i=null==(t=au(this,eI))?void 0:t.associateElement)||i.call(t,this))}disconnectedCallback(){var e,t;null==(t=null==(e=au(this,eI))?void 0:e.unassociateElement)||t.call(e,this),ac(this,eI,null)}get loadingDelay(){return au(this,eT)}set loadingDelay(e){ac(this,eT,e);let{style:t}=(0,tu.aQ)(this.shadowRoot,":host");t.setProperty("--_loading-indicator-delay",`var(--media-loading-indicator-transition-delay, ${e}ms)`)}get mediaPaused(){return(0,tu.Y_)(this,tr.GC.MEDIA_PAUSED)}set mediaPaused(e){(0,tu.QW)(this,tr.GC.MEDIA_PAUSED,e)}get mediaLoading(){return(0,tu.Y_)(this,tr.GC.MEDIA_LOADING)}set mediaLoading(e){(0,tu.QW)(this,tr.GC.MEDIA_LOADING,e)}get mediaController(){return(0,tu.vT)(this,tr.Ex.MEDIA_CONTROLLER)}set mediaController(e){(0,tu.tA)(this,tr.Ex.MEDIA_CONTROLLER,e)}get noAutohide(){return(0,tu.Y_)(this,ap)}set noAutohide(e){(0,tu.QW)(this,ap,e)}}eI=new WeakMap,eT=new WeakMap,tl.Au.customElements.get("media-loading-indicator")||tl.Au.customElements.define("media-loading-indicator",ab);let{MEDIA_VOLUME_LEVEL:ag}=tr.GC,af=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0a6.84 6.84 0 0 1-.54 2.64L20 16.15A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.92 6.92 0 0 1 14 18.7v2.06A9 9 0 0 0 17.69 19l2 2.05L21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z"/>
</svg>`,aA=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z"/>
</svg>`,ak=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z"/>
</svg>`,ay=tl.Al.createElement("template");ay.innerHTML=`
  <style>
  
  :host(:not([${ag}])) slot[name=icon] slot:not([name=high]), 
  :host([${ag}=high]) slot[name=icon] slot:not([name=high]) {
    display: none !important;
  }

  :host([${ag}=off]) slot[name=icon] slot:not([name=off]) {
    display: none !important;
  }

  :host([${ag}=low]) slot[name=icon] slot:not([name=low]) {
    display: none !important;
  }

  :host([${ag}=medium]) slot[name=icon] slot:not([name=medium]) {
    display: none !important;
  }

  :host(:not([${ag}=off])) slot[name=tooltip-unmute],
  :host([${ag}=off]) slot[name=tooltip-mute] {
    display: none;
  }
  </style>

  <slot name="icon">
    <slot name="off">${af}</slot>
    <slot name="low">${aA}</slot>
    <slot name="medium">${aA}</slot>
    <slot name="high">${ak}</slot>
  </slot>
`;let aC=`
  <slot name="tooltip-mute">${(0,to.t)("Mute")}</slot>
  <slot name="tooltip-unmute">${(0,to.t)("Unmute")}</slot>
`,aw=e=>{let t="off"===e.mediaVolumeLevel?(0,to.t)("unmute"):(0,to.t)("mute");e.setAttribute("aria-label",t)};class aI extends io.T{static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_VOLUME_LEVEL]}constructor(e={}){super({slotTemplate:ay,tooltipContent:aC,...e})}connectedCallback(){aw(this),super.connectedCallback()}attributeChangedCallback(e,t,i){e===tr.GC.MEDIA_VOLUME_LEVEL&&aw(this),super.attributeChangedCallback(e,t,i)}get mediaVolumeLevel(){return(0,tu.vT)(this,tr.GC.MEDIA_VOLUME_LEVEL)}set mediaVolumeLevel(e){(0,tu.tA)(this,tr.GC.MEDIA_VOLUME_LEVEL,e)}handleClick(){let e="off"===this.mediaVolumeLevel?tr.a8.MEDIA_UNMUTE_REQUEST:tr.a8.MEDIA_MUTE_REQUEST;this.dispatchEvent(new tl.Au.CustomEvent(e,{composed:!0,bubbles:!0}))}}tl.Au.customElements.get("media-mute-button")||tl.Au.customElements.define("media-mute-button",aI);let aT=`<svg aria-hidden="true" viewBox="0 0 28 24">
  <path d="M24 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-1 16H5V5h18v14Zm-3-8h-7v5h7v-5Z"/>
</svg>`,a_=tl.Al.createElement("template");a_.innerHTML=`
  <style>
  :host([${tr.GC.MEDIA_IS_PIP}]) slot[name=icon] slot:not([name=exit]) {
    display: none !important;
  }

  
  :host(:not([${tr.GC.MEDIA_IS_PIP}])) slot[name=icon] slot:not([name=enter]) {
    display: none !important;
  }

  :host([${tr.GC.MEDIA_IS_PIP}]) slot[name=tooltip-enter],
  :host(:not([${tr.GC.MEDIA_IS_PIP}])) slot[name=tooltip-exit] {
    display: none;
  }
  </style>

  <slot name="icon">
    <slot name="enter">${aT}</slot>
    <slot name="exit">${aT}</slot>
  </slot>
`;let aS=`
  <slot name="tooltip-enter">${(0,to.t)("Enter picture in picture mode")}</slot>
  <slot name="tooltip-exit">${(0,to.t)("Exit picture in picture mode")}</slot>
`,aM=e=>{let t=e.mediaIsPip?(0,to.t)("exit picture in picture mode"):(0,to.t)("enter picture in picture mode");e.setAttribute("aria-label",t)};class aL extends io.T{static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_IS_PIP,tr.GC.MEDIA_PIP_UNAVAILABLE]}constructor(e={}){super({slotTemplate:a_,tooltipContent:aS,...e})}connectedCallback(){aM(this),super.connectedCallback()}attributeChangedCallback(e,t,i){e===tr.GC.MEDIA_IS_PIP&&aM(this),super.attributeChangedCallback(e,t,i)}get mediaPipUnavailable(){return(0,tu.vT)(this,tr.GC.MEDIA_PIP_UNAVAILABLE)}set mediaPipUnavailable(e){(0,tu.tA)(this,tr.GC.MEDIA_PIP_UNAVAILABLE,e)}get mediaIsPip(){return(0,tu.Y_)(this,tr.GC.MEDIA_IS_PIP)}set mediaIsPip(e){(0,tu.QW)(this,tr.GC.MEDIA_IS_PIP,e)}handleClick(){let e=this.mediaIsPip?tr.a8.MEDIA_EXIT_PIP_REQUEST:tr.a8.MEDIA_ENTER_PIP_REQUEST;this.dispatchEvent(new tl.Au.CustomEvent(e,{composed:!0,bubbles:!0}))}}tl.Au.customElements.get("media-pip-button")||tl.Au.customElements.define("media-pip-button",aL);var aR=i(38591);let ax=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="m6 21 15-9L6 3v18Z"/>
</svg>`,aD=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M6 20h4V4H6v16Zm8-16v16h4V4h-4Z"/>
</svg>`,aN=tl.Al.createElement("template");aN.innerHTML=`
  <style>
    :host([${tr.GC.MEDIA_PAUSED}]) slot[name=pause],
    :host(:not([${tr.GC.MEDIA_PAUSED}])) slot[name=play] {
      display: none !important;
    }

    :host([${tr.GC.MEDIA_PAUSED}]) slot[name=tooltip-pause],
    :host(:not([${tr.GC.MEDIA_PAUSED}])) slot[name=tooltip-play] {
      display: none;
    }
  </style>

  <slot name="icon">
    <slot name="play">${ax}</slot>
    <slot name="pause">${aD}</slot>
  </slot>
`;let aP=`
  <slot name="tooltip-play">${(0,to.t)("Play")}</slot>
  <slot name="tooltip-pause">${(0,to.t)("Pause")}</slot>
`,aU=e=>{let t=e.mediaPaused?(0,to.t)("play"):(0,to.t)("pause");e.setAttribute("aria-label",t)};class aG extends io.T{static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_PAUSED,tr.GC.MEDIA_ENDED]}constructor(e={}){super({slotTemplate:aN,tooltipContent:aP,...e})}connectedCallback(){aU(this),super.connectedCallback()}attributeChangedCallback(e,t,i){e===tr.GC.MEDIA_PAUSED&&aU(this),super.attributeChangedCallback(e,t,i)}get mediaPaused(){return(0,tu.Y_)(this,tr.GC.MEDIA_PAUSED)}set mediaPaused(e){(0,tu.QW)(this,tr.GC.MEDIA_PAUSED,e)}handleClick(){let e=this.mediaPaused?tr.a8.MEDIA_PLAY_REQUEST:tr.a8.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new tl.Au.CustomEvent(e,{composed:!0,bubbles:!0}))}}tl.Au.customElements.get("media-play-button")||tl.Au.customElements.define("media-play-button",aG);let aO="placeholdersrc",aW=tl.Al.createElement("template");aW.innerHTML=`
  <style>
    :host {
      pointer-events: none;
      display: var(--media-poster-image-display, inline-block);
      box-sizing: border-box;
    }

    img {
      max-width: 100%;
      max-height: 100%;
      min-width: 100%;
      min-height: 100%;
      background-repeat: no-repeat;
      background-position: var(--media-poster-image-background-position, var(--media-object-position, center));
      background-size: var(--media-poster-image-background-size, var(--media-object-fit, contain));
      object-fit: var(--media-object-fit, contain);
      object-position: var(--media-object-position, center);
    }
  </style>

  <img part="poster img" aria-hidden="true" id="image"/>
`;class a$ extends tl.Au.HTMLElement{static get observedAttributes(){return[aO,"src"]}constructor(){super(),this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(aW.content.cloneNode(!0))),this.image=this.shadowRoot.querySelector("#image")}attributeChangedCallback(e,t,i){if("src"===e&&(null==i?this.image.removeAttribute("src"):this.image.setAttribute("src",i)),e===aO)if(null==i)this.image.style.removeProperty("background-image");else{var a;a=this.image,a.style["background-image"]=`url('${i}')`}}get placeholderSrc(){return(0,tu.vT)(this,aO)}set placeholderSrc(e){(0,tu.tA)(this,"src",e)}get src(){return(0,tu.vT)(this,"src")}set src(e){(0,tu.tA)(this,"src",e)}}tl.Au.customElements.get("media-poster-image")||tl.Au.customElements.define("media-poster-image",a$);var aH=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)};class aB extends iK{constructor(){super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,e_,void 0),((e,t,i,a)=>(aH(e,t,"write to private field"),a?a.call(e,i):t.set(e,i)))(this,e_,this.shadowRoot.querySelector("slot"))}static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_PREVIEW_CHAPTER]}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),e===tr.GC.MEDIA_PREVIEW_CHAPTER&&i!==t&&null!=i){var a,n;(aH(this,a=e_,"read from private field"),n?n.call(this):a.get(this)).textContent=i,""!==i?this.setAttribute("aria-valuetext",`chapter: ${i}`):this.removeAttribute("aria-valuetext")}}get mediaPreviewChapter(){return(0,tu.vT)(this,tr.GC.MEDIA_PREVIEW_CHAPTER)}set mediaPreviewChapter(e){(0,tu.tA)(this,tr.GC.MEDIA_PREVIEW_CHAPTER,e)}}e_=new WeakMap,tl.Au.customElements.get("media-preview-chapter-display")||tl.Au.customElements.define("media-preview-chapter-display",aB);var aV=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},aq=(e,t,i)=>(aV(e,t,"read from private field"),i?i.call(e):t.get(e)),aQ=(e,t,i,a)=>(aV(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);let aF=tl.Al.createElement("template");aF.innerHTML=`
  <style>
    :host {
      box-sizing: border-box;
      display: var(--media-control-display, var(--media-preview-thumbnail-display, inline-block));
      overflow: hidden;
    }

    img {
      display: none;
      position: relative;
    }
  </style>
  <img crossorigin loading="eager" decoding="async">
`;class aY extends tl.Au.HTMLElement{constructor(){super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,eS,void 0),this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(aF.content.cloneNode(!0)))}static get observedAttributes(){return[tr.Ex.MEDIA_CONTROLLER,tr.GC.MEDIA_PREVIEW_IMAGE,tr.GC.MEDIA_PREVIEW_COORDS]}connectedCallback(){var e,t,i;let a=this.getAttribute(tr.Ex.MEDIA_CONTROLLER);a&&(aQ(this,eS,null==(e=this.getRootNode())?void 0:e.getElementById(a)),null==(i=null==(t=aq(this,eS))?void 0:t.associateElement)||i.call(t,this))}disconnectedCallback(){var e,t;null==(t=null==(e=aq(this,eS))?void 0:e.unassociateElement)||t.call(e,this),aQ(this,eS,null)}attributeChangedCallback(e,t,i){var a,n,r,s,o;[tr.GC.MEDIA_PREVIEW_IMAGE,tr.GC.MEDIA_PREVIEW_COORDS].includes(e)&&this.update(),e===tr.Ex.MEDIA_CONTROLLER&&(t&&(null==(n=null==(a=aq(this,eS))?void 0:a.unassociateElement)||n.call(a,this),aQ(this,eS,null)),i&&this.isConnected&&(aQ(this,eS,null==(r=this.getRootNode())?void 0:r.getElementById(i)),null==(o=null==(s=aq(this,eS))?void 0:s.associateElement)||o.call(s,this)))}get mediaPreviewImage(){return(0,tu.vT)(this,tr.GC.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(e){(0,tu.tA)(this,tr.GC.MEDIA_PREVIEW_IMAGE,e)}get mediaPreviewCoords(){let e=this.getAttribute(tr.GC.MEDIA_PREVIEW_COORDS);if(e)return e.split(/\s+/).map(e=>+e)}set mediaPreviewCoords(e){e?this.setAttribute(tr.GC.MEDIA_PREVIEW_COORDS,e.join(" ")):this.removeAttribute(tr.GC.MEDIA_PREVIEW_COORDS)}update(){let e=this.mediaPreviewCoords,t=this.mediaPreviewImage;if(!(e&&t))return;let[i,a,n,r]=e,s=t.split("#")[0],{maxWidth:o,maxHeight:l,minWidth:d,minHeight:u}=getComputedStyle(this),h=Math.min(parseInt(o)/n,parseInt(l)/r),c=Math.max(parseInt(d)/n,parseInt(u)/r),m=h<1,p=m?h:c>1?c:1,{style:v}=(0,tu.aQ)(this.shadowRoot,":host"),E=(0,tu.aQ)(this.shadowRoot,"img").style,b=this.shadowRoot.querySelector("img"),g=m?"min":"max";v.setProperty(`${g}-width`,"initial","important"),v.setProperty(`${g}-height`,"initial","important"),v.width=`${n*p}px`,v.height=`${r*p}px`;let f=()=>{E.width=`${this.imgWidth*p}px`,E.height=`${this.imgHeight*p}px`,E.display="block"};b.src!==s&&(b.onload=()=>{this.imgWidth=b.naturalWidth,this.imgHeight=b.naturalHeight,f()},b.src=s,f()),f(),E.transform=`translate(-${i*p}px, -${a*p}px)`}}eS=new WeakMap,tl.Au.customElements.get("media-preview-thumbnail")||tl.Au.customElements.define("media-preview-thumbnail",aY);var aj=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},aK=(e,t,i)=>(aj(e,t,"read from private field"),i?i.call(e):t.get(e));class aZ extends iK{constructor(){super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,eM,void 0),((e,t,i,a)=>(aj(e,t,"write to private field"),a?a.call(e,i):t.set(e,i)))(this,eM,this.shadowRoot.querySelector("slot")),aK(this,eM).textContent=(0,ts.fU)(0)}static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_PREVIEW_TIME]}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===tr.GC.MEDIA_PREVIEW_TIME&&null!=i&&(aK(this,eM).textContent=(0,ts.fU)(parseFloat(i)))}get mediaPreviewTime(){return(0,tu.dm)(this,tr.GC.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(e){(0,tu.pK)(this,tr.GC.MEDIA_PREVIEW_TIME,e)}}eM=new WeakMap,tl.Au.customElements.get("media-preview-time-display")||tl.Au.customElements.define("media-preview-time-display",aZ);let az="seekoffset",aX=tl.Al.createElement("template");aX.innerHTML=`
  <slot name="icon"><svg aria-hidden="true" viewBox="0 0 20 24"><defs><style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style></defs><text class="text value" transform="translate(2.18 19.87)">30</text><path d="M10 6V3L4.37 7 10 10.94V8a5.54 5.54 0 0 1 1.9 10.48v2.12A7.5 7.5 0 0 0 10 6Z"/></svg></slot>
`;class aJ extends io.T{static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_CURRENT_TIME,az]}constructor(e={}){super({slotTemplate:aX,tooltipContent:(0,to.t)("Seek backward"),...e})}connectedCallback(){this.seekOffset=(0,tu.dm)(this,az,30),super.connectedCallback()}attributeChangedCallback(e,t,i){e===az&&(this.seekOffset=(0,tu.dm)(this,az,30)),super.attributeChangedCallback(e,t,i)}get seekOffset(){return(0,tu.dm)(this,az,30)}set seekOffset(e){(0,tu.pK)(this,az,e),this.setAttribute("aria-label",(0,to.t)("seek back {seekOffset} seconds",{seekOffset:this.seekOffset})),(0,tu.Ek)((0,tu.u0)(this,"icon"),this.seekOffset)}get mediaCurrentTime(){return(0,tu.dm)(this,tr.GC.MEDIA_CURRENT_TIME,0)}set mediaCurrentTime(e){(0,tu.pK)(this,tr.GC.MEDIA_CURRENT_TIME,e)}handleClick(){let e=Math.max(this.mediaCurrentTime-this.seekOffset,0),t=new tl.Au.CustomEvent(tr.a8.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(t)}}tl.Au.customElements.get("media-seek-backward-button")||tl.Au.customElements.define("media-seek-backward-button",aJ);let a0="seekoffset",a1=tl.Al.createElement("template");a1.innerHTML=`
  <slot name="icon"><svg aria-hidden="true" viewBox="0 0 20 24"><defs><style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style></defs><text class="text value" transform="translate(8.9 19.87)">30</text><path d="M10 6V3l5.61 4L10 10.94V8a5.54 5.54 0 0 0-1.9 10.48v2.12A7.5 7.5 0 0 1 10 6Z"/></svg></slot>
`;class a2 extends io.T{static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_CURRENT_TIME,a0]}constructor(e={}){super({slotTemplate:a1,tooltipContent:(0,to.t)("Seek forward"),...e})}connectedCallback(){this.seekOffset=(0,tu.dm)(this,a0,30),super.connectedCallback()}attributeChangedCallback(e,t,i){e===a0&&(this.seekOffset=(0,tu.dm)(this,a0,30)),super.attributeChangedCallback(e,t,i)}get seekOffset(){return(0,tu.dm)(this,a0,30)}set seekOffset(e){(0,tu.pK)(this,a0,e),this.setAttribute("aria-label",(0,to.t)("seek forward {seekOffset} seconds",{seekOffset:this.seekOffset})),(0,tu.Ek)((0,tu.u0)(this,"icon"),this.seekOffset)}get mediaCurrentTime(){return(0,tu.dm)(this,tr.GC.MEDIA_CURRENT_TIME,0)}set mediaCurrentTime(e){(0,tu.pK)(this,tr.GC.MEDIA_CURRENT_TIME,e)}handleClick(){let e=this.mediaCurrentTime+this.seekOffset,t=new tl.Au.CustomEvent(tr.a8.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(t)}}tl.Au.customElements.get("media-seek-forward-button")||tl.Au.customElements.define("media-seek-forward-button",a2);var a3=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},a4=(e,t,i)=>(a3(e,t,"read from private field"),i?i.call(e):t.get(e));let a5={REMAINING:"remaining",SHOW_DURATION:"showduration",NO_TOGGLE:"notoggle"},a8=[...Object.values(a5),tr.GC.MEDIA_CURRENT_TIME,tr.GC.MEDIA_DURATION,tr.GC.MEDIA_SEEKABLE],a7=["Enter"," "],a9="&nbsp;/&nbsp;",a6=(e,{timesSep:t=a9}={})=>{var i,a;let n=e.hasAttribute(a5.REMAINING),r=e.hasAttribute(a5.SHOW_DURATION),s=null!=(i=e.mediaCurrentTime)?i:0,[,o]=null!=(a=e.mediaSeekable)?a:[],l=0;Number.isFinite(e.mediaDuration)?l=e.mediaDuration:Number.isFinite(o)&&(l=o);let d=n?(0,ts.fU)(0-(l-s)):(0,ts.fU)(s);return r?`${d}${t}${(0,ts.fU)(l)}`:d};class ne extends iK{constructor(){super(),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,eL,void 0),((e,t,i,a)=>(a3(e,t,"write to private field"),a?a.call(e,i):t.set(e,i)))(this,eL,this.shadowRoot.querySelector("slot")),a4(this,eL).innerHTML=`${a6(this)}`}static get observedAttributes(){return[...super.observedAttributes,...a8,"disabled"]}connectedCallback(){let{style:e}=(0,tu.aQ)(this.shadowRoot,":host(:hover:not([notoggle]))");e.setProperty("cursor","var(--media-cursor, pointer)"),e.setProperty("background","var(--media-control-hover-background, rgba(50 50 70 / .7))"),this.hasAttribute("disabled")||this.enable(),this.setAttribute("role","progressbar"),this.setAttribute("aria-label",(0,to.t)("playback time"));let t=e=>{let{key:i}=e;a7.includes(i)?this.toggleTimeDisplay():this.removeEventListener("keyup",t)};this.addEventListener("keydown",e=>{let{metaKey:i,altKey:a,key:n}=e;i||a||!a7.includes(n)?this.removeEventListener("keyup",t):this.addEventListener("keyup",t)}),this.addEventListener("click",this.toggleTimeDisplay),super.connectedCallback()}toggleTimeDisplay(){this.noToggle||(this.hasAttribute("remaining")?this.removeAttribute("remaining"):this.setAttribute("remaining",""))}disconnectedCallback(){this.disable(),super.disconnectedCallback()}attributeChangedCallback(e,t,i){a8.includes(e)?this.update():"disabled"===e&&i!==t&&(null==i?this.enable():this.disable()),super.attributeChangedCallback(e,t,i)}enable(){this.tabIndex=0}disable(){this.tabIndex=-1}get remaining(){return(0,tu.Y_)(this,a5.REMAINING)}set remaining(e){(0,tu.QW)(this,a5.REMAINING,e)}get showDuration(){return(0,tu.Y_)(this,a5.SHOW_DURATION)}set showDuration(e){(0,tu.QW)(this,a5.SHOW_DURATION,e)}get noToggle(){return(0,tu.Y_)(this,a5.NO_TOGGLE)}set noToggle(e){(0,tu.QW)(this,a5.NO_TOGGLE,e)}get mediaDuration(){return(0,tu.dm)(this,tr.GC.MEDIA_DURATION)}set mediaDuration(e){(0,tu.pK)(this,tr.GC.MEDIA_DURATION,e)}get mediaCurrentTime(){return(0,tu.dm)(this,tr.GC.MEDIA_CURRENT_TIME)}set mediaCurrentTime(e){(0,tu.pK)(this,tr.GC.MEDIA_CURRENT_TIME,e)}get mediaSeekable(){let e=this.getAttribute(tr.GC.MEDIA_SEEKABLE);if(e)return e.split(":").map(e=>+e)}set mediaSeekable(e){null==e?this.removeAttribute(tr.GC.MEDIA_SEEKABLE):this.setAttribute(tr.GC.MEDIA_SEEKABLE,e.join(":"))}update(){let e=a6(this);(e=>{var t;let i=e.mediaCurrentTime,[,a]=null!=(t=e.mediaSeekable)?t:[],n=null;if(Number.isFinite(e.mediaDuration)?n=e.mediaDuration:Number.isFinite(a)&&(n=a),null==i||null===n)return e.setAttribute("aria-valuetext","video not loaded, unknown time.");let r=e.hasAttribute(a5.REMAINING),s=e.hasAttribute(a5.SHOW_DURATION),o=r?(0,ts.ss)(0-(n-i)):(0,ts.ss)(i);if(!s)return e.setAttribute("aria-valuetext",o);let l=(0,ts.ss)(n),d=`${o} of ${l}`;e.setAttribute("aria-valuetext",d)})(this),e!==a4(this,eL).innerHTML&&(a4(this,eL).innerHTML=e)}}eL=new WeakMap,tl.Au.customElements.get("media-time-display")||tl.Au.customElements.define("media-time-display",ne);var nt=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},ni=(e,t,i)=>(nt(e,t,"read from private field"),i?i.call(e):t.get(e)),na=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},nn=(e,t,i,a)=>(nt(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i);class nr{constructor(e,t,i){na(this,eR,void 0),na(this,ex,void 0),na(this,eD,void 0),na(this,eN,void 0),na(this,eP,void 0),na(this,eU,void 0),na(this,eG,void 0),na(this,eO,void 0),na(this,eW,0),na(this,e$,(e=performance.now())=>{nn(this,eW,requestAnimationFrame(ni(this,e$))),nn(this,eN,performance.now()-ni(this,eD));let t=1e3/this.fps;if(ni(this,eN)>t){let i,a,n,r;nn(this,eD,e-ni(this,eN)%t);let s=1e3/((e-ni(this,ex))/++(i=this,a=eP,{set _(value){nn(i,a,value,n)},get _(){return ni(i,a,r)}})._),o=(e-ni(this,eU))/1e3/this.duration,l=ni(this,eG)+o*this.playbackRate;l-ni(this,eR).valueAsNumber>0?nn(this,eO,this.playbackRate/this.duration/s):(nn(this,eO,.995*ni(this,eO)),l=ni(this,eR).valueAsNumber+ni(this,eO)),this.callback(l)}}),nn(this,eR,e),this.callback=t,this.fps=i}start(){0===ni(this,eW)&&(nn(this,eD,performance.now()),nn(this,ex,ni(this,eD)),nn(this,eP,0),ni(this,e$).call(this))}stop(){0!==ni(this,eW)&&(cancelAnimationFrame(ni(this,eW)),nn(this,eW,0))}update({start:e,duration:t,playbackRate:i}){let a=e-ni(this,eR).valueAsNumber,n=Math.abs(t-this.duration);(a>0||a<-.03||n>=.5)&&this.callback(e),nn(this,eG,e),nn(this,eU,performance.now()),this.duration=t,this.playbackRate=i}}eR=new WeakMap,ex=new WeakMap,eD=new WeakMap,eN=new WeakMap,eP=new WeakMap,eU=new WeakMap,eG=new WeakMap,eO=new WeakMap,eW=new WeakMap,e$=new WeakMap;var ns=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},no=(e,t,i)=>(ns(e,t,"read from private field"),i?i.call(e):t.get(e)),nl=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},nd=(e,t,i,a)=>(ns(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),nu=(e,t,i)=>(ns(e,t,"access private method"),i);let nh=tl.Al.createElement("template");nh.innerHTML=`
  <style>
    :host {
      --media-box-border-radius: 4px;
      --media-box-padding-left: 10px;
      --media-box-padding-right: 10px;
      --media-preview-border-radius: var(--media-box-border-radius);
      --media-box-arrow-offset: var(--media-box-border-radius);
      --_control-background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
      --_preview-background: var(--media-preview-background, var(--_control-background));

      
      contain: layout;
    }

    #buffered {
      background: var(--media-time-range-buffered-color, rgb(255 255 255 / .4));
      position: absolute;
      height: 100%;
      will-change: width;
    }

    #preview-rail,
    #current-rail {
      width: 100%;
      position: absolute;
      left: 0;
      bottom: 100%;
      pointer-events: none;
      will-change: transform;
    }

    [part~="box"] {
      width: min-content;
      
      position: absolute;
      bottom: 100%;
      flex-direction: column;
      align-items: center;
      transform: translateX(-50%);
    }

    [part~="current-box"] {
      display: var(--media-current-box-display, var(--media-box-display, flex));
      margin: var(--media-current-box-margin, var(--media-box-margin, 0 0 5px));
      visibility: hidden;
    }

    [part~="preview-box"] {
      display: var(--media-preview-box-display, var(--media-box-display, flex));
      margin: var(--media-preview-box-margin, var(--media-box-margin, 0 0 5px));
      transition-property: var(--media-preview-transition-property, visibility, opacity);
      transition-duration: var(--media-preview-transition-duration-out, .25s);
      transition-delay: var(--media-preview-transition-delay-out, 0s);
      visibility: hidden;
      opacity: 0;
    }

    :host(:is([${tr.GC.MEDIA_PREVIEW_IMAGE}], [${tr.GC.MEDIA_PREVIEW_TIME}])[dragging]) [part~="preview-box"] {
      transition-duration: var(--media-preview-transition-duration-in, .5s);
      transition-delay: var(--media-preview-transition-delay-in, .25s);
      visibility: visible;
      opacity: 1;
    }

    @media (hover: hover) {
      :host(:is([${tr.GC.MEDIA_PREVIEW_IMAGE}], [${tr.GC.MEDIA_PREVIEW_TIME}]):hover) [part~="preview-box"] {
        transition-duration: var(--media-preview-transition-duration-in, .5s);
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
        opacity: 1;
      }
    }

    media-preview-thumbnail,
    ::slotted(media-preview-thumbnail) {
      visibility: hidden;
      
      transition: visibility 0s .25s;
      transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
      background: var(--media-preview-thumbnail-background, var(--_preview-background));
      box-shadow: var(--media-preview-thumbnail-box-shadow, 0 0 4px rgb(0 0 0 / .2));
      max-width: var(--media-preview-thumbnail-max-width, 180px);
      max-height: var(--media-preview-thumbnail-max-height, 160px);
      min-width: var(--media-preview-thumbnail-min-width, 120px);
      min-height: var(--media-preview-thumbnail-min-height, 80px);
      border: var(--media-preview-thumbnail-border);
      border-radius: var(--media-preview-thumbnail-border-radius,
        var(--media-preview-border-radius) var(--media-preview-border-radius) 0 0);
    }

    :host([${tr.GC.MEDIA_PREVIEW_IMAGE}][dragging]) media-preview-thumbnail,
    :host([${tr.GC.MEDIA_PREVIEW_IMAGE}][dragging]) ::slotted(media-preview-thumbnail) {
      transition-delay: var(--media-preview-transition-delay-in, .25s);
      visibility: visible;
    }

    @media (hover: hover) {
      :host([${tr.GC.MEDIA_PREVIEW_IMAGE}]:hover) media-preview-thumbnail,
      :host([${tr.GC.MEDIA_PREVIEW_IMAGE}]:hover) ::slotted(media-preview-thumbnail) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
      }

      :host([${tr.GC.MEDIA_PREVIEW_TIME}]:hover) {
        --media-time-range-hover-display: block;
      }
    }

    media-preview-chapter-display,
    ::slotted(media-preview-chapter-display) {
      font-size: var(--media-font-size, 13px);
      line-height: 17px;
      min-width: 0;
      visibility: hidden;
      
      transition: min-width 0s, border-radius 0s, margin 0s, padding 0s, visibility 0s;
      transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
      background: var(--media-preview-chapter-background, var(--_preview-background));
      border-radius: var(--media-preview-chapter-border-radius,
        var(--media-preview-border-radius) var(--media-preview-border-radius)
        var(--media-preview-border-radius) var(--media-preview-border-radius));
      padding: var(--media-preview-chapter-padding, 3.5px 9px);
      margin: var(--media-preview-chapter-margin, 0 0 5px);
      text-shadow: var(--media-preview-chapter-text-shadow, 0 0 4px rgb(0 0 0 / .75));
    }

    :host([${tr.GC.MEDIA_PREVIEW_IMAGE}]) media-preview-chapter-display,
    :host([${tr.GC.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-chapter-display) {
      transition-delay: var(--media-preview-transition-delay-in, .25s);
      border-radius: var(--media-preview-chapter-border-radius, 0);
      padding: var(--media-preview-chapter-padding, 3.5px 9px 0);
      margin: var(--media-preview-chapter-margin, 0);
      min-width: 100%;
    }

    media-preview-chapter-display[${tr.GC.MEDIA_PREVIEW_CHAPTER}],
    ::slotted(media-preview-chapter-display[${tr.GC.MEDIA_PREVIEW_CHAPTER}]) {
      visibility: visible;
    }

    media-preview-chapter-display:not([aria-valuetext]),
    ::slotted(media-preview-chapter-display:not([aria-valuetext])) {
      display: none;
    }

    media-preview-time-display,
    ::slotted(media-preview-time-display),
    media-time-display,
    ::slotted(media-time-display) {
      font-size: var(--media-font-size, 13px);
      line-height: 17px;
      min-width: 0;
      
      transition: min-width 0s, border-radius 0s;
      transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
      background: var(--media-preview-time-background, var(--_preview-background));
      border-radius: var(--media-preview-time-border-radius,
        var(--media-preview-border-radius) var(--media-preview-border-radius)
        var(--media-preview-border-radius) var(--media-preview-border-radius));
      padding: var(--media-preview-time-padding, 3.5px 9px);
      margin: var(--media-preview-time-margin, 0);
      text-shadow: var(--media-preview-time-text-shadow, 0 0 4px rgb(0 0 0 / .75));
      transform: translateX(min(
        max(calc(50% - var(--_box-width) / 2),
        calc(var(--_box-shift, 0))),
        calc(var(--_box-width) / 2 - 50%)
      ));
    }

    :host([${tr.GC.MEDIA_PREVIEW_IMAGE}]) media-preview-time-display,
    :host([${tr.GC.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-time-display) {
      transition-delay: var(--media-preview-transition-delay-in, .25s);
      border-radius: var(--media-preview-time-border-radius,
        0 0 var(--media-preview-border-radius) var(--media-preview-border-radius));
      min-width: 100%;
    }

    :host([${tr.GC.MEDIA_PREVIEW_TIME}]:hover) {
      --media-time-range-hover-display: block;
    }

    [part~="arrow"],
    ::slotted([part~="arrow"]) {
      display: var(--media-box-arrow-display, inline-block);
      transform: translateX(min(
        max(calc(50% - var(--_box-width) / 2 + var(--media-box-arrow-offset)),
        calc(var(--_box-shift, 0))),
        calc(var(--_box-width) / 2 - 50% - var(--media-box-arrow-offset))
      ));
      
      border-color: transparent;
      border-top-color: var(--media-box-arrow-background, var(--_control-background));
      border-width: var(--media-box-arrow-border-width,
        var(--media-box-arrow-height, 5px) var(--media-box-arrow-width, 6px) 0);
      border-style: solid;
      justify-content: center;
      height: 0;
    }
  </style>
  <div id="preview-rail">
    <slot name="preview" part="box preview-box">
      <media-preview-thumbnail></media-preview-thumbnail>
      <media-preview-chapter-display></media-preview-chapter-display>
      <media-preview-time-display></media-preview-time-display>
      <slot name="preview-arrow"><div part="arrow"></div></slot>
    </slot>
  </div>
  <div id="current-rail">
    <slot name="current" part="box current-box">
      
    </slot>
  </div>
`;let nc=(e,t=e.mediaCurrentTime)=>{let i=Number.isFinite(e.mediaSeekableStart)?e.mediaSeekableStart:0,a=Number.isFinite(e.mediaDuration)?e.mediaDuration:e.mediaSeekableEnd;return Number.isNaN(a)?0:Math.max(0,Math.min((t-i)/(a-i),1))},nm=(e,t=e.range.valueAsNumber)=>{let i=Number.isFinite(e.mediaSeekableStart)?e.mediaSeekableStart:0,a=Number.isFinite(e.mediaDuration)?e.mediaDuration:e.mediaSeekableEnd;return Number.isNaN(a)?0:t*(a-i)+i};class np extends iW{constructor(){super(),nl(this,eZ),nl(this,eX),nl(this,e1),nl(this,e3),nl(this,e5),nl(this,e7),nl(this,e6),nl(this,tt),nl(this,eH,void 0),nl(this,eB,void 0),nl(this,eV,void 0),nl(this,eq,void 0),nl(this,eQ,void 0),nl(this,eF,void 0),nl(this,eY,void 0),nl(this,ej,void 0),nl(this,eK,void 0),nl(this,e0,e=>{this.dragging||((0,tN.gf)(e)&&(this.range.valueAsNumber=e),this.updateBar())}),this.container.appendChild(nh.content.cloneNode(!0)),this.shadowRoot.querySelector("#track").insertAdjacentHTML("afterbegin",'<div id="buffered" part="buffered"></div>'),nd(this,eV,this.shadowRoot.querySelectorAll('[part~="box"]')),nd(this,eQ,this.shadowRoot.querySelector('[part~="preview-box"]')),nd(this,eF,this.shadowRoot.querySelector('[part~="current-box"]'));const e=getComputedStyle(this);nd(this,eY,parseInt(e.getPropertyValue("--media-box-padding-left"))),nd(this,ej,parseInt(e.getPropertyValue("--media-box-padding-right"))),nd(this,eB,new nr(this.range,no(this,e0),60))}static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_PAUSED,tr.GC.MEDIA_DURATION,tr.GC.MEDIA_SEEKABLE,tr.GC.MEDIA_CURRENT_TIME,tr.GC.MEDIA_PREVIEW_IMAGE,tr.GC.MEDIA_PREVIEW_TIME,tr.GC.MEDIA_PREVIEW_CHAPTER,tr.GC.MEDIA_BUFFERED,tr.GC.MEDIA_PLAYBACK_RATE,tr.GC.MEDIA_LOADING,tr.GC.MEDIA_ENDED]}connectedCallback(){var e;super.connectedCallback(),this.range.setAttribute("aria-label",(0,to.t)("seek")),nu(this,eZ,ez).call(this),nd(this,eH,this.getRootNode()),null==(e=no(this,eH))||e.addEventListener("transitionstart",this)}disconnectedCallback(){var e;super.disconnectedCallback(),nu(this,eZ,ez).call(this),null==(e=no(this,eH))||e.removeEventListener("transitionstart",this),nd(this,eH,null)}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),t!=i){if(e===tr.GC.MEDIA_CURRENT_TIME||e===tr.GC.MEDIA_PAUSED||e===tr.GC.MEDIA_ENDED||e===tr.GC.MEDIA_LOADING||e===tr.GC.MEDIA_DURATION||e===tr.GC.MEDIA_SEEKABLE){let e,t,i,a;no(this,eB).update({start:nc(this),duration:this.mediaSeekableEnd-this.mediaSeekableStart,playbackRate:this.mediaPlaybackRate}),nu(this,eZ,ez).call(this),e=this.range,t=(0,ts.ss)(+nm(this)),i=(0,ts.ss)(+this.mediaSeekableEnd),a=t&&i?`${t} of ${i}`:"video not loaded, unknown time.",e.setAttribute("aria-valuetext",a)}else e===tr.GC.MEDIA_BUFFERED&&this.updateBufferedBar();(e===tr.GC.MEDIA_DURATION||e===tr.GC.MEDIA_SEEKABLE)&&(this.mediaChaptersCues=no(this,eK),this.updateBar())}}get mediaChaptersCues(){return no(this,eK)}set mediaChaptersCues(e){var t;nd(this,eK,e),this.updateSegments(null==(t=no(this,eK))?void 0:t.map(e=>({start:nc(this,e.startTime),end:nc(this,e.endTime)})))}get mediaPaused(){return(0,tu.Y_)(this,tr.GC.MEDIA_PAUSED)}set mediaPaused(e){(0,tu.QW)(this,tr.GC.MEDIA_PAUSED,e)}get mediaLoading(){return(0,tu.Y_)(this,tr.GC.MEDIA_LOADING)}set mediaLoading(e){(0,tu.QW)(this,tr.GC.MEDIA_LOADING,e)}get mediaDuration(){return(0,tu.dm)(this,tr.GC.MEDIA_DURATION)}set mediaDuration(e){(0,tu.pK)(this,tr.GC.MEDIA_DURATION,e)}get mediaCurrentTime(){return(0,tu.dm)(this,tr.GC.MEDIA_CURRENT_TIME)}set mediaCurrentTime(e){(0,tu.pK)(this,tr.GC.MEDIA_CURRENT_TIME,e)}get mediaPlaybackRate(){return(0,tu.dm)(this,tr.GC.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(e){(0,tu.pK)(this,tr.GC.MEDIA_PLAYBACK_RATE,e)}get mediaBuffered(){let e=this.getAttribute(tr.GC.MEDIA_BUFFERED);return e?e.split(" ").map(e=>e.split(":").map(e=>+e)):[]}set mediaBuffered(e){if(!e)return void this.removeAttribute(tr.GC.MEDIA_BUFFERED);let t=e.map(e=>e.join(":")).join(" ");this.setAttribute(tr.GC.MEDIA_BUFFERED,t)}get mediaSeekable(){let e=this.getAttribute(tr.GC.MEDIA_SEEKABLE);if(e)return e.split(":").map(e=>+e)}set mediaSeekable(e){null==e?this.removeAttribute(tr.GC.MEDIA_SEEKABLE):this.setAttribute(tr.GC.MEDIA_SEEKABLE,e.join(":"))}get mediaSeekableEnd(){var e;let[,t=this.mediaDuration]=null!=(e=this.mediaSeekable)?e:[];return t}get mediaSeekableStart(){var e;let[t=0]=null!=(e=this.mediaSeekable)?e:[];return t}get mediaPreviewImage(){return(0,tu.vT)(this,tr.GC.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(e){(0,tu.tA)(this,tr.GC.MEDIA_PREVIEW_IMAGE,e)}get mediaPreviewTime(){return(0,tu.dm)(this,tr.GC.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(e){(0,tu.pK)(this,tr.GC.MEDIA_PREVIEW_TIME,e)}get mediaEnded(){return(0,tu.Y_)(this,tr.GC.MEDIA_ENDED)}set mediaEnded(e){(0,tu.QW)(this,tr.GC.MEDIA_ENDED,e)}updateBar(){super.updateBar(),this.updateBufferedBar(),this.updateCurrentBox()}updateBufferedBar(){var e;let t,i=this.mediaBuffered;if(!i.length)return;if(this.mediaEnded)t=1;else{let a=this.mediaCurrentTime,[,n=this.mediaSeekableStart]=null!=(e=i.find(([e,t])=>e<=a&&a<=t))?e:[];t=nc(this,n)}let{style:a}=(0,tu.aQ)(this.shadowRoot,"#buffered");a.setProperty("width",`${100*t}%`)}updateCurrentBox(){if(!this.shadowRoot.querySelector('slot[name="current"]').assignedElements().length)return;let e=(0,tu.aQ)(this.shadowRoot,"#current-rail"),t=(0,tu.aQ)(this.shadowRoot,'[part~="current-box"]'),i=nu(this,e1,e2).call(this,no(this,eF)),a=nu(this,e3,e4).call(this,i,this.range.valueAsNumber),n=nu(this,e5,e8).call(this,i,this.range.valueAsNumber);e.style.transform=`translateX(${a})`,e.style.setProperty("--_range-width",`${i.range.width}`),t.style.setProperty("--_box-shift",`${n}`),t.style.setProperty("--_box-width",`${i.box.width}px`),t.style.setProperty("visibility","initial")}handleEvent(e){switch(super.handleEvent(e),e.type){case"input":nu(this,tt,ti).call(this);break;case"pointermove":nu(this,e7,e9).call(this,e);break;case"pointerup":case"pointerleave":nu(this,e6,te).call(this,null);break;case"transitionstart":(0,tu.qg)(e.target,this)&&setTimeout(()=>nu(this,eZ,ez).call(this),0)}}}eH=new WeakMap,eB=new WeakMap,eV=new WeakMap,eq=new WeakMap,eQ=new WeakMap,eF=new WeakMap,eY=new WeakMap,ej=new WeakMap,eK=new WeakMap,eZ=new WeakSet,ez=function(){nu(this,eX,eJ).call(this)?no(this,eB).start():no(this,eB).stop()},eX=new WeakSet,eJ=function(){return this.isConnected&&!this.mediaPaused&&!this.mediaLoading&&!this.mediaEnded&&this.mediaSeekableEnd>0&&(0,tu.J9)(this)},e0=new WeakMap,e1=new WeakSet,e2=function(e){var t;let i=(null!=(t=this.getAttribute("bounds")?(0,tu.CQ)(this,`#${this.getAttribute("bounds")}`):this.parentElement)?t:this).getBoundingClientRect(),a=this.range.getBoundingClientRect(),n=e.offsetWidth,r=-(a.left-i.left-n/2),s=i.right-a.left-n/2;return{box:{width:n,min:r,max:s},bounds:i,range:a}},e3=new WeakSet,e4=function(e,t){let i=`${100*t}%`,{width:a,min:n,max:r}=e.box;if(!a)return i;if(!Number.isNaN(n)){let e=`calc(1 / var(--_range-width) * 100 * ${n}% + var(--media-box-padding-left))`;i=`max(${e}, ${i})`}if(!Number.isNaN(r)){let e=`calc(1 / var(--_range-width) * 100 * ${r}% - var(--media-box-padding-right))`;i=`min(${i}, ${e})`}return i},e5=new WeakSet,e8=function(e,t){let{width:i,min:a,max:n}=e.box,r=t*e.range.width;if(r<a+no(this,eY)){let t=e.range.left-e.bounds.left-no(this,eY);return`${r-i/2+t}px`}if(r>n-no(this,ej)){let t=e.bounds.right-e.range.right-no(this,ej);return`${r+i/2-t-e.range.width}px`}return 0},e7=new WeakSet,e9=function(e){let t=[...no(this,eV)].some(t=>e.composedPath().includes(t));if(!this.dragging&&(t||!e.composedPath().includes(this)))return void nu(this,e6,te).call(this,null);let i=this.mediaSeekableEnd;if(!i)return;let a=(0,tu.aQ)(this.shadowRoot,"#preview-rail"),n=(0,tu.aQ)(this.shadowRoot,'[part~="preview-box"]'),r=nu(this,e1,e2).call(this,no(this,eQ)),s=(e.clientX-r.range.left)/r.range.width;s=Math.max(0,Math.min(1,s));let o=nu(this,e3,e4).call(this,r,s),l=nu(this,e5,e8).call(this,r,s);a.style.transform=`translateX(${o})`,a.style.setProperty("--_range-width",`${r.range.width}`),n.style.setProperty("--_box-shift",`${l}`),n.style.setProperty("--_box-width",`${r.box.width}px`),1>Math.abs(Math.round(no(this,eq))-Math.round(s*i))&&s>.01&&s<.99||(nd(this,eq,s*i),nu(this,e6,te).call(this,no(this,eq)))},e6=new WeakSet,te=function(e){this.dispatchEvent(new tl.Au.CustomEvent(tr.a8.MEDIA_PREVIEW_REQUEST,{composed:!0,bubbles:!0,detail:e}))},tt=new WeakSet,ti=function(){no(this,eB).stop();let e=nm(this);this.dispatchEvent(new tl.Au.CustomEvent(tr.a8.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e}))},tl.Au.customElements.get("media-time-range")||tl.Au.customElements.define("media-time-range",np);let nv="placement",nE="bounds",nb=tl.Al.createElement("template");nb.innerHTML=`
  <style>
    :host {
      --_tooltip-background-color: var(--media-tooltip-background-color, var(--media-secondary-color, rgba(20, 20, 30, .7)));
      --_tooltip-background: var(--media-tooltip-background, var(--_tooltip-background-color));
      --_tooltip-arrow-half-width: calc(var(--media-tooltip-arrow-width, 12px) / 2);
      --_tooltip-arrow-height: var(--media-tooltip-arrow-height, 5px);
      --_tooltip-arrow-background: var(--media-tooltip-arrow-color, var(--_tooltip-background-color));
      position: relative;
      pointer-events: none;
      display: var(--media-tooltip-display, inline-flex);
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      z-index: var(--media-tooltip-z-index, 1);
      background: var(--_tooltip-background);
      color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
      font: var(--media-font,
        var(--media-font-weight, 400)
        var(--media-font-size, 13px) /
        var(--media-text-content-height, var(--media-control-height, 18px))
        var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
      padding: var(--media-tooltip-padding, .35em .7em);
      border: var(--media-tooltip-border, none);
      border-radius: var(--media-tooltip-border-radius, 5px);
      filter: var(--media-tooltip-filter, drop-shadow(0 0 4px rgba(0, 0, 0, .2)));
      white-space: var(--media-tooltip-white-space, nowrap);
    }

    :host([hidden]) {
      display: none;
    }

    img, svg {
      display: inline-block;
    }

    #arrow {
      position: absolute;
      width: 0px;
      height: 0px;
      border-style: solid;
      display: var(--media-tooltip-arrow-display, block);
    }

    :host(:not([placement])),
    :host([placement="top"]) {
      position: absolute;
      bottom: calc(100% + var(--media-tooltip-distance, 12px));
      left: 50%;
      transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
    }
    :host(:not([placement])) #arrow,
    :host([placement="top"]) #arrow {
      top: 100%;
      left: 50%;
      border-width: var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width);
      border-color: var(--_tooltip-arrow-background) transparent transparent transparent;
      transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
    }

    :host([placement="right"]) {
      position: absolute;
      left: calc(100% + var(--media-tooltip-distance, 12px));
      top: 50%;
      transform: translate(0, -50%);
    }
    :host([placement="right"]) #arrow {
      top: 50%;
      right: 100%;
      border-width: var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0;
      border-color: transparent var(--_tooltip-arrow-background) transparent transparent;
      transform: translate(0, -50%);
    }

    :host([placement="bottom"]) {
      position: absolute;
      top: calc(100% + var(--media-tooltip-distance, 12px));
      left: 50%;
      transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
    }
    :host([placement="bottom"]) #arrow {
      bottom: 100%;
      left: 50%;
      border-width: 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width);
      border-color: transparent transparent var(--_tooltip-arrow-background) transparent;
      transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
    }

    :host([placement="left"]) {
      position: absolute;
      right: calc(100% + var(--media-tooltip-distance, 12px));
      top: 50%;
      transform: translate(0, -50%);
    }
    :host([placement="left"]) #arrow {
      top: 50%;
      left: 100%;
      border-width: var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height);
      border-color: transparent transparent transparent var(--_tooltip-arrow-background);
      transform: translate(0, -50%);
    }
    
    :host([placement="none"]) #arrow {
      display: none;
    }

  </style>
  <slot></slot>
  <div id="arrow"></div>
`;class ng extends tl.Au.HTMLElement{constructor(){if(super(),this.updateXOffset=()=>{var e;if(!(0,tu.J9)(this,{checkOpacity:!1,checkVisibilityCSS:!1}))return;let t=this.placement;if("left"===t||"right"===t)return void this.style.removeProperty("--media-tooltip-offset-x");let i=getComputedStyle(this),a=null!=(e=(0,tu.CQ)(this,"#"+this.bounds))?e:(0,tu.Bk)(this);if(!a)return;let{x:n,width:r}=a.getBoundingClientRect(),{x:s,width:o}=this.getBoundingClientRect(),l=i.getPropertyValue("--media-tooltip-offset-x"),d=l?parseFloat(l.replace("px","")):0,u=i.getPropertyValue("--media-tooltip-container-margin"),h=u?parseFloat(u.replace("px","")):0,c=s-n+d-h,m=s+o-(n+r)+d+h;c<0?this.style.setProperty("--media-tooltip-offset-x",`${c}px`):m>0?this.style.setProperty("--media-tooltip-offset-x",`${m}px`):this.style.removeProperty("--media-tooltip-offset-x")},this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.appendChild(nb.content.cloneNode(!0))),this.arrowEl=this.shadowRoot.querySelector("#arrow"),Object.prototype.hasOwnProperty.call(this,"placement")){const e=this.placement;delete this.placement,this.placement=e}}static get observedAttributes(){return[nv,nE]}get placement(){return(0,tu.vT)(this,nv)}set placement(e){(0,tu.tA)(this,nv,e)}get bounds(){return(0,tu.vT)(this,nE)}set bounds(e){(0,tu.tA)(this,nE,e)}}tl.Au.customElements.get("media-tooltip")||tl.Au.customElements.define("media-tooltip",ng);class nf extends iW{static get observedAttributes(){return[...super.observedAttributes,tr.GC.MEDIA_VOLUME,tr.GC.MEDIA_MUTED,tr.GC.MEDIA_VOLUME_UNAVAILABLE]}constructor(){super(),this.range.addEventListener("input",()=>{let e=this.range.value,t=new tl.Au.CustomEvent(tr.a8.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:e});this.dispatchEvent(t)})}connectedCallback(){super.connectedCallback(),this.range.setAttribute("aria-label",(0,to.t)("volume"))}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),e===tr.GC.MEDIA_VOLUME||e===tr.GC.MEDIA_MUTED){let e;this.range.valueAsNumber=this.mediaMuted?0:this.mediaVolume,this.range.setAttribute("aria-valuetext",(e=this.range.valueAsNumber,`${Math.round(100*e)}%`)),this.updateBar()}}get mediaVolume(){return(0,tu.dm)(this,tr.GC.MEDIA_VOLUME,1)}set mediaVolume(e){(0,tu.pK)(this,tr.GC.MEDIA_VOLUME,e)}get mediaMuted(){return(0,tu.Y_)(this,tr.GC.MEDIA_MUTED)}set mediaMuted(e){(0,tu.QW)(this,tr.GC.MEDIA_MUTED,e)}get mediaVolumeUnavailable(){return(0,tu.vT)(this,tr.GC.MEDIA_VOLUME_UNAVAILABLE)}set mediaVolumeUnavailable(e){(0,tu.tA)(this,tr.GC.MEDIA_VOLUME_UNAVAILABLE,e)}}tl.Au.customElements.get("media-volume-range")||tl.Au.customElements.define("media-volume-range",nf),(0,tn.a0)({tagName:"media-gesture-receiver",elementClass:tv,react:ta}),(0,tn.a0)({tagName:"media-container",elementClass:tx,react:ta});let nA=(0,tn.a0)({tagName:"media-controller",elementClass:t5,react:ta});(0,tn.a0)({tagName:"media-chrome-button",elementClass:io.A,react:ta}),(0,tn.a0)({tagName:"media-airplay-button",elementClass:ic,react:ta});let nk=(0,tn.a0)({tagName:"media-captions-button",elementClass:ig,react:ta});(0,tn.a0)({tagName:"media-cast-button",elementClass:iI,react:ta}),(0,tn.a0)({tagName:"media-chrome-dialog",elementClass:ix,react:ta}),(0,tn.a0)({tagName:"media-chrome-range",elementClass:iW,react:ta});let ny=(0,tn.a0)({tagName:"media-control-bar",elementClass:iq,react:ta});(0,tn.a0)({tagName:"media-text-display",elementClass:iK,react:ta}),(0,tn.a0)({tagName:"media-duration-display",elementClass:iX,react:ta}),(0,tn.a0)({tagName:"media-error-dialog",elementClass:i5,react:ta});let nC=(0,tn.a0)({tagName:"media-fullscreen-button",elementClass:at,react:ta});(0,tn.a0)({tagName:"media-live-button",elementClass:al,react:ta});let nw=(0,tn.a0)({tagName:"media-loading-indicator",elementClass:ab,react:ta}),nI=(0,tn.a0)({tagName:"media-mute-button",elementClass:aI,react:ta}),nT=(0,tn.a0)({tagName:"media-pip-button",elementClass:aL,react:ta});(0,tn.a0)({tagName:"media-playback-rate-button",elementClass:aR.Ay,react:ta});let n_=(0,tn.a0)({tagName:"media-play-button",elementClass:aG,react:ta});(0,tn.a0)({tagName:"media-poster-image",elementClass:a$,react:ta}),(0,tn.a0)({tagName:"media-preview-chapter-display",elementClass:aB,react:ta}),(0,tn.a0)({tagName:"media-preview-thumbnail",elementClass:aY,react:ta}),(0,tn.a0)({tagName:"media-preview-time-display",elementClass:aZ,react:ta}),(0,tn.a0)({tagName:"media-seek-backward-button",elementClass:aJ,react:ta}),(0,tn.a0)({tagName:"media-seek-forward-button",elementClass:a2,react:ta});let nS=(0,tn.a0)({tagName:"media-time-display",elementClass:ne,react:ta}),nM=(0,tn.a0)({tagName:"media-time-range",elementClass:np,react:ta});(0,tn.a0)({tagName:"media-tooltip",elementClass:ng,react:ta}),(0,tn.a0)({tagName:"media-volume-range",elementClass:nf,react:ta})},69350:(e,t,i)=>{i.d(t,{W:()=>s});var a=i(38275),n=i(34541);let r={some:0,all:1};function s(e,{root:t,margin:i,amount:o,once:l=!1,initial:d=!1}={}){let[u,h]=(0,a.useState)(d);return(0,a.useEffect)(()=>{if(!e.current||l&&u)return;let a={root:t&&t.current||void 0,margin:i,amount:o};return function(e,t,{root:i,margin:a,amount:s="some"}={}){let o=(0,n.K)(e),l=new WeakMap,d=new IntersectionObserver(e=>{e.forEach(e=>{let i=l.get(e.target);if(!!i!==e.isIntersecting)if(e.isIntersecting){let i=t(e.target,e);"function"==typeof i?l.set(e.target,i):d.unobserve(e.target)}else"function"==typeof i&&(i(e),l.delete(e.target))})},{root:i,rootMargin:a,threshold:"number"==typeof s?s:r[s]});return o.forEach(e=>d.observe(e)),()=>d.disconnect()}(e.current,()=>(h(!0),l?void 0:()=>h(!1)),a)},[t,e,i,l,o]),u}},74201:(e,t,i)=>{i.d(t,{VR:()=>ie,Wf:()=>it,Z4:()=>t7,v$:()=>t6,ss:()=>t9});var a,n,r,s,o,l,d,u,h,c,m,p,v,E,b,g,f,A,k,y,C,w,I,T,_,S,M,L,R,x,D,N,P,U,G,O,W,$,H,B,V,q,Q,F,Y,j,K,Z,z,X,J,ee,et,ei,ea,en,er,es,eo,el,ed,eu,eh,ec,em,ep,ev,eE,eb,eg,ef,eA,ek,ey,eC,ew,eI,eT,e_,eS,eM,eL,eR,ex,eD=i(38275),eN=i(55420),eP=i(83074),eU=i(84411);function eG(e){return e.split("-")[0]}var eO=i(33908);class eW extends Event{constructor({action:e="auto",relatedTarget:t,...i}){super("invoke",i),this.action=e,this.relatedTarget=t}}class e$ extends Event{constructor({newState:e,oldState:t,...i}){super("toggle",i),this.newState=e,this.oldState=t}}var eH=i(3341),eB=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},eV=(e,t,i)=>(eB(e,t,"read from private field"),i?i.call(e):t.get(e)),eq=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},eQ=(e,t,i,a)=>(eB(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),eF=(e,t,i)=>(eB(e,t,"access private method"),i);function eY({type:e,text:t,value:i,checked:a}){let n=eU.Al.createElement("media-chrome-menu-item");n.type=null!=e?e:"",n.part.add("menu-item"),e&&n.part.add(e),n.value=i,n.checked=a;let r=eU.Al.createElement("span");return r.textContent=t,n.append(r),n}function ej(e,t){let i=e.querySelector(`:scope > [slot="${t}"]`);if((null==i?void 0:i.nodeName)=="SLOT"&&(i=i.assignedElements({flatten:!0})[0]),i)return i.cloneNode(!0);let a=e.shadowRoot.querySelector(`[name="${t}"] > svg`);return a?a.cloneNode(!0):""}let eK=eU.Al.createElement("template");eK.innerHTML=`
  <style>
    :host {
      font: var(--media-font,
        var(--media-font-weight, normal)
        var(--media-font-size, 14px) /
        var(--media-text-content-height, var(--media-control-height, 24px))
        var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
      color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
      --_menu-bg: rgb(20 20 30 / .8);
      background: var(--media-menu-background, var(--media-control-background, var(--media-secondary-color, var(--_menu-bg))));
      border-radius: var(--media-menu-border-radius);
      border: var(--media-menu-border, none);
      display: var(--media-menu-display, inline-flex);
      transition: var(--media-menu-transition-in,
        visibility 0s,
        opacity .2s ease-out,
        transform .15s ease-out,
        left .2s ease-in-out,
        min-width .2s ease-in-out,
        min-height .2s ease-in-out
      ) !important;
      
      visibility: var(--media-menu-visibility, visible);
      opacity: var(--media-menu-opacity, 1);
      max-height: var(--media-menu-max-height, var(--_menu-max-height, 300px));
      transform: var(--media-menu-transform-in, translateY(0) scale(1));
      flex-direction: column;
      
      min-height: 0;
      position: relative;
      bottom: var(--_menu-bottom);
      box-sizing: border-box;
    } 

    @-moz-document url-prefix() {
      :host{
        --_menu-bg: rgb(20 20 30);
      }
    }

    :host([hidden]) {
      transition: var(--media-menu-transition-out,
        visibility .15s ease-in,
        opacity .15s ease-in,
        transform .15s ease-in
      ) !important;
      visibility: var(--media-menu-hidden-visibility, hidden);
      opacity: var(--media-menu-hidden-opacity, 0);
      max-height: var(--media-menu-hidden-max-height,
        var(--media-menu-max-height, var(--_menu-max-height, 300px)));
      transform: var(--media-menu-transform-out, translateY(2px) scale(.99));
      pointer-events: none;
    }

    :host([slot="submenu"]) {
      background: none;
      width: 100%;
      min-height: 100%;
      position: absolute;
      bottom: 0;
      right: -100%;
    }

    #container {
      display: flex;
      flex-direction: column;
      min-height: 0;
      transition: transform .2s ease-out;
      transform: translate(0, 0);
    }

    #container.has-expanded {
      transition: transform .2s ease-in;
      transform: translate(-100%, 0);
    }

    button {
      background: none;
      color: inherit;
      border: none;
      padding: 0;
      font: inherit;
      outline: inherit;
      display: inline-flex;
      align-items: center;
    }

    slot[name="header"][hidden] {
      display: none;
    }

    slot[name="header"] > *,
    slot[name="header"]::slotted(*) {
      padding: .4em .7em;
      border-bottom: 1px solid rgb(255 255 255 / .25);
      cursor: var(--media-cursor, default);
    }

    slot[name="header"] > button[part~="back"],
    slot[name="header"]::slotted(button[part~="back"]) {
      cursor: var(--media-cursor, pointer);
    }

    svg[part~="back"] {
      height: var(--media-menu-icon-height, var(--media-control-height, 24px));
      fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
      display: block;
      margin-right: .5ch;
    }

    slot:not([name]) {
      gap: var(--media-menu-gap);
      flex-direction: var(--media-menu-flex-direction, column);
      overflow: var(--media-menu-overflow, hidden auto);
      display: flex;
      min-height: 0;
    }

    :host([role="menu"]) slot:not([name]) {
      padding-block: .4em;
    }

    slot:not([name])::slotted([role="menu"]) {
      background: none;
    }

    media-chrome-menu-item > span {
      margin-right: .5ch;
      max-width: var(--media-menu-item-max-width);
      text-overflow: ellipsis;
      overflow: hidden;
    }
  </style>
  <style id="layout-row" media="width:0">

    slot[name="header"] > *,
    slot[name="header"]::slotted(*) {
      padding: .4em .5em;
    }

    slot:not([name]) {
      gap: var(--media-menu-gap, .25em);
      flex-direction: var(--media-menu-flex-direction, row);
      padding-inline: .5em;
    }

    media-chrome-menu-item {
      padding: .3em .5em;
    }

    media-chrome-menu-item[aria-checked="true"] {
      background: var(--media-menu-item-checked-background, rgb(255 255 255 / .2));
    }

    
    media-chrome-menu-item::part(checked-indicator) {
      display: var(--media-menu-item-checked-indicator-display, none);
    }
  </style>
  <div id="container">
    <slot name="header" hidden>
      <button part="back button" aria-label="Back to previous menu">
        <slot name="back-icon">
          <svg aria-hidden="true" viewBox="0 0 20 24" part="back indicator">
            <path d="m11.88 17.585.742-.669-4.2-4.665 4.2-4.666-.743-.669-4.803 5.335 4.803 5.334Z"/>
          </svg>
        </slot>
        <slot name="title"></slot>
      </button>
    </slot>
    <slot></slot>
  </div>
  <slot name="checked-indicator" hidden></slot>
`;let eZ="style",ez="hidden",eX="disabled";class eJ extends eU.Au.HTMLElement{constructor(){super(),eq(this,u),eq(this,m),eq(this,v),eq(this,b),eq(this,f),eq(this,C),eq(this,I),eq(this,_),eq(this,M),eq(this,R),eq(this,D),eq(this,P),eq(this,G),eq(this,W),eq(this,H),eq(this,V),eq(this,Q),eq(this,a,null),eq(this,n,null),eq(this,r,null),eq(this,s,new Set),eq(this,o,void 0),eq(this,l,!1),eq(this,d,null),eq(this,c,()=>{let e=eV(this,s),t=new Set(this.items);for(let i of e)t.has(i)||this.dispatchEvent(new CustomEvent("removemenuitem",{detail:i}));for(let i of t)e.has(i)||this.dispatchEvent(new CustomEvent("addmenuitem",{detail:i}));eQ(this,s,t)}),eq(this,k,()=>{eF(this,C,w).call(this),eF(this,I,T).call(this,!1)}),eq(this,y,()=>{eF(this,C,w).call(this)}),this.shadowRoot||(this.attachShadow({mode:"open"}),this.nativeEl=this.constructor.template.content.cloneNode(!0),this.shadowRoot.append(this.nativeEl)),this.container=this.shadowRoot.querySelector("#container"),this.defaultSlot=this.shadowRoot.querySelector("slot:not([name])"),this.shadowRoot.addEventListener("slotchange",this),eQ(this,o,new MutationObserver(eV(this,c))),eV(this,o).observe(this.defaultSlot,{childList:!0})}static get observedAttributes(){return[eX,ez,eZ,"anchor",eP.Ex.MEDIA_CONTROLLER]}static formatMenuItemText(e,t){return e}enable(){this.addEventListener("click",this),this.addEventListener("focusout",this),this.addEventListener("keydown",this),this.addEventListener("invoke",this),this.addEventListener("toggle",this)}disable(){this.removeEventListener("click",this),this.removeEventListener("focusout",this),this.removeEventListener("keyup",this),this.removeEventListener("invoke",this),this.removeEventListener("toggle",this)}handleEvent(e){switch(e.type){case"slotchange":eF(this,u,h).call(this,e);break;case"invoke":eF(this,v,E).call(this,e);break;case"click":eF(this,_,S).call(this,e);break;case"toggle":eF(this,R,x).call(this,e);break;case"focusout":eF(this,P,U).call(this,e);break;case"keydown":eF(this,G,O).call(this,e)}}connectedCallback(){var e,t;eQ(this,d,(0,eH.Vw)(this.shadowRoot,":host")),eF(this,m,p).call(this),this.hasAttribute("disabled")||this.enable(),this.role||(this.role="menu"),eQ(this,a,(0,eH.xf)(this)),null==(t=null==(e=eV(this,a))?void 0:e.associateElement)||t.call(e,this),this.hidden||((0,eO.v)(e1(this),eV(this,k)),(0,eO.v)(this,eV(this,y)))}disconnectedCallback(){var e,t;(0,eO.u)(e1(this),eV(this,k)),(0,eO.u)(this,eV(this,y)),this.disable(),null==(t=null==(e=eV(this,a))?void 0:e.unassociateElement)||t.call(e,this),eQ(this,a,null)}attributeChangedCallback(e,t,i){var n,r,s,o;e===ez&&i!==t?(eV(this,l)||eQ(this,l,!0),this.hidden?eF(this,f,A).call(this):eF(this,b,g).call(this),this.dispatchEvent(new e$({oldState:this.hidden?"open":"closed",newState:this.hidden?"closed":"open",bubbles:!0}))):e===eP.Ex.MEDIA_CONTROLLER?(t&&(null==(r=null==(n=eV(this,a))?void 0:n.unassociateElement)||r.call(n,this),eQ(this,a,null)),i&&this.isConnected&&(eQ(this,a,(0,eH.xf)(this)),null==(o=null==(s=eV(this,a))?void 0:s.associateElement)||o.call(s,this))):e===eX&&i!==t?null==i?this.enable():this.disable():e===eZ&&i!==t&&eF(this,m,p).call(this)}formatMenuItemText(e,t){return this.constructor.formatMenuItemText(e,t)}get anchor(){return this.getAttribute("anchor")}set anchor(e){this.setAttribute("anchor",`${e}`)}get anchorElement(){var e;return this.anchor?null==(e=(0,eH.l5)(this))?void 0:e.querySelector(`#${this.anchor}`):null}get items(){return this.defaultSlot.assignedElements({flatten:!0}).filter(e0)}get radioGroupItems(){return this.items.filter(e=>"menuitemradio"===e.role)}get checkedItems(){return this.items.filter(e=>e.checked)}get value(){var e,t;return null!=(t=null==(e=this.checkedItems[0])?void 0:e.value)?t:""}set value(e){let t=this.items.find(t=>t.value===e);t&&eF(this,Q,F).call(this,t)}focus(){if(eQ(this,n,(0,eH.bq)()),this.items.length){eF(this,V,q).call(this,this.items[0]),this.items[0].focus();return}let e=this.querySelector('[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]');null==e||e.focus()}handleSelect(e){var t;let i=eF(this,W,$).call(this,e);i&&(eF(this,Q,F).call(this,i,"checkbox"===i.type),eV(this,r)&&!this.hidden&&(null==(t=eV(this,n))||t.focus(),this.hidden=!0))}get keysUsed(){return["Enter","Escape","Tab"," ","ArrowDown","ArrowUp","Home","End"]}handleMove(e){var t,i;let{key:a}=e,n=this.items,r=null!=(i=null!=(t=eF(this,W,$).call(this,e))?t:eF(this,H,B).call(this))?i:n[0],s=Math.max(0,n.indexOf(r));"ArrowDown"===a?s++:"ArrowUp"===a?s--:"Home"===e.key?s=0:"End"===e.key&&(s=n.length-1),s<0&&(s=n.length-1),s>n.length-1&&(s=0),eF(this,V,q).call(this,n[s]),n[s].focus()}}function e0(e){return["menuitem","menuitemradio","menuitemcheckbox"].includes(null==e?void 0:e.role)}function e1(e){var t;return null!=(t=e.getAttribute("bounds")?(0,eH.CQ)(e,`#${e.getAttribute("bounds")}`):(0,eH.Bk)(e)||e.parentElement)?t:e}a=new WeakMap,n=new WeakMap,r=new WeakMap,s=new WeakMap,o=new WeakMap,l=new WeakMap,d=new WeakMap,u=new WeakSet,h=function(e){let t=e.target;for(let e of t.assignedNodes({flatten:!0}))3===e.nodeType&&""===e.textContent.trim()&&e.remove();["header","title"].includes(t.name)&&(this.shadowRoot.querySelector('slot[name="header"]').hidden=0===t.assignedNodes().length),t.name||eV(this,c).call(this)},c=new WeakMap,m=new WeakSet,p=function(){var e;let t=this.shadowRoot.querySelector("#layout-row"),i=null==(e=getComputedStyle(this).getPropertyValue("--media-menu-layout"))?void 0:e.trim();t.setAttribute("media","row"===i?"":"width:0")},v=new WeakSet,E=function(e){eQ(this,r,e.relatedTarget),(0,eH.qg)(this,e.relatedTarget)||(this.hidden=!this.hidden)},b=new WeakSet,g=function(){var e;null==(e=eV(this,r))||e.setAttribute("aria-expanded","true"),this.addEventListener("transitionend",()=>this.focus(),{once:!0}),(0,eO.v)(e1(this),eV(this,k)),(0,eO.v)(this,eV(this,y))},f=new WeakSet,A=function(){var e;null==(e=eV(this,r))||e.setAttribute("aria-expanded","false"),(0,eO.u)(e1(this),eV(this,k)),(0,eO.u)(this,eV(this,y))},k=new WeakMap,y=new WeakMap,C=new WeakSet,w=function(e){if(this.hasAttribute("mediacontroller")&&!this.anchor||this.hidden||!this.anchorElement)return;let{x:t,y:i}=function({anchor:e,floating:t,placement:i}){let{x:a,y:n}=function({anchor:e,floating:t},i){let a,n="x"==(["top","bottom"].includes(eG(i))?"y":"x")?"y":"x",r="y"===n?"height":"width",s=eG(i),o=e.x+e.width/2-t.width/2,l=e.y+e.height/2-t.height/2,d=e[r]/2-t[r]/2;switch(s){case"top":a={x:o,y:e.y-t.height};break;case"bottom":a={x:o,y:e.y+e.height};break;case"right":a={x:e.x+e.width,y:l};break;case"left":a={x:e.x-t.width,y:l};break;default:a={x:e.x,y:e.y}}switch(i.split("-")[1]){case"start":a[n]-=d;break;case"end":a[n]+=d}return a}(function({anchor:e,floating:t}){var i,a,n;let r,s;return{anchor:(i=e,a=t.offsetParent,r=i.getBoundingClientRect(),s=null!=(n=null==a?void 0:a.getBoundingClientRect())?n:{x:0,y:0},{x:r.x-s.x,y:r.y-s.y,width:r.width,height:r.height}),floating:{x:0,y:0,width:t.offsetWidth,height:t.offsetHeight}}}({anchor:e,floating:t}),i);return{x:a,y:n}}({anchor:this.anchorElement,floating:this,placement:"top-start"});null!=e||(e=this.offsetWidth);let a=e1(this).getBoundingClientRect(),n=a.width-t-e,r=a.height-i-this.offsetHeight,{style:s}=eV(this,d);s.setProperty("position","absolute"),s.setProperty("right",`${Math.max(0,n)}px`),s.setProperty("--_menu-bottom",`${r}px`);let o=getComputedStyle(this),l=s.getPropertyValue("--_menu-bottom")===o.bottom?r:parseFloat(o.bottom),u=a.height-l-parseFloat(o.marginBottom);this.style.setProperty("--_menu-max-height",`${u}px`)},I=new WeakSet,T=function(e){let t=this.querySelector('[role="menuitem"][aria-haspopup][aria-expanded="true"]'),i=null==t?void 0:t.querySelector('[role="menu"]'),{style:a}=eV(this,d);if(e||a.setProperty("--media-menu-transition-in","none"),i){let e=i.offsetHeight,a=Math.max(i.offsetWidth,t.offsetWidth);this.style.setProperty("min-width",`${a}px`),this.style.setProperty("min-height",`${e}px`),eF(this,C,w).call(this,a)}else this.style.removeProperty("min-width"),this.style.removeProperty("min-height"),eF(this,C,w).call(this);a.removeProperty("--media-menu-transition-in")},_=new WeakSet,S=function(e){var t;if(e.stopPropagation(),e.composedPath().includes(eV(this,M,L))){null==(t=eV(this,n))||t.focus(),this.hidden=!0;return}let i=eF(this,W,$).call(this,e);!i||i.hasAttribute("disabled")||(eF(this,V,q).call(this,i),this.handleSelect(e))},M=new WeakSet,L=function(){var e;return null==(e=this.shadowRoot.querySelector('slot[name="header"]').assignedElements({flatten:!0}))?void 0:e.find(e=>e.matches('button[part~="back"]'))},R=new WeakSet,x=function(e){if(e.target===this)return;eF(this,D,N).call(this);let t=Array.from(this.querySelectorAll('[role="menuitem"][aria-haspopup]'));for(let i of t)i.invokeTargetElement!=e.target&&("open"!=e.newState||"true"!=i.getAttribute("aria-expanded")||i.invokeTargetElement.hidden||i.invokeTargetElement.dispatchEvent(new eW({relatedTarget:i})));for(let e of t)e.setAttribute("aria-expanded",`${!e.submenuElement.hidden}`);eF(this,I,T).call(this,!0)},D=new WeakSet,N=function(){let e=this.querySelector('[role="menuitem"] > [role="menu"]:not([hidden])');this.container.classList.toggle("has-expanded",!!e)},P=new WeakSet,U=function(e){var t;(0,eH.qg)(this,e.relatedTarget)||(eV(this,l)&&(null==(t=eV(this,n))||t.focus()),eV(this,r)&&eV(this,r)!==e.relatedTarget&&!this.hidden&&(this.hidden=!0))},G=new WeakSet,O=function(e){var t,i,a,r,s;let{key:o,ctrlKey:d,altKey:u,metaKey:h}=e;if(!d&&!u&&!h&&this.keysUsed.includes(o))if(e.preventDefault(),e.stopPropagation(),"Tab"===o){if(eV(this,l)){this.hidden=!0;return}e.shiftKey?null==(i=null==(t=this.previousElementSibling)?void 0:t.focus)||i.call(t):null==(r=null==(a=this.nextElementSibling)?void 0:a.focus)||r.call(a),this.blur()}else"Escape"===o?(null==(s=eV(this,n))||s.focus(),eV(this,l)&&(this.hidden=!0)):"Enter"===o||" "===o?this.handleSelect(e):this.handleMove(e)},W=new WeakSet,$=function(e){return e.composedPath().find(e=>["menuitemradio","menuitemcheckbox"].includes(e.role))},H=new WeakSet,B=function(){return this.items.find(e=>0===e.tabIndex)},V=new WeakSet,q=function(e){for(let t of this.items)t.tabIndex=t===e?0:-1},Q=new WeakSet,F=function(e,t){let i=[...this.checkedItems];"radio"===e.type&&this.radioGroupItems.forEach(e=>e.checked=!1),t?e.checked=!e.checked:e.checked=!0,this.checkedItems.some((e,t)=>e!=i[t])&&this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))},eJ.template=eK,eU.Au.customElements.get("media-chrome-menu")||eU.Au.customElements.define("media-chrome-menu",eJ);var e2=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},e3=(e,t,i)=>(e2(e,t,"read from private field"),i?i.call(e):t.get(e)),e4=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},e5=(e,t,i,a)=>(e2(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),e8=(e,t,i)=>(e2(e,t,"access private method"),i);let e7=eU.Al.createElement("template");e7.innerHTML=`
  <style>
    :host {
      transition: var(--media-menu-item-transition,
        background .15s linear,
        opacity .2s ease-in-out
      );
      outline: var(--media-menu-item-outline, 0);
      outline-offset: var(--media-menu-item-outline-offset, -1px);
      cursor: var(--media-cursor, pointer);
      display: flex;
      align-items: center;
      align-self: stretch;
      justify-self: stretch;
      white-space: nowrap;
      white-space-collapse: collapse;
      text-wrap: nowrap;
      padding: .4em .8em .4em 1em;
    }

    :host(:focus-visible) {
      box-shadow: var(--media-menu-item-focus-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
      outline: var(--media-menu-item-hover-outline, 0);
      outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
    }

    :host(:hover) {
      cursor: var(--media-cursor, pointer);
      background: var(--media-menu-item-hover-background, rgb(92 92 102 / .5));
      outline: var(--media-menu-item-hover-outline);
      outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
    }

    :host([aria-checked="true"]) {
      background: var(--media-menu-item-checked-background);
    }

    :host([hidden]) {
      display: none;
    }

    :host([disabled]) {
      pointer-events: none;
      color: rgba(255, 255, 255, .3);
    }

    slot:not([name]) {
      width: 100%;
    }

    slot:not([name="submenu"]) {
      display: inline-flex;
      align-items: center;
      transition: inherit;
      opacity: var(--media-menu-item-opacity, 1);
    }

    slot[name="description"] {
      justify-content: end;
    }

    slot[name="description"] > span {
      display: inline-block;
      margin-inline: 1em .2em;
      max-width: var(--media-menu-item-description-max-width, 100px);
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: .8em;
      font-weight: 400;
      text-align: right;
      position: relative;
      top: .04em;
    }

    slot[name="checked-indicator"] {
      display: none;
    }

    :host(:is([role="menuitemradio"],[role="menuitemcheckbox"])) slot[name="checked-indicator"] {
      display: var(--media-menu-item-checked-indicator-display, inline-block);
    }

    
    svg, img, ::slotted(svg), ::slotted(img) {
      height: var(--media-menu-item-icon-height, var(--media-control-height, 24px));
      fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
      display: block;
    }

    
    [part~="indicator"],
    ::slotted([part~="indicator"]) {
      fill: var(--media-menu-item-indicator-fill,
        var(--media-icon-color, var(--media-primary-color, rgb(238 238 238))));
      height: var(--media-menu-item-indicator-height, 1.25em);
      margin-right: .5ch;
    }

    [part~="checked-indicator"] {
      visibility: hidden;
    }

    :host([aria-checked="true"]) [part~="checked-indicator"] {
      visibility: visible;
    }
  </style>
  <slot name="checked-indicator">
    <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
      <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
    </svg>
  </slot>
  <slot name="prefix"></slot>
  <slot></slot>
  <slot name="description"></slot>
  <slot name="suffix"></slot>
  <slot name="submenu"></slot>
`;let e9="type",e6="value",te="checked",tt="disabled";class ti extends eU.Au.HTMLElement{constructor(){super(),e4(this,K),e4(this,z),e4(this,J),e4(this,ei),e4(this,en),e4(this,es),e4(this,Y,!1),e4(this,j,void 0),e4(this,et,()=>{var e,t;this.setAttribute("submenusize",`${this.submenuElement.items.length}`);let i=this.shadowRoot.querySelector('slot[name="description"]'),a=null==(e=this.submenuElement.checkedItems)?void 0:e[0],n=null!=(t=null==a?void 0:a.dataset.description)?t:null==a?void 0:a.text,r=eU.Al.createElement("span");r.textContent=null!=n?n:"",i.replaceChildren(r)}),this.shadowRoot||(this.attachShadow({mode:"open"}),this.shadowRoot.append(this.constructor.template.content.cloneNode(!0))),this.shadowRoot.addEventListener("slotchange",this)}static get observedAttributes(){return[e9,tt,te,e6]}enable(){this.hasAttribute("tabindex")||this.setAttribute("tabindex","-1"),ta(this)&&!this.hasAttribute("aria-checked")&&this.setAttribute("aria-checked","false"),this.addEventListener("click",this),this.addEventListener("keydown",this)}disable(){this.removeAttribute("tabindex"),this.removeEventListener("click",this),this.removeEventListener("keydown",this),this.removeEventListener("keyup",this)}handleEvent(e){switch(e.type){case"slotchange":e8(this,K,Z).call(this,e);break;case"click":this.handleClick(e);break;case"keydown":e8(this,en,er).call(this,e);break;case"keyup":e8(this,ei,ea).call(this,e)}}attributeChangedCallback(e,t,i){e===te&&ta(this)&&!e3(this,Y)?this.setAttribute("aria-checked",null!=i?"true":"false"):e===e9&&i!==t?this.role="menuitem"+i:e===tt&&i!==t&&(null==i?this.enable():this.disable())}connectedCallback(){this.hasAttribute(tt)||this.enable(),this.role="menuitem"+this.type,e5(this,j,function e(t,i){if(!t)return null;let{host:a}=t.getRootNode();return!i&&a?e(t,a):(null==i?void 0:i.items)?i:e(i,null==i?void 0:i.parentNode)}(this,this.parentNode)),e8(this,es,eo).call(this)}disconnectedCallback(){this.disable(),e8(this,es,eo).call(this),e5(this,j,null)}get invokeTarget(){return this.getAttribute("invoketarget")}set invokeTarget(e){this.setAttribute("invoketarget",`${e}`)}get invokeTargetElement(){var e;return this.invokeTarget?null==(e=(0,eH.l5)(this))?void 0:e.querySelector(`#${this.invokeTarget}`):this.submenuElement}get submenuElement(){return this.shadowRoot.querySelector('slot[name="submenu"]').assignedElements({flatten:!0})[0]}get type(){var e;return null!=(e=this.getAttribute(e9))?e:""}set type(e){this.setAttribute(e9,`${e}`)}get value(){var e;return null!=(e=this.getAttribute(e6))?e:this.text}set value(e){this.setAttribute(e6,e)}get text(){var e;return(null!=(e=this.textContent)?e:"").trim()}get checked(){if(ta(this))return"true"===this.getAttribute("aria-checked")}set checked(e){ta(this)&&(e5(this,Y,!0),this.setAttribute("aria-checked",e?"true":"false"),e?this.part.add("checked"):this.part.remove("checked"))}handleClick(e){!ta(this)&&this.invokeTargetElement&&(0,eH.qg)(this,e.target)&&this.invokeTargetElement.dispatchEvent(new eW({relatedTarget:this}))}get keysUsed(){return["Enter"," "]}}function ta(e){return"radio"===e.type||"checkbox"===e.type}Y=new WeakMap,j=new WeakMap,K=new WeakSet,Z=function(e){let t=e.target;if(!(null==t?void 0:t.name))for(let e of t.assignedNodes({flatten:!0}))e instanceof Text&&""===e.textContent.trim()&&e.remove();"submenu"===t.name&&(this.submenuElement?e8(this,z,X).call(this):e8(this,J,ee).call(this))},z=new WeakSet,X=async function(){this.setAttribute("aria-haspopup","menu"),this.setAttribute("aria-expanded",`${!this.submenuElement.hidden}`),this.submenuElement.addEventListener("change",e3(this,et)),this.submenuElement.addEventListener("addmenuitem",e3(this,et)),this.submenuElement.addEventListener("removemenuitem",e3(this,et)),e3(this,et).call(this)},J=new WeakSet,ee=function(){this.removeAttribute("aria-haspopup"),this.removeAttribute("aria-expanded"),this.submenuElement.removeEventListener("change",e3(this,et)),this.submenuElement.removeEventListener("addmenuitem",e3(this,et)),this.submenuElement.removeEventListener("removemenuitem",e3(this,et)),e3(this,et).call(this)},et=new WeakMap,ei=new WeakSet,ea=function(e){let{key:t}=e;this.keysUsed.includes(t)?this.handleClick(e):this.removeEventListener("keyup",e8(this,ei,ea))},en=new WeakSet,er=function(e){let{metaKey:t,altKey:i,key:a}=e;t||i||!this.keysUsed.includes(a)?this.removeEventListener("keyup",e8(this,ei,ea)):this.addEventListener("keyup",e8(this,ei,ea),{once:!0})},es=new WeakSet,eo=function(){var e;let t=null==(e=e3(this,j))?void 0:e.radioGroupItems;if(!t)return;let i=t.filter(e=>"true"===e.getAttribute("aria-checked")).pop();for(let e of(i||(i=t[0]),t))e.setAttribute("aria-checked","false");null==i||i.setAttribute("aria-checked","true")},ti.template=e7,eU.Au.customElements.get("media-chrome-menu-item")||eU.Au.customElements.define("media-chrome-menu-item",ti);let tn=eU.Al.createElement("template");tn.innerHTML=eJ.template.innerHTML+`
  <style>
    :host {
      --_menu-bg: rgb(20 20 30 / .8);
      background: var(--media-settings-menu-background,
          var(--media-menu-background,
            var(--media-control-background,
              var(--media-secondary-color, var(--_menu-bg)))));
      min-width: var(--media-settings-menu-min-width, 170px);
      border-radius: 2px 2px 0 0;
      overflow: hidden;
    }

    @-moz-document url-prefix() {
      :host{
        --_menu-bg: rgb(20 20 30);
      }
    }

    :host([role="menu"]) {
      
      justify-content: end;
    }

    slot:not([name]) {
      justify-content: var(--media-settings-menu-justify-content);
      flex-direction: var(--media-settings-menu-flex-direction, column);
      overflow: visible;
    }

    #container.has-expanded {
      --media-settings-menu-item-opacity: 0;
    }
  </style>
`;class tr extends eJ{get anchorElement(){return"auto"!==this.anchor?super.anchorElement:(0,eH.Bk)(this).querySelector("media-settings-menu-button")}}tr.template=tn,eU.Au.customElements.get("media-settings-menu")||eU.Au.customElements.define("media-settings-menu",tr);let ts=eU.Al.createElement("template");ts.innerHTML=ti.template.innerHTML+`
  <style>
    slot:not([name="submenu"]) {
      opacity: var(--media-settings-menu-item-opacity, var(--media-menu-item-opacity));
    }

    :host([aria-expanded="true"]:hover) {
      background: transparent;
    }
  </style>
`,(null==(el=ts.content)?void 0:el.querySelector)&&(ts.content.querySelector('slot[name="suffix"]').innerHTML=`
    <svg aria-hidden="true" viewBox="0 0 20 24">
      <path d="m8.12 17.585-.742-.669 4.2-4.665-4.2-4.666.743-.669 4.803 5.335-4.803 5.334Z"/>
    </svg>
  `);class to extends ti{}to.template=ts,eU.Au.customElements.get("media-settings-menu-item")||eU.Au.customElements.define("media-settings-menu-item",to);var tl=i(15923);class td extends tl.T{connectedCallback(){super.connectedCallback(),this.invokeTargetElement&&this.setAttribute("aria-haspopup","menu")}get invokeTarget(){return this.getAttribute("invoketarget")}set invokeTarget(e){this.setAttribute("invoketarget",`${e}`)}get invokeTargetElement(){var e;return this.invokeTarget?null==(e=(0,eH.l5)(this))?void 0:e.querySelector(`#${this.invokeTarget}`):null}handleClick(){var e;null==(e=this.invokeTargetElement)||e.dispatchEvent(new eW({relatedTarget:this}))}}eU.Au.customElements.get("media-chrome-menu-button")||eU.Au.customElements.define("media-chrome-menu-button",td);var tu=i(42716);let th=eU.Al.createElement("template");th.innerHTML=`
  <style>
    :host([aria-expanded="true"]) slot[name=tooltip] {
      display: none;
    }
  </style>
  <slot name="icon">
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4.5 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
    </svg>
  </slot>
`;class tc extends td{static get observedAttributes(){return[...super.observedAttributes,"target"]}constructor(){super({slotTemplate:th,tooltipContent:(0,tu.t)("Settings")})}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",(0,tu.t)("settings"))}get invokeTargetElement(){return void 0!=this.invokeTarget?super.invokeTargetElement:(0,eH.Bk)(this).querySelector("media-settings-menu")}}eU.Au.customElements.get("media-settings-menu-button")||eU.Au.customElements.define("media-settings-menu-button",tc);var tm=i(42324),tp=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},tv=(e,t,i)=>(tp(e,t,"read from private field"),i?i.call(e):t.get(e)),tE=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},tb=(e,t,i,a)=>(tp(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),tg=(e,t,i)=>(tp(e,t,"access private method"),i);class tf extends eJ{constructor(){super(...arguments),tE(this,eh),tE(this,em),tE(this,ed,[]),tE(this,eu,void 0)}static get observedAttributes(){return[...super.observedAttributes,eP.GC.MEDIA_AUDIO_TRACK_LIST,eP.GC.MEDIA_AUDIO_TRACK_ENABLED,eP.GC.MEDIA_AUDIO_TRACK_UNAVAILABLE]}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===eP.GC.MEDIA_AUDIO_TRACK_ENABLED&&t!==i?this.value=i:e===eP.GC.MEDIA_AUDIO_TRACK_LIST&&t!==i&&(tb(this,ed,(0,tm.j3)(null!=i?i:"")),tg(this,eh,ec).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",tg(this,em,ep))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",tg(this,em,ep))}get anchorElement(){var e;return"auto"!==this.anchor?super.anchorElement:null==(e=(0,eH.Bk)(this))?void 0:e.querySelector("media-audio-track-menu-button")}get mediaAudioTrackList(){return tv(this,ed)}set mediaAudioTrackList(e){tb(this,ed,e),tg(this,eh,ec).call(this)}get mediaAudioTrackEnabled(){var e;return null!=(e=(0,eH.vT)(this,eP.GC.MEDIA_AUDIO_TRACK_ENABLED))?e:""}set mediaAudioTrackEnabled(e){(0,eH.tA)(this,eP.GC.MEDIA_AUDIO_TRACK_ENABLED,e)}}ed=new WeakMap,eu=new WeakMap,eh=new WeakSet,ec=function(){if(tv(this,eu)===JSON.stringify(this.mediaAudioTrackList))return;tb(this,eu,JSON.stringify(this.mediaAudioTrackList));let e=this.mediaAudioTrackList;for(let t of(this.defaultSlot.textContent="",e)){let e=eY({type:"radio",text:this.formatMenuItemText(t.label,t),value:`${t.id}`,checked:t.enabled});e.prepend(ej(this,"checked-indicator")),this.defaultSlot.append(e)}},em=new WeakSet,ep=function(){if(null==this.value)return;let e=new eU.Au.CustomEvent(eP.a8.MEDIA_AUDIO_TRACK_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)},eU.Au.customElements.get("media-audio-track-menu")||eU.Au.customElements.define("media-audio-track-menu",tf);let tA=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M11 17H9.5V7H11v10Zm-3-3H6.5v-4H8v4Zm6-5h-1.5v6H14V9Zm3 7h-1.5V8H17v8Z"/>
  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-2 0a8 8 0 1 0-16 0 8 8 0 0 0 16 0Z"/>
</svg>`,tk=eU.Al.createElement("template");tk.innerHTML=`
  <style>
    :host([aria-expanded="true"]) slot[name=tooltip] {
      display: none;
    }
  </style>
  <slot name="icon">${tA}</slot>
`;class ty extends td{static get observedAttributes(){return[...super.observedAttributes,eP.GC.MEDIA_AUDIO_TRACK_ENABLED,eP.GC.MEDIA_AUDIO_TRACK_UNAVAILABLE]}constructor(){super({slotTemplate:tk,tooltipContent:(0,tu.t)("Audio")})}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",(0,tu.t)("Audio"))}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i)}get invokeTargetElement(){var e;return void 0!=this.invokeTarget?super.invokeTargetElement:null==(e=(0,eH.Bk)(this))?void 0:e.querySelector("media-audio-track-menu")}get mediaAudioTrackEnabled(){var e;return null!=(e=(0,eH.vT)(this,eP.GC.MEDIA_AUDIO_TRACK_ENABLED))?e:""}set mediaAudioTrackEnabled(e){(0,eH.tA)(this,eP.GC.MEDIA_AUDIO_TRACK_ENABLED,e)}}eU.Au.customElements.get("media-audio-track-menu-button")||eU.Au.customElements.define("media-audio-track-menu-button",ty);var tC=i(22440),tw=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},tI=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},tT=(e,t,i)=>(tw(e,t,"access private method"),i);let t_=`
  <svg aria-hidden="true" viewBox="0 0 26 24" part="captions-indicator indicator">
    <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
  </svg>`,tS=eU.Al.createElement("template");tS.innerHTML=eJ.template.innerHTML+`
  <slot name="captions-indicator" hidden>${t_}</slot>`;class tM extends eJ{constructor(){super(...arguments),tI(this,eE),tI(this,eg),tI(this,ev,void 0)}static get observedAttributes(){return[...super.observedAttributes,eP.GC.MEDIA_SUBTITLES_LIST,eP.GC.MEDIA_SUBTITLES_SHOWING]}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===eP.GC.MEDIA_SUBTITLES_LIST&&t!==i?tT(this,eE,eb).call(this):e===eP.GC.MEDIA_SUBTITLES_SHOWING&&t!==i&&(this.value=i)}connectedCallback(){super.connectedCallback(),this.addEventListener("change",tT(this,eg,ef))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",tT(this,eg,ef))}get anchorElement(){return"auto"!==this.anchor?super.anchorElement:(0,eH.Bk)(this).querySelector("media-captions-menu-button")}get mediaSubtitlesList(){return tL(this,eP.GC.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(e){tR(this,eP.GC.MEDIA_SUBTITLES_LIST,e)}get mediaSubtitlesShowing(){return tL(this,eP.GC.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(e){tR(this,eP.GC.MEDIA_SUBTITLES_SHOWING,e)}}ev=new WeakMap,eE=new WeakSet,eb=function(){var e,t,i,a,n,r;if(tw(this,t=ev,"read from private field"),(i?i.call(this):t.get(this))===JSON.stringify(this.mediaSubtitlesList))return;a=ev,n=JSON.stringify(this.mediaSubtitlesList),tw(this,a,"write to private field"),r?r.call(this,n):a.set(this,n),this.defaultSlot.textContent="";let s=!this.value,o=eY({type:"radio",text:this.formatMenuItemText("Off"),value:"off",checked:s});for(let t of(o.prepend(ej(this,"checked-indicator")),this.defaultSlot.append(o),this.mediaSubtitlesList)){let i=eY({type:"radio",text:this.formatMenuItemText(t.label,t),value:(0,tC.PH)(t),checked:this.value==(0,tC.PH)(t)});i.prepend(ej(this,"checked-indicator")),"captions"===(null!=(e=t.kind)?e:"subs")&&i.append(ej(this,"captions-indicator")),this.defaultSlot.append(i)}},eg=new WeakSet,ef=function(){let e=this.mediaSubtitlesShowing,t=this.getAttribute(eP.GC.MEDIA_SUBTITLES_SHOWING),i=this.value!==t;if((null==e?void 0:e.length)&&i&&this.dispatchEvent(new eU.Au.CustomEvent(eP.a8.MEDIA_DISABLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0,detail:e})),!this.value||!i)return;let a=new eU.Au.CustomEvent(eP.a8.MEDIA_SHOW_SUBTITLES_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(a)},tM.template=tS;let tL=(e,t)=>{let i=e.getAttribute(t);return i?(0,tC.W5)(i):[]},tR=(e,t,i)=>{if(!(null==i?void 0:i.length))return void e.removeAttribute(t);let a=(0,tC.mc)(i);e.getAttribute(t)!==a&&e.setAttribute(t,a)};eU.Au.customElements.get("media-captions-menu")||eU.Au.customElements.define("media-captions-menu",tM);let tx=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`,tD=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`,tN=eU.Al.createElement("template");tN.innerHTML=`
  <style>
    :host([aria-checked="true"]) slot[name=off] {
      display: none !important;
    }

    
    :host(:not([aria-checked="true"])) slot[name=on] {
      display: none !important;
    }

    :host([aria-expanded="true"]) slot[name=tooltip] {
      display: none;
    }
  </style>

  <slot name="icon">
    <slot name="on">${tx}</slot>
    <slot name="off">${tD}</slot>
  </slot>
`;let tP=e=>{e.setAttribute("aria-checked",(0,tC.VV)(e).toString())};class tU extends td{constructor(e={}){super({slotTemplate:tN,tooltipContent:(0,tu.t)("Captions"),...e}),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,eA,void 0),((e,t,i,a)=>{if(!t.has(e))throw TypeError("Cannot write to private field");return a?a.call(e,i):t.set(e,i)})(this,eA,!1)}static get observedAttributes(){return[...super.observedAttributes,eP.GC.MEDIA_SUBTITLES_LIST,eP.GC.MEDIA_SUBTITLES_SHOWING]}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",(0,tu.t)("closed captions")),tP(this)}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===eP.GC.MEDIA_SUBTITLES_SHOWING&&tP(this)}get invokeTargetElement(){var e;return void 0!=this.invokeTarget?super.invokeTargetElement:null==(e=(0,eH.Bk)(this))?void 0:e.querySelector("media-captions-menu")}get mediaSubtitlesList(){return tG(this,eP.GC.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(e){tO(this,eP.GC.MEDIA_SUBTITLES_LIST,e)}get mediaSubtitlesShowing(){return tG(this,eP.GC.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(e){tO(this,eP.GC.MEDIA_SUBTITLES_SHOWING,e)}}eA=new WeakMap;let tG=(e,t)=>{let i=e.getAttribute(t);return i?(0,tC.W5)(i):[]},tO=(e,t,i)=>{if(!(null==i?void 0:i.length))return void e.removeAttribute(t);let a=(0,tC.mc)(i);e.getAttribute(t)!==a&&e.setAttribute(t,a)};eU.Au.customElements.get("media-captions-menu-button")||eU.Au.customElements.define("media-captions-menu-button",tU);var tW=i(43988),t$=i(38591),tH=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},tB=(e,t,i)=>(tH(e,t,"read from private field"),i?i.call(e):t.get(e)),tV=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},tq=(e,t,i)=>(tH(e,t,"access private method"),i);let tQ="rates";class tF extends eJ{constructor(){super(),tV(this,ey),tV(this,ew),tV(this,ek,new tW.M(this,tQ,{defaultValue:t$.ap})),tq(this,ey,eC).call(this)}static get observedAttributes(){return[...super.observedAttributes,eP.GC.MEDIA_PLAYBACK_RATE,tQ]}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===eP.GC.MEDIA_PLAYBACK_RATE&&t!=i?this.value=i:e===tQ&&t!=i&&(tB(this,ek).value=i,tq(this,ey,eC).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",tq(this,ew,eI))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",tq(this,ew,eI))}get anchorElement(){return"auto"!==this.anchor?super.anchorElement:(0,eH.Bk)(this).querySelector("media-playback-rate-menu-button")}get rates(){return tB(this,ek)}set rates(e){e?Array.isArray(e)&&(tB(this,ek).value=e.join(" ")):tB(this,ek).value="",tq(this,ey,eC).call(this)}get mediaPlaybackRate(){return(0,eH.dm)(this,eP.GC.MEDIA_PLAYBACK_RATE,t$.L5)}set mediaPlaybackRate(e){(0,eH.pK)(this,eP.GC.MEDIA_PLAYBACK_RATE,e)}}ek=new WeakMap,ey=new WeakSet,eC=function(){for(let e of(this.defaultSlot.textContent="",this.rates)){let t=eY({type:"radio",text:this.formatMenuItemText(`${e}x`,e),value:e,checked:this.mediaPlaybackRate==e});t.prepend(ej(this,"checked-indicator")),this.defaultSlot.append(t)}},ew=new WeakSet,eI=function(){if(!this.value)return;let e=new eU.Au.CustomEvent(eP.a8.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)},eU.Au.customElements.get("media-playback-rate-menu")||eU.Au.customElements.define("media-playback-rate-menu",tF);var tY=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot read from private field");return i?i.call(e):t.get(e)};let tj="rates",tK=[1,1.2,1.5,1.7,2],tZ=eU.Al.createElement("template");tZ.innerHTML=`
  <style>
    :host {
      min-width: 5ch;
      padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
    }
    
    :host([aria-expanded="true"]) slot[name=tooltip] {
      display: none;
    }
  </style>
  <slot name="icon"></slot>
`;class tz extends td{constructor(e={}){super({slotTemplate:tZ,tooltipContent:(0,tu.t)("Playback rate"),...e}),((e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)})(this,eT,new tW.M(this,tj,{defaultValue:tK})),this.container=this.shadowRoot.querySelector('slot[name="icon"]'),this.container.innerHTML="1x"}static get observedAttributes(){return[...super.observedAttributes,eP.GC.MEDIA_PLAYBACK_RATE,tj]}attributeChangedCallback(e,t,i){if(super.attributeChangedCallback(e,t,i),e===tj&&(tY(this,eT).value=i),e===eP.GC.MEDIA_PLAYBACK_RATE){let e=i?+i:NaN,t=Number.isNaN(e)?1:e;this.container.innerHTML=`${t}x`,this.setAttribute("aria-label",(0,tu.t)("Playback rate {playbackRate}",{playbackRate:t}))}}get invokeTargetElement(){return void 0!=this.invokeTarget?super.invokeTargetElement:(0,eH.Bk)(this).querySelector("media-playback-rate-menu")}get rates(){return tY(this,eT)}set rates(e){e?Array.isArray(e)&&(tY(this,eT).value=e.join(" ")):tY(this,eT).value=""}get mediaPlaybackRate(){return(0,eH.dm)(this,eP.GC.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(e){(0,eH.pK)(this,eP.GC.MEDIA_PLAYBACK_RATE,e)}}eT=new WeakMap,eU.Au.customElements.get("media-playback-rate-menu-button")||eU.Au.customElements.define("media-playback-rate-menu-button",tz);var tX=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},tJ=(e,t,i)=>(tX(e,t,"read from private field"),i?i.call(e):t.get(e)),t0=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},t1=(e,t,i,a)=>(tX(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),t2=(e,t,i)=>(tX(e,t,"access private method"),i);class t3 extends eJ{constructor(){super(...arguments),t0(this,eM),t0(this,eR),t0(this,e_,[]),t0(this,eS,{})}static get observedAttributes(){return[...super.observedAttributes,eP.GC.MEDIA_RENDITION_LIST,eP.GC.MEDIA_RENDITION_SELECTED,eP.GC.MEDIA_RENDITION_UNAVAILABLE,eP.GC.MEDIA_HEIGHT]}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),e===eP.GC.MEDIA_RENDITION_SELECTED&&t!==i?(this.value=null!=i?i:"auto",t2(this,eM,eL).call(this)):e===eP.GC.MEDIA_RENDITION_LIST&&t!==i?(t1(this,e_,(0,tm.MT)(i)),t2(this,eM,eL).call(this)):e===eP.GC.MEDIA_HEIGHT&&t!==i&&t2(this,eM,eL).call(this)}connectedCallback(){super.connectedCallback(),this.addEventListener("change",t2(this,eR,ex))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",t2(this,eR,ex))}get anchorElement(){return"auto"!==this.anchor?super.anchorElement:(0,eH.Bk)(this).querySelector("media-rendition-menu-button")}get mediaRenditionList(){return tJ(this,e_)}set mediaRenditionList(e){t1(this,e_,e),t2(this,eM,eL).call(this)}get mediaRenditionSelected(){return(0,eH.vT)(this,eP.GC.MEDIA_RENDITION_SELECTED)}set mediaRenditionSelected(e){(0,eH.tA)(this,eP.GC.MEDIA_RENDITION_SELECTED,e)}get mediaHeight(){return(0,eH.dm)(this,eP.GC.MEDIA_HEIGHT)}set mediaHeight(e){(0,eH.pK)(this,eP.GC.MEDIA_HEIGHT,e)}}e_=new WeakMap,eS=new WeakMap,eM=new WeakSet,eL=function(){if(tJ(this,eS).mediaRenditionList===JSON.stringify(this.mediaRenditionList)&&tJ(this,eS).mediaHeight===this.mediaHeight)return;tJ(this,eS).mediaRenditionList=JSON.stringify(this.mediaRenditionList),tJ(this,eS).mediaHeight=this.mediaHeight;let e=this.mediaRenditionList.sort((e,t)=>t.height-e.height);for(let t of e)t.selected=t.id===this.mediaRenditionSelected;this.defaultSlot.textContent="";let t=!this.mediaRenditionSelected;for(let i of e){let e=eY({type:"radio",text:this.formatMenuItemText(`${Math.min(i.width,i.height)}p`,i),value:`${i.id}`,checked:i.selected&&!t});e.prepend(ej(this,"checked-indicator")),this.defaultSlot.append(e)}let i=eY({type:"radio",text:t?this.formatMenuItemText(`Auto (${this.mediaHeight}p)`):this.formatMenuItemText("Auto"),value:"auto",checked:t}),a=this.mediaHeight>0?`Auto (${this.mediaHeight}p)`:"Auto";i.dataset.description=a,i.prepend(ej(this,"checked-indicator")),this.defaultSlot.append(i)},eR=new WeakSet,ex=function(){if(null==this.value)return;let e=new eU.Au.CustomEvent(eP.a8.MEDIA_RENDITION_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)},eU.Au.customElements.get("media-rendition-menu")||eU.Au.customElements.define("media-rendition-menu",t3);let t4=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M13.5 2.5h2v6h-2v-2h-11v-2h11v-2Zm4 2h4v2h-4v-2Zm-12 4h2v6h-2v-2h-3v-2h3v-2Zm4 2h12v2h-12v-2Zm1 4h2v6h-2v-2h-8v-2h8v-2Zm4 2h7v2h-7v-2Z" />
</svg>`,t5=eU.Al.createElement("template");t5.innerHTML=`
  <style>
    :host([aria-expanded="true"]) slot[name=tooltip] {
      display: none;
    }
  </style>
  <slot name="icon">${t4}</slot>
`;class t8 extends td{static get observedAttributes(){return[...super.observedAttributes,eP.GC.MEDIA_RENDITION_SELECTED,eP.GC.MEDIA_RENDITION_UNAVAILABLE,eP.GC.MEDIA_HEIGHT]}constructor(){super({slotTemplate:t5,tooltipContent:(0,tu.t)("Quality")})}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",(0,tu.t)("quality"))}get invokeTargetElement(){return void 0!=this.invokeTarget?super.invokeTargetElement:(0,eH.Bk)(this).querySelector("media-rendition-menu")}get mediaRenditionSelected(){return(0,eH.vT)(this,eP.GC.MEDIA_RENDITION_SELECTED)}set mediaRenditionSelected(e){(0,eH.tA)(this,eP.GC.MEDIA_RENDITION_SELECTED,e)}get mediaHeight(){return(0,eH.dm)(this,eP.GC.MEDIA_HEIGHT)}set mediaHeight(e){(0,eH.pK)(this,eP.GC.MEDIA_HEIGHT,e)}}eU.Au.customElements.get("media-rendition-menu-button")||eU.Au.customElements.define("media-rendition-menu-button",t8),(0,eN.a0)({tagName:"media-chrome-menu",elementClass:eJ,react:eD}),(0,eN.a0)({tagName:"media-chrome-menu-item",elementClass:ti,react:eD});let t7=(0,eN.a0)({tagName:"media-settings-menu",elementClass:tr,react:eD}),t9=(0,eN.a0)({tagName:"media-settings-menu-item",elementClass:to,react:eD});(0,eN.a0)({tagName:"media-chrome-menu-button",elementClass:td,react:eD});let t6=(0,eN.a0)({tagName:"media-settings-menu-button",elementClass:tc,react:eD});(0,eN.a0)({tagName:"media-audio-track-menu",elementClass:tf,react:eD}),(0,eN.a0)({tagName:"media-audio-track-menu-button",elementClass:ty,react:eD}),(0,eN.a0)({tagName:"media-captions-menu",elementClass:tM,react:eD}),(0,eN.a0)({tagName:"media-captions-menu-button",elementClass:tU,react:eD});let ie=(0,eN.a0)({tagName:"media-playback-rate-menu",elementClass:tF,react:eD});(0,eN.a0)({tagName:"media-playback-rate-menu-button",elementClass:tz,react:eD});let it=(0,eN.a0)({tagName:"media-rendition-menu",elementClass:t3,react:eD});(0,eN.a0)({tagName:"media-rendition-menu-button",elementClass:t8,react:eD})},83074:(e,t,i)=>{i.d(t,{CY:()=>m,Ex:()=>n,GC:()=>o,LJ:()=>r,Np:()=>c,T$:()=>l,U4:()=>p,Up:()=>u,a8:()=>a,br:()=>v,lr:()=>h,nJ:()=>d});let a={MEDIA_PLAY_REQUEST:"mediaplayrequest",MEDIA_PAUSE_REQUEST:"mediapauserequest",MEDIA_MUTE_REQUEST:"mediamuterequest",MEDIA_UNMUTE_REQUEST:"mediaunmuterequest",MEDIA_VOLUME_REQUEST:"mediavolumerequest",MEDIA_SEEK_REQUEST:"mediaseekrequest",MEDIA_AIRPLAY_REQUEST:"mediaairplayrequest",MEDIA_ENTER_FULLSCREEN_REQUEST:"mediaenterfullscreenrequest",MEDIA_EXIT_FULLSCREEN_REQUEST:"mediaexitfullscreenrequest",MEDIA_PREVIEW_REQUEST:"mediapreviewrequest",MEDIA_ENTER_PIP_REQUEST:"mediaenterpiprequest",MEDIA_EXIT_PIP_REQUEST:"mediaexitpiprequest",MEDIA_ENTER_CAST_REQUEST:"mediaentercastrequest",MEDIA_EXIT_CAST_REQUEST:"mediaexitcastrequest",MEDIA_SHOW_TEXT_TRACKS_REQUEST:"mediashowtexttracksrequest",MEDIA_HIDE_TEXT_TRACKS_REQUEST:"mediahidetexttracksrequest",MEDIA_SHOW_SUBTITLES_REQUEST:"mediashowsubtitlesrequest",MEDIA_DISABLE_SUBTITLES_REQUEST:"mediadisablesubtitlesrequest",MEDIA_TOGGLE_SUBTITLES_REQUEST:"mediatogglesubtitlesrequest",MEDIA_PLAYBACK_RATE_REQUEST:"mediaplaybackraterequest",MEDIA_RENDITION_REQUEST:"mediarenditionrequest",MEDIA_AUDIO_TRACK_REQUEST:"mediaaudiotrackrequest",MEDIA_SEEK_TO_LIVE_REQUEST:"mediaseektoliverequest",REGISTER_MEDIA_STATE_RECEIVER:"registermediastatereceiver",UNREGISTER_MEDIA_STATE_RECEIVER:"unregistermediastatereceiver"},n={MEDIA_CHROME_ATTRIBUTES:"mediachromeattributes",MEDIA_CONTROLLER:"mediacontroller"},r={MEDIA_AIRPLAY_UNAVAILABLE:"mediaAirplayUnavailable",MEDIA_AUDIO_TRACK_ENABLED:"mediaAudioTrackEnabled",MEDIA_AUDIO_TRACK_LIST:"mediaAudioTrackList",MEDIA_AUDIO_TRACK_UNAVAILABLE:"mediaAudioTrackUnavailable",MEDIA_BUFFERED:"mediaBuffered",MEDIA_CAST_UNAVAILABLE:"mediaCastUnavailable",MEDIA_CHAPTERS_CUES:"mediaChaptersCues",MEDIA_CURRENT_TIME:"mediaCurrentTime",MEDIA_DURATION:"mediaDuration",MEDIA_ENDED:"mediaEnded",MEDIA_ERROR:"mediaError",MEDIA_ERROR_CODE:"mediaErrorCode",MEDIA_ERROR_MESSAGE:"mediaErrorMessage",MEDIA_FULLSCREEN_UNAVAILABLE:"mediaFullscreenUnavailable",MEDIA_HAS_PLAYED:"mediaHasPlayed",MEDIA_HEIGHT:"mediaHeight",MEDIA_IS_AIRPLAYING:"mediaIsAirplaying",MEDIA_IS_CASTING:"mediaIsCasting",MEDIA_IS_FULLSCREEN:"mediaIsFullscreen",MEDIA_IS_PIP:"mediaIsPip",MEDIA_LOADING:"mediaLoading",MEDIA_MUTED:"mediaMuted",MEDIA_PAUSED:"mediaPaused",MEDIA_PIP_UNAVAILABLE:"mediaPipUnavailable",MEDIA_PLAYBACK_RATE:"mediaPlaybackRate",MEDIA_PREVIEW_CHAPTER:"mediaPreviewChapter",MEDIA_PREVIEW_COORDS:"mediaPreviewCoords",MEDIA_PREVIEW_IMAGE:"mediaPreviewImage",MEDIA_PREVIEW_TIME:"mediaPreviewTime",MEDIA_RENDITION_LIST:"mediaRenditionList",MEDIA_RENDITION_SELECTED:"mediaRenditionSelected",MEDIA_RENDITION_UNAVAILABLE:"mediaRenditionUnavailable",MEDIA_SEEKABLE:"mediaSeekable",MEDIA_STREAM_TYPE:"mediaStreamType",MEDIA_SUBTITLES_LIST:"mediaSubtitlesList",MEDIA_SUBTITLES_SHOWING:"mediaSubtitlesShowing",MEDIA_TARGET_LIVE_WINDOW:"mediaTargetLiveWindow",MEDIA_TIME_IS_LIVE:"mediaTimeIsLive",MEDIA_VOLUME:"mediaVolume",MEDIA_VOLUME_LEVEL:"mediaVolumeLevel",MEDIA_VOLUME_UNAVAILABLE:"mediaVolumeUnavailable",MEDIA_WIDTH:"mediaWidth"},s=Object.entries(r),o=s.reduce((e,[t,i])=>(e[t]=i.toLowerCase(),e),{}),l=s.reduce((e,[t,i])=>(e[t]=i.toLowerCase(),e),{USER_INACTIVE_CHANGE:"userinactivechange",BREAKPOINTS_CHANGE:"breakpointchange",BREAKPOINTS_COMPUTED:"breakpointscomputed"});Object.entries(l).reduce((e,[t,i])=>{let a=o[t];return a&&(e[i]=a),e},{userinactivechange:"userinactive"});let d=Object.entries(o).reduce((e,[t,i])=>{let a=l[t];return a&&(e[i]=a),e},{userinactive:"userinactivechange"}),u={SUBTITLES:"subtitles",CAPTIONS:"captions",DESCRIPTIONS:"descriptions",CHAPTERS:"chapters",METADATA:"metadata"},h={DISABLED:"disabled",HIDDEN:"hidden",SHOWING:"showing"},c={MOUSE:"mouse",PEN:"pen",TOUCH:"touch"},m={UNAVAILABLE:"unavailable",UNSUPPORTED:"unsupported"},p={LIVE:"live",ON_DEMAND:"on-demand",UNKNOWN:"unknown"},v={INLINE:"inline",FULLSCREEN:"fullscreen",PICTURE_IN_PICTURE:"picture-in-picture"}},84411:(e,t,i)=>{i.d(t,{Al:()=>c,Au:()=>h});class a{addEventListener(){}removeEventListener(){}dispatchEvent(){return!0}}class n extends a{}class r extends n{constructor(){super(...arguments),this.role=null}}class s{observe(){}unobserve(){}disconnect(){}}let o={createElement:function(){return new l.HTMLElement},createElementNS:function(){return new l.HTMLElement},addEventListener(){},removeEventListener(){},dispatchEvent:e=>!1},l={ResizeObserver:s,document:o,Node:n,Element:r,HTMLElement:class extends r{constructor(){super(...arguments),this.innerHTML=""}get content(){return new l.DocumentFragment}},DocumentFragment:class extends a{},customElements:{get:function(){},define:function(){},whenDefined:function(){}},localStorage:{getItem:e=>null,setItem(e,t){},removeItem(e){}},CustomEvent:function(){},getComputedStyle:function(){},navigator:{languages:[],get userAgent(){return""}},matchMedia:e=>({matches:!1,media:e})},d="u"<typeof window||void 0===window.customElements,u=Object.keys(l).every(e=>e in globalThis),h=d&&!u?l:globalThis,c=d&&!u?o:globalThis.document},99786:(e,t,i)=>{i.d(t,{gg:()=>c,YE:()=>v,w8:()=>E,PP:()=>b,JM:()=>f});var a=i(38275),n=i(83074),r=i(10574);let s="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t};i(43902);let{REGISTER_MEDIA_STATE_RECEIVER:o,UNREGISTER_MEDIA_STATE_RECEIVER:l,MEDIA_SHOW_TEXT_TRACKS_REQUEST:d,MEDIA_HIDE_TEXT_TRACKS_REQUEST:u,...h}=n.a8,c={...h,MEDIA_ELEMENT_CHANGE_REQUEST:"mediaelementchangerequest",FULLSCREEN_ELEMENT_CHANGE_REQUEST:"fullscreenelementchangerequest"};({...n.LJ});let m=e=>e,p=(0,a.createContext)(null),v=({children:e,mediaStore:t})=>{let i=(0,a.useMemo)(()=>null!=t?t:(0,r.M)({documentElement:globalThis.document}),[t]);return(0,a.useEffect)(()=>(null==i||i.dispatch({type:"documentelementchangerequest",detail:globalThis.document}),()=>{null==i||i.dispatch({type:"documentelementchangerequest",detail:void 0})}),[]),a.createElement(p.Provider,{value:i},e)},E=()=>{var e;let t=(0,a.useContext)(p),i=null!=(e=null==t?void 0:t.dispatch)?e:m;return e=>i(e)},b=()=>{let e=E();return t=>{e({type:c.MEDIA_ELEMENT_CHANGE_REQUEST,detail:t})}},g=(e,t)=>e===t,f=(e,t=g)=>{var i,n,r;let o=(0,a.useContext)(p);return function(e,t,i,n,r){let o,l=(0,a.useRef)(null);null===l.current?l.current=o={hasValue:!1,value:null}:o=l.current;let[d,u]=(0,a.useMemo)(()=>{let e,a,l=!1,d=t=>{if(!l){l=!0,e=t;let i=n(t);if(void 0!==r&&o.hasValue){let e=o.value;if(r(e,i))return a=e,e}return a=i,i}let i=a;if(s(e,t))return i;let d=n(t);return void 0!==r&&r(i,d)?i:(e=t,a=d,d)},u=void 0===i?null:i;return[()=>d(t()),null===u?void 0:()=>d(u())]},[t,i,n,r]),h=(0,a.useSyncExternalStore)(e,d,u);return(0,a.useEffect)(()=>{o.hasValue=!0,o.value=h},[h]),(0,a.useDebugValue)(h),h}(null!=(i=null==o?void 0:o.subscribe)?i:m,null!=(n=null==o?void 0:o.getState)?n:m,null!=(r=null==o?void 0:o.getState)?r:m,e,t)}}}]);