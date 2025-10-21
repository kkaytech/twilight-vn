let gameState = {
    scene: "intro",
    affinityEdward: 0,
    affinityJacob: 0
};

let musicPlaying = false;
const backgroundMusic = document.getElementById('background-music');
backgroundMusic.volume = 0.5;

// Base64 encoded placeholder images for the game
const placeholderImages = {
    forest_intro: 'images-vn/forest_intro.jpg',
    hallway: 'images-vn/hallway.jpg',
    jacob: 'images-vn/jacob.jpg',
    la_push: 'images-vn/la_push.jpg',
    jacob_smile: 'images-vn/jacob_smile.jpg',
    forest_path: 'images-vn/forest_path.jpg',
    wolf: 'images-vn/wolf.jpg',
    jacob_angry: 'images-vn/jacob_angry.jpg',
    smile_jb: 'images-vn/smile_jb.jpg',
    jacob_hug: 'images-vn/jacob_hug.jpg',
    edward: 'images-vn/edward.jpg',
    edward_topaz: 'images-vn/edward_topaz.jpg',
    vampire: 'images-vn/vampire.jpg',
    edward_meadow: 'images-vn/edward_meadow.jpg',
    meadow_sparkle: 'images-vn/meadow_sparkle.jpg',
    edward_talk_forest: 'images-vn/edward_talk_forest.jpg',
    love_edward: 'images-vn/love_edward.jpg',
    Forks_High_School: 'images-vn/Forks_High_School.jpg',
    forksmist: 'images-vn/forksmist.jpg',
    edward_talk: 'images-vn/edward_talk.jpg',
    jacob_explain: 'images-vn/jacob_explain.jpg',
    bella_alone: 'images-vn/bella_alone.jpg',
    edward_ending: 'images-vn/edward_ending.jpg',
    jb_ending: 'images-vn/jb_ending.jpg',
    edward_close: 'images-vn/edward_close.jpg',
    library: 'images-vn/library.jpg',
};

function toggleMusic() {
    const musicToggle = document.getElementById('music-toggle');
    if (musicPlaying) {
        backgroundMusic.pause();
        musicToggle.textContent = '🔇 Music Off';
        musicPlaying = false;
    } else {
        backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
        musicToggle.textContent = '🔊 Music On';
        musicPlaying = true;
    }
}

function startGame() {
    console.log("Game starting...");
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("scene").classList.remove("hidden");
    
    // Start music after user interaction
    if (!musicPlaying) {
        backgroundMusic.play().catch(e => {
            console.log('Music play failed on start');
        });
    }
    
    updateAffinityMeter();
    showScene("intro");
}

function restartGame() {
    gameState = { scene: "intro", affinityEdward: 0, affinityJacob: 0 };
    document.getElementById("ending-screen").classList.add("hidden");
    document.getElementById("scene").classList.remove("hidden");
    updateAffinityMeter();
    showScene("intro");
}

function updateAffinityMeter() {
    const totalAffinity = gameState.affinityEdward + gameState.affinityJacob;
    const edwardPercent = totalAffinity > 0 ? (gameState.affinityEdward / totalAffinity) * 100 : 0;
    const jacobPercent = totalAffinity > 0 ? (gameState.affinityJacob / totalAffinity) * 100 : 0;
    
    document.getElementById("edward-fill").style.width = `${edwardPercent}%`;
    document.getElementById("jacob-fill").style.width = `${jacobPercent}%`;
}

let skipTyping = false;
let currentTypingTimeout = null;

