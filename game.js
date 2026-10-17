/**
 * THE LAST CASE - Round 1 Gameplay Engine
 * Clean, minimal, AAA forensic investigation state machine.
 */

class Round1Engine {
    constructor() {
        this.teamName = "OMEGA DEDUCTION";
        this.p1 = "Agent Vance";
        this.p2 = "Agent Sarah";

        this.cinematicIndex = 0;
        this.cinematicActive = false;

        this.collectedEvidence = new Set();
        this.activeClueId = null;

        // Jumbled puzzle state
        this.currentSlots = [null, null, null, null, null];
        this.jumbledSolved = false;

        // Reconstruction selection
        this.reconAnswers = { q1: null, q2: null, q3: null };

        // Vikram's Ghost hint system (max 5 hints total across game)
        this.ghostHintsRemaining = 5;

        // Round 2 State variables
        this.currentRound = 1;
        this.r2Evidence = new Set(); // e.g. 'admin_01', 'r2_statements', 'r2_tech_puzzle', 'r2_deleted_msg', 'r2_suspect_secrets'
        this.r2TechSlots = [null, null, null, null];
        this.r2TechSolved = false;
        this.r2DeletedMsgRecovered = false;
        this.r2AdminDiscovered = false;
        this.r2DeductionAnswers = { q1: null, q2: null, q3: null, q4: null };
    }
}

const game = new Round1Engine();
window.game = game;

// ==========================================================================
// 1. BOOT SEQUENCE & LOADING SCREEN
// ==========================================================================

window.addEventListener('DOMContentLoaded', () => {
    // Initialise the 3D renderer safely
    const container = document.getElementById('viewport-3d');
    if (window.scene3d && container) {
        try {
            window.scene3d.init(container);
            window.scene3d.buildExteriorScene(); // <-- outside facility during story
        } catch (err) {
            console.warn("3D scene initialization notice:", err);
        }
    }

    // Check if step test query param is present to skip boot sequence
    const urlParams = new URLSearchParams(window.location.search);
    const urlStep = urlParams.get('step');
    if (urlStep) {
        const bootScreen = document.getElementById('screen-boot');
        const regScreen = document.getElementById('screen-registration');
        if (bootScreen) bootScreen.style.display = 'none';
        if (regScreen) regScreen.style.display = 'none';
        return;
    }

    // Run simulated system initialization
    let progress = 0;
    const bar = document.getElementById('boot-bar-fill');
    const percent = document.getElementById('boot-percent');

    const bootInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 4;
        if (progress > 100) progress = 100;

        if (bar) bar.style.width = `${progress}%`;
        if (percent) percent.innerText = `${progress}%`;

        if (progress >= 100) {
            clearInterval(bootInterval);
            setTimeout(() => {
                const bootScreen = document.getElementById('screen-boot');
                const regScreen = document.getElementById('screen-registration');
                if (bootScreen) bootScreen.style.display = 'none';
                if (regScreen) regScreen.style.display = 'flex';
                if (window.sound && window.sound.init) {
                    try { window.sound.init(); } catch (e) {}
                }
            }, 400);
        }
    }, 45);
});

// Sound Toggle
window.toggleSound = function() {
    window.sound.isMuted = !window.sound.isMuted;
    const btn = document.getElementById('btn-sound');
    if (btn) {
        btn.innerText = window.sound.isMuted ? "AUDIO: OFF" : "AUDIO: ON";
    }
};

// ==========================================================================
// 2. TEAM REGISTRATION & TRANSITION INTO STORY
// ==========================================================================

window.onTeamSubmit = function(e) {
    e.preventDefault();
    const team = document.getElementById('input-team').value.trim();
    const p1 = document.getElementById('input-p1').value.trim();
    const p2 = document.getElementById('input-p2').value.trim();

    if (!team || !p1 || !p2) return;

    game.teamName = team;
    game.p1 = p1;
    game.p2 = p2;

    document.getElementById('hud-team-tag').innerText = `TEAM: ${team.toUpperCase()}`;

    // Audio transition: start rain and distant thunder
    window.sound.init();
    window.sound.startHum();
    window.sound.startRain();
    window.sound.playThunder();

    document.getElementById('screen-registration').style.display = 'none';

    // Start Cinematic Introduction
    startCinematicMode();
};

// ==========================================================================
// 4. CINEMATIC CUTSCENE CONTROLLER
// ==========================================================================

function startCinematicMode() {
    game.cinematicActive = true;
    game.cinematicIndex = 0;

    // Show the facility photo background + rain effect
    const bg = document.getElementById('cinematic-bg');
    const rain = document.getElementById('rain-canvas');
    if (bg)   bg.style.display   = 'block';
    if (rain) rain.style.display = 'block';

    // Hide the Three.js viewport during story (exterior replaced by photo)
    const vp = document.getElementById('viewport-3d');
    if (vp) vp.style.opacity = '0';

    document.getElementById('cinematic-overlay').style.display = 'flex';
    renderCinematicBeat(0);
}

function renderCinematicBeat(idx) {
    if (idx >= GAME_DATA.cinematicBeats.length) {
        finishCinematicMode();
        return;
    }

    const beat = GAME_DATA.cinematicBeats[idx];
    document.getElementById('cinema-location-tag').innerText = beat.locationTag;
    document.getElementById('cinema-time-tag').innerText = beat.timeTag;

    const speakerEl = document.getElementById('cinema-speaker');
    const quoteEl = document.getElementById('cinema-quote');
    const narrativeEl = document.getElementById('cinema-narrative');

    if (beat.speaker) {
        speakerEl.style.display = 'block';
        speakerEl.innerText = beat.speaker;
    } else {
        speakerEl.style.display = 'none';
    }

    if (beat.text) {
        quoteEl.style.display = 'block';
        quoteEl.innerText = beat.text;
    } else {
        quoteEl.style.display = 'none';
    }

    narrativeEl.innerText = beat.caption;

    // Trigger procedural audio cue
    switch(beat.soundEffect) {
        case 'rain_thunder':
            window.sound.playThunder();
            break;
        case 'door_clang':
            window.sound.playDoorClang();
            window.scene3d.setAlarm(true);
            break;
        case 'static':
            window.sound.playStatic();
            window.scene3d.setAlarm(false);
            break;
        case 'heartbeat':
            window.sound.playHeartbeat();
            break;
        default:
            window.sound.playClick();
            break;
    }

    // Drive the exterior 3D camera to reflect each cinematic shot
    // (never reveals the interior lab — stays fully outside the building)
    switch(beat.cameraView) {
        case 'exterior':
            // Wide approach: camera at facility gate, looking at building
            window.scene3d.setCinematicCamera(0, 2.2, 4, 0, 3.5, -18);
            break;
        case 'vikram_intro':
            // Drift slightly right — as if looking at a lit window
            window.scene3d.setCinematicCamera(3, 2.8, 2, 0, 3.8, -18);
            break;
        case 'intercom_alert':
            // Pull back a little, slight upward tilt to suggest intercom on building
            window.scene3d.setCinematicCamera(-2, 3.5, 5, 0, 4.5, -18);
            break;
        case 'doors_lock':
            // Close to the gate — suggest blast doors slamming
            window.scene3d.setCinematicCamera(0, 1.8, -3, 0, 3, -18);
            break;
        case 'blackout':
            // Window goes dark — camera drifts left, slight downward
            window.scene3d.setCinematicCamera(-4, 2, 3, 0, 3.2, -18);
            break;
        case 'compromised':
            // Straight-on, centred on building — ominous stillness
            window.scene3d.setCinematicCamera(0, 3, 1, 0, 3.5, -18);
            break;
        case 'corridor_door':
            // Tight on facility entrance gate — camera pushed to fence line
            // Camera NEVER enters. This is as close as the story gets.
            window.scene3d.setCinematicCamera(0, 2, -5.2, 0, 3, -18);
            break;
        default:
            break;
    }
}

window.advanceCinematic = function() {
    game.cinematicIndex++;
    if (game.cinematicIndex < GAME_DATA.cinematicBeats.length) {
        renderCinematicBeat(game.cinematicIndex);
    } else {
        finishCinematicMode();
    }
};

window.skipCinematic = function() {
    finishCinematicMode();
};

function finishCinematicMode() {
    game.cinematicActive = false;
    window.sound.stopRain();
    window.scene3d.setAlarm(false);
    document.getElementById('cinematic-overlay').style.display = 'none';

    // Hide facility photo background and rain
    const bg = document.getElementById('cinematic-bg');
    const rain = document.getElementById('rain-canvas');
    if (bg)   bg.style.display   = 'none';
    if (rain) rain.style.display = 'none';

    // Restore Three.js viewport (title screen is shown over it)
    const vp = document.getElementById('viewport-3d');
    if (vp) vp.style.opacity = '1';

    // Show Title Reveal Screen (Section 12)
    const titleScreen = document.getElementById('screen-title-reveal');
    titleScreen.style.display = 'flex';
    window.sound.playHeartbeat();
}

window.enterCrimeScene = function() {
    document.getElementById('screen-title-reveal').style.display = 'none';
    document.getElementById('hud-overlay').style.display = 'flex';

    // Show the blurred lab photograph as atmosphere behind the 3D scene
    const labBg = document.getElementById('lab-bg');
    if (labBg) labBg.style.display = 'block';

    // NOW build the crime scene — player is stepping through the door for
    // the first time. The exterior was shown during the story.
    window.scene3d.buildMainLaboratory();
    window.sound.playSuccess();

    renderCaseFileList();

    // Auto-fade controls hint after 5 seconds
    setTimeout(() => {
        const hint = document.getElementById('controls-hint');
        if (hint) hint.style.opacity = '0';
    }, 5000);
};

// ==========================================================================
// 16 & 17. INVESTIGATION SYSTEM & EVIDENCE DISCOVERY
// ==========================================================================

window.onInvestigateClue = function(clueId) {
    const clue = GAME_DATA.evidence[clueId];
    if (!clue) return;

    game.activeClueId = clueId;
    window.sound.playClick();

    // Smooth camera focus onto prop in 3D
    window.scene3d.focusOnClue(clueId);

    // Populate Evidence Card
    document.getElementById('ev-num').innerText = clue.num;
    document.getElementById('ev-title').innerText = clue.title;
    document.getElementById('ev-status').innerText = clue.status;
    document.getElementById('ev-time').innerText = clue.lastActivity;
    document.getElementById('ev-significance').innerText = clue.significance;
    document.getElementById('ev-details').innerText = clue.details;

    const addBtn = document.getElementById('btn-add-evidence');
    if (game.collectedEvidence.has(clueId)) {
        addBtn.innerText = "✓ ALREADY IN CASE FILE";
        addBtn.disabled = true;
        addBtn.style.opacity = "0.5";
    } else {
        addBtn.innerText = "ADD TO CASE FILE";
        addBtn.disabled = false;
        addBtn.style.opacity = "1";
    }

    document.getElementById('modal-evidence-card').style.display = 'flex';
};

window.addCurrentEvidenceToFile = function() {
    if (!game.activeClueId) return;

    game.collectedEvidence.add(game.activeClueId);
    window.sound.playEvidenceScan();

    renderCaseFileList();
    closeModals();

    const count = game.collectedEvidence.size;
    document.getElementById('hud-evidence-count').innerText = `${count} / 6`;

    if (count === 6) {
        document.getElementById('hud-objective-text').innerText = "All 6 physical clues recovered. Reconstruct the recovered audio message and complete the Round 1 Deduction.";
    }
};

window.closeModals = function() {
    const evCard = document.getElementById('modal-evidence-card');
    if (evCard) evCard.style.display = 'none';
    const caseFile = document.getElementById('modal-case-file');
    if (caseFile) caseFile.style.display = 'none';
    const jumbled = document.getElementById('modal-jumbled-puzzle');
    if (jumbled) jumbled.style.display = 'none';
    const recon = document.getElementById('modal-reconstruction');
    if (recon) recon.style.display = 'none';
    const suspectsModal = document.getElementById('modal-suspects');
    if (suspectsModal) suspectsModal.style.display = 'none';
    const ghostModal = document.getElementById('modal-ghost');
    if (ghostModal) ghostModal.style.display = 'none';

    // Round 2 Modals
    const accessLogsModal = document.getElementById('modal-access-logs');
    if (accessLogsModal) accessLogsModal.style.display = 'none';
    const techPuzzleModal = document.getElementById('modal-tech-puzzle');
    if (techPuzzleModal) techPuzzleModal.style.display = 'none';
    const delMsgModal = document.getElementById('modal-deleted-message');
    if (delMsgModal) delMsgModal.style.display = 'none';
    const r2DedModal = document.getElementById('modal-r2-deduction');
    if (r2DedModal) r2DedModal.style.display = 'none';

    try { if (window.scene3d && window.scene3d.resetCameraFocus) window.scene3d.resetCameraFocus(); } catch(e) {}
    try { if (window.sound && window.sound.playClick) window.sound.playClick(); } catch(e) {}
};

