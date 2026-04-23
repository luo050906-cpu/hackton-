document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Haal alle data op uit localStorage ---
    
    // Slechte gewoontes (vanaf de TikTik)
    const timeSpentSeconds = parseInt(localStorage.getItem('timeSpent') || '0');
    const aantalScrolls = parseInt(localStorage.getItem('aantalScrolls') || '0');

    // Goede gewoontes (vanaf focus modus)
    const totaleFocusTijdSeconds = parseInt(localStorage.getItem('totaleFocusTijd') || '0');
    const focusStreak = parseInt(localStorage.getItem('focusStreak') || '0');

    // --- 2. Reken seconden om naar minuten ---
    const tijdVerspildMin = Math.floor(timeSpentSeconds / 60);
    const tijdGefocustMin = Math.floor(totaleFocusTijdSeconds / 60);

    // --- 3. Vul de HTML elementen in ---
    
    document.getElementById('tijd-verspild').textContent = `${tijdVerspildMin} min`;
    document.getElementById('aantal-scrolls').textContent = aantalScrolls;
    document.getElementById('tijd-gefocust').textContent = `${tijdGefocustMin} min`;
    document.getElementById('focus-streak').textContent = focusStreak;

    // --- 4. Bepaal de 'Confrontatie' tekst op basis van de data ---
    
    const confrontatieTitel = document.getElementById('confrontatie-titel');
    const confrontatieTekst = document.getElementById('confrontatie-tekst');

    if (tijdVerspildMin === 0 && tijdGefocustMin === 0) {
        // Welcome to ScrollLock
        confrontatieTitel.textContent = "Welcome to ScrollLock";
        confrontatieTitel.style.color = "#00d4ff"; // neon-blue
        confrontatieTekst.textContent = "You haven't collected any data yet. Go to the TikTik to see how easily distracted you get, or start a focus session directly!";
    } 
    else if (tijdVerspildMin > tijdGefocustMin) {
        // Ouch... distraction wins.
        confrontatieTitel.textContent = "Ouch... distraction wins.";
        confrontatieTitel.style.color = "#ff0055"; // neon-red
        confrontatieTekst.innerHTML = `You threw away <strong>${tijdVerspildMin} minutes</strong> of your life on mindless scrolling. That's <strong>${aantalScrolls} swipes</strong> that got you nowhere. Time to turn things around and enter Focus Mode!`;
    } 
    else if (tijdGefocustMin >= tijdVerspildMin && tijdGefocustMin > 0) {
        // You're in control!
        confrontatieTitel.textContent = "You're in control!";
        confrontatieTitel.style.color = "#00ff88"; // neon-green
        confrontatieTekst.innerHTML = `Awesome job! You've already focused for <strong>${tijdGefocustMin} minutes</strong>, with a streak of <strong>${focusStreak}</strong>. You don't let yourself get distracted easily. Keep it up!`;
    }

    // --- 5. Reset Knop Logica ---
    
    const resetBtn = document.getElementById('reset-stats');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Confirm data deletion
            if (confirm('Are you sure you want to delete ALL your data? This cannot be undone.')) {
                // Clear localStorage
                localStorage.removeItem('timeSpent');
                localStorage.removeItem('aantalScrolls');
                localStorage.removeItem('totaleFocusTijd');
                localStorage.removeItem('focusStreak');
                localStorage.removeItem('screenTimeAllowed'); // Also reset fake permission
                
                // Reload page
                window.location.reload();
            }
        });
    }

    // --- 6. Fake Screen Time Permission Logica ---
    const modal = document.getElementById('permission-modal');
    const allowBtn = document.getElementById('btn-allow');
    const denyBtn = document.getElementById('btn-deny');
    const screenTimeSectie = document.getElementById('device-screentime-sectie');
    const screenTimeBars = document.getElementById('screentime-bars');
    const loadingText = document.getElementById('permission-loading');
    const knoppen = document.getElementById('permission-knoppen');

    if (!localStorage.getItem('screenTimeAllowed') && modal) {
        // Show modal smoothly
        modal.classList.remove('hidden');
        setTimeout(() => modal.style.opacity = '1', 50);
    } else if (modal) {
        toonScreenTime();
    }

    if (denyBtn) {
        denyBtn.addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.classList.add('hidden'), 300);
        });
    }

    if (allowBtn) {
        allowBtn.addEventListener('click', () => {
            knoppen.style.display = 'none';
            loadingText.style.display = 'block';
            
            setTimeout(() => {
                localStorage.setItem('screenTimeAllowed', 'true');
                modal.style.opacity = '0';
                setTimeout(() => modal.classList.add('hidden'), 300);
                toonScreenTime();
            }, 2000);
        });
    }

    function toonScreenTime() {
        if (!screenTimeSectie) return;
        
        screenTimeSectie.style.display = 'block';
        screenTimeSectie.classList.remove('hidden');
        
        // Randomize the values slightly for a bit of dynamic realism
        const ttH = Math.floor(Math.random() * 2) + 2; // 2 or 3 hours
        const ttM = Math.floor(Math.random() * 59);
        const igH = Math.floor(Math.random() * 2) + 1; // 1 or 2 hours
        const igM = Math.floor(Math.random() * 59);
        
        screenTimeBars.innerHTML = `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: white; font-weight: bold;">📱 TikTok</span>
                    <span style="color: #00d4ff;">${ttH}h ${ttM}m</span>
                </div>
                <div style="width: 100%; background: rgba(255,255,255,0.1); border-radius: 5px; height: 10px; overflow: hidden;">
                    <div style="width: 85%; background: #00d4ff; height: 100%; box-shadow: 0 0 10px #00d4ff;"></div>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: white; font-weight: bold;">📸 Instagram</span>
                    <span style="color: #e400c9;">${igH}h ${igM}m</span>
                </div>
                <div style="width: 100%; background: rgba(255,255,255,0.1); border-radius: 5px; height: 10px; overflow: hidden;">
                    <div style="width: 60%; background: #e400c9; height: 100%; box-shadow: 0 0 10px #e400c9;"></div>
                </div>
            </div>
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: white; font-weight: bold;">💬 WhatsApp</span>
                    <span style="color: #00ff88;">1h 12m</span>
                </div>
                <div style="width: 100%; background: rgba(255,255,255,0.1); border-radius: 5px; height: 10px; overflow: hidden;">
                    <div style="width: 30%; background: #00ff88; height: 100%; box-shadow: 0 0 10px #00ff88;"></div>
                </div>
            </div>
        `;
    }
});
