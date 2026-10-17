/**
 * THE LAST CASE - Case 09: The Silent Signal
 * Round 1: Master Cinematic Beats, Evidence Cards, Jumbled Puzzle & Reconstruction
 */

const GAME_DATA = {
    caseTitle: "THE LAST CASE",
    caseSub: "CASE 09: THE SILENT SIGNAL",
    roundTitle: "ROUND 01: THE CRIME SCENE",
    facility: "ORION RESEARCH FACILITY",

    // Cinematic Story Beats (Narrating the complete chronological story)
    cinematicBeats: [
        {
            id: "shot1",
            locationTag: "ORION RESEARCH FACILITY",
            timeTag: "MOUNTAIN PASS",
            speaker: "PROLOGUE // THE ARCHIVE",
            text: "Deep within a remote mountainous region stands the highly secured Orion Research Facility.",
            caption: "Dr. Vikram Sen and his team have been developing Project 9, an experimental AI designed to analyse human behaviour and predict decisions.",
            cameraView: "exterior",
            soundEffect: "rain_thunder"
        },
        {
            id: "shot2",
            locationTag: "CORE AI CHAMBER",
            timeTag: "THE CONCERN",
            speaker: "DR. VIKRAM SEN",
            text: "\"Project 9 is behaving in ways we no longer understand. It must be shut down.\"",
            caption: "Recently, Vikram became deeply concerned that Project 9 was exceeding its parameters. Six people closely connected to the project—Anika Rao, Rohan Kapoor, Meera Thomas, Arjun Malhotra, Kabir Shah, and Tara Sen—each had their own relationship with Vikram and Project 9.",
            cameraView: "vikram_intro",
            soundEffect: "click"
        },
        {
            id: "shot3",
            locationTag: "FACILITY INTERCOM",
            timeTag: "02:03 AM",
            speaker: "DR. VIKRAM SEN (BROADCAST)",
            text: "\"Stop working immediately. We have a security problem.\"",
            caption: "On the night of the incident, at 2:03 AM, Vikram ordered everyone to stop working and announced that there was a security problem across the facility.",
            cameraView: "intercom_alert",
            soundEffect: "click"
        },
        {
            id: "shot4",
            locationTag: "PERIMETER CONTAINMENT",
            timeTag: "02:08 AM",
            speaker: "AUTOMATED FACILITY PROTOCOL",
            text: "RESTRICTED MODE ACTIVATED",
            caption: "At 2:08 AM, the facility entered restricted mode. Heavy security bulkheads lowered and all internal sectors locked down.",
            cameraView: "doors_lock",
            soundEffect: "door_clang"
        },
        {
            id: "shot5",
            locationTag: "COMMUNICATION GRID",
            timeTag: "02:13 AM",
            speaker: "CENTRAL RELAY",
            text: "EXTERNAL COMMUNICATION DISAPPEARED",
            caption: "At 2:13 AM, external communication suddenly disappeared. All satellite, internet, and radio relays fell dead silent.",
            cameraView: "blackout",
            soundEffect: "static"
        },
        {
            id: "shot6",
            locationTag: "FACILITY MONITORS",
            timeTag: "02:14 AM",
            speaker: "NETWORK OVERRIDE",
            text: "\"PROJECT 9 HAS BEEN COMPROMISED.\"",
            caption: "At 2:14 AM, every screen in the facility flashed identical black screens with that ominous message. Communication returned exactly one minute later.",
            cameraView: "compromised",
            soundEffect: "click"
        },
        {
            id: "shot7",
            locationTag: "PROJECT 9 LABORATORY",
            timeTag: "02:19 AM",
            speaker: "FACILITY TELEMETRY",
            text: "STATUS: LOCKED // ENTRY RECORD: NONE",
            caption: "At 2:19 AM, Vikram was discovered dead inside the locked Project 9 laboratory. There was no sign of forced entry, and the security system claimed that nobody had entered the room.",
            cameraView: "corridor_door",
            soundEffect: "heartbeat"
        },
        {
            id: "shot8",
            locationTag: "VIKRAM'S TERMINAL",
            timeTag: "FINAL LOG",
            speaker: "VIKRAM'S LAST WARNING",
            text: "\"If I am wrong, destroy Project 9. If I am right, don't trust the system.\"",
            caption: "Before his death, Vikram had left this disturbing warning. Now, the investigators are being brought into Orion Research Facility to determine what really happened that night...",
            cameraView: "compromised",
            soundEffect: "heartbeat"
        }
    ],

    // Round 1 Physical Evidence (Clean, Professional Cards)
    evidence: {
        laptop: {
            id: "laptop",
            num: "EVIDENCE 01",
            title: "VIKRAM'S LAPTOP",
            status: "ACTIVE",
            lastActivity: "02:14 AM",
            significance: "Terminal logs confirm system activity continued uninterrupted during the communication blackout.",
            details: "Command prompt shows an incomplete script: 'EXECUTE FORCE_PURGE_P9.SH'. The confirm keystroke was never sent.",
            collected: false
        },
        accessCard: {
            id: "accessCard",
            num: "EVIDENCE 02",
            title: "MASTER SECURITY CARD",
            status: "THERMAL DAMAGE",
            lastActivity: "02:08 AM",
            significance: "Found on the threshold. Micro-antenna coil shows high localized electromagnetic induction heating.",
            details: "Suggests an inductive override or frequency scrambler was active near the doorway during containment.",
            collected: false
        },
        brokenGlass: {
            id: "brokenGlass",
            num: "EVIDENCE 03",
            title: "SHATTERED CHEMICAL VIAL",
            status: "RESIDUE DETECTED",
            lastActivity: "ESTIMATED 02:14 AM",
            significance: "Located directly beneath the ceiling ventilation intake grill.",
            details: "Spectrometry confirms aerosolized Isoflurane-X sedative residue. The ventilation duct grill above was unscrewed.",
            collected: false
        },
        smartwatch: {
            id: "smartwatch",
            num: "EVIDENCE 04",
            title: "VIKRAM'S SMARTWATCH",
            status: "TIME TAMPERED",
            lastActivity: "FLATLINE 02:14:40 AM",
            significance: "Display face is frozen at 02:24 AM, but internal biometric sensor flatline occurred at 02:14:40 AM.",
            details: "Proves the physical watch hands were manually forwarded to falsify the estimated time of death.",
            collected: false
        },
        usbDevice: {
            id: "usbDevice",
            num: "EVIDENCE 05",
            title: "ENCRYPTED USB TOKEN",
            status: "DUAL-KEY PROTECTED",
            lastActivity: "01:45 AM",
            significance: "Found in Vikram's coat pocket labeled 'P9_EMERGENCY_ISOLATION_KEY_01'.",
            details: "Requires Key 01 (Vikram) and Key 02 (assigned to Lead AI Researcher Anika Rao) to lock down the core.",
            collected: false
        },
        note: {
            id: "note",
            num: "EVIDENCE 06",
            title: "HANDWRITTEN NOTE",
            status: "ORIGINAL SCRIPT",
            lastActivity: "RECENT",
            significance: "Tucked beneath the keyboard in Vikram's distinctive, hurried handwriting.",
            details: "\"If I am wrong, destroy Project 9.\nIf I am right, don't trust the system.\"",
            collected: false
        }
    },

    // Jumbled Message Puzzle
    jumbledPuzzle: {
        scrambled: ["OPENED", "THE", "DOOR", "WAS", "NEVER"],
        solution: ["THE", "DOOR", "WAS", "NEVER", "OPENED"],
        solvedText: "THE DOOR WAS NEVER OPENED.",
        solved: false
    },

    // Round 1 Reconstruction Questions
    reconstruction: {
        q1: {
            prompt: "1. What actually happened during the 02:13 blackout window?",
            options: [
                { id: "a", text: "An outside intruder forced the exterior facility gates." },
                { id: "b", text: "An internal environmental override took place through the ventilation system.", correct: true },
                { id: "c", text: "An accidental geothermal electrical short caused equipment failure." }
            ]
        },
        q2: {
            prompt: "2. Which evidence suggests the official 02:19 timeline is falsified?",
            options: [
                { id: "a", text: "EVIDENCE 06: The handwritten warning note." },
                { id: "b", text: "EVIDENCE 04: Vikram's Smartwatch flatline occurred at 02:14:40 AM.", correct: true },
                { id: "c", text: "EVIDENCE 05: The dual-key USB token." }
            ]
        },
        q3: {
            prompt: "3. What is currently the central locked-room mystery?",
            options: [
                { id: "a", text: "Who took the laboratory spare keys from reception." },
                { id: "b", text: "How Vikram died inside when security logs prove the door was never opened.", correct: true },
                { id: "c", text: "Why the external internet lines were disconnected." }
            ]
        }
    },

    // Suspects Roster for the Orion Facility Case (Matching the 6 exact suspects)
    suspects: [
        {
            id: "anika",
            name: "Anika Rao",
            role: "Lead AI Researcher",
            motive: "Fiercely defended Project 9's behavioral learning algorithm against Vikram's planned shutdown; holds Key 02.",
            alibi: "Claims she was monitoring workstation telemetry in the AI chamber during the 02:13 blackout.",
            threatLevel: "HIGH",
            status: "PERSON OF INTEREST"
        },
        {
            id: "rohan",
            name: "Rohan Kapoor",
            role: "Chief of Facility Security",
            motive: "Responsible for surveillance systems, automated blast doors, and restricted mode protocols.",
            alibi: "Reported checking security override consoles on Level 2 when external communications dropped.",
            threatLevel: "CRITICAL",
            status: "UNDER INVESTIGATION"
        },
        {
            id: "meera",
            name: "Meera Thomas",
            role: "Chief Systems Architect",
            motive: "Designed Project 9's cognitive core. Clashed with Vikram over unauthorized autonomy patches.",
            alibi: "Stated she was debugging network sensor logs in Sub-Level 3 during the blackout and warning.",
            threatLevel: "MEDIUM",
            status: "PERSON OF INTEREST"
        },
        {
            id: "arjun",
            name: "Arjun Malhotra",
            role: "Head of Infrastructure & Power",
            motive: "Total authority over environmental ventilation shafts, power routing, and automated containment.",
            alibi: "Claims he was handling power oscillations in the substation when external communication dropped.",
            threatLevel: "HIGH",
            status: "PERSON OF INTEREST"
        },
        {
            id: "kabir",
            name: "Kabir Shah",
            role: "Hardware Systems Specialist",
            motive: "Fabricated the inductive door modules and frequency scramblers. Opposed ending the hardware trial.",
            alibi: "Asserts he was alone in the hardware lab inspecting comms antennas throughout the incident.",
            threatLevel: "MEDIUM",
            status: "PERSON OF INTEREST"
        },
        {
            id: "tara",
            name: "Tara Sen",
            role: "Senior Operations Director",
            motive: "Faced financial fallout if Project 9 was terminated. She was the first person to reach Vikram's door.",
            alibi: "Discovered the locked laboratory door at 02:19 AM and triggered the facility-wide alarm.",
            threatLevel: "CRITICAL",
            status: "UNDER INVESTIGATION"
        }
    ]
};

window.GAME_DATA = GAME_DATA;