// ==========================================================================
// SUSPECTS DOSSIER CONTROLLER
// ==========================================================================

window.toggleSuspectsDossier = function() {
    const modal = document.getElementById('modal-suspects');
    if (!modal) return;

    const isShowing = modal.style.display === 'flex';
    if (isShowing) {
        modal.style.display = 'none';
    } else {
        renderSuspectsDossier();
        modal.style.display = 'flex';
    }
    window.sound.playClick();
};

function renderSuspectsDossier() {
    const container = document.getElementById('suspects-container');
    if (!container || !GAME_DATA.suspects) return;
    container.innerHTML = "";

    GAME_DATA.suspects.forEach(s => {
        const div = document.createElement('div');
        div.className = 'suspect-item';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                <div class="suspect-name">${s.name}</div>
                <span class="suspect-threat-badge threat-${s.threatLevel}">${s.threatLevel}</span>
            </div>
            <div class="suspect-role">${s.role} // ${s.status}</div>
            <div class="suspect-detail-row">
                <span class="suspect-detail-label">POTENTIAL MOTIVE:</span><br>
                ${s.motive}
            </div>
            <div class="suspect-detail-row" style="margin-bottom: 0;">
                <span class="suspect-detail-label">STATED ALIBI (02:13 AM):</span><br>
                ${s.alibi}
            </div>
        `;
        container.appendChild(div);
    });
}

// ==========================================================================
// VIKRAM'S GHOST (SPECTRAL MANIFESTATION HINT SYSTEM - MAX 5 USES)
// ==========================================================================

window.summonVikramGhost = function() {
    const modal = document.getElementById('modal-ghost');
    if (!modal) return;

    if (game.ghostHintsRemaining <= 0) {
        alert("VIKRAM'S GHOST: My neural imprint has dissipated... You have exhausted all 5 spectral manifestations.");
        return;
    }

    game.ghostHintsRemaining--;
    window.sound.playHeartbeat();

    // Update remaining indicator on HUD button and modal
    const hudBadge = document.getElementById('ghost-hints-left');
    if (hudBadge) {
        hudBadge.innerText = `(${game.ghostHintsRemaining}/5)`;
        if (game.ghostHintsRemaining === 0) {
            hudBadge.style.color = 'var(--text-muted)';
        }
    }
    const modalBadge = document.getElementById('ghost-uses-display');
    if (modalBadge) {
        modalBadge.innerText = `SPECTRAL MANIFESTATIONS REMAINING: ${game.ghostHintsRemaining} / 5`;
    }

    // Determine targeted intelligent clue based on current player progress
    const speechEl = document.getElementById('ghost-speech-text');
    const clueHighlightEl = document.getElementById('ghost-actionable-clue');

    let speech = "";
    let actionableClue = "";

    // ROUND 2 CONTEXTUAL GHOST HINTS
    if (game.currentRound === 2) {
        if (!game.r2AdminDiscovered) {
            speech = "\"Don't assume the name attached to a security log is the person who actually used the system. Look at what the system records — and what it doesn't. Inspect the 02:14:37 log entry closely.\"";
            actionableClue = "TARGET: Open the ACCESS LOGS terminal and inspect the flagged 02:14:37 security entry.";
        } else if (!game.r2Evidence.has('r2_tech_puzzle')) {
            speech = "\"The system clocks never lie. Arrange the anomalies chronologically: when was the surveillance camera looped relative to when the magnetic door pulsed?\"";
            actionableClue = "TARGET: Open the TECHNICAL LOG puzzle and order the events forward from CAM-04.";
        } else if (!game.r2Evidence.has('r2_deleted_msg')) {
            speech = "\"On the server rack... memory cell #09-V contains my deleted communication buffer. I tried to warn everyone about the neural model.\"";
            actionableClue = "TARGET: Open the DELETED COMMUNICATION unit at the mainframe server rack.";
        } else {
            speech = "\"Remember: A person lying does NOT automatically mean that person is the murderer. Separate personal secrets from the murder itself, then proceed to the DIGITAL DEDUCTION console.\"";
            actionableClue = "TARGET: Open the DIGITAL DEDUCTION console to conclude Round 2.";
        }
    } else {
        // ROUND 1 HINTS
        if (!game.collectedEvidence.has('accessCard')) {
            speech = "\"Detectives... look directly at the front of the floor near your boots. My Master Security Card was dropped during the scramble. Examine its magnetic coil!\"";
            actionableClue = "TARGET: Investigate the red MASTER SECURITY CARD located in the foreground floor.";
            window.scene3d.focusOnClue('accessCard');
        } else if (!game.collectedEvidence.has('smartwatch')) {
            speech = "\"Examine my body outline on the floor. My smartwatch... look closely at its timestamp. It doesn't match the official coroner's narrative!\"";
            actionableClue = "TARGET: Investigate VIKRAM'S SMARTWATCH lying beside the chalk body outline.";
            window.scene3d.focusOnClue('smartwatch');
        } else if (!game.collectedEvidence.has('brokenGlass')) {
            speech = "\"Look upward toward the ventilation shaft... someone unscrewed the intake grill and introduced something into my room before the doors locked.\"";
            actionableClue = "TARGET: Investigate the green SHATTERED CHEMICAL VIAL beneath the ceiling ventilation vent.";
            window.scene3d.focusOnClue('brokenGlass');
        } else if (!game.collectedEvidence.has('laptop')) {
            speech = "\"My workstation... I was running an emergency terminal script when the blackout struck. Check the uncommitted command!\"";
            actionableClue = "TARGET: Investigate VIKRAM'S LAPTOP on the central workbench.";
            window.scene3d.focusOnClue('laptop');
        } else if (!game.collectedEvidence.has('usbDevice')) {
            speech = "\"On the right corner of my desk... the purple glowing encrypted token. It holds half of the emergency shutdown protocol.\"";
            actionableClue = "TARGET: Investigate the ENCRYPTED USB TOKEN on the right edge of the desk.";
            window.scene3d.focusOnClue('usbDevice');
        } else if (!game.collectedEvidence.has('note')) {
            speech = "\"Tucked right beside my keyboard, I left a final handwritten warning. Don't trust the automated logs...\"";
            actionableClue = "TARGET: Investigate the HANDWRITTEN NOTE on the left side of the desk.";
            window.scene3d.focusOnClue('note');
        } else if (!game.jumbledSolved) {
            speech = "\"You have found all 6 physical clues. Now decode the distress transmission buffer: 'THE DOOR WAS NEVER OPENED'. What does that imply?\"";
            actionableClue = "TARGET: Open the RECOVERED MESSAGE puzzle and arrange the words in sequence.";
        } else {
            speech = "\"You possess all the facts now. The blast door never breached, yet I died inside. Proceed to the RECONSTRUCTION console and expose the truth!\"";
            actionableClue = "TARGET: Open the RECONSTRUCT ROUND 01 console to complete your deduction.";
        }
    }

    if (speechEl) speechEl.innerText = speech;
    if (clueHighlightEl) clueHighlightEl.innerText = actionableClue;

    modal.style.display = 'flex';
};

// ==========================================================================
// 18. CASE FILE NOTEBOOK (TAB)
// ==========================================================================

window.toggleCaseFile = function() {
    const file = document.getElementById('modal-case-file');
    const isShowing = file.style.display === 'flex';
    if (isShowing) {
        file.style.display = 'none';
    } else {
        renderCaseFileList();
        file.style.display = 'flex';
    }
    window.sound.playClick();
};

// Keyboard listeners (TAB for Case File, Space for Cinematic Advance)
window.addEventListener('keydown', (e) => {
    if (e.code === 'Tab') {
        e.preventDefault();
        window.toggleCaseFile();
    } else if (e.code === 'Space' && game.cinematicActive) {
        e.preventDefault();
        window.advanceCinematic();
    }
});

function renderCaseFileList() {
    const container = document.getElementById('case-file-list');
    if (!container) return;
    container.innerHTML = "";

    for (let key in GAME_DATA.evidence) {
        const ev = GAME_DATA.evidence[key];
        const isFound = game.collectedEvidence.has(key);

        const card = document.createElement('div');
        card.className = `evidence-item-card ${isFound ? 'found' : ''}`;
        card.innerHTML = `
            <div>
                <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-blue);">${ev.num}</div>
                <div style="font-weight: 500; color: #fff; margin-top: 2px;">${ev.title}</div>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: ${isFound ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
                ${isFound ? '✓ LOGGED' : 'PENDING'}
            </div>
        `;
        card.onclick = () => window.onInvestigateClue(key);
        container.appendChild(card);
    }

    const count = game.collectedEvidence.size;
    const progressEl = document.getElementById('case-file-progress');
    if (progressEl) progressEl.innerText = `${count} / 6 EVIDENCE FOUND`;
}

// ==========================================================================
// 20. JUMBLED MESSAGE PUZZLE
// ==========================================================================

window.openJumbledPuzzle = function() {
    renderJumbledPuzzle();
    document.getElementById('modal-jumbled-puzzle').style.display = 'flex';
    window.sound.playClick();
};

function renderJumbledPuzzle() {
    const slotsGrid = document.getElementById('puzzle-slots-grid');
    const wordBank = document.getElementById('puzzle-word-bank');
    slotsGrid.innerHTML = "";
    wordBank.innerHTML = "";

    // 5 Word Slots
    for (let i = 0; i < 5; i++) {
        const val = game.currentSlots[i];
        const slot = document.createElement('div');
        slot.className = `word-slot ${val ? 'filled' : ''}`;
        slot.innerText = val ? val : `SLOT ${i + 1}`;
        if (val) {
            slot.onclick = () => removeWordFromSlot(i);
        }
        slotsGrid.appendChild(slot);
    }

    // Word Bank
    GAME_DATA.jumbledPuzzle.scrambled.forEach((word) => {
        const isUsed = game.currentSlots.includes(word);
        const tile = document.createElement('div');
        tile.className = `word-tile ${isUsed ? 'used' : ''}`;
        tile.innerText = word;
        tile.onclick = () => placeWordInFirstSlot(word);
        wordBank.appendChild(tile);
    });

    checkJumbledSolution();
}

function placeWordInFirstSlot(word) {
    const emptyIndex = game.currentSlots.indexOf(null);
    if (emptyIndex !== -1) {
        game.currentSlots[emptyIndex] = word;
        window.sound.playSnap();
        renderJumbledPuzzle();
    }
}

function removeWordFromSlot(index) {
    game.currentSlots[index] = null;
    window.sound.playClick();
    renderJumbledPuzzle();
}

function checkJumbledSolution() {
    const sol = GAME_DATA.jumbledPuzzle.solution;
    const matches = game.currentSlots.every((val, i) => val === sol[i]);

    const resultBox = document.getElementById('puzzle-result-box');
    if (matches) {
        game.jumbledSolved = true;
        window.sound.playSuccess();
        if (resultBox) {
            resultBox.style.display = 'block';
            resultBox.innerHTML = `
                <div style="font-family: var(--font-mono); color: var(--accent-emerald); font-weight: 600; margin-bottom: 4px;">MESSAGE RECOVERED:</div>
                <div style="font-size: 1.15rem; color: #fff;">"THE DOOR WAS NEVER OPENED."</div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 6px;">
                    Deduction: If security telemetry confirms the blast door was never breached, how did Vikram die inside?
                </p>
            `;
        }
    } else {
        if (resultBox) resultBox.style.display = 'none';
    }
}

// ==========================================================================
// 22. ROUND 1 RECONSTRUCTION CONSOLE
// ==========================================================================

window.openReconstruction = function() {
    if (game.collectedEvidence.size < 6) {
        alert(`You must collect all 6 physical evidence items first. Currently: ${game.collectedEvidence.size}/6.`);
        return;
    }
    if (!game.jumbledSolved) {
        alert("Please solve the recovered message puzzle first.");
        return;
    }

    renderReconstructionForm();
    document.getElementById('modal-reconstruction').style.display = 'flex';
    window.sound.playClick();
};

function renderReconstructionForm() {
    for (let qKey of ['q1', 'q2', 'q3']) {
        const qData = GAME_DATA.reconstruction[qKey];
        const container = document.getElementById(`recon-options-${qKey}`);
        if (!container) continue;
        container.innerHTML = "";

        qData.options.forEach(opt => {
            const isSelected = game.reconAnswers[qKey] === opt.id;
            const div = document.createElement('div');
            div.className = `recon-option-item ${isSelected ? 'selected' : ''}`;
            div.innerHTML = `
                <div style="width: 16px; height: 16px; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    ${isSelected ? '<div style="width: 8px; height: 8px; background: var(--accent-blue); border-radius: 50%;"></div>' : ''}
                </div>
                <span>${opt.text}</span>
            `;
            div.onclick = () => {
                game.reconAnswers[qKey] = opt.id;
                window.sound.playClick();
                renderReconstructionForm();
            };
            container.appendChild(div);
        });
    }
}

window.submitReconstruction = function() {
    const { q1, q2, q3 } = game.reconAnswers;
    if (!q1 || !q2 || !q3) {
        alert("Please answer all three reconstruction questions.");
        return;
    }

    const isQ1Correct = GAME_DATA.reconstruction.q1.options.find(o => o.id === q1)?.correct;
    const isQ2Correct = GAME_DATA.reconstruction.q2.options.find(o => o.id === q2)?.correct;
    const isQ3Correct = GAME_DATA.reconstruction.q3.options.find(o => o.id === q3)?.correct;

    if (!isQ1Correct || !isQ2Correct || !isQ3Correct) {
        alert("DEDUCTION INCONSISTENCY: Your reconstruction does not match the physical evidence collected. Review the smartwatch flatline and the ventilation duct evidence.");
        return;
    }

    // SUCCESS: Complete Round 1
    closeModals();
    completeRound1();
};

// ==========================================================================
// 23. ROUND COMPLETION & DOOR UNLOCK CUTSCENE
// ==========================================================================

function completeRound1() {
    window.sound.playDoorClang();

    // Trigger physical 3D blast door opening animation
    window.scene3d.triggerDoorUnlockAnimation(() => {
        // Show Round 1 Complete screen
        const screen = document.getElementById('screen-round-complete');
        if (screen) screen.style.display = 'flex';
        window.sound.playSuccess();

        // Update Facility Map: Control Room unlocked
        const ctrlBtn = document.getElementById('map-btn-control');
        if (ctrlBtn) {
            ctrlBtn.classList.remove('locked');
            ctrlBtn.innerHTML = `<span>● CONTROL ROOM</span><span class="status-dot active"></span>`;
            ctrlBtn.onclick = () => window.startRound2Transition();
        }
    });
}

// ==========================================================================
// ROUND 2: THE DIGITAL TRAIL - CORE CONTROLLER
// ==========================================================================

window.startRound2Transition = function() {
    closeModals();
    document.getElementById('screen-round-complete').style.display = 'none';

    const transScreen = document.getElementById('screen-r2-transition');
    transScreen.style.display = 'flex';
    transScreen.style.opacity = '1';

    // Sound: fade lab sounds, start electronic server ambience
    window.sound.startServerAmbience();
    window.sound.playHeartbeat();

    // Progressively animate transition bar and enter control room
    let tProgress = 0;
    const bar = document.getElementById('r2-trans-bar');
    const transInterval = setInterval(() => {
        tProgress += 20;
        if (bar) bar.style.width = `${tProgress}%`;
        if (tProgress >= 100) {
            clearInterval(transInterval);
            setTimeout(() => {
                enterRound2ControlRoom();
            }, 600);
        }
    }, 400);
};

function enterRound2ControlRoom() {
    game.currentRound = 2;

    // Fade out transition screen
    const transScreen = document.getElementById('screen-r2-transition');
    transScreen.style.opacity = '0';
    setTimeout(() => {
        transScreen.style.display = 'none';
    }, 800);

    // Hide blurred lab background and build 3D Control Room scene
    const labBg = document.getElementById('lab-bg');
    if (labBg) labBg.style.display = 'none';

    window.scene3d.buildControlRoomScene();

    // Update HUD elements for Round 2
    document.querySelector('.hud-room-name').innerText = "ORION FACILITY // SECURITY CONTROL ROOM";
    document.querySelector('.objective-tag').innerText = "ROUND 02 OBJECTIVE";
    document.getElementById('hud-objective-text').innerText =
        "Determine which digital evidence can be trusted. Identify contradictions. Discover who is hiding information. (LYING ≠ MURDER).";

    // Update Facility Map buttons
    const labBtn = document.getElementById('map-btn-lab');
    const ctrlBtn = document.getElementById('map-btn-control');
    if (labBtn) {
        labBtn.classList.remove('active');
        labBtn.onclick = () => {
            alert("LABORATORY 9 is currently sealed by the forensic team. Continue your digital investigation in the Control Room.");
        };
    }
    if (ctrlBtn) {
        ctrlBtn.classList.add('active');
        ctrlBtn.classList.remove('locked');
    }

    const bottomBarActions = document.querySelector('#bottom-bar > div:last-child') || document.querySelector('.hud-bottom-bar > div:last-child');
    if (bottomBarActions) {
        bottomBarActions.innerHTML = `
            <button class="btn-secondary" onclick="window.openAccessLogsTerminal()">🖥 ACCESS LOGS</button>
            <button class="btn-secondary" onclick="window.openTechPuzzle()">🧩 TECHNICAL LOG</button>
            <button class="btn-secondary" onclick="window.openDeletedMessage()">📩 DELETED MSG</button>
            <button class="btn-primary" id="btn-digital-deduction" onclick="window.openRound2Deduction()">DIGITAL DEDUCTION</button>
        `;
    }

    // Update Case file count display
    updateR2CaseFileUI();

    // Auto-briefing fade
    setTimeout(() => {
        const hint = document.getElementById('controls-hint');
        if (hint) {
            hint.innerHTML = `
                [ E ] &nbsp; ACCESS CONTROL TERMINAL<br>
                [ TAB ] &nbsp; INVESTIGATION CASE FILE<br>
                ROUND 02: THE DIGITAL TRAIL
            `;
            hint.style.opacity = '1';
            setTimeout(() => { hint.style.opacity = '0'; }, 6000);
        }
    }, 1000);
}

// ==========================================================================
// ROUND 2: 3D INTERACTION ROUTING FOR TERMINALS
// ==========================================================================

const originalOnInvestigateClue = window.onInvestigateClue;
window.onInvestigateClue = function(clueId) {
    if (game.currentRound === 2) {
        window.sound.playKeypress();
        if (clueId === 'term_access') {
            window.openAccessLogsTerminal();
        } else if (clueId === 'term_suspects') {
            window.toggleSuspectsDossier();
        } else if (clueId === 'term_tech') {
            window.openTechPuzzle();
        } else if (clueId === 'term_comms') {
            window.openDeletedMessage();
        }
        return;
    }
    originalOnInvestigateClue(clueId);
};

// ==========================================================================
// ROUND 2: ACCESS LOGS TERMINAL CONTROLLER (ADMIN_01 DISCOVERY)
// ==========================================================================

window.openAccessLogsTerminal = function() {
    renderAccessLogsTable();
    document.getElementById('modal-access-logs').style.display = 'flex';
    window.sound.playKeypress();
};

function renderAccessLogsTable() {
    const tbody = document.getElementById('access-logs-tbody');
    if (!tbody || !GAME_DATA_R2.accessLogs) return;
    tbody.innerHTML = "";

    GAME_DATA_R2.accessLogs.forEach((log) => {
        const tr = document.createElement('tr');
        if (log.flagged) {
            tr.className = 'log-row-flagged';
        }
        tr.innerHTML = `
            <td style="font-family: var(--font-mono); font-weight: 600; color: ${log.flagged ? '#ef4444' : 'var(--accent-amber)'};">${log.time}</td>
            <td style="font-family: var(--font-mono); font-weight: 500;">${log.user}</td>
            <td>${log.location}</td>
            <td style="font-family: var(--font-mono); font-size: 0.78rem;">${log.system}</td>
            <td style="font-size: 0.82rem;">${log.action}</td>
            <td><button class="log-btn-inspect" onclick="window.inspectAccessLog('${log.id}')">INSPECT</button></td>
        `;
        tbody.appendChild(tr);
    });
}

window.inspectAccessLog = function(logId) {
    const log = GAME_DATA_R2.accessLogs.find(l => l.id === logId);
    if (!log) return;

    window.sound.playKeypress();

    const detailBox = document.getElementById('access-log-detail-box');
    const detailMeta = document.getElementById('detail-log-meta');
    const detailDesc = document.getElementById('detail-log-desc');

    if (detailBox && detailMeta && detailDesc) {
        detailBox.style.display = 'block';
        detailMeta.innerText = `LOG ${log.id.toUpperCase()} // ${log.time} // ${log.user} // ${log.system}`;
        detailDesc.innerText = log.details;
    }

    // If player inspects ADMIN_01 (log_05) -> Trigger Cinematic System Glitch Discovery!
    if (logId === 'log_05' && !game.r2AdminDiscovered) {
        game.r2AdminDiscovered = true;
        game.r2Evidence.add('admin_01');

        window.sound.playGlitch();

        // Brief cinematic camera push and monitor glitch
        window.scene3d.setCinematicCamera(0, 1.8, -1.8, 0, 1.4, -2.5);

        const banner = document.getElementById('admin-glitch-banner');
        if (banner) {
            banner.style.display = 'block';
        }

        updateR2CaseFileUI();
    }
};

// ==========================================================================
// ROUND 2: TECHNICAL EVENT RECONSTRUCTION PUZZLE (CAM-04 -> DOOR-02 -> SERVER-9 -> BIO-03)
// ==========================================================================

window.openTechPuzzle = function() {
    if (!game.r2TechSlots[0]) {
        // Initialize with default scrambled order
        game.r2TechSlots = [...GAME_DATA_R2.technicalPuzzle.events];
    }
    renderTechPuzzleSlots();
    document.getElementById('modal-tech-puzzle').style.display = 'flex';
    window.sound.playKeypress();
};

function renderTechPuzzleSlots() {
    const container = document.getElementById('tech-slots-container');
    if (!container) return;
    container.innerHTML = "";

    game.r2TechSlots.forEach((ev, idx) => {
        const card = document.createElement('div');
        card.className = 'tech-card-item';
        card.innerHTML = `
            <div>
                <span class="tech-card-code">${ev.code}</span>
                <span class="tech-card-time">[${ev.time}]</span>
                <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-blue); margin-left: 10px;">${ev.system}</span>
                <div class="tech-card-desc">${ev.description}</div>
            </div>
            <div class="tech-move-btns">
                <button class="tech-btn-arrow" onclick="window.moveTechCard(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
                <button class="tech-btn-arrow" onclick="window.moveTechCard(${idx}, 1)" ${idx === game.r2TechSlots.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
            </div>
        `;
        container.appendChild(card);
    });
}

window.moveTechCard = function(idx, direction) {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= game.r2TechSlots.length) return;

    window.sound.playSnap();
    const temp = game.r2TechSlots[idx];
    game.r2TechSlots[idx] = game.r2TechSlots[newIdx];
    game.r2TechSlots[newIdx] = temp;
    renderTechPuzzleSlots();
};