function typeText(text, element, callback) {
    element.innerHTML = "";
    let i = 0;
    skipTyping = false;
    
    // Create cursor
    const cursor = document.createElement("span");
    cursor.className = "typing-cursor";
    element.appendChild(cursor);
    
    // Create spacebar skip indicator
    const skipIndicator = document.createElement("div");
    skipIndicator.className = "skip-indicator";
    skipIndicator.innerHTML = "Press SPACE to skip";
    
    // Add skip indicator to dialogue box
    const dialogueBox = document.getElementById('dialogue-box');
    dialogueBox.appendChild(skipIndicator);
    
    function typing() {
        if (skipTyping) {
            // Skip to end immediately
            cleanup();
            element.innerHTML = text;
            if (callback) callback();
            return;
        }
        
        if (i < text.length) {
            // Replace cursor with character
            element.removeChild(cursor);
            element.innerHTML += text.charAt(i);
            element.appendChild(cursor);
            i++;
            currentTypingTimeout = setTimeout(typing, 30);
        } else if (callback) {
            // Remove cursor when done
            cleanup();
            callback();
        }
    }
    
    function handleSkip() {
        skipTyping = true;
        cleanup();
        element.innerHTML = text;
        if (callback) callback();
    }
    
    function cleanup() {
        if (cursor.parentNode === element) {
            element.removeChild(cursor);
        }
        if (skipIndicator.parentNode === dialogueBox) {
            dialogueBox.removeChild(skipIndicator);
        }
        if (currentTypingTimeout) {
            clearTimeout(currentTypingTimeout);
            currentTypingTimeout = null;
        }
        // Remove event listeners
        document.removeEventListener('keydown', handleKeyPress);
        skipIndicator.removeEventListener('click', handleSkip);
        element.removeEventListener('click', handleSkip);
    }
    
    function handleKeyPress(event) {
        if (event.code === 'Space') {
            event.preventDefault(); // Prevent scrolling with spacebar
            handleSkip();
        }
    }
    
    // Add event listeners for skipping
    document.addEventListener('keydown', handleKeyPress);
    skipIndicator.addEventListener('click', handleSkip);
    element.addEventListener('click', handleSkip);
    
    typing();
}

function showScene(sceneKey) {
    console.log("Showing scene:", sceneKey);
    const dialogueEl = document.getElementById("dialogue");
    const choicesEl = document.getElementById("choices");
    const backgroundEl = document.getElementById("background");
    const characterEl = document.getElementById("character");

    // Clear previous choices immediately
    choicesEl.innerHTML = "";
    
    let sceneData = scenes[sceneKey];
    
    if (!sceneData) {
        console.error("Scene not found:", sceneKey);
        showEnding();
        return;
    }

    // Check if this is an ending scene
    if (sceneKey.startsWith("ending")) {
        showProfessionalEnding(sceneKey);
        return;
    }

    // Update background
    const bgImage = sceneData.bg.startsWith('images-vn/') ? 
        placeholderImages[sceneData.bg.replace('images-vn/', '').replace('.jpg', '')] || sceneData.bg : 
        sceneData.bg;
    backgroundEl.style.backgroundImage = `url('${bgImage}')`;
    backgroundEl.style.backgroundSize = "cover";
    
    characterEl.style.backgroundImage = sceneData.char ? `url('${sceneData.char}')` : "none";

    // Typewriter effect
    typeText(sceneData.text, dialogueEl, () => {
        console.log("Creating buttons for choices:", sceneData.choices);
        
        // Create choice buttons
        sceneData.choices.forEach(choice => {
            let btn = document.createElement("button");
            btn.innerText = choice.text;
            btn.onclick = () => {
                console.log("Choice clicked:", choice.text, "Next scene:", choice.next);
                if (choice.affinity) {
                    gameState[choice.affinity] += 1;
                    updateAffinityMeter();
                }
                showScene(choice.next);
            };
            choicesEl.appendChild(btn);
        });
    });
}

function showProfessionalEnding(endingType) {
    console.log("Showing professional ending:", endingType);
    
    // Hide the normal scene and show ending screen
    document.getElementById("scene").classList.add("hidden");
    document.getElementById("ending-screen").classList.remove("hidden");
    
    let endingTitle = "";
    let endingText = "";
    let endingImage = "";

    switch(endingType) {
        case "endingEdward":
            endingTitle = "Eternal Love";
            endingText = "You chose Edward Cullen and the immortal world of vampires. As he slips his mother's ring onto your finger, you feel the cold certainty of eternity settle around you. 'Forever,' he whispers, his topaz eyes holding centuries of loneliness finally fulfilled. Your human life fades like a dream as you embrace the dangerous, beautiful existence of the undead. Together, you'll walk through time itself, your love story etched in the stars above Forks for all eternity.";
            endingImage = "images-vn/ending_edward.jpg";
            break;
            
        case "endingJacob":
            endingTitle = "Wild Heart";
            endingText = "You chose Jacob Black and the warm, living world of the Quileute pack. As he pulls you into his embrace, you feel the steady beat of his heart against yours - strong, human, real. 'You're my imprint,' he murmurs, his warmth chasing away the Forks chill. The forest becomes your sanctuary, his laughter your home. In the heat of his love, you find a passion as wild and enduring as the ancient trees of La Push.";
            endingImage = "images-vn/ending_jacob.jpg";
            break;
            
        case "endingAlone":
            endingTitle = "Independent Spirit";
            endingText = "You chose to walk your own path, preserving your humanity in a town torn between vampires and werewolves. The rain washes away the memories of both supernatural loves as you find strength in your own choices. Sometimes the bravest destiny is the one you forge yourself, away from ancient rivalries and eternal dangers. Under the perpetual gray sky of Forks, you discover that your own heart is territory worth protecting.";
            endingImage = "images-vn/ending_alone.jpg";
            break;
    }

    // Update ending screen content
    document.getElementById("ending-title").textContent = endingTitle;
    document.getElementById("ending-text").textContent = endingText;
    
    // Set background image for ending screen
    const endingBg = document.getElementById("ending-screen");
    const bgImage = placeholderImages[endingImage.replace('images-vn/', '').replace('.jpg', '')] || endingImage;
    endingBg.style.backgroundImage = `linear-gradient(rgba(4, 20, 12, 0.9), rgba(8, 35, 22, 0.95)), url('${bgImage}')`;
}

