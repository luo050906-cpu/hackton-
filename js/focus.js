// === FOCUS MODE JAVASCRIPT ===

// --- Constanten ---
const TOTALE_TIJD = 25 * 60; // 25 minuten in seconden
const OMTREK = 691;           // 2 * Math.PI * 110 (straal van de cirkel)

// --- DOM Elementen selecteren ---
const timerDisplay = document.getElementById('timer-display');
const timerStatus = document.getElementById('timer-status');
const cirkelVoortgang = document.getElementById('cirkel-voortgang');
const startKnop = document.getElementById('start-sessie');
const pauzeKnop = document.getElementById('pauze-sessie');
const resetKnop = document.getElementById('reset-sessie');
const streakTeller = document.getElementById('streak-teller');
const geluidKeuze = document.getElementById('geluid-keuze');
const voltooidOverlay = document.getElementById('sessie-voltooid');
const opnieuwKnop = document.getElementById('opnieuw-btn');
const focusMode = document.getElementById('focus-mode');

const notifVersnelling = document.getElementById('notif-versnelling');
const notifFakeVideo = document.getElementById('notif-fake-video');
const notifWhatsapp = document.getElementById('notif-whatsapp');
const notifSnapchat = document.getElementById('notif-snapchat');
const notifInstagram = document.getElementById('notif-instagram');
const fakeNotifBtns = document.querySelectorAll('.fake-notif-btn');
const focusBrokenBericht = document.getElementById('focus-broken-bericht');
const sluitBrokenBtn = document.getElementById('sluit-broken-btn');

// --- Timer State ---
let tijdOver   = TOTALE_TIJD;
let interval   = null;
let isBezig    = false;
let realTimeElapsed = 0;   // Echte verstreken seconden
let tickSnelheid = 1000;   // Start op 1 seconde per tick
let volgendeNotifTijd = 10; // Eerste notificatie na 10 sec

const alleNotificaties = [notifFakeVideo, notifWhatsapp, notifSnapchat, notifInstagram];

// --- Streak ophalen uit localStorage ---
let streak = parseInt(localStorage.getItem('focusStreak') || '0');
streakTeller.textContent = streak;

// --- Audio Setup ---
// We gebruiken de Web Audio API om ruis te genereren (geen externe bestanden nodig)
let audioContext = null;
let ruisNode = null;
let rauisSource = null;

function maakBruineRuis() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const bufferGrootte = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferGrootte, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferGrootte; i++) {
        const wit = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * wit)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
    }
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = audioContext.createGain();
    gain.gain.value = 0.3;

    source.connect(gain);
    gain.connect(audioContext.destination);
    source.start();
    return source;
}

function maakRegenGeluid() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const bufferGrootte = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferGrootte, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferGrootte; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    const gain = audioContext.createGain();
    gain.gain.value = 0.4;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    source.start();
    return source;
}

function stopGeluid() {
    if (rauisSource) {
        try { rauisSource.stop(); } catch (e) { }
        rauisSource = null;
    }
}

// Speel een 'Ding-Ding' notificatie geluid af
function speelNotificatieGeluid() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    
    const time = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc.type = 'sine';
    
    // Twee tonen (Ding - Ding)
    osc.frequency.setValueAtTime(600, time);
    osc.frequency.setValueAtTime(850, time + 0.15);
    
    // Volume envelop
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.8, time + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1); // eerste decay
    
    gainNode.gain.setValueAtTime(0, time + 0.14);
    gainNode.gain.linearRampToValueAtTime(0.8, time + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.4); // tweede decay
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start(time);
    osc.stop(time + 0.5);
}

// Geluid wisselen via dropdown
geluidKeuze.addEventListener('change', () => {
    stopGeluid();
    if (geluidKeuze.value === 'ruis') rauisSource = maakBruineRuis();
    if (geluidKeuze.value === 'regen') rauisSource = maakRegenGeluid();
});

// --- Hulpfuncties ---

// Zet seconden om naar MM:SS formaat
function formateerTijd(seconden) {
    const minuten = Math.floor(seconden / 60);
    const secs = seconden % 60;
    return `${String(minuten).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Update de SVG cirkel op basis van hoeveel tijd er nog over is
function updateCirkel(seconden) {
    const voortgang = seconden / TOTALE_TIJD;         // 1.0 = vol, 0.0 = leeg
    const offset = OMTREK * (1 - voortgang);       // hoe ver de streep "ingetrokken" is
    
    // Voorkom crash als je de SVG hebt verwijderd in de HTML
    if (cirkelVoortgang) {
        cirkelVoortgang.style.strokeDashoffset = offset;
    }

    // Cirkel kleurt oranje als er minder dan 5 min over is
    if (seconden <= 300) {
        focusMode.classList.add('timer-bijna-klaar');
    } else {
        focusMode.classList.remove('timer-bijna-klaar');
    }
}

// Update het scherm: tijd + cirkel + status tekst
function updateScherm() {
    timerDisplay.textContent = formateerTijd(tijdOver);
    updateCirkel(tijdOver);

    if (tijdOver <= 300 && isBezig) {
        timerStatus.textContent = '⚡ Bijna klaar, nog even volhouden!';
    }
}

// Sessie voltooid afhandeling
function sessiVoltooid() {
    clearInterval(interval);
    interval = null;
    isBezig = false;
    stopGeluid();

    document.querySelector('.timer-container')?.classList.remove('actief');

    // Focus tijd opslaan voor stats pagina
    const huidigeFocusTijd = parseInt(localStorage.getItem('totaleFocusTijd') || '0');
    localStorage.setItem('totaleFocusTijd', huidigeFocusTijd + TOTALE_TIJD);

    // Toon de voltooiing overlay
    voltooidOverlay.classList.remove('hidden');

    // Knoppen resetten
    startKnop.disabled = false;
    pauzeKnop.disabled = true;
    timerStatus.textContent = 'YOU WON! 🏆';
}

// Hulpfunctie om interval te herstarten
function herstartInterval() {
    if (interval) clearInterval(interval);
    interval = setInterval(timerTick, tickSnelheid);
}

// Focus Verbroken Logica
function breekFocus() {
    clearInterval(interval);
    interval = null;
    isBezig = false;
    stopGeluid();
    
    // Verberg alle meldingen
    notifFakeVideo.classList.add('hidden');
    notifWhatsapp.classList.add('hidden');
    notifSnapchat.classList.add('hidden');
    notifInstagram.classList.add('hidden');
    
    // Zet streak op 0
    streak = 0;
    localStorage.setItem('focusStreak', streak);
    streakTeller.textContent = streak;
    
    // Toon falen bericht
    focusBrokenBericht.classList.remove('hidden');
    
    startKnop.disabled = false;
    pauzeKnop.disabled = true;
    timerStatus.textContent = 'Focus broken...';
}

// Eén tick van de timer
function timerTick() {
    tijdOver--;
    updateScherm();

    if (tijdOver <= 0) {
        sessiVoltooid();
        return;
    }

    // Houd de ECHTE tijd bij
    realTimeElapsed += (tickSnelheid / 1000);

    // Na 20 seconden: Timer sneller
    if (Math.abs(realTimeElapsed - 20) < 0.1 && tickSnelheid === 1000) {
        tickSnelheid = 400; // Timer 2.5x zo snel
        herstartInterval();
    } 
    // Na 40 seconden: Nog sneller
    else if (Math.abs(realTimeElapsed - 40) < 0.1 && tickSnelheid === 400) {
        tickSnelheid = 100; // Timer 10x zo snel
        herstartInterval();
    } 
    
    // Notificatie Bombardement: Elke 10 seconden
    if (realTimeElapsed >= volgendeNotifTijd) {
        
        // ++ SCORE/STREAK VERHOGEN ELKE 10 SECONDE ++
        streak++;
        localStorage.setItem('focusStreak', streak);
        streakTeller.textContent = streak;

        // Verberg alle huidige (voor de zekerheid)
        alleNotificaties.forEach(n => n.classList.add('hidden'));
        
        // Kies een willekeurige notificatie
        const willekeurig = alleNotificaties[Math.floor(Math.random() * alleNotificaties.length)];
        willekeurig.classList.remove('hidden');
        
        // Speel het irritante geluidje af!
        speelNotificatieGeluid();
        
        // Verberg hem weer na 6 seconden
        setTimeout(() => willekeurig.classList.add('hidden'), 6000);
        
        volgendeNotifTijd += 10; // Zet de volgende klaar over 10 sec!
    }
}

// --- Knop Logica ---

// START knop
const timerContainer = document.querySelector('.timer-container');

startKnop.addEventListener('click', () => {
    if (isBezig) return;
    isBezig = true;

    // Zorg dat audio context actief is (browsers blokkeren dit soms voor de eerste klik)
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();

    startKnop.disabled = true;
    pauzeKnop.disabled = false;
    timerStatus.textContent = '🎯 Focusing...';

    // Toon notificatie bericht "Let op timer gaat sneller"
    if (tijdOver === TOTALE_TIJD) {
        notifVersnelling.classList.remove('hidden');
        setTimeout(() => {
            notifVersnelling.classList.add('hidden');
        }, 4000); // Verberg na 4 sec
    }

    tickSnelheid = 1000;
    herstartInterval();
});

// PAUZE knop
pauzeKnop.addEventListener('click', () => {
    if (!isBezig) {
        // Hervat
        isBezig = true;
        herstartInterval();
        pauzeKnop.textContent = '⏸ Pause';
        startKnop.disabled = true;
        timerStatus.textContent = '🎯 Focusing...';
    } else {
        // Pauzeer
        isBezig = false;
        clearInterval(interval);
        pauzeKnop.textContent = '▶ Resume';
        startKnop.disabled = false;
        timerStatus.textContent = '⏸ Paused';
    }
});

// RESET knop
resetKnop.addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
    isBezig = false;
    tijdOver = TOTALE_TIJD;
    realTimeElapsed = 0;
    tickSnelheid = 1000;
    volgendeNotifTijd = 10;
    alleNotificaties.forEach(n => n.classList.add('hidden'));
    stopGeluid();
    geluidKeuze.value = 'none';

    startKnop.disabled = false;
    pauzeKnop.disabled = true;
    pauzeKnop.textContent = '⏸ Pause';

    timerStatus.textContent = 'Ready to focus';
    updateScherm();
});

// OPNIEUW knop (in de overlay)
opnieuwKnop.addEventListener('click', () => {
    voltooidOverlay.classList.add('hidden');
    tijdOver = TOTALE_TIJD;
    realTimeElapsed = 0;
    tickSnelheid = 1000;
    volgendeNotifTijd = 10;
    alleNotificaties.forEach(n => n.classList.add('hidden'));
    isBezig = false;
    interval = null;

    startKnop.disabled = false;
    pauzeKnop.disabled = true;
    pauzeKnop.textContent = '⏸ Pause';
    timerStatus.textContent = 'Ready to focus';
    updateScherm();
});

// Event Listeners voor Notificatie & Broken
fakeNotifBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        breekFocus();
    });
});

sluitBrokenBtn.addEventListener('click', () => {
    focusBrokenBericht.classList.add('hidden');
    tijdOver = TOTALE_TIJD;
    realTimeElapsed = 0;
    tickSnelheid = 1000;
    volgendeNotifTijd = 10;
    alleNotificaties.forEach(n => n.classList.add('hidden'));
    updateScherm();
    timerStatus.textContent = 'Ready to try again';
});

// --- Initialisatie ---
updateScherm();