window.resetTechPuzzle = function() {
    game.r2TechSlots = [...GAME_DATA_R2.technicalPuzzle.events].reverse();
    renderTechPuzzleSlots();
    const status = document.getElementById('tech-puzzle-status');
    if (status) status.style.display = 'none';
};

window.verifyTechPuzzle = function() {
    const currentOrder = game.r2TechSlots.map(e => e.id);
    const correctOrder = GAME_DATA_R2.technicalPuzzle.solution;
    const isCorrect = currentOrder.every((val, index) => val === correctOrder[index]);

    const statusEl = document.getElementById('tech-puzzle-status');
    statusEl.style.display = 'block';

    if (isCorrect) {
        game.r2TechSolved = true;
        game.r2Evidence.add('r2_tech_puzzle');
        window.sound.playSuccess();

        statusEl.className = 'tech-status-notice tech-status-success';
        statusEl.innerHTML = `
            <strong>EVENT ORDER VERIFIED:</strong><br>
            CAM-04 (02:13:51) → DOOR-02 (02:14:02) → SERVER-9 (02:14:37) → BIO-03 (02:15:11)<br>
            <em>"Now determine what happened between these events: the camera was looped before the magnetic lock pulsed, followed by root server modification and sedative dissipation."</em>
        `;

        updateR2CaseFileUI();
    } else {
        window.sound.playGlitch();
        statusEl.className = 'tech-status-notice tech-status-error';
        statusEl.innerHTML = `
            <strong>SEQUENCE ERROR:</strong> The timestamps of the facility events do not form a forward chronological progression. Inspect the seconds digits closely.
        `;
    }
};

// ==========================================================================
// ROUND 2: DELETED COMMUNICATION RECOVERY
// ==========================================================================

window.openDeletedMessage = function() {
    const modal = document.getElementById('modal-deleted-message');
    modal.style.display = 'flex';
    window.sound.playKeypress();

    if (!game.r2DeletedMsgRecovered) {
        // Run cinematic recovery animation (47% -> 68% -> 89% -> 100%)
        const progressBox = document.getElementById('msg-recovery-progress');
        const contentBox = document.getElementById('msg-recovery-content');
        const percentEl = document.getElementById('recovery-percent');
        const barFill = document.getElementById('recovery-bar-fill');

        progressBox.style.display = 'block';
        contentBox.style.display = 'none';

        const stages = [47, 68, 89, 100];
        let sIdx = 0;
        const recInterval = setInterval(() => {
            sIdx++;
            if (sIdx < stages.length) {
                const p = stages[sIdx];
                if (percentEl) percentEl.innerText = `${p}%`;
                if (barFill) barFill.style.width = `${p}%`;
                window.sound.playKeypress();
            } else {
                clearInterval(recInterval);
                window.sound.playDecrypted();
                progressBox.style.display = 'none';
                contentBox.style.display = 'block';

                game.r2DeletedMsgRecovered = true;
                game.r2Evidence.add('r2_deleted_msg');
                updateR2CaseFileUI();
            }
        }, 550);
    } else {
        document.getElementById('msg-recovery-progress').style.display = 'none';
        document.getElementById('msg-recovery-content').style.display = 'block';
    }
};

// ==========================================================================
// ROUND 2: DEDUCTION CONSOLE
// ==========================================================================

window.openRound2Deduction = function() {
    window.closeModals();
    renderRound2DeductionForm();
    const modal = document.getElementById('modal-r2-deduction');
    if (modal) modal.style.display = 'flex';
    if (window.sound && window.sound.playClick) window.sound.playClick();
};

function renderRound2DeductionForm() {
    const data = window.GAME_DATA_R2 || (typeof GAME_DATA_R2 !== 'undefined' ? GAME_DATA_R2 : null);
    if (!data || !data.deduction) return;
    if (!game.r2DeductionAnswers) game.r2DeductionAnswers = { q1: null, q2: null, q3: null, q4: null };

    for (let qKey of ['q1', 'q2', 'q3', 'q4']) {
        const qData = data.deduction[qKey];
        if (!qData) continue;
        const container = document.getElementById(`r2-recon-${qKey}`);
        if (!container) continue;
        container.innerHTML = "";

        qData.options.forEach(opt => {
            const isSelected = game.r2DeductionAnswers && game.r2DeductionAnswers[qKey] === opt.id;
            const div = document.createElement('div');
            div.className = `recon-option-item ${isSelected ? 'selected' : ''}`;
            div.innerHTML = `
                <div style="font-family: var(--font-mono); font-size: 0.8rem; color: ${isSelected ? 'var(--accent-blue)' : 'var(--text-muted)'};">
                    [${opt.id.toUpperCase()}]
                </div>
                <div>${opt.text}</div>
            `;
            div.onclick = () => {
                if (!game.r2DeductionAnswers) game.r2DeductionAnswers = { q1: null, q2: null, q3: null, q4: null };
                game.r2DeductionAnswers[qKey] = opt.id;
                if (window.sound && window.sound.playClick) window.sound.playClick();
                renderRound2DeductionForm();
            };
            container.appendChild(div);
        });
    }
}

window.submitRound2Deduction = function() {
    const data = window.GAME_DATA_R2 || (typeof GAME_DATA_R2 !== 'undefined' ? GAME_DATA_R2 : null);
    if (!data || !data.deduction) return;
    if (!game.r2DeductionAnswers) game.r2DeductionAnswers = { q1: null, q2: null, q3: null, q4: null };
    const { q1, q2, q3, q4 } = game.r2DeductionAnswers;
    if (!q1 || !q2 || !q3 || !q4) {
        alert("Please answer all four digital deduction questions.");
        return;
    }

    const isQ1Correct = data.deduction.q1.options.find(o => o.id === q1)?.correct;
    const isQ2Correct = data.deduction.q2.options.find(o => o.id === q2)?.correct;
    const isQ3Correct = data.deduction.q3.options.find(o => o.id === q3)?.correct;
    const isQ4Correct = data.deduction.q4.options.find(o => o.id === q4)?.correct;

    if (!isQ1Correct || !isQ2Correct || !isQ3Correct || !isQ4Correct) {
        alert("DEDUCTION INCONSISTENCY: Review the ADMIN_01 root modification timestamp and remember: several suspects lied for reasons unrelated to the murder (LYING ≠ MURDER).");
        return;
    }

    // SUCCESS: Complete Round 2
    window.closeModals();
    completeRound2();
};

function completeRound2() {
    if (window.sound) {
        if (window.sound.stopServerAmbience) window.sound.stopServerAmbience();
        if (window.sound.playSuccess) window.sound.playSuccess();
    }

    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const screen = document.getElementById('screen-r2-complete');
    if (screen) {
        screen.style.display = 'flex';
    }
}

// Update Case File notebook to dynamically present both Round 1 & Round 2 evidence
function updateR2CaseFileUI() {
    if (game.currentRound !== 2) return;

    const count = game.r2Evidence.size;
    const hudBadge = document.getElementById('hud-evidence-count');
    if (hudBadge) {
        hudBadge.innerText = `${count} / 4 DIGITAL LOGS`;
    }

    const container = document.getElementById('case-file-list');
    if (!container) return;

    // In Round 2, show Round 1 physical verified summary + Round 2 digital files
    container.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-emerald); margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 4px;">
            [✓] ROUND 01 PHYSICAL EVIDENCE: 6/6 VERIFIED
        </div>
        <div class="evidence-item-card found">
            <div>
                <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-blue);">ACCESS LOG TELEMETRY</div>
                <div style="font-weight: 500; color: #fff;">${game.r2Evidence.has('admin_01') ? 'ADMIN_01 ROOT OVERRIDE DETECTED' : 'STANDARD ACCESS AUDIT'}</div>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: ${game.r2Evidence.has('admin_01') ? 'var(--accent-red)' : 'var(--accent-emerald)'};">
                ${game.r2Evidence.has('admin_01') ? '⚠ COMPROMISED' : 'REVIEWED'}
            </div>
        </div>
        <div class="evidence-item-card ${game.r2Evidence.has('r2_tech_puzzle') ? 'found' : ''}">
            <div>
                <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-blue);">TECHNICAL EVENT SEQUENCE</div>
                <div style="font-weight: 500; color: #fff;">CAM → DOOR → SERVER → BIO CHRONOLOGY</div>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: ${game.r2Evidence.has('r2_tech_puzzle') ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
                ${game.r2Evidence.has('r2_tech_puzzle') ? '✓ VERIFIED' : 'PENDING'}
            </div>
        </div>
        <div class="evidence-item-card ${game.r2Evidence.has('r2_deleted_msg') ? 'found' : ''}">
            <div>
                <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-blue);">RECOVERED SLACK SECTOR</div>
                <div style="font-weight: 500; color: #fff;">PROJECT 9 PREDICTION COMMUNICATION</div>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: ${game.r2Evidence.has('r2_deleted_msg') ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
                ${game.r2Evidence.has('r2_deleted_msg') ? '✓ DECRYPTED' : 'ENCRYPTED'}
            </div>
        </div>
    `;

    const prog = document.getElementById('case-file-progress');
    if (prog) {
        prog.innerText = `${count} / 3 CORE DIGITAL FINDINGS LOGGED`;
    }
}

// Enhance Suspect Dossier in Round 2 to reveal secrets and contradictions
const originalRenderSuspects = renderSuspectsDossier;
renderSuspectsDossier = function() {
    if (game.currentRound === 2 && window.GAME_DATA_R2) {
        const container = document.getElementById('suspects-container');
        if (!container) return;
        container.innerHTML = "";

        const suspects = Object.values(GAME_DATA_R2.suspectsDetailed);
        suspects.forEach(s => {
            const div = document.createElement('div');
            div.className = 'suspect-item';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <div class="suspect-name">${s.name}</div>
                    <span class="suspect-threat-badge threat-HIGH">${s.role}</span>
                </div>
                <div class="suspect-detail-row">
                    <span class="suspect-detail-label">OFFICIAL STATEMENT:</span><br>
                    <span style="font-style: italic; color: #f1f5f9;">${s.statement}</span>
                </div>
                <div style="margin-top: 10px; padding: 10px 12px; background: rgba(56, 189, 248, 0.06); border-left: 3px solid var(--accent-blue); border-radius: 3px;">
                    <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-amber); font-weight: 600;">
                        ${s.secretTitle}
                    </div>
                    <div style="font-size: 0.84rem; color: #cbd5e1; margin-top: 4px; line-height: 1.45;">
                        ${s.secretText}
                    </div>
                </div>
                <div style="margin-top: 6px; font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">
                    ANOMALY: ${s.contradictionHint}
                </div>
            `;
            container.appendChild(div);
        });
        return;
    }
    originalRenderSuspects();
};

// URL test query parameter handler
let _urlStepHandled = false;
function handleUrlTestStep() {
    if (_urlStepHandled) return;
    const params = new URLSearchParams(window.location.search);
    const step = params.get('step');
    if (!step) return;
    _urlStepHandled = true;

    const boot = document.getElementById('screen-boot');
    if (boot) boot.style.display = 'none';
    const reg = document.getElementById('screen-registration');
    if (reg) reg.style.display = 'none';

    if (step === 'cinema') {
        startCinematicMode();
    } else if (step === 'title') {
        finishCinematicMode();
    } else if (step === 'game') {
        window.enterCrimeScene();
    } else if (step === 'evidence') {
        window.enterCrimeScene();
        window.onInvestigateClue('laptop');
    } else if (step === 'casefile') {
        window.enterCrimeScene();
        window.toggleCaseFile();
    } else if (step === 'jumbled') {
        window.enterCrimeScene();
        window.openJumbledPuzzle();
    } else if (step === 'recon') {
        window.enterCrimeScene();
        for (let key in GAME_DATA.evidence) {
            game.collectedEvidence.add(key);
        }
        game.jumbledSolved = true;
        window.openReconstruction();
    } else if (step === 'complete') {
        window.enterCrimeScene();
        completeRound1();
    } else if (step === 'suspects') {
        window.enterCrimeScene();
        window.toggleSuspectsDossier();
    } else if (step === 'ghost') {
        window.enterCrimeScene();
        window.summonVikramGhost();
    } else if (step === 'round2' || step === 'r2') {
        // Direct jump to Round 2 Control Room
        enterRound2ControlRoom();
    } else if (step === 'r2logs') {
        enterRound2ControlRoom();
        window.openAccessLogsTerminal();
    } else if (step === 'r2tech') {
        enterRound2ControlRoom();
        window.openTechPuzzle();
    } else if (step === 'r2msg') {
        enterRound2ControlRoom();
        window.openDeletedMessage();
    } else if (step === 'r2recon') {
        enterRound2ControlRoom();
        window.openRound2Deduction();
    } else if (step === 'round3' || step === 'r3') {
        enterRound3Chamber();
    } else if (step === 'r3p9') {
        enterRound3Chamber();
        setTimeout(() => window.openR3Station('term_p9'), 600);
    } else if (step === 'r3eighth') {
        enterRound3Chamber();
        setTimeout(() => window.openR3Station('term_eighth'), 600);
    } else if (step === 'r3hidden') {
        enterRound3Chamber();
        setTimeout(() => window.openR3Station('term_hidden_ws'), 600);
    } else if (step === 'r3archive') {
        enterRound3Chamber();
        setTimeout(() => window.openR3Station('term_archive'), 600);
    } else if (step === 'r3accusation') {
        enterRound3Chamber();
        setTimeout(() => window.openFinalAccusation(), 600);
    } else if (step === 'r3reveal') {
        initR3State();
        // Pre-fill answers so Case Closed screen has content
        game.r3AccWho = 'Anika Rao';
        game.r3AccHow = 'how_a';
        game.r3AccWhy = 'why_a';
        hideAllScreens();
        const hudOverlay = document.getElementById('hud-overlay');
        if (hudOverlay) hudOverlay.style.display = 'none';
        window.runAnikaReveal();
    } else if (step === 'r3twist') {
        initR3State();
        game.r3AccWho = 'Anika Rao';
        game.r3AccHow = 'how_a';
        game.r3AccWhy = 'why_a';
        hideAllScreens();
        window.runP9Twist();
    } else if (step === 'r3complete') {
        initR3State();
        game.r3AccWho = 'Anika Rao';
        game.r3AccHow = 'how_a';
        game.r3AccWhy = 'why_a';
        hideAllScreens();
        window.showCaseClosedScreen();
    }
}
window.addEventListener('DOMContentLoaded', handleUrlTestStep);
window.addEventListener('load', handleUrlTestStep);



// ════════════════════════════════════════════════════════════════════════════
// ROUND 3 — THE FINAL DEDUCTION
// ════════════════════════════════════════════════════════════════════════════

// ── State fields (added to game object on entry) ────────────────────────────
function initR3State() {
    game.currentRound            = 3;
    game.r3Evidence              = game.r3Evidence              || new Set();
    game.r3StationsViewed        = game.r3StationsViewed        || new Set();
    game.r3ArchiveFile           = game.r3ArchiveFile           || null;
    game.r3AccWho                = game.r3AccWho                || null;
    game.r3AccHow                = game.r3AccHow                || null;
    game.r3AccWhy                = game.r3AccWhy                || null;
    game.r3AccEvidence           = game.r3AccEvidence           || new Set();
    game.r3VerifiedConnections   = game.r3VerifiedConnections   || new Set();
    game.r3SelectedNode          = null;
    game.r3PredictionHypothesis  = game.r3PredictionHypothesis  || null;
}

function hideAllScreens() {
    // Hide all .screen elements and known screen IDs (including HUD overlay)
    const toHide = [
        'screen-boot','screen-registration','screen-title-reveal',
        'screen-round-complete','screen-r2-transition','screen-r2-complete',
        'screen-r3-transition','screen-r3-reveal','screen-r3-p9twist','screen-r3-complete',
        'hud-overlay'
    ];
    toHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    document.querySelectorAll('.screen').forEach(s => { s.style.display = 'none'; });
}
window.hideAllScreens = hideAllScreens;

// ── TRANSITION ──────────────────────────────────────────────────────────────
window.startRound3Transition = function() {
    // Stop Round 2 ambience if playing
    if (window.sound && window.sound.stopServerAmbience) window.sound.stopServerAmbience();
    if (window.sound && window.sound.playClick) window.sound.playClick();
    window.closeModals();

    hideAllScreens();

    const trans = document.getElementById('screen-r3-transition');
    if (trans) trans.style.display = 'flex';

    const monitors = ['r3m1','r3m2','r3m3','r3m4'];
    const labels   = [
        'CASE 09',
        'THE SILENT SIGNAL',
        'ROUND 03',
        'THE FINAL DEDUCTION',
        'CONNECT THE EVIDENCE',
    ];

    // Fill monitors with active state
    monitors.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('off');
            el.textContent = ['DIGITAL TRAIL', 'CASE 09 ACTIVE', 'P9 CHAMBER UNLOCKED', 'FINAL DEDUCTION'][i];
        }
    });

    const labelEl = document.getElementById('r3TransLabel');

    let labelIdx = 0;
    function nextLabel() {
        if (!labelEl) return;
        labelEl.classList.remove('visible');
        setTimeout(() => {
            if (labelEl && labelIdx < labels.length) {
                labelEl.textContent = labels[labelIdx++];
                labelEl.classList.add('visible');
            }
        }, 400);
    }
    nextLabel();

    // Shut monitors off one by one
    monitors.forEach((id, i) => {
        setTimeout(() => {
            const m = document.getElementById(id);
            if (m) m.classList.add('off');
            if (i < labels.length - 1) nextLabel();
        }, 1200 + i * 700);
    });

    // After all monitors dark, pause, then enter chamber
    setTimeout(() => {
        enterRound3Chamber();
    }, 1200 + monitors.length * 700 + 1400);
};

window.enterRound3Chamber = enterRound3Chamber;

// ── ENTER P9 CHAMBER ────────────────────────────────────────────────────────
function enterRound3Chamber() {
    initR3State();
    window.closeModals();

    hideAllScreens();

    // Show the HUD overlay (same element used by R1 and R2)
    const hudOverlay = document.getElementById('hud-overlay');
    if (hudOverlay) hudOverlay.style.display = 'flex';

    // Hide lab background
    const labBg = document.getElementById('lab-bg');
    if (labBg) labBg.style.display = 'none';

    // Build P9 Chamber 3D scene safely
    try {
        if (window.scene3d && window.scene3d.buildP9ChamberScene) {
            window.scene3d.buildP9ChamberScene();
        }
    } catch(err) {
        console.warn("P9 Chamber 3D scene build notice:", err);
    }

    // Start P9 ambience safely
    try {
        if (window.sound && window.sound.startP9Ambience) window.sound.startP9Ambience();
    } catch(err) {}

    // Update HUD text elements
    const roomNameEl = document.querySelector('.hud-room-name');
    if (roomNameEl) roomNameEl.innerText = 'ORION FACILITY // PROJECT 9 CHAMBER — SECTOR 7';

    // Map buttons — lock both lab and control room, unlock chamber
    const labBtn = document.getElementById('map-btn-lab');
    if (labBtn) { labBtn.classList.remove('active'); }
    const ctrlBtn = document.getElementById('map-btn-control');
    if (ctrlBtn) { ctrlBtn.classList.remove('active'); }
    const chamberBtn = document.getElementById('map-btn-chamber');
    if (chamberBtn) { chamberBtn.classList.remove('locked'); chamberBtn.classList.add('active'); }

    // Update bottom toolbar with R3 buttons while preserving the objective box
    const bottomBar = document.getElementById('bottom-bar');
    if (bottomBar) {
        bottomBar.innerHTML = `
            <div class="hud-objective-box">
                <div class="objective-tag" style="color: #38bdf8; font-weight: 700; letter-spacing: 2px;">ROUND 03 OBJECTIVE // RESTRICTED ACCESS</div>
                <div class="objective-text" id="hud-objective-text" style="font-size: 0.88rem; line-height: 1.35; color: #f1f5f9;">
                    Investigate Project 9's restricted chamber. Connect the evidence. Determine who killed Dr. Vikram Sen.
                </div>
            </div>
            <div class="r3-bottom-bar" style="margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                <button class="r3-tool-btn" id="r3btn_p9"       onclick="window.openR3Station('term_p9')">▸ P9 PREDICTION</button>
                <button class="r3-tool-btn" id="r3btn_eighth"   onclick="window.openR3Station('term_eighth')">▸ EIGHTH SIGNATURE</button>
                <button class="r3-tool-btn" id="r3btn_hidden"   onclick="window.openR3Station('term_hidden_ws')">▸ HIDDEN WORKSTATION</button>
                <button class="r3-tool-btn" id="r3btn_archive"  onclick="window.openR3Station('term_archive')">▸ P9 ARCHIVE</button>
                <button class="r3-tool-btn" id="r3btn_anika"    onclick="window.openR3Station('term_anika_link')">▸ ANIKA CONNECTION</button>
                <button class="r3-tool-btn" id="r3btn_board"    onclick="window.openFinalEvidenceBoard()" style="border-color: #eab308; color: #eab308; background: rgba(234, 179, 8, 0.08);">🕸 EVIDENCE BOARD</button>
                <button class="r3-tool-btn" onclick="window.summonVikramGhost()">👻 GHOST</button>
                <button class="r3-accuse-btn" onclick="window.openFinalAccusation()">⚖ MAKE ACCUSATION</button>
            </div>`;
    }

    window.enterRound3Chamber = enterRound3Chamber;

    // Wire clue interaction to R3 station router
    window.onInvestigateClue = function(clueId) {
        window.openR3Station(clueId);
    };

    // Auto-fade controls hint
    setTimeout(() => {
        const hint = document.getElementById('controls-hint');
        if (hint) {
            hint.innerHTML = '[ E ] &nbsp; INVESTIGATE TERMINAL<br>[ TAB ] &nbsp; CASE FILE<br>ROUND 03: THE FINAL DEDUCTION';
            hint.style.opacity = '1';
            setTimeout(() => { hint.style.opacity = '0'; }, 6000);
        }
    }, 800);
}

// ── STATION ROUTER ───────────────────────────────────────────────────────────
// IMPORTANT: Only close the inline dynamic modal — preserve the evidence board
window.openR3Station = function(stationId) {
    // Close inline modals (both static and dynamic) — NOT the evidence board
    const dynModal    = document.getElementById('r3-dynamic-modal');
    if (dynModal)    dynModal.style.display    = 'none';
    const staticModal = document.getElementById('modal-r3-station');
    if (staticModal) staticModal.style.display = 'none';
    const accModal    = document.getElementById('modal-r3-accusation');
    if (accModal)    accModal.style.display    = 'none';
    if (window.sound) window.sound.playKeypress && window.sound.playKeypress();

    game.r3StationsViewed.add(stationId);

    // Mark toolbar button as unlocked
    const btnMap = {
        'term_p9':        'r3btn_p9',
        'term_eighth':    'r3btn_eighth',
        'term_hidden_ws': 'r3btn_hidden',
        'term_archive':   'r3btn_archive',
        'term_anika_link':'r3btn_anika',
        'term_board':     'r3btn_board',
    };
    if (btnMap[stationId]) {
        const btn = document.getElementById(btnMap[stationId]);
        if (btn) btn.classList.add('unlocked');
    }

    switch (stationId) {
        case 'term_p9':        openP9PredictionModal();         break;
        case 'term_eighth':    openEighthSignatureModal();      break;
        case 'term_hidden_ws': openHiddenWorkstationModal();    break;
        case 'term_archive':   openP9ArchiveModal();            break;
        case 'term_anika_link':openAnikaConnectionModal();      break;
        case 'term_board':     window.openFinalEvidenceBoard(); break;
    }
};

// ── STATION 1: P9 PREDICTION ─────────────────────────────────────────────────
function openP9PredictionModal() {
    const D = window.GAME_DATA_R3;
    if (!D) return;
    const p = D.p9Prediction;
    game.r3Evidence.add('ev_prediction');
    game.r3Evidence.add('ev_admin');

    const html = `
        <div class="r3-invest-card">
            <div class="r3-card-tag">STATION 01 — PROJECT 9 AUTONOMOUS SYSTEM // CLASSIFIED</div>
            <div class="r3-card-title">${p.record.predictionLabel}</div>
            <div class="r3-data-row"><span class="r3-data-label">SYSTEM ID</span><span class="r3-data-value">${p.systemId}</span></div>
            <div class="r3-data-row"><span class="r3-data-label">STATUS</span><span class="r3-data-value alert">${p.status}</span></div>
            <div class="r3-data-row"><span class="r3-data-label">LAST ACTIVE</span><span class="r3-data-value">${p.lastActive}</span></div>
            <div class="r3-data-row"><span class="r3-data-label">INCIDENT ID</span><span class="r3-data-value">${p.record.id}</span></div>
            <div class="r3-data-row"><span class="r3-data-label">SUBJECT</span><span class="r3-data-value">${p.record.subject}</span></div>
            <div class="r3-data-row"><span class="r3-data-label">PREDICTED EVENT TIME</span><span class="r3-data-value alert">${p.record.predictedEventTime}</span></div>
            <div class="r3-data-row"><span class="r3-data-label">ANALYSIS CREATED</span><span class="r3-data-value warn">${p.record.analysisCreated} — Hours before the incident.</span></div>
            <div class="r3-data-row"><span class="r3-data-label">CLASSIFIED BY</span><span class="r3-data-value">${p.record.classifiedBy}</span></div>
            <div class="p9-flagged-list">
                ${p.record.flaggedBehaviours.map(f => `
                    <div class="p9-flag-item">
                        <span class="p9-flag-tag">[${f.tag}]</span>
                        <span class="p9-flag-text">${f.text}</span>
                    </div>`).join('')}
            </div>
            <div class="p9-system-note">SYSTEM NOTE: ${p.record.systemNote}</div>
            <div class="r3-clue-box">&#9888; ${p.clue}</div>
            <div class="r3-deduction-prompt" style="margin-top:20px;padding:16px 20px;background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.25);border-radius:4px;">
                <div style="font-family:var(--font-mono);font-size:0.75rem;color:#38bdf8;font-weight:700;margin-bottom:8px;">PLAYER DEDUCTION MOMENT: A PREDICTION CREATED 6 HOURS BEFORE DEATH</div>
                <div style="font-size:0.82rem;color:#cbd5e1;margin-bottom:12px;line-height:1.4;">What does this prediction mean? Select your hypothesis:</div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <button id="hyp-p9-pred" onclick="window.selectP9Hypothesis('predicted')" style="flex:1;min-width:240px;padding:10px 14px;text-align:left;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.15);color:#e2e8f0;font-family:var(--font-mono);font-size:0.75rem;border-radius:3px;cursor:pointer;">[ A ] PROJECT 9 AUTONOMOUSLY PREDICTED THE MURDER</button>
                    <button id="hyp-p9-used" onclick="window.selectP9Hypothesis('used')" style="flex:1;min-width:240px;padding:10px 14px;text-align:left;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.15);color:#e2e8f0;font-family:var(--font-mono);font-size:0.75rem;border-radius:3px;cursor:pointer;">[ B ] SOMEONE WITH ADMIN_01 ACCESS USED PROJECT 9 TO PLAN THE MURDER</button>
                </div>
                <div id="hyp-feedback" style="font-family:var(--font-mono);font-size:0.72rem;color:#10b981;margin-top:10px;display:${game.r3PredictionHypothesis ? 'block' : 'none'};">&#10004; HYPOTHESIS RECORDED IN CASE FILE. CONTINUE INVESTIGATION.</div>
            </div>
        </div>`;

    showR3InlineModal('PROJECT 9 — INCIDENT PREDICTION LOG', html);
}