// Initialize music when page loads
document.addEventListener('DOMContentLoaded', function() {
    backgroundMusic.volume = 0.5;
});

// STORYLINE
const scenes = {
  // ----- INTRO -----
  intro: {
    text: "The rain never stops in Forks, Washington. You've just moved from sunny Arizona to this perpetually gray town. As you step out of the police cruiser, the damp chill seeps into your bones. This small town holds secrets you can't yet imagine...",
    bg: "images-vn/forest_intro.jpg",
    char: null,
    choices: [
      { text: "Head to Forks High School", next: "schoolArrival" },
      { text: "Explore the forest behind your house", next: "forestEntrance" }
    ]
  },

  // ----- SCHOOL PATH -----
  schoolArrival: {
    text: "Forks High School feels alien. Students stare at the new girl. In the hallway, you notice two very different people: a warm, smiling boy with dark hair, and a pale, beautiful boy who watches you intensely.",
    bg: "images-vn/hallway.jpg",
    char: null,
    choices: [
      { text: "Approach the friendly-looking boy", next: "jacobIntro" },
      { text: "Meet the gaze of the pale boy", next: "edwardIntro" }
    ]
  },

  // ----- JACOB PATH -----
  jacobIntro: {
    text: "The boy with dark hair smiles warmly. 'You must be Bella! I'm Jacob Black - my dad and yours are friends.' His energy is a welcome contrast to the gloomy weather.",
    bg: "images-vn/jacob.jpg",
    char: null,
    choices: [
      { text: "Sit with Jacob at lunch", next: "jacobLunch", affinity: "affinityJacob" },
      { text: "Politely excuse yourself", next: "libraryAlone" }
    ]
  },

  jacobLunch: {
    text: "Jacob introduces you to his friends. They talk about beaches, hiking, and local legends. You feel surprisingly comfortable with them.",
    bg: "images-vn/la_push.jpg",
    char: null,
    choices: [
      { text: "Ask about the local legends", next: "legendsTalk", affinity: "affinityJacob" },
      { text: "Invite Jacob to hang out after school", next: "forestWalk", affinity: "affinityJacob" }
    ]
  },

  legendsTalk: {
    text: "Jacob's expression turns serious. 'Our legends speak of shape-shifters and cold ones... vampires.' He watches your reaction carefully.",
    bg: "images-vn/jacob_explain.jpg",
    char: null,
    choices: [
      { text: "'Vampires? Are you serious?'", next: "jacobReveal", affinity: "affinityJacob" },
      { text: "This sounds like superstition", next: "changeSubject" }
    ]
  },

  forestWalk: {
    text: "After school, Jacob walks with you through the forest. Suddenly, he stops. 'There's something I need to show you.' His body begins to change...",
    bg: "images-vn/forest_sheepish.jpg",
    char: null,
    choices: [
      { text: "Stay and watch", next: "jacobReveal", affinity: "affinityJacob" },
      { text: "Run away", next: "runFromReveal" }
    ]
  },

  jacobReveal: {
    text: "Jacob transforms into a massive wolf, then back to human. 'We're shape-shifters. We protect this land from the cold ones - vampires like the Cullens.'",
    bg: "images-vn/wolf.jpg",
    char: null,
    choices: [
      { text: "Ask about the Cullens", next: "cullenTruth", affinity: "affinityJacob" },
      { text: "This is too much - I need to go", next: "decisionTime" }
    ]
  },

  cullenTruth: {
    text: "'The Cullens are vampires, Bella. They drink animal blood, but they're still dangerous.' Jacob looks genuinely worried for you.",
    bg: "images-vn/jacob_angry.jpg",
    char: null,
    choices: [
      { text: "Promise to be careful", next: "jacobPromise", affinity: "affinityJacob" },
      { text: "I want to see for myself", next: "edwardPathFromJacob" }
    ]
  },

  jacobPromise: {
    text: "Jacob smiles with relief. 'Good. I care about you, Bella.' His hand brushes yours gently.",
    bg: "images-vn/smile_jb.jpg",
    char: null,
    choices: [
      { text: "Admit you feel something too", next: "jacobRomance", affinity: "affinityJacob" },
      { text: "Say you need time", next: "decisionTime" }
    ]
  },

  jacobRomance: {
    text: "Jacob pulls you into a warm embrace. 'You're my imprint, Bella. My perfect match.' His heart beats steadily against yours.",
    bg: "images-vn/jacob_hug.jpg",
    char: null,
    choices: [
      { text: "Kiss him", next: "endingJacob" },
      { text: "Hug him back", next: "endingJacob" }
    ]
  },

  // ----- EDWARD PATH -----
  edwardIntro: {
    text: "The pale boy doesn't move as you approach. 'Isabella Swan,' he says, his voice like velvet. 'I'm Edward Cullen.' His topaz eyes seem to look straight through you.",
    bg: "images-vn/edward.jpg",
    char: null,
    choices: [
      { text: "'How do you know my name?'", next: "edwardMysterious", affinity: "affinityEdward" },
      { text: "This feels too intense", next: "jacobIntro" }
    ]
  },

  edwardMysterious: {
    text: "'I can hear people's thoughts,' Edward murmurs. 'Everyone's but yours. Your mind is... silent. It's fascinating.'",
    bg: "images-vn/edward_topaz.jpg",
    char: null,
    choices: [
      { text: "Ask him to prove it", next: "edwardProof", affinity: "affinityEdward" },
      { text: "Back away slowly", next: "decisionTime" }
    ]
  },

  edwardProof: {
    text: "Edward accurately tells you what people around you are thinking. 'See? Now do you believe me?' His gaze is intense.",
    bg: "images-vn/twilight_school_hall.jpg",
    char: null,
    choices: [
      { text: "Ask what he really is", next: "vampireReveal", affinity: "affinityEdward" },
      { text: "This is too weird", next: "decisionTime" }
    ]
  },

  vampireReveal: {
    text: "'My family and I are vampires,' Edward confesses. 'We don't drink human blood, but we're still dangerous to you.'",
    bg: "images-vn/vampire.jpg",
    char: null,
    choices: [
      { text: "Show me more", next: "meadowScene", affinity: "affinityEdward" },
      { text: "I need to leave", next: "decisionTime" }
    ]
  },

  meadowScene: {
    text: "In a hidden meadow, Edward demonstrates his powers - speed, strength, and skin that sparkles in sunlight. 'This is what I am, Bella.'",
    bg: "images-vn/meadow_sparkle.jpg",
    char: null,
    choices: [
      { text: "I'm not afraid", next: "trustEdward", affinity: "affinityEdward" },
      { text: "This is too dangerous", next: "decisionTime" }
    ]
  },

  trustEdward: {
    text: "Edward looks at you with overwhelming emotion. 'No one has ever trusted me like this,' he whispers, gently touching your cheek.",
    bg: "images-vn/edward_meadow.jpg",
    char: null,
    choices: [
      { text: "Tell him you love him", next: "loveEdward", affinity: "affinityEdward" },
      { text: "Ask what happens now", next: "decisionTime" }
    ]
  },

  loveEdward: {
    text: "'I've waited a century to find you,' Edward says. 'But being with me means danger. Are you certain this is what you want?'",
    bg: "images-vn/love_edward.jpg",
    char: null,
    choices: [
      { text: "I'm certain", next: "eternityWithEdward", affinity: "affinityEdward" },
      { text: "I need time to think", next: "decisionTime" }
    ]
  },

  eternityWithEdward: {
    text: "Edward smiles beautifully. 'Then forever it is.' He gives you his mother's ring as a promise of protection and eternal love.",
    bg: "images-vn/edward_smile.jpg",
    char: null,
    choices: [
      { text: "Embrace your destiny", next: "endingEdward" }
    ]
  },

  // ----- FOREST PATH -----
  forestEntrance: {
    text: "The forest is dense and ancient. Sunlight struggles through the thick canopy. You hear rustling nearby - something large moving through the trees.",
    bg: "images-vn/forest_path.jpg",
    char: null,
    choices: [
      { text: "Investigate the rustling", next: "wolfEncounter" },
      { text: "Head back to the road", next: "schoolArrival" }
    ]
  },

  wolfEncounter: {
    text: "A massive wolf emerges from the trees. It doesn't attack, just watches you with intelligent eyes. Then it begins to transform... into Jacob Black.",
    bg: "images-vn/wolf.jpg",
    char: null,
    choices: [
      { text: "Stay and listen", next: "jacobReveal", affinity: "affinityJacob" },
      { text: "Run back to town", next: "schoolArrival" }
    ]
  },

  // ----- DECISION POINT -----
  decisionTime: {
    text: "You've learned incredible secrets about Forks. Now you must choose your path forward.",
    bg: "images-vn/forksmist.jpg",
    char: null,
    choices: [
      { text: "Choose Edward and the vampire world", next: "finalEdward" },
      { text: "Choose Jacob and the wolf pack", next: "finalJacob" },
      { text: "Remain human and independent", next: "finalAlone" }
    ]
  },

  // ----- FINAL PATHS -----
  finalEdward: {
    text: "You find Edward waiting at the forest's edge. 'I knew you would choose us,' he says, his cold hand taking yours. 'My world is dangerous, but I will protect you always.'",
    bg: "images-vn/edward_ending.jpg",
    char: null,
    choices: [
      { text: "Join him in eternity", next: "endingEdward" }
    ]
  },

  finalJacob: {
    text: "Jacob is working on his motorcycle when you approach. He looks up with hope in his eyes. 'I knew you'd make the right choice,' he says, pulling you into a warm embrace.",
    bg: "images-vn/jb_ending.jpg",
    char: null,
    choices: [
      { text: "Embrace your future with Jacob", next: "endingJacob" }
    ]
  },

  finalAlone: {
    text: "You decide to walk your own path, away from both supernatural worlds. Sometimes the safest choice is preserving your humanity.",
    bg: "images-vn/bella_alone.jpg",
    char: null,
    choices: [
      { text: "Continue your journey alone", next: "endingAlone" }
    ]
  },

  // ----- ENDINGS -----
  endingEdward: {
    text: "You chose Edward. Your life becomes an eternal dance with danger and beauty. Under the pale moonlight of Forks, you and Edward face forever together, your love story written in the stars for all time.",
    bg: "images-vn/ending_edward.jpg",
    char: null,
    choices: [
      { text: "Play Again", next: "intro" }
    ]
  },

  endingJacob: {
    text: "You chose Jacob. His warmth and loyalty become your anchor in the storm of supernatural dangers. Running through the forests of La Push, you find a love that's wild, passionate, and beautifully human.",
    bg: "images-vn/ending_jacob.jpg",
    char: null,
    choices: [
      { text: "Play Again", next: "intro" }
    ]
  },

  endingAlone: {
    text: "You chose to remain human. While both Edward and Jacob offered extraordinary love, you walk your own path under the gray Forks sky. Some stories are about finding yourself before finding love.",
    bg: "images-vn/ending_alone.jpg",
    char: null,
    choices: [
      { text: "Play Again", next: "intro" }
    ]
  },

  // ----- FALLBACK SCENES -----
  libraryAlone: {
    text: "You find a quiet corner in the library. Both Edward and Jacob approach you at different times, each wanting to talk. The choice between them becomes unavoidable.",
    bg: "images-vn/library.jpg",
    char: null,
    choices: [
      { text: "Talk to Edward", next: "edwardMysterious" },
      { text: "Talk to Jacob", next: "legendsTalk" },
      { text: "Avoid them both", next: "decisionTime" }
    ]
  },

  changeSubject: {
    text: "You change the subject, but the supernatural truths of Forks keep finding you. Both Edward and Jacob make their interest clear.",
    bg: "images-vn/Forks_High_School.jpg",
    char: null,
    choices: [
      { text: "Approach Edward", next: "edwardIntro" },
      { text: "Spend time with Jacob", next: "forestWalk" },
      { text: "Make a decision", next: "decisionTime" }
    ]
  },

  runFromReveal: {
    text: "You run from Jacob's revelation, but the truth about Forks can't be escaped. Both supernatural worlds keep pulling you back in.",
    bg: "images-vn/forest_path.jpg",
    char: null,
    choices: [
      { text: "Return to Jacob", next: "jacobReveal" },
      { text: "Seek out Edward", next: "edwardIntro" },
      { text: "Decide your path", next: "decisionTime" }
    ]
  },

  edwardPathFromJacob: {
    text: "You decide to see the vampire world for yourself. Edward is surprised but pleased when you approach him.",
    bg: "images-vn/edward.jpg",
    char: null,
    choices: [
      { text: "Ask about being a vampire", next: "vampireReveal" },
      { text: "Change your mind and go back to Jacob", next: "jacobPromise" }
    ]
  }
};