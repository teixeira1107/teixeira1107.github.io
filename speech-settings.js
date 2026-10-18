export function safeRate(value){const n=Number(value);return Number.isFinite(n)&&n>=.5&&n<=1.25?n:.9;}
export function deviceValue(voice){return 'device:'+encodeURIComponent(voice.voiceURI||voice.name);}
export function chooseVoice(voices,value){return voices.find(v=>deviceValue(v)===value)||voices.find(v=>/natural|enhanced|premium/i.test(v.name))||voices.find(v=>v.default)||voices[0];}