window.selectP9Hypothesis = function(hyp) {
    game.r3PredictionHypothesis = hyp;
    if (window.sound) window.sound.playKeypress && window.sound.playKeypress();
    const btnA = document.getElementById('hyp-p9-pred');
    const btnB = document.getElementById('hyp-p9-used');
    const fb   = document.getElementById('hyp-feedback');
    if (btnA) { btnA.style.borderColor = hyp === 'predicted' ? '#38bdf8' : 'rgba(255,255,255,0.15)'; btnA.style.background = hyp === 'predicted' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)'; }
    if (btnB) { btnB.style.borderColor = hyp === 'used'      ? '#38bdf8' : 'rgba(255,255,255,0.15)'; btnB.style.background = hyp === 'used'      ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)'; }
    if (fb)   fb.style.display = 'block';
};

// ── STATION 2: EIGHTH SIGNATURE ──────────────────────────────────────────────
function openEighthSignatureModal() {
    const D = window.GAME_DATA_R3;
    if (!D) return;
    const es = D.eighthSignature;
    game.r3Evidence.add('ev_eighthsig');
    if (window.sound && window.sound.playHeartbeatPulse) window.sound.playHeartbeatPulse();

    const rows = es.entries.map(e => `
        <tr class="${e.status.includes('ANOMALY') ? 'anomaly-row' : ''}">
            <td>${e.id.toUpperCase()}</td><td>${e.person}</td><td>${e.time}</td>
            <td class="${e.status.includes('ANOMALY') ? 'sig-status-bad' : 'sig-status-ok'}">${e.status}</td>
            <td style="font-size:0.68rem;color:var(--text-muted);">${e.note}</td>
        </tr>`).join('');

    const html = `
        <div class="r3-invest-card">
            <div class="r3-card-tag">STATION 02 — BIOMETRIC ACCESS SYSTEM // ANOMALY REPORT</div>
            <div class="r3-card-title">${es.title}</div>
            <div class="r3-data-row"><span class="r3-data-label">FACILITY ZONE</span><span class="r3-data-value">${es.facilityZone}</span></div>
            <div class="r3-data-row"><span class="r3-data-label">AUTHORISED USERS</span><span class="r3-data-value">${es.authorizedUsers}</span></div>
            <div class="r3-data-row"><span class="r3-data-label">SIGNATURES RECORDED</span><span class="r3-data-value alert">${es.totalSignatures} — ONE UNACCOUNTED FOR</span></div>
            <div class="r3-data-row"><span class="r3-data-label">REPORT GENERATED</span><span class="r3-data-value">${es.generated}</span></div>
            <table class="sig-table"><thead><tr><th>ID</th><th>PERSON</th><th>TIME</th><th>STATUS</th><th>NOTES</th></tr></thead><tbody>${rows}</tbody></table>
            <div class="r3-clue-box" style="margin-top:16px;">&#9888; ${es.anomalyNote}</div>
            <div class="r3-clue-box" style="margin-top:10px;border-color:#ef4444;background:rgba(239,68,68,0.05);">&#128269; ${es.clue}</div>
        </div>`;

    showR3InlineModal('BIOMETRIC ANOMALY — EIGHTH SIGNATURE', html);
}

// ── STATION 3: HIDDEN WORKSTATION ─────────────────────────────────────────────
function openHiddenWorkstationModal() {
    const D = window.GAME_DATA_R3;
    if (!D) return;
    const ws = D.hiddenWorkstation;
    game.r3Evidence.add('ev_hiddenws');
    game.r3Evidence.add('ev_admin');
    if (window.sound && window.sound.playMechanicalUnlock) window.sound.playMechanicalUnlock();

    const fileItems = ws.archiveFiles.map(f => `
        <div class="ws-file-item">
            <span class="ws-file-name">${f.label}</span>
            ${f.decryptable
                ? `<button class="ws-file-btn" onclick="window.openWorkstationFile('${f.id}')">DECRYPT</button>`
                : `<button class="ws-file-btn locked" disabled>&#128274; ${f.note || 'LOCKED'}</button>`}
        </div>`).join('');

    const html = `
        <div class="r3-invest-card">
            <div class="r3-card-tag">STATION 03 — HIDDEN WORKSTATION // NODE H-07</div>
            <div class="r3-card-title">${ws.title}</div>
            <div class="r3-data-row"><span class="r3-data-label">MAC ADDRESS</span><span class="r3-data-value">${ws.macAddress}</span></div>
            <div class="r3-data-row"><span class="r3-data-label">LAST LOGIN</span><span class="r3-data-value alert">${ws.lastLogin}</span></div>
            <div class="r3-data-row"><span class="r3-data-label">LAST ACTIVITY</span><span class="r3-data-value warn">${ws.lastActivity}</span></div>
            <div class="r3-data-row"><span class="r3-data-label">DISCOVERED BY</span><span class="r3-data-value">${ws.discoveredBy}</span></div>
            <div class="ws-file-list">${fileItems}</div>
            <div id="ws-file-content-area"></div>
            <div class="r3-clue-box" style="margin-top:16px;">&#9888; ${ws.clue}</div>
        </div>`;

    showR3InlineModal('HIDDEN WORKSTATION — DECRYPT FILES', html);
}

window.openWorkstationFile = function(fileId) {
    const D = window.GAME_DATA_R3;
    if (!D) return;
    const arcId = fileId.replace('ws_file_', 'arc_');
    const archiveEntry = D.p9Archive.find(a => a.id === arcId);
    if (!archiveEntry) return;
    if (window.sound && window.sound.playDecrypted) window.sound.playDecrypted();
    game.r3Evidence.add('ev_admin');
    const area = document.getElementById('ws-file-content-area');
    if (!area) return;
    area.innerHTML = `
        <div style="font-family:var(--font-mono);font-size:0.65rem;color:#38bdf8;margin:16px 0 6px;letter-spacing:0.15em;">DECRYPTING... ██████████ 100%</div>
        <div class="r3-card-title" style="font-size:0.9rem;margin-top:10px;">${archiveEntry.title}</div>
        <div class="ws-file-content">${archiveEntry.content}</div>`;
};

// ── STATION 4: P9 ARCHIVE ────────────────────────────────────────────────────
function openP9ArchiveModal() {
    const D = window.GAME_DATA_R3;
    if (!D) return;
    const files = D.p9Archive;
    game.r3Evidence.add('ev_p9decision');

    const fileList = files.map(f => `
        <div class="ws-file-item">
            <span class="ws-file-name">${f.filename}</span>
            <button class="ws-file-btn" onclick="window.openArchiveFile('${f.id}')">READ</button>
        </div>`).join('');

    const html = `
        <div class="r3-invest-card">
            <div class="r3-card-tag">STATION 04 — PROJECT 9 ARCHIVE // RECOVERED FILES</div>
            <div class="r3-card-title">PROJECT 9 DATA ARCHIVE — 6 FILES RECOVERED</div>
            <div class="ws-file-list">${fileList}</div>
            <div id="archive-content-area"></div>
        </div>`;

    showR3InlineModal('P9 ARCHIVE — RECOVERED DATA', html);
}

window.openArchiveFile = function(fileId) {
    const D = window.GAME_DATA_R3;
    if (!D) return;
    const f = D.p9Archive.find(x => x.id === fileId);
    if (!f) return;
    if (window.sound && window.sound.playDecrypted) window.sound.playDecrypted();
    game.r3Evidence.add('ev_p9msg');
    const area = document.getElementById('archive-content-area');
    if (!area) return;
    area.innerHTML = `
        <div class="r3-card-title" style="font-size:0.9rem;margin-top:18px;">${f.title}</div>
        <div class="ws-file-content">${f.content}</div>`;
};

// ── STATION 5: ANIKA CONNECTION ───────────────────────────────────────────────
function openAnikaConnectionModal() {
    const D = window.GAME_DATA_R3;
    if (!D) return;
    const ac = D.anikaConnection;
    game.r3Evidence.add('ev_statement');
    game.r3Evidence.add('ev_accesscard');
    game.r3Evidence.add('ev_motive');
    game.r3Evidence.add('ev_timeline');
    if (window.sound && window.sound.playGlitch) window.sound.playGlitch();

    const sections = ac.sections.map(s => `
        <div class="anika-conn-section">
            <div class="anika-conn-label-bar">
                <span>${s.label}</span>
                <span class="conn-flag ${s.flag}">${s.flag}</span>
            </div>
            <div class="anika-conn-content">${s.content}</div>
        </div>`).join('');

    const html = `
        <div class="r3-invest-card">
            <div class="r3-card-tag">STATION 05 — EVIDENCE COMPARISON // ANIKA RAO / ADMIN_01</div>
            <div class="r3-card-title">${ac.title}</div>
            ${sections}
            <div class="anika-conn-summary">&#9654; ${ac.summaryClue}</div>
        </div>`;

    showR3InlineModal('EVIDENCE COMPARISON — ANIKA RAO', html);
}

// ── STATION 6: FINAL EVIDENCE CONNECTION BOARD ────────────────────────────────
window.openFinalEvidenceBoard = function() {
    // Close both inline modal variants
    const dynModal    = document.getElementById('r3-dynamic-modal');
    if (dynModal)    dynModal.style.display    = 'none';
    const staticModal = document.getElementById('modal-r3-station');
    if (staticModal) staticModal.style.display = 'none';
    if (window.sound && window.sound.playKeypress) window.sound.playKeypress();

    game.r3StationsViewed.add('term_board');
    const btn = document.getElementById('r3btn_board');
    if (btn) btn.classList.add('unlocked');

    const modal = document.getElementById('modal-r3-evidence-board');
    if (!modal) return;
    modal.style.display = 'flex';
    // Use setTimeout so the modal is fully laid out before measuring dimensions
    setTimeout(() => window.switchBoardTab('web'), 80);
};

window.switchBoardTab = function(tab) {
    const tabWeb     = document.getElementById('boardTabWeb');
    const tabDossier = document.getElementById('boardTabDossier');
    const btnWeb     = document.getElementById('boardTabBtnWeb');
    const btnDossier = document.getElementById('boardTabBtnDossier');
    if (tab === 'web') {
        if (tabWeb)     tabWeb.style.display     = 'block';
        if (tabDossier) tabDossier.style.display = 'none';
        if (btnWeb)     btnWeb.classList.add('active');
        if (btnDossier) btnDossier.classList.remove('active');
        renderConnectionBoardWeb();
    } else {
        if (tabWeb)     tabWeb.style.display     = 'none';
        if (tabDossier) tabDossier.style.display = 'block';
        if (btnWeb)     btnWeb.classList.remove('active');
        if (btnDossier) btnDossier.classList.add('active');
    }
};

// ── EVIDENCE BOARD RENDER ─────────────────────────────────────────────────────
function renderConnectionBoardWeb() {
    const D = window.GAME_DATA_R3;
    if (!D) return;
    const nodes     = D.connectionNodes;
    const container = document.getElementById('boardNodesContainer');
    const svg       = document.getElementById('boardSvgLines');
    if (!container || !svg) return;

    container.innerHTML = '';
    nodes.forEach(n => {
        const el = document.createElement('div');
        el.className = 'board-node';
        // ── KEY FIX: use n.id directly as element ID (e.g. "node_anika")
        //    drawVerifiedConnectionLines() also looks up by n.id directly
        el.id = n.id;
        el.textContent = n.label;
        el.style.left        = (n.x / 750) * 100 + '%';
        el.style.top         = (n.y / 440) * 100 + '%';
        el.style.borderColor = n.color;
        el.style.color       = '#fff';
        if (game.r3SelectedNode === n.id) el.classList.add('selected');
        const isConn = [...(game.r3VerifiedConnections || [])].some(k => k === n.id || k.startsWith(n.id + '___') || k.endsWith('___' + n.id));
        if (isConn) el.classList.add('connected');
        el.onclick = () => window.onConnectionNodeClick(n.id);
        container.appendChild(el);
    });

    // Draw existing lines after DOM fully renders (setTimeout more reliable than rAF)
    setTimeout(() => {
        drawVerifiedConnectionLines();
        updateBoardStatus();
    }, 50);
}

// ── NODE CLICK: INSTANT LINE ON SECOND CLICK ──────────────────────────────────
window.onConnectionNodeClick = function(nodeId) {
    if (window.sound && window.sound.playKeypress) window.sound.playKeypress();

    if (!game.r3SelectedNode) {
        // First click — select this node
        game.r3SelectedNode = nodeId;
        const el = document.getElementById(nodeId);
        if (el) el.classList.add('selected');
        return;
    }

    if (game.r3SelectedNode === nodeId) {
        // Click same node — deselect
        const el = document.getElementById(nodeId);
        if (el) el.classList.remove('selected');
        game.r3SelectedNode = null;
        return;
    }

    // Second click on different node — attempt connection
    const nodeA = game.r3SelectedNode;
    const nodeB = nodeId;
    const elA = document.getElementById(nodeA);
    if (elA) elA.classList.remove('selected');
    game.r3SelectedNode = null;

    const D = window.GAME_DATA_R3;
    if (!D) return;

    const isRequired = D.requiredConnections.some(pair =>
        (pair[0] === nodeA && pair[1] === nodeB) ||
        (pair[0] === nodeB && pair[1] === nodeA)
    );

    const key = [nodeA, nodeB].sort().join('___');

    if (isRequired) {
        const isNew = !game.r3VerifiedConnections.has(key);
        game.r3VerifiedConnections.add(key);
        if (isNew && window.sound && window.sound.playEvidenceConnect) window.sound.playEvidenceConnect();
        // ── INSTANT draw — no setTimeout ──
        drawVerifiedConnectionLines();
        updateBoardStatus();
    } else {
        if (window.sound && window.sound.playGlitch) window.sound.playGlitch();
        const stat = document.getElementById('boardConnectionStatus');
        if (stat) {
            stat.innerHTML = '<span style="color:#ef4444;font-weight:700;">NO DIRECT CORRELATION FOUND BETWEEN THESE NODES</span>';
            setTimeout(updateBoardStatus, 1600);
        }
    }
};

// ── DRAW SVG LINES ────────────────────────────────────────────────────────────
// Uses offsetWidth/Height of the canvas container + node % positions.
// Avoids getBoundingClientRect() drift caused by modal scroll.
function drawVerifiedConnectionLines() {
    const svg       = document.getElementById('boardSvgLines');
    const container = document.getElementById('boardWebCanvasContainer');
    if (!svg || !container) return;

    const D = window.GAME_DATA_R3;
    if (!D) return;

    // Build nodeId → percentage center map
    const nodeMap = {};
    D.connectionNodes.forEach(n => {
        nodeMap[n.id] = { xPct: (n.x / 750) * 100, yPct: (n.y / 440) * 100 };
    });

    const W = container.offsetWidth  || 750;
    const H = container.offsetHeight || 440;

    // Ensure SVG matches container size
    svg.setAttribute('width',  W);
    svg.setAttribute('height', H);

    let svgHtml = '';
    game.r3VerifiedConnections.forEach(key => {
        const [idA, idB] = key.split('___');
        const nA = nodeMap[idA];
        const nB = nodeMap[idB];
        if (!nA || !nB) return;

        const x1 = (nA.xPct / 100) * W;
        const y1 = (nA.yPct / 100) * H;
        const x2 = (nB.xPct / 100) * W;
        const y2 = (nB.yPct / 100) * H;

        svgHtml += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
            stroke="#10b981" stroke-width="2.5" stroke-dasharray="6,4"
            style="filter:drop-shadow(0 0 5px #10b981);"/>`;

        // Mark as connected
        const elA = document.getElementById(idA);
        const elB = document.getElementById(idB);
        if (elA) elA.classList.add('connected');
        if (elB) elB.classList.add('connected');
    });

    svg.innerHTML = svgHtml;
}

// ── BOARD STATUS ──────────────────────────────────────────────────────────────
function updateBoardStatus() {
    const banner = document.getElementById('boardCompletionBanner');
    const stat   = document.getElementById('boardConnectionStatus');
    const count  = game.r3VerifiedConnections ? game.r3VerifiedConnections.size : 0;
    if (stat) {
        stat.innerHTML = `CONNECTIONS VERIFIED: <span id="boardConnCount" style="color:#10b981;font-weight:700;">${count}</span> / 6`;
    }
    if (count >= 4 && banner) banner.style.display = 'block';
}

// ── SHARED INLINE MODAL RENDERER ─────────────────────────────────────────────
function showR3InlineModal(title, bodyHtml) {
    // Try static modal first; fall back to dynamic creation if absent
    const staticModal = document.getElementById('modal-r3-station');
    const staticTitle = document.getElementById('r3StationModalTitle');
    const staticBody  = document.getElementById('r3StationModalBody');

    if (staticModal && staticTitle && staticBody) {
        staticTitle.textContent = title;
        staticBody.innerHTML    = bodyHtml;
        staticModal.style.cssText = 'display:flex;position:fixed;inset:0;z-index:2200;align-items:center;justify-content:center;background:rgba(0,0,0,0.88);padding:20px;overflow-y:auto;';
        return;
    }

    // Fallback: dynamic creation
    let modal = document.getElementById('r3-dynamic-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'r3-dynamic-modal';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:2200;align-items:center;justify-content:center;background:rgba(0,0,0,0.88);padding:20px;overflow-y:auto;';
        modal.innerHTML = `
            <div class="modal-panel" style="max-width:820px;width:100%;max-height:90vh;overflow-y:auto;position:relative;z-index:2201;">
                <div class="modal-header" style="position:sticky;top:0;z-index:10;background:var(--bg-panel);">
                    <span class="modal-icon">&#9672;</span>
                    <span id="r3DynModalTitle"></span>
                    <button class="modal-close-btn" onclick="document.getElementById('r3-dynamic-modal').style.display='none'">&#10005;</button>
                </div>
                <div class="modal-body" id="r3DynModalBody" style="padding:24px 28px;"></div>
            </div>`;
        document.body.appendChild(modal);
    }
    document.getElementById('r3DynModalTitle').textContent = title;
    document.getElementById('r3DynModalBody').innerHTML = bodyHtml;
    modal.style.display = 'flex';
}

// Close the static station modal
window.closeR3StationModal = function() {
    const m = document.getElementById('modal-r3-station');
    if (m) m.style.display = 'none';
    const d = document.getElementById('r3-dynamic-modal');
    if (d) d.style.display = 'none';
};

// ── FINAL ACCUSATION ─────────────────────────────────────────────────────────
window.openFinalAccusation = function() {
    // ── PREREQUISITE: at least 3 of the 5 stations must be visited ──
    const REQUIRED   = ['term_p9', 'term_eighth', 'term_hidden_ws', 'term_archive', 'term_anika_link'];
    const visited    = REQUIRED.filter(s => game.r3StationsViewed.has(s));
    const minVisit   = 3;
    if (visited.length < minVisit) {
        if (window.sound && window.sound.playGlitch) window.sound.playGlitch();
        const remaining = minVisit - visited.length;
        // Flash warning in HUD objective box
        const obj = document.getElementById('hud-objective-text');
        if (obj) {
            const saved = obj.innerHTML;
            obj.innerHTML = `<span style="color:#f59e0b;font-weight:700;font-family:var(--font-mono);">&#9888; INVESTIGATE AT LEAST ${remaining} MORE STATION(S) BEFORE MAKING YOUR ACCUSATION.</span>`;
            setTimeout(() => { if (obj) obj.innerHTML = saved; }, 3500);
        }
        // Flash accuse button border red
        const accBtn = document.querySelector('.r3-accuse-btn');
        if (accBtn) {
            accBtn.style.borderColor = '#ef4444';
            accBtn.style.color       = '#ef4444';
            setTimeout(() => { accBtn.style.borderColor = ''; accBtn.style.color = ''; }, 2000);
        }
        return;
    }

    // Close inline and board modals
    const dynModal   = document.getElementById('r3-dynamic-modal');
    if (dynModal)   dynModal.style.display   = 'none';
    const boardModal = document.getElementById('modal-r3-evidence-board');
    if (boardModal) boardModal.style.display = 'none';

    const D = window.GAME_DATA_R3;
    if (!D) return;
    const fa = D.finalAccusation;

    // WHO
    const whoGrid = document.getElementById('accWhoGrid');
    if (whoGrid) {
        whoGrid.innerHTML = fa.whoOptions.map(name => `
            <button class="acc-suspect-btn${game.r3AccWho === name ? ' selected' : ''}"
                    onclick="window.accSelectWho('${name}')">${name}</button>`).join('');
    }
    // HOW
    const howGrid = document.getElementById('accHowGrid');
    if (howGrid) {
        howGrid.innerHTML = fa.howOptions.map(h => `
            <button class="acc-option-btn${game.r3AccHow === h.id ? ' selected' : ''}"
                    onclick="window.accSelectHow('${h.id}',this)">${h.text}</button>`).join('');
    }
    // WHY
    const whyGrid = document.getElementById('accWhyGrid');
    if (whyGrid) {
        whyGrid.innerHTML = fa.whyOptions.map(w => `
            <button class="acc-option-btn${game.r3AccWhy === w.id ? ' selected' : ''}"
                    onclick="window.accSelectWhy('${w.id}',this)">${w.text}</button>`).join('');
    }
    // EVIDENCE
    const evGrid = document.getElementById('accEvidenceGrid');
    if (evGrid) {
        evGrid.innerHTML = fa.evidenceOptions.map(e => {
            const sel = game.r3AccEvidence.has(e.id);
            return `<div class="acc-ev-item${sel ? ' selected' : ''}" onclick="window.accToggleEvidence('${e.id}',this)">
                <span class="acc-ev-check">${sel ? '&#10003;' : ''}</span>
                <span>${e.text}</span>
            </div>`;
        }).join('');
    }

    const errEl = document.getElementById('r3AccError');
    if (errEl) { errEl.style.display = 'none'; errEl.innerHTML = ''; }

    const acc = document.getElementById('modal-r3-accusation');
    if (acc) acc.style.display = 'flex';
};

window.accSelectWho = function(name) {
    game.r3AccWho = name;
    document.querySelectorAll('.acc-suspect-btn').forEach(b => {
        b.classList.toggle('selected', b.textContent.trim() === name);
    });
};
window.accSelectHow = function(id, el) {
    game.r3AccHow = id;
    document.querySelectorAll('#accHowGrid .acc-option-btn').forEach(b => b.classList.remove('selected'));
    if (el) el.classList.add('selected');
};
window.accSelectWhy = function(id, el) {
    game.r3AccWhy = id;
    document.querySelectorAll('#accWhyGrid .acc-option-btn').forEach(b => b.classList.remove('selected'));
    if (el) el.classList.add('selected');
};
window.accToggleEvidence = function(id, el) {
    if (game.r3AccEvidence.has(id)) {
        game.r3AccEvidence.delete(id);
        if (el) { el.classList.remove('selected'); const c = el.querySelector('.acc-ev-check'); if (c) c.textContent = ''; }
    } else {
        game.r3AccEvidence.add(id);
        if (el) { el.classList.add('selected'); const c = el.querySelector('.acc-ev-check'); if (c) c.textContent = '\u2713'; }
    }
};

// ── SUBMIT FINAL ACCUSATION ───────────────────────────────────────────────────
window.submitFinalAccusation = function() {
    const D = window.GAME_DATA_R3;
    if (!D) return;
    const fa = D.finalAccusation;

    const errEl = document.getElementById('r3AccError');
    function showError(html) {
        if (!errEl) return;
        errEl.innerHTML = html;
        errEl.style.display = 'block';
        // Re-trigger shake animation
        errEl.style.animation = 'none';
        void errEl.offsetHeight; // reflow
        errEl.style.animation  = '';
        // Scroll the accusation panel to show the error
        setTimeout(() => {
            const panel = document.querySelector('#modal-r3-accusation .r3-accusation-panel');
            if (panel) {
                panel.scrollTop = panel.scrollHeight;
            } else {
                errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 60);
    }

    // Basic completeness checks
    if (!game.r3AccWho) {
        showError('<strong style="color:#ef4444;">&#9888; INCOMPLETE:</strong> You must name a suspect (WHO).'); return;
    }
    if (!game.r3AccHow) {
        showError('<strong style="color:#ef4444;">&#9888; INCOMPLETE:</strong> You must select a method (HOW).'); return;
    }
    if (!game.r3AccWhy) {
        showError('<strong style="color:#ef4444;">&#9888; INCOMPLETE:</strong> You must select a motive (WHY).'); return;
    }
    if (game.r3AccEvidence.size < fa.minEvidenceCount) {
        showError(`<strong style="color:#ef4444;">&#9888; INCOMPLETE:</strong> Select at least <strong>${fa.minEvidenceCount}</strong> evidence items.`); return;
    }

    // Evaluate
    const whoOk  = game.r3AccWho  === fa.correctWho;
    const howOk  = game.r3AccHow  === fa.correctHow;
    const whyOk  = game.r3AccWhy  === fa.correctWhy;
    const evHit  = fa.requiredEvidence.filter(e => game.r3AccEvidence.has(e));
    const evOk   = evHit.length >= Math.ceil(fa.requiredEvidence.length * 0.6);

    if (whoOk && howOk && whyOk && evOk) {
        // ─── CORRECT! ───────────────────────────────
        const acc = document.getElementById('modal-r3-accusation');
        if (acc) acc.style.display = 'none';
        runAnikaReveal();
    } else {
        // ─── WRONG — show specific feedback ─────────
        if (window.sound && window.sound.playGlitch) window.sound.playGlitch();
        let fb = `<div style="color:#ef4444;font-family:var(--font-mono);font-size:0.78rem;font-weight:700;margin-bottom:10px;letter-spacing:0.08em;">&#9888; ACCUSATION REJECTED — EVIDENCE CHAIN INSUFFICIENT</div>`;
        if (!whoOk) {
            fb += `<div style="margin-bottom:6px;">&#8226; <strong>SUSPECT:</strong> The person you named is not supported by the access logs and security telemetry. Re-examine all stations.</div>`;
        } else {
            fb += `<div style="margin-bottom:6px;color:#10b981;">&#8226; <strong>SUSPECT:</strong> Correct suspect — but your method, motive, or evidence is wrong.</div>`;
        }
        if (!howOk) fb += `<div style="margin-bottom:6px;">&#8226; <strong>METHOD:</strong> This contradicts the digital bypass records in Station 03.</div>`;
        if (!whyOk) fb += `<div style="margin-bottom:6px;">&#8226; <strong>MOTIVE:</strong> Unsupported by the Project 9 archive. Review Stations 04 &amp; 05.</div>`;
        if (!evOk)  fb += `<div style="margin-bottom:6px;">&#8226; <strong>EVIDENCE:</strong> You are missing critical items linking ADMIN_01 and the P9 chamber to the killer.</div>`;
        fb += `<div style="margin-top:10px;color:#94a3b8;font-size:0.72rem;font-family:var(--font-mono);">Review the Evidence Board, visit all stations, then re-submit.</div>`;
        showError(fb);
    }
};

// ── ANIKA REVEAL CINEMATIC ────────────────────────────────────────────────────
window.runAnikaReveal = function runAnikaReveal() {
    if (window.sound && window.sound.playCinematicImpact) window.sound.playCinematicImpact();
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    hideAllScreens();

    const revealScreen = document.getElementById('screen-r3-reveal');
    if (revealScreen) revealScreen.style.display = 'flex';

    const D = window.GAME_DATA_R3;
    if (!D) return;
    const beats     = D.r3Flashbacks || [];
    const container = document.getElementById('r3RevealContent');
    if (!container) return;

    container.innerHTML = `
        <div style="margin-bottom:28px;">
            <div style="font-family:var(--font-mono);font-size:0.8rem;letter-spacing:0.28em;color:#10b981;margin-bottom:10px;font-weight:700;">&#9733; ACCUSATION VERIFIED &#9733;</div>
            <div style="font-family:var(--font-heading);font-size:1.9rem;font-weight:800;color:#fff;letter-spacing:0.04em;">YOU WON — ANIKA RAO IS THE MURDERER</div>
        </div>
        <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.35);border-radius:6px;padding:18px 24px;margin-bottom:32px;text-align:left;font-family:var(--font-mono);font-size:0.8rem;line-height:1.9;">
            <div style="color:#ef4444;font-weight:700;border-bottom:1px solid rgba(239,68,68,0.2);padding-bottom:6px;margin-bottom:12px;letter-spacing:0.15em;">CASE RECORD // VERDICT CONFIRMED</div>
            <div><strong style="color:#94a3b8;">VICTIM:</strong> <span style="color:#fff;">Dr. Vikram Sen</span></div>
            <div><strong style="color:#94a3b8;">RESPONSIBLE:</strong> <span style="color:#ef4444;font-weight:700;">Anika Rao (Lead Researcher, Project 9)</span></div>
            <div><strong style="color:#94a3b8;">METHOD:</strong> <span style="color:#e2e8f0;">Used ADMIN_01 root authorization to bypass cameras and sealed chamber during blackout</span></div>
            <div><strong style="color:#94a3b8;">MOTIVE:</strong> <span style="color:#e2e8f0;">Prevent Vikram's shutdown order from terminating Project 9</span></div>
        </div>
    ` + beats.map(b => `
        <div class="r3-reveal-beat" id="r3beat${b.beat}">
            <div class="r3-reveal-time">${b.text}</div>
            <div class="r3-reveal-sub">${b.sub}</div>
        </div>`).join('') + `
        <div class="r3-reveal-verdict" id="r3Verdict">
            <div class="r3-reveal-verdict-label">THE INVESTIGATION CONCLUDES. THE EVIDENCE SPEAKS.</div>
            <div class="r3-reveal-verdict-name">ANIKA KILLED VIKRAM</div>
        </div>
        <button class="r3-reveal-continue-btn" id="r3RevealContinueBtn" onclick="window.runP9Twist()">
            WITNESS PROJECT 9'S FINAL MESSAGE &#8594;
        </button>`;

    // Animate beats sequentially
    beats.forEach((b, i) => {
        setTimeout(() => {
            const el = document.getElementById(`r3beat${b.beat}`);
            if (el) el.classList.add('visible');
        }, 600 + i * 1600);
    });

    const verdictDelay = 600 + beats.length * 1600 + 400;
    setTimeout(() => {
        const v = document.getElementById('r3Verdict');
        if (v) v.classList.add('visible');
        if (window.sound && window.sound.playCinematicImpact) window.sound.playCinematicImpact();
    }, verdictDelay);

    setTimeout(() => {
        const btn = document.getElementById('r3RevealContinueBtn');
        if (btn) btn.classList.add('visible');
    }, verdictDelay + 2000);
};

// ── PROJECT 9 TWIST TERMINAL ─────────────────────────────────────────────────
window.runP9Twist = function runP9Twist() {
    if (window.sound && window.sound.playP9Activate) window.sound.playP9Activate();
    hideAllScreens();

    const twistScreen = document.getElementById('screen-r3-p9twist');
    if (twistScreen) twistScreen.style.display = 'flex';

    const output      = document.getElementById('p9TwistOutput');
    const continueBtn = document.getElementById('p9TwistContinueBtn');
    if (!output) return;
    output.innerHTML = '';
    if (continueBtn) continueBtn.style.display = 'none';

    const D = window.GAME_DATA_R3;
    if (!D) return;
    const beats = D.p9TwistBeats || [];

    beats.forEach(b => {
        setTimeout(() => {
            const span = document.createElement('span');
            span.className = 'p9-twist-line';
            span.style.animationDelay = '0ms';
            span.textContent = b.line;
            output.appendChild(span);
            output.scrollTop = output.scrollHeight;
        }, b.delay);
    });

    if (beats.length > 0) {
        const lastDelay = beats[beats.length - 1].delay;
        setTimeout(() => {
            if (continueBtn) continueBtn.style.display = 'block';
        }, lastDelay + 2200);
    }
};

// ── CASE CLOSED SCREEN ───────────────────────────────────────────────────────
window.showCaseClosedScreen = function() {
    if (window.sound && window.sound.stopP9Ambience) window.sound.stopP9Ambience();
    hideAllScreens();

    const D  = window.GAME_DATA_R3;
    const fa = D ? D.finalAccusation : null;

    const closedWho = document.getElementById('closedWho');
    const closedHow = document.getElementById('closedHow');
    const closedWhy = document.getElementById('closedWhy');
    if (closedWho) closedWho.textContent = game.r3AccWho || 'Anika Rao';
    if (fa) {
        const howObj = fa.howOptions.find(h => h.id === game.r3AccHow);
        if (closedHow) closedHow.textContent = howObj ? howObj.text : '—';
        const whyObj = fa.whyOptions.find(w => w.id === game.r3AccWhy);
        if (closedWhy) closedWhy.textContent = whyObj ? whyObj.text : '—';
    }

    const complete = document.getElementById('screen-r3-complete');
    if (complete) complete.style.display = 'flex';
};

// ── VIKRAM GHOST — ROUND 3 BRANCH ────────────────────────────────────────────
(function() {
    const _origGhost = window.summonVikramGhost;
    window.summonVikramGhost = function() {
        if (game.currentRound !== 3) {
            if (_origGhost) _origGhost();
            return;
        }
        const ghostModal = document.getElementById('modal-ghost');
        if (!ghostModal) return;

        if ((game.ghostHintsUsed || 0) >= 5) {
            const speech = document.getElementById('ghost-speech-text');
            if (speech) speech.textContent = 'I have told you everything I can. The answer is in your hands now.';
            const uses = document.getElementById('ghost-uses-display');
            if (uses) uses.textContent = 'SPECTRAL MANIFESTATIONS REMAINING: 0 / 5';
            ghostModal.style.display = 'flex';
            return;
        }

        const D = window.GAME_DATA_R3;
        if (!D) return;
        const hints   = D.ghostHintsR3 || [];
        const hintIdx = Math.min(game.ghostHintsUsed || 0, hints.length - 1);
        game.ghostHintsUsed = (game.ghostHintsUsed || 0) + 1;

        const speech = document.getElementById('ghost-speech-text');
        const clue   = document.getElementById('ghost-actionable-clue');
        const uses   = document.getElementById('ghost-uses-display');
        if (speech) speech.textContent = `"${hints[hintIdx]}"`;
        if (clue)   clue.textContent   = 'DEDUCTION TARGET: Connect suspect, motive, digital records, and Project 9.';
        if (uses)   uses.textContent   = `SPECTRAL MANIFESTATIONS REMAINING: ${Math.max(0, 5 - game.ghostHintsUsed)} / 5`;
        ghostModal.style.display = 'flex';
    };
})();

// ── CLOSE MODALS — R3 extension ───────────────────────────────────────────────
(function() {
    const _origClose = window.closeModals;
    window.closeModals = function() {
        if (_origClose) _origClose();
        const r3Dyn     = document.getElementById('r3-dynamic-modal');
        if (r3Dyn)     r3Dyn.style.display     = 'none';
        const r3Station = document.getElementById('modal-r3-station');
        if (r3Station) r3Station.style.display  = 'none';
        const r3Board   = document.getElementById('modal-r3-evidence-board');
        if (r3Board)   r3Board.style.display    = 'none';
        const r3Acc     = document.getElementById('modal-r3-accusation');
        if (r3Acc)     r3Acc.style.display      = 'none';
        const ghost     = document.getElementById('modal-ghost');
        if (ghost)     ghost.style.display      = 'none';
    };
})();

