/* ==========================================================================
   BILIMDON - AQLNI CHARXLASH | TO'LIQ O'YIN MANTIQI VA AUDIO TIZIMI
   ========================================================================== */

// ---------------- 1. WEB AUDIO API (MUSIQA VA OVOZ EFFEKTLARI) ----------------
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.volume = 0.7;
        this.bgmInterval = null;
        this.isPlayingBgm = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type, duration, gainVal = 0.2, delay = 0) {
        if (!this.sfxEnabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

        const finalGain = gainVal * this.volume;
        gain.gain.setValueAtTime(finalGain, this.ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    }

    playClick() {
        this.playTone(520, 'sine', 0.08, 0.15);
    }

    playLogin() {
        this.playTone(440, 'triangle', 0.15, 0.2, 0);
        this.playTone(554, 'triangle', 0.15, 0.2, 0.1);
        this.playTone(659, 'triangle', 0.25, 0.25, 0.2);
    }

    playCorrect() {
        this.playTone(587.33, 'sine', 0.12, 0.22, 0);
        this.playTone(880, 'sine', 0.25, 0.25, 0.1);
    }

    playWrong() {
        this.playTone(220, 'sawtooth', 0.18, 0.2, 0);
        this.playTone(175, 'sawtooth', 0.25, 0.2, 0.15);
    }

    playCoin() {
        this.playTone(987.77, 'sine', 0.08, 0.2, 0);
        this.playTone(1318.51, 'sine', 0.22, 0.22, 0.07);
    }

    playVictory() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((n, idx) => {
            this.playTone(n, 'triangle', 0.25, 0.25, idx * 0.12);
        });
    }

    startBackgroundMusic() {
        if (this.isPlayingBgm || !this.musicEnabled) return;
        this.init();
        this.isPlayingBgm = true;

        const melody = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23];
        let step = 0;

        this.bgmInterval = setInterval(() => {
            if (!this.musicEnabled || !this.isPlayingBgm) return;
            if (this.ctx && this.ctx.state === 'running') {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(melody[step % melody.length], this.ctx.currentTime);

                const bgmVol = 0.045 * this.volume;
                gain.gain.setValueAtTime(bgmVol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.45);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.48);
                step++;
            }
        }, 550);
    }

    stopBackgroundMusic() {
        this.isPlayingBgm = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
}

const sound = new SoundEngine();

// ---------------- 2. HOLAT (STATE) VA MA'LUMOTLAR BAZASI ----------------
const DEFAULT_USER = {
    username: '',
    ageGroup: '6-10',
    avatar: '😎',
    coins: 50,
    xp: 0,
    level: 1,
    streak: 0,
    maxStreak: 0,
    gamesPlayed: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalCoinsEarned: 50,
    gameLevels: {}, // { gameId: currentLevel }
    history: [],
    lastDailyClaim: null,
    dailyDaysClaimed: 0,
    bonuses: {
        extraHeart: 0,
        extraTime: 0
    },
    quests: {
        solvedToday: 0,
        gamesToday: 0,
        claimedQ1: false,
        claimedQ2: false
    }
};

let userState = JSON.parse(localStorage.getItem('bilimdon_user')) || null;

// Boshlang'ich sun'iy TOP-10 reyting o'yinchilari
const BOT_PLAYERS = [
    { username: 'Alisher_UZ', ageGroup: '16-20', level: 14, coins: 2450, avatar: '👑' },
    { username: 'Madina_Pro', ageGroup: '11-15', level: 12, coins: 1980, avatar: '🦄' },
    { username: 'Jasur_Brain', ageGroup: '16-20', level: 10, coins: 1640, avatar: '🤖' },
    { username: 'Zarina_Star', ageGroup: '6-10', level: 9, coins: 1320, avatar: '🦊' },
    { username: 'Sardor_IQ', ageGroup: '11-15', level: 8, coins: 1100, avatar: '🦁' },
    { username: 'Malika_Kids', ageGroup: '3-5', level: 7, coins: 890, avatar: '🐼' },
    { username: 'Bobur_Logic', ageGroup: '16-20', level: 6, coins: 740, avatar: '🧙‍♂️' },
    { username: 'Nilufar_99', ageGroup: '11-15', level: 5, coins: 560, avatar: '😎' },
    { username: 'Aziz_Rocket', ageGroup: '6-10', level: 4, coins: 410, avatar: '👨‍🚀' }
];

const MOTIVATIONAL_QUOTES = [
    "Har bir yechilgan jumboq — miyangiz uchun yangi kuchdir!",
    "Bugun kechagidan aqlliroq bo‘lishga tayyormisiz?",
    "Mantiq — har qanday qulfni ochadigan oltin kalitdir!",
    "Xato qilishdan qo‘rqmang, har bir urinish sizni g‘alabaga yaqinlashtiradi!",
    "Bilimdonlar hech qachon taslim bo‘lmaydilar!"
];

const ACHIEVEMENTS_LIST = [
    { id: 'first_win', icon: '🌟', title: 'Ilk qadam', desc: 'Birinchi o‘yinni yakunlang', check: u => u.gamesPlayed >= 1 },
    { id: 'coins_200', icon: '💰', title: 'Tanga yig‘uvchi', desc: '200 tanga to‘plang', check: u => u.totalCoinsEarned >= 200 },
    { id: 'coins_1000', icon: '👑', title: 'Oltin Xazina', desc: '1000 tanga to‘plang', check: u => u.totalCoinsEarned >= 1000 },
    { id: 'streak_5', icon: '🔥', title: 'O‘tli seriya', desc: 'Ketma-ket 5 ta to‘g‘ri javob', check: u => u.maxStreak >= 5 },
    { id: 'streak_15', icon: '⚡', title: 'Yengilmas aql', desc: 'Ketma-ket 15 ta to‘g‘ri javob', check: u => u.maxStreak >= 15 },
    { id: 'solved_25', icon: '🎯', title: 'Mergan bilimdon', desc: '25 ta to‘g‘ri javob bering', check: u => u.correctAnswers >= 25 },
    { id: 'level_5', icon: '🚀', title: 'Yuqori parvoz', desc: '5-darajaga yeting', check: u => u.level >= 5 },
    { id: 'daily_1', icon: '🎁', title: 'Sovg‘a egasi', desc: 'Kunlik sovg‘ani oling', check: u => u.dailyDaysClaimed >= 1 }
];

// ---------------- 3. YOSH TOIFALARIGA MOS O'YINLAR KATALOGI ----------------
const GAMES_CATALOG = {
    '3-5': [
        { id: 'k_colors', icon: '🎨', title: 'Ranglarni topish', desc: 'Yorqin ranglarni nomiga qarab toping!', reward: 10, type: 'quiz' },
        { id: 'k_animals', icon: '🦁', title: 'Hayvonlarni tanish', desc: 'Yoqimtoy hayvonlarning nomini toping!', reward: 10, type: 'quiz' },
        { id: 'k_shapes', icon: '🔺', title: 'Shakllarni topish', desc: 'Doira, kvadrat va uchburchaklarni ajrating!', reward: 10, type: 'quiz' },
        { id: 'k_match', icon: '🍎', title: 'Rasmlarni moslashtirish', desc: 'Hayvonlar va ularning sevimli taomini toping!', reward: 15, type: 'quiz' },
        { id: 'k_count', icon: '🔢', title: 'Oddiy sanash', desc: 'Rasmdagi mevalar sonini sanang!', reward: 15, type: 'quiz' },
        { id: 'k_same', icon: '👯', title: 'Bir xil rasmlarni topish', desc: 'Bir xil kartochkalarni ochib juftlang!', reward: 20, type: 'memory' }
    ],
    '6-10': [
        { id: 'j_math', icon: '➕', title: 'Matematik misollar', desc: 'Qo‘shish, ayirish va ko‘paytirish misollari!', reward: 15, type: 'quiz' },
        { id: 'j_memory', icon: '🃏', title: 'Xotirani sinash', desc: 'Barcha juft rasmlarni eslab qoling va oching!', reward: 20, type: 'memory' },
        { id: 'j_words', icon: '🔤', title: 'So‘z topish', desc: 'Aralash harflardan to‘g‘ri so‘z tuzing!', reward: 20, type: 'input' },
        { id: 'j_diff', icon: '🔍', title: 'Ortiqchasini topish', desc: 'Qator orasidagi farqli belgini tez toping!', reward: 15, type: 'quiz' },
        { id: 'j_logic', icon: '💡', title: 'Mantiqiy savollar', desc: 'Qiziqarli topishmoq va mantiqiy savollar!', reward: 20, type: 'quiz' },
        { id: 'j_seq', icon: '📈', title: 'Sonlar ketma-ketligi', desc: 'Keyingi keladigan sonni aniqlang!', reward: 20, type: 'quiz' },
        { id: 'j_fast', icon: '⚡', title: 'Tezkor fikrlash', desc: 'Qisqa vaqt ichida to‘g‘ri javobni bosing!', reward: 25, type: 'quiz' }
    ],
    '11-15': [
        { id: 't_math', icon: '📐', title: 'Murakkab matematika', desc: 'Tenglamalar, darajalar va foizlar!', reward: 20, type: 'quiz' },
        { id: 't_puzzle', icon: '🧩', title: 'Mantiqiy jumboqlar', desc: 'Chuqur fikrlash talab qiluvchi masalalar!', reward: 25, type: 'quiz' },
        { id: 't_cipher', icon: '🔐', title: 'Shifrlangan so‘zlar', desc: 'Sezar shifri va kodlangan so‘zlarni oching!', reward: 25, type: 'input' },
        { id: 't_speed', icon: '⏱️', title: 'Matematik tezkor test', desc: '15 soniya ichida hisob-kitob qiling!', reward: 25, type: 'quiz' },
        { id: 't_memory', icon: '🧠', title: 'Kiber Xotira sinovi', desc: 'Katta matritsada juftliklarni toping!', reward: 25, type: 'memory' },
        { id: 't_seq', icon: '🔢', title: 'Ketma-ketlikni aniqlash', desc: 'Fibonachchi va murakkab qonuniyatlar!', reward: 25, type: 'quiz' },
        { id: 't_iq', icon: '🎓', title: 'IQ savollari', desc: 'Xalqaro IQ test darajasidagi savollar!', reward: 30, type: 'quiz' }
    ],
    '16-20': [
        { id: 'p_iq', icon: '🧬', title: 'Murakkab IQ testlari', desc: 'Yuqori intellektual koeffitsient sinovi!', reward: 30, type: 'quiz' },
        { id: 'p_strategy', icon: '♟️', title: 'Strategik mantiq', desc: 'Ehtimollar nazariyasi va strategik qarorlar!', reward: 30, type: 'quiz' },
        { id: 'p_math', icon: '∑', title: 'Oliy matematika', desc: 'Logarifm, progressiya va murakkab tenglamalar!', reward: 30, type: 'quiz' },
        { id: 'p_code', icon: '💻', title: 'Kod va shifrlarni yechish', desc: 'Ikkilik sanoq (Binary) va mantiqiy kodlar!', reward: 35, type: 'input' },
        { id: 'p_fast', icon: '⚡', title: 'Tezkor intellekt', desc: 'Tezkor tahlil va reaksiya testi!', reward: 30, type: 'quiz' },
        { id: 'p_memory', icon: '🔮', title: 'Murakkab xotira sinovi', desc: 'Yuqori aniqlikdagi vizual xotira!', reward: 30, type: 'memory' },
        { id: 'p_combo', icon: '🗝️', title: 'Mantiqiy kombinatsiyalar', desc: 'Simvollar va sonlar tizimini yeching!', reward: 35, type: 'quiz' }
    ]
};

// ---------------- 4. SAVOLLAR GENERATORI (HAR BIR O'YIN VA DARAJA UCHUN) ----------------
function generateQuestionForGame(gameId, level) {
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

    // --- 3-5 YOSH ---
    if (gameId === 'k_colors') {
        const items = [
            { q: 'Qaysi biri QIZIL rangda?', v: '🔴', ans: 'Qizil', opts: ['Qizil', 'Ko‘k', 'Yashil', 'Sariq'] },
            { q: 'Osmon va dengiz qaysi rangda?', v: '🔵', ans: 'Ko‘k', opts: ['Ko‘k', 'Sariq', 'Qora', 'Pushti'] },
            { q: 'Quyosh va banan qaysi rangda?', v: '🟡', ans: 'Sariq', opts: ['Sariq', 'Yashil', 'Qizil', 'Binafsha'] },
            { q: 'Daraxt barglari qaysi rangda?', v: '🟢', ans: 'Yashil', opts: ['Yashil', 'Ko‘k', 'Apelsin', 'Oq'] },
            { q: 'Apelsin mevasining rangi qanday?', v: '🟠', ans: 'To‘q sariq', opts: ['To‘q sariq', 'Qora', 'Ko‘k', 'Yashil'] }
        ];
        const pick = items[rand(0, items.length - 1)];
        return { prompt: pick.q, visual: pick.v, answer: pick.ans, options: shuffle(pick.opts), difficulty: 'easy' };
    }

    if (gameId === 'k_animals') {
        const items = [
            { q: 'Bu qaysi hayvon? U "Miyov" deydi!', v: '🐱', ans: 'Mushuk', opts: ['Mushuk', 'Kuchuk', 'Sigir', 'Ot'] },
            { q: 'Hayvonlar shohi kim?', v: '🦁', ans: 'Sher', opts: ['Sher', 'Quyon', 'Tipratikan', 'Ayiq'] },
            { q: 'Uzun xartumli katta hayvon qaysi?', v: '🐘', ans: 'Fil', opts: ['Fil', 'Tulki', 'Bo‘ri', 'Xo‘roz'] },
            { q: 'Sabzini juda yaxshi ko‘radigan hayvon?', v: '🐰', ans: 'Quyon', opts: ['Quyon', 'Timsoh', 'Ilon', 'Kiyik'] },
            { q: 'Asalni yaxshi ko‘radigan polvon hayvon?', v: '🐻', ans: 'Ayiq', opts: ['Ayiq', 'Baliq', 'Qarg‘a', 'Mushuk'] }
        ];
        const pick = items[rand(0, items.length - 1)];
        return { prompt: pick.q, visual: pick.v, answer: pick.ans, options: shuffle(pick.opts), difficulty: 'easy' };
    }

    if (gameId === 'k_shapes') {
        const items = [
            { q: 'Koptok qaysi shaklga o‘xshaydi?', v: '⭕', ans: 'Doira', opts: ['Doira', 'Kvadrat', 'Uchburchak', 'Yulduz'] },
            { q: '3 ta burchagi bor shakl qaysi?', v: '🔺', ans: 'Uchburchak', opts: ['Uchburchak', 'Doira', 'Kvadrat', 'To‘rtburchak'] },
            { q: '4 ta teng tomonli shakl qaysi?', v: '🟥', ans: 'Kvadrat', opts: ['Kvadrat', 'Doira', 'Uchburchak', 'Oval'] },
            { q: 'Osmonda kechasi nima charaqlaydi?', v: '⭐', ans: 'Yulduz', opts: ['Yulduz', 'Kvadrat', 'Uchburchak', 'Kub'] }
        ];
        const pick = items[rand(0, items.length - 1)];
        return { prompt: pick.q, visual: pick.v, answer: pick.ans, options: shuffle(pick.opts), difficulty: 'easy' };
    }

    if (gameId === 'k_match') {
        const items = [
            { q: 'Maymun nimani yaxshi ko‘radi?', v: '🐒 ➔ ❓', ans: '🍌 Banan', opts: ['🍌 Banan', '🦴 Suyak', '🥕 Sabzi', '🐟 Baliq'] },
            { q: 'Kuchuk nimani yaxshi ko‘radi?', v: '🐕 ➔ ❓', ans: '🦴 Suyak', opts: ['🦴 Suyak', '🍌 Banan', '🌿 Barg', '🧀 Pishloq'] },
            { q: 'Sichqoncha nimani yaxshi ko‘radi?', v: '🐭 ➔ ❓', ans: '🧀 Pishloq', opts: ['🧀 Pishloq', '🍉 Tarvuz', '🦴 Suyak', '🍋 Limon'] },
            { q: 'Asalari nimadan asal yig‘adi?', v: '🐝 ➔ ❓', ans: '🌸 Gul', opts: ['🌸 Gul', '🪨 Tosh', '❄️ Qor', '🍞 Non'] }
        ];
        const pick = items[rand(0, items.length - 1)];
        return { prompt: pick.q, visual: pick.v, answer: pick.ans, options: shuffle(pick.opts), difficulty: 'easy' };
    }

    if (gameId === 'k_count') {
        const count = rand(1, Math.min(5 + level, 9));
        const emojis = ['🍎', '🍓', '🚗', '🎈', '🌟'];
        const em = emojis[rand(0, emojis.length - 1)];
        const visual = Array(count).fill(em).join(' ');
        const opts = new Set([String(count)]);
        while (opts.size < 4) opts.add(String(rand(1, 10)));
        return {
            prompt: 'Rasmda nechta narsa bor? Sanang!',
            visual: visual,
            answer: String(count),
            options: shuffle([...opts]),
            difficulty: 'easy'
        };
    }

    // --- 6-10 YOSH ---
    if (gameId === 'j_math' || gameId === 'j_fast') {
        const maxNum = 10 + level * 8;
        const a = rand(3, maxNum);
        const b = rand(2, maxNum);
        const isPlus = Math.random() > 0.4;
        const ans = isPlus ? a + b : Math.max(a, b) - Math.min(a, b);
        const expr = isPlus ? `${a} + ${b} = ?` : `${Math.max(a, b)} - ${Math.min(a, b)} = ?`;
        const opts = new Set([String(ans)]);
        while (opts.size < 4) opts.add(String(ans + rand(-7, 9)));
        return { prompt: 'To‘g‘ri javobni hisoblang:', visual: expr, answer: String(ans), options: shuffle([...opts]), difficulty: 'medium' };
    }

    if (gameId === 'j_words') {
        const words = [
            { word: 'KITOB', hint: 'Bilim manbai, uni o‘qiymiz' },
            { word: 'MAKTAB', hint: 'O‘quvchilar bilim oladigan joy' },
            { word: 'QUYOSH', hint: 'Kunduzi osmonni yoritadigan yulduz' },
            { word: 'VATAN', hint: 'Biz tug‘ilib o‘sgan muqaddas yurt' },
            { word: 'DO‘ST', hint: 'Qiyin kunda yordam beradigan yaqin inson' },
            { word: 'OLMA', hint: 'Qizil yoki yashil shirin meva' }
        ];
        const pick = words[rand(0, words.length - 1)];
        const scrambled = pick.word.split('').sort(() => Math.random() - 0.5).join(' - ');
        return {
            prompt: `Harflardan so‘z tuzing! Maslahat: ${pick.hint}`,
            visual: scrambled,
            answer: pick.word,
            difficulty: 'medium'
        };
    }

    if (gameId === 'j_diff') {
        const sets = [
            { base: '😀', diff: '😎' },
            { base: '🍏', diff: '🍎' },
            { base: '🐶', diff: '🐺' },
            { base: '⚽', diff: '🏀' },
            { base: '🚗', diff: '🚕' }
        ];
        const s = sets[rand(0, sets.length - 1)];
        const opts = [s.base, s.base, s.base, s.diff];
        return {
            prompt: 'Qaysi belgi boshqalaridan FARQ qiladi?',
            visual: '👀 Diqqat bilan qarang!',
            answer: s.diff,
            options: shuffle(opts),
            difficulty: 'easy'
        };
    }

    if (gameId === 'j_logic') {
        const items = [
            { q: 'Qaysi oyda 28 kun bor?', v: '📅', ans: 'Barcha oylarda', opts: ['Barcha oylarda', 'Faqat Fevralda', 'Martda', 'Hech qaysida'] },
            { q: 'Nimani ko‘z yumib ham ko‘rish mumkin?', v: '💤', ans: 'Tushni', opts: ['Tushni', 'Quyoshni', 'Kitobni', 'Rasmni'] },
            { q: 'Yomg‘ir yog‘ayotganda qarg‘a qanday daraxtga qo‘nadi?', v: '🌳', ans: 'Ho‘l daraxtga', opts: ['Ho‘l daraxtga', 'Quruq daraxtga', 'Baland daraxtga', 'Past daraxtga'] },
            { q: '1 kg paxta og‘irmi yoki 1 kg temir?', v: '⚖️', ans: 'Ikkalasi teng', opts: ['Ikkalasi teng', '1 kg temir', '1 kg paxta', 'Bilmayman'] }
        ];
        const pick = items[rand(0, items.length - 1)];
        return { prompt: pick.q, visual: pick.v, answer: pick.ans, options: shuffle(pick.opts), difficulty: 'medium' };
    }

    if (gameId === 'j_seq') {
        const step = rand(2, 4 + level);
        const start = rand(1, 10);
        const seq = [start, start + step, start + step * 2, start + step * 3];
        const ans = start + step * 4;
        const opts = new Set([String(ans)]);
        while (opts.size < 4) opts.add(String(ans + rand(-5, 8)));
        return {
            prompt: 'Ketma-ketlikni davom ettiring:',
            visual: `${seq.join(', ')}, ❓`,
            answer: String(ans),
            options: shuffle([...opts]),
            difficulty: 'medium'
        };
    }

    // --- 11-15 YOSH ---
    if (gameId === 't_math' || gameId === 't_speed') {
        const a = rand(12, 25 + level * 5);
        const b = rand(4, 15);
        const c = rand(5, 30);
        const ans = a * b - c;
        const opts = new Set([String(ans)]);
        while (opts.size < 4) opts.add(String(ans + rand(-15, 15)));
        return {
            prompt: 'Ifodaning qiymatini toping:',
            visual: `(${a} × ${b}) - ${c} = ?`,
            answer: String(ans),
            options: shuffle([...opts]),
            difficulty: 'hard'
        };
    }

    if (gameId === 't_cipher') {
        const dict = [
            { plain: 'ALGORITM', cipher: 'BMHPSJUN', hint: 'Har bir harf alifboda +1 oldinga surilgan (A→B)' },
            { plain: 'MANTIQ', cipher: 'NBOUJR', hint: 'Har bir harf +1 keyingi harfga almashtirilgan' },
            { plain: 'KOSMOS', cipher: 'LPTNPT', hint: 'Sezar shifri (+1 siljish)' },
            { plain: 'DASTUR', cipher: 'EBTUVS', hint: 'Sezar shifri (+1 siljish)' },
            { plain: 'ROBOT', cipher: 'SPCPU', hint: 'Sezar shifri (+1 siljish)' }
        ];
        const pick = dict[rand(0, dict.length - 1)];
        return {
            prompt: `Shifrni yeching! (${pick.hint})`,
            visual: `🔐 ${pick.cipher}`,
            answer: pick.plain,
            difficulty: 'hard'
        };
    }

    if (gameId === 't_puzzle' || gameId === 't_iq') {
        const items = [
            { q: 'Agar 5 ta mashina 5 daqiqada 5 ta detal tayyorlasa, 100 ta mashina 100 ta detalni necha daqiqada tayyorlaydi?', v: '⚙️', ans: '5 daqiqada', opts: ['5 daqiqada', '100 daqiqada', '20 daqiqada', '1 daqiqada'] },
            { q: 'Soat 3:15 bo‘lganda soat va minut strelkalari orasidagi burchak necha gradus?', v: '🕒', ans: '7.5°', opts: ['7.5°', '0°', '15°', '30°'] },
            { q: 'Akmalning 4 ta opasi bor. Har bir opasining 1 tadan ukasi bor. Oilada nechta farzand bor?', v: '👨‍👩‍👧‍👦', ans: '5 ta', opts: ['5 ta', '8 ta', '9 ta', '4 ta'] },
            { q: 'Qaysi sonning kvadrati va kubi o‘ziga teng (0 dan katta)?', v: '🔢', ans: '1', opts: ['1', '2', '10', '5'] }
        ];
        const pick = items[rand(0, items.length - 1)];
        return { prompt: pick.q, visual: pick.v, answer: pick.ans, options: shuffle(pick.opts), difficulty: 'hard' };
    }

    if (gameId === 't_seq') {
        // Kvadratlar yoki ko'paytma ketma-ketligi
        const start = rand(2, 5);
        const seq = [start, start * 2, start * 4, start * 8];
        const ans = start * 16;
        const opts = new Set([String(ans)]);
        while (opts.size < 4) opts.add(String(ans + rand(-12, 20)));
        return {
            prompt: 'Geometrik ketma-ketlikni davom ettiring:',
            visual: `${seq.join(', ')}, ❓`,
            answer: String(ans),
            options: shuffle([...opts]),
            difficulty: 'hard'
        };
    }

    // --- 16-20 YOSH ---
    if (gameId === 'p_code') {
        const num = rand(5, 31);
        const binary = num.toString(2);
        return {
            prompt: 'Ikkilik sanoq sistemasidagi (Binary) sonni o‘nlikka o‘tkazing:',
            visual: `0b${binary}`,
            answer: String(num),
            difficulty: 'hard'
        };
    }

    if (gameId === 'p_math') {
        const x = rand(3, 12);
        const a = rand(2, 6);
        const b = rand(5, 25);
        const res = a * (x * x) + b;
        const opts = new Set([String(x)]);
        while (opts.size < 4) opts.add(String(rand(1, 16)));
        return {
            prompt: 'Tenglamani yeching (x > 0):',
            visual: `${a}x² + ${b} = ${res}`,
            answer: String(x),
            options: shuffle([...opts]),
            difficulty: 'hard'
        };
    }

    if (gameId === 'p_iq' || gameId === 'p_strategy' || gameId === 'p_fast' || gameId === 'p_combo') {
        const items = [
            { q: 'Xonada 3 ta lampochka, tashqarida 3 ta viklyuchatel bor. Xonaga faqat 1 marta kirib, qaysi viklyuchatel qaysi lampaga tegishli ekanini qanday bilasiz?', v: '💡', ans: 'Issiqlik (harorat) orqali', opts: ['Issiqlik (harorat) orqali', 'Tasodifiy tanlab', 'Aniqlab bo‘lmaydi', 'Ovozidan'] },
            { q: 'Mantiqiy qonuniyat: 2 → 6, 3 → 12, 4 → 20, 5 → 30, 6 → ?', v: '🧠', ans: '42', opts: ['42', '36', '40', '48'] },
            { q: 'Bozorda 3 ta quti bor: "Olmalar", "Apelsinlar" va "Aralash". Barcha yorliqlar NOTO‘G‘RI yopishtirilgan. Nechta meva olib barchasini to‘g‘ri topish mumkin?', v: '📦', ans: '1 ta ("Aralash" qutidan)', opts: ['1 ta ("Aralash" qutidan)', '2 ta', '3 ta', '4 ta'] },
            { q: 'Agar A > B, B > C va D < C bo‘lsa, quyidagilardan qaysi biri eng kichik?', v: '📊', ans: 'D', opts: ['D', 'C', 'B', 'A'] },
            { q: 'Shaxmat taxtasida jami nechta kvadrat (barcha o‘lchamdagi) mavjud?', v: '♟️', ans: '204 ta', opts: ['204 ta', '64 ta', '128 ta', '100 ta'] }
        ];
        const pick = items[rand(0, items.length - 1)];
        return { prompt: pick.q, visual: pick.v, answer: pick.ans, options: shuffle(pick.opts), difficulty: 'hard' };
    }

    // Default fallback
    return {
        prompt: '15 + 25 nechaga teng?',
        visual: '15 + 25 = ?',
        answer: '40',
        options: ['35', '40', '45', '50'],
        difficulty: 'easy'
    };
}

// ---------------- 5. ILOVANI ISHGA TUSHIRISH VA BOSHQARISH ----------------
document.addEventListener('DOMContentLoaded', () => {
    initLoginScreen();
    if (userState && userState.username) {
        enterPlatform(false);
    }
});

function saveUser() {
    localStorage.setItem('bilimdon_user', JSON.stringify(userState));
}

// Kirish oynasi logikasi
function initLoginScreen() {
    const ageCards = document.querySelectorAll('.age-card');
    let selectedAge = '6-10';

    ageCards.forEach(card => {
        card.addEventListener('click', () => {
            sound.playClick();
            ageCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedAge = card.dataset.age;
            document.body.setAttribute('data-theme', `age-${selectedAge}`);
        });
    });

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameVal = document.getElementById('username-input').value.trim();
        if (!usernameVal) return;

        userState = {
            ...JSON.parse(JSON.stringify(DEFAULT_USER)),
            username: usernameVal,
            ageGroup: selectedAge,
            avatar: selectedAge === '3-5' ? '🐼' : selectedAge === '6-10' ? '🦊' : selectedAge === '11-15' ? '🤖' : '👑'
        };

        saveUser();
        sound.playLogin();
        sound.startBackgroundMusic();
        enterPlatform(true);
    });
}

function enterPlatform(isNewLogin) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');

    applyAgeTheme(userState.ageGroup);
    updateAllUI();
    navigateTo('home');

    if (isNewLogin) {
        showToast(`Xush kelibsiz, ${userState.username}! +50 boshlang‘ich tanga! 🎉`, 'success');
    }
}

function applyAgeTheme(ageGroup) {
    document.body.setAttribute('data-theme', `age-${ageGroup}`);
    const mascots = {
        '3-5': '🧸',
        '6-10': '🦊',
        '11-15': '🤖',
        '16-20': '🧠'
    };
    const ageLabels = {
        '3-5': '3–5 yosh (Kichkintoylar)',
        '6-10': '6–10 yosh (Sarguzashtchilar)',
        '11-15': '11–15 yosh (Kiber-Bilimdon)',
        '16-20': '16–20 yosh (Oliy Intellekt)'
    };

    document.getElementById('age-mascot').textContent = mascots[ageGroup] || '🦊';
    document.getElementById('header-age-badge').textContent = `${ageGroup} yosh`;
    document.getElementById('profile-age-label').textContent = ageLabels[ageGroup];
}

// ---------------- 6. SAHIFALAR ORASIDA O'TISH (NAVIGATION) ----------------
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        sound.playClick();
        sound.startBackgroundMusic();
        const page = item.dataset.page;
        navigateTo(page);
    });
});

function navigateTo(pageName) {
    // O'yin jarayoni ketayotgan bo'lsa to'xtatish
    if (activeGameSession.timerId) {
        clearInterval(activeGameSession.timerId);
        activeGameSession.timerId = null;
    }
    document.getElementById('games-catalog-view').classList.remove('hidden');
    document.getElementById('active-game-view').classList.add('hidden');

    document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.toggle('active', n.dataset.page === pageName);
    });

    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) targetPage.classList.add('active');

    updateAllUI();
}

// Chiqish tugmasi
document.getElementById('logout-btn').addEventListener('click', () => {
    sound.playClick();
    sound.stopBackgroundMusic();
    if (activeGameSession.timerId) clearInterval(activeGameSession.timerId);

    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('username-input').value = userState ? userState.username : '';
});

// ---------------- 7. UI YANGILASH FUNKSIYALARI ----------------
function updateAllUI() {
    if (!userState) return;

    // Header
    document.getElementById('header-coins').textContent = userState.coins;
    document.getElementById('header-level').textContent = userState.level;
    document.getElementById('header-streak').textContent = userState.streak;
    document.getElementById('header-username').textContent = userState.username;
    document.getElementById('header-avatar').textContent = userState.avatar;

    // Home
    document.getElementById('welcome-name').textContent = userState.username;
    document.getElementById('home-stat-solved').textContent = userState.correctAnswers;
    document.getElementById('home-stat-max-streak').textContent = userState.maxStreak;

    const unlockedCount = ACHIEVEMENTS_LIST.filter(a => a.check(userState)).length;
    document.getElementById('home-stat-achievements').textContent = `${unlockedCount}/${ACHIEVEMENTS_LIST.length}`;

    // Reytingdagi o'rin
    const fullLeaderboard = getSortedLeaderboard();
    const myRank = fullLeaderboard.findIndex(p => p.isCurrentUser) + 1;
    document.getElementById('home-stat-rank').textContent = `#${myRank}`;

    // Motivatsiya
    const qIdx = (userState.gamesPlayed + userState.level) % MOTIVATIONAL_QUOTES.length;
    document.getElementById('motivational-quote').textContent = `"${MOTIVATIONAL_QUOTES[qIdx]}"`;

    renderGamesCatalog();
    renderDailyQuests();
    renderProfilePage();
    renderLeaderboard();
    renderGiftsPage();
    renderSettingsPage();

    document.getElementById('coins-page-balance').textContent = userState.coins;
}

function renderGamesCatalog() {
    const games = GAMES_CATALOG[userState.ageGroup] || GAMES_CATALOG['6-10'];
    const allGrid = document.getElementById('all-games-grid');
    const featuredGrid = document.getElementById('featured-games-grid');

    const createCardHTML = (game) => {
        const lvl = userState.gameLevels[game.id] || 1;
        return `
            <div class="game-card glass-panel" onclick="startGame('${game.id}')">
                <div>
                    <div class="gc-top">
                        <div class="gc-icon">${game.icon}</div>
                        <span class="gc-level-tag">Level ${lvl}</span>
                    </div>
                    <h4 class="gc-title">${game.title}</h4>
                    <p class="gc-desc">${game.desc}</p>
                </div>
                <div class="gc-footer">
                    <span class="gc-reward">+${game.reward} 🪙 / savol</span>
                    <button class="btn-3d btn-primary btn-sm">O‘ynash ▶</button>
                </div>
            </div>
        `;
    };

    allGrid.innerHTML = games.map(createCardHTML).join('');
    featuredGrid.innerHTML = games.slice(0, 3).map(createCardHTML).join('');
}

function renderDailyQuests() {
    const q = userState.quests;
    const container = document.getElementById('daily-quests-list');

    const q1Done = q.solvedToday >= 5;
    const q2Done = q.gamesToday >= 2;

    container.innerHTML = `
        <div class="quest-item">
            <div class="quest-info">
                <h4>🎯 5 ta savolga to‘g‘ri javob bering (${Math.min(q.solvedToday, 5)}/5)</h4>
                <p>Mukofot: +50 tanga</p>
            </div>
            ${q.claimedQ1
                ? '<span class="badge" style="background:#10B981;color:#fff;">Olindi ✓</span>'
                : `<button class="btn-3d btn-primary btn-sm" ${!q1Done ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="claimQuest(1)">Olish</button>`
            }
        </div>
        <div class="quest-item">
            <div class="quest-info">
                <h4>🎮 2 ta o‘yin darajasini yakunlang (${Math.min(q.gamesToday, 2)}/2)</h4>
                <p>Mukofot: +80 tanga</p>
            </div>
            ${q.claimedQ2
                ? '<span class="badge" style="background:#10B981;color:#fff;">Olindi ✓</span>'
                : `<button class="btn-3d btn-primary btn-sm" ${!q2Done ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="claimQuest(2)">Olish</button>`
            }
        </div>
    `;
}

window.claimQuest = function(num) {
    if (num === 1 && userState.quests.solvedToday >= 5 && !userState.quests.claimedQ1) {
        userState.quests.claimedQ1 = true;
        addCoins(50);
        showToast('Kunlik vazifa bajarildi! +50 tanga! 🎉', 'success');
    } else if (num === 2 && userState.quests.gamesToday >= 2 && !userState.quests.claimedQ2) {
        userState.quests.claimedQ2 = true;
        addCoins(80);
        showToast('Kunlik vazifa bajarildi! +80 tanga! 🎉', 'success');
    }
    saveUser();
    updateAllUI();
};

// ---------------- 8. HAQIQIY O'YIN DVIGATELI (GAME ENGINE) ----------------
let activeGameSession = {
    gameObj: null,
    level: 1,
    questionIndex: 0,
    totalQuestions: 5,
    score: 0,
    sessionCoins: 0,
    hearts: 3,
    timeLeft: 30,
    timerId: null,
    currentQuestion: null
};

window.startGame = function(gameId) {
    sound.playClick();
    sound.startBackgroundMusic();

    const games = GAMES_CATALOG[userState.ageGroup];
    const gameObj = games.find(g => g.id === gameId);
    if (!gameObj) return;

    const currentLevel = userState.gameLevels[gameId] || 1;
    const baseHearts = 3 + (userState.bonuses.extraHeart > 0 ? 1 : 0);
    if (userState.bonuses.extraHeart > 0) userState.bonuses.extraHeart--;

    activeGameSession = {
        gameObj,
        level: currentLevel,
        questionIndex: 0,
        totalQuestions: gameObj.type === 'memory' ? 1 : 5,
        score: 0,
        sessionCoins: 0,
        hearts: baseHearts,
        timeLeft: 30,
        timerId: null,
        currentQuestion: null
    };

    saveUser();

    document.getElementById('games-catalog-view').classList.add('hidden');
    document.getElementById('active-game-view').classList.remove('hidden');

    document.getElementById('current-game-title').textContent = `${gameObj.icon} ${gameObj.title}`;
    document.getElementById('current-game-level').textContent = `Level ${currentLevel}`;

    loadNextStep();
};

document.getElementById('exit-game-btn').addEventListener('click', () => {
    sound.playClick();
    if (activeGameSession.timerId) clearInterval(activeGameSession.timerId);
    document.getElementById('active-game-view').classList.add('hidden');
    document.getElementById('games-catalog-view').classList.remove('hidden');
    updateAllUI();
});

function updateGameHUD() {
    document.getElementById('game-hearts').textContent = '❤️'.repeat(Math.max(0, activeGameSession.hearts));
    document.getElementById('game-q-num').textContent = `${Math.min(activeGameSession.questionIndex + 1, activeGameSession.totalQuestions)}/${activeGameSession.totalQuestions}`;
    const pct = ((activeGameSession.questionIndex) / activeGameSession.totalQuestions) * 100;
    document.getElementById('game-progress-fill').style.width = `${pct}%`;
}

function startQuestionTimer(seconds) {
    if (activeGameSession.timerId) clearInterval(activeGameSession.timerId);
    const extra = userState.bonuses.extraTime > 0 ? 15 : 0;
    activeGameSession.timeLeft = seconds + extra;

    const timerEl = document.getElementById('game-timer');
    const timerBox = timerEl.parentElement;
    timerBox.classList.remove('danger');
    timerEl.textContent = activeGameSession.timeLeft;

    activeGameSession.timerId = setInterval(() => {
        activeGameSession.timeLeft--;
        timerEl.textContent = activeGameSession.timeLeft;

        if (activeGameSession.timeLeft <= 5) {
            timerBox.classList.add('danger');
        }

        if (activeGameSession.timeLeft <= 0) {
            clearInterval(activeGameSession.timerId);
            handleWrongAnswer('Vaqt tugadi! ⏰');
        }
    }, 1000);
}

function loadNextStep() {
    updateGameHUD();

    if (activeGameSession.hearts <= 0) {
        finishGame(false);
        return;
    }

    if (activeGameSession.questionIndex >= activeGameSession.totalQuestions) {
        finishGame(true);
        return;
    }

    const stage = document.getElementById('game-stage');
    const game = activeGameSession.gameObj;

    // Xotira o'yini (Memory Card Game)
    if (game.type === 'memory') {
        renderMemoryGame(stage);
        startQuestionTimer(45 + activeGameSession.level * 5);
        return;
    }

    // Savol-javob yoki Matn kiritish o'yini
    const q = generateQuestionForGame(game.id, activeGameSession.level);
    activeGameSession.currentQuestion = q;

    const baseTime = userState.ageGroup === '3-5' ? 40 : (game.id.includes('fast') || game.id.includes('speed') ? 15 : 25);
    startQuestionTimer(baseTime);

    if (game.type === 'input') {
        stage.innerHTML = `
            <div class="question-prompt">${q.prompt}</div>
            <div class="question-visual">${q.visual}</div>
            <form id="text-answer-form" class="text-answer-box">
                <input type="text" id="user-text-ans" class="text-answer-input" placeholder="Javobni yozing..." autocomplete="off" required>
                <button type="submit" class="btn-3d btn-primary">Tekshirish ✓</button>
            </form>
        `;
        const inputEl = document.getElementById('user-text-ans');
        inputEl.focus();
        document.getElementById('text-answer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            checkAnswer(inputEl.value.trim().toUpperCase(), null);
        });
    } else {
        stage.innerHTML = `
            <div class="question-prompt">${q.prompt}</div>
            <div class="question-visual">${q.visual}</div>
            <div class="options-grid">
                ${q.options.map(opt => `
                    <button class="option-btn" onclick="checkAnswer('${opt.replace(/'/g, "\\'")}', this)">${opt}</button>
                `).join('')}
            </div>
        `;
    }
}

window.checkAnswer = function(selectedVal, btnEl) {
    if (activeGameSession.timerId) clearInterval(activeGameSession.timerId);

    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);

    const correctVal = activeGameSession.currentQuestion.answer.toUpperCase();
    const isCorrect = selectedVal.toUpperCase() === correctVal;

    if (isCorrect) {
        if (btnEl) btnEl.classList.add('correct');
        sound.playCorrect();
        sound.playCoin();

        const reward = activeGameSession.gameObj.reward;
        activeGameSession.score++;
        activeGameSession.sessionCoins += reward;

        userState.correctAnswers++;
        userState.quests.solvedToday++;
        userState.streak++;
        if (userState.streak > userState.maxStreak) userState.maxStreak = userState.streak;

        // Ketma-ket 3 ta g'alaba bonusi
        let bonusMsg = '';
        if (userState.streak % 3 === 0) {
            addCoins(15);
            activeGameSession.sessionCoins += 15;
            bonusMsg = ' (+15 seriya bonusi! 🔥)';
        }

        addCoins(reward);
        spawnFloatingCoin(`+${reward} 🪙`);
        showToast(`To‘g‘ri javob! +${reward} tanga${bonusMsg}`, 'success');

        setTimeout(() => {
            activeGameSession.questionIndex++;
            loadNextStep();
        }, 950);
    } else {
        if (btnEl) btnEl.classList.add('wrong');
        // To'g'ri javobni ko'rsatish
        allBtns.forEach(b => {
            if (b.textContent.toUpperCase() === correctVal) b.classList.add('correct');
        });
        handleWrongAnswer(`Noto‘g‘ri! To‘g‘ri javob: ${activeGameSession.currentQuestion.answer}`);
    }
};

function handleWrongAnswer(msg) {
    sound.playWrong();
    activeGameSession.hearts--;
    userState.wrongAnswers++;
    userState.streak = 0;
    saveUser();
    updateAllUI();
    updateGameHUD();

    showToast(msg, 'error');

    setTimeout(() => {
        activeGameSession.questionIndex++;
        loadNextStep();
    }, 1300);
}

// Xotira o'yini (Memory Card Matching)
function renderMemoryGame(stage) {
    const emojis = ['🦁', '🚀', '🍎', '💎', '🦄', '🎸', '🍕', '⚽'];
    const pairCount = Math.min(4 + activeGameSession.level, 8);
    const chosen = emojis.slice(0, pairCount);
    const deck = [...chosen, ...chosen].sort(() => Math.random() - 0.5);

    let flippedCards = [];
    let matchedPairs = 0;
    let lockBoard = false;

    stage.innerHTML = `
        <div class="question-prompt">Bir xil juftliklarni toping! (${pairCount} ta juftlik)</div>
        <div class="memory-grid" style="grid-template-columns: repeat(4, 1fr);">
            ${deck.map((em, i) => `
                <div class="memory-card" data-idx="${i}" data-val="${em}">❓</div>
            `).join('')}
        </div>
    `;

    const cards = stage.querySelectorAll('.memory-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (lockBoard || card.classList.contains('flipped') || card.classList.contains('matched')) return;
            sound.playClick();

            card.classList.add('flipped');
            card.textContent = card.dataset.val;
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                lockBoard = true;
                const [c1, c2] = flippedCards;
                if (c1.dataset.val === c2.dataset.val) {
                    sound.playCorrect();
                    c1.classList.add('matched');
                    c2.classList.add('matched');
                    matchedPairs++;
                    flippedCards = [];
                    lockBoard = false;

                    addCoins(10);
                    activeGameSession.sessionCoins += 10;
                    userState.correctAnswers++;
                    userState.quests.solvedToday++;
                    spawnFloatingCoin('+10 🪙');

                    if (matchedPairs === pairCount) {
                        clearInterval(activeGameSession.timerId);
                        activeGameSession.score = 5;
                        activeGameSession.totalQuestions = 5;
                        setTimeout(() => finishGame(true), 600);
                    }
                } else {
                    sound.playWrong();
                    setTimeout(() => {
                        c1.classList.remove('flipped');
                        c2.classList.remove('flipped');
                        c1.textContent = '❓';
                        c2.textContent = '❓';
                        flippedCards = [];
                        lockBoard = false;
                    }, 750);
                }
            }
        });
    });
}

// O'yin yakuni va Tabriklash oynasi
function finishGame(isWin) {
    if (activeGameSession.timerId) clearInterval(activeGameSession.timerId);
    document.getElementById('game-progress-fill').style.width = '100%';

    userState.gamesPlayed++;
    if (isWin) userState.quests.gamesToday++;

    // Mukammal natija bonusi (+50 tanga)
    let perfectBonus = 0;
    if (isWin && activeGameSession.score === activeGameSession.totalQuestions && activeGameSession.hearts >= 3) {
        perfectBonus = 50;
        addCoins(perfectBonus);
    }

    // XP va Level oshirish
    const earnedXp = isWin ? 40 + activeGameSession.level * 10 : 10;
    userState.xp += earnedXp;
    while (userState.xp >= userState.level * 100) {
        userState.xp -= userState.level * 100;
        userState.level++;
        showToast(`TABRIKLAYMIZ! Siz ${userState.level}-darajaga ko‘tarildingiz! ⭐`, 'info');
    }

    // O'yinning keyingi darajasini ochish
    if (isWin) {
        const gId = activeGameSession.gameObj.id;
        userState.gameLevels[gId] = (userState.gameLevels[gId] || 1) + 1;
    }

    // Tarixga yozish
    userState.history.unshift({
        gameName: activeGameSession.gameObj.title,
        level: activeGameSession.level,
        score: `${activeGameSession.score}/${activeGameSession.totalQuestions}`,
        coins: activeGameSession.sessionCoins + perfectBonus
    });
    if (userState.history.length > 15) userState.history.pop();

    saveUser();
    updateAllUI();

    // Modalni ko'rsatish
    const modal = document.getElementById('result-modal');
    modal.classList.remove('hidden');

    if (isWin) {
        sound.playVictory();
        launchConfetti();
        document.getElementById('modal-emoji').textContent = '🏆';
        document.getElementById('modal-title').textContent = 'Ajoyib G‘alaba!';
        document.getElementById('modal-subtitle').textContent = `${activeGameSession.gameObj.title} — Level ${activeGameSession.level} yakunlandi!`;
        document.getElementById('modal-stars').textContent = perfectBonus > 0 ? '⭐⭐⭐' : '⭐⭐';
        document.getElementById('modal-next-btn').style.display = 'inline-flex';
    } else {
        sound.playWrong();
        document.getElementById('modal-emoji').textContent = '💔';
        document.getElementById('modal-title').textContent = 'Urinishlar tugadi!';
        document.getElementById('modal-subtitle').textContent = 'Xavotir olmang, yana bir bor urinib ko‘ring!';
        document.getElementById('modal-stars').textContent = '⭐';
        document.getElementById('modal-next-btn').style.display = 'none';
    }

    document.getElementById('modal-score').textContent = `${activeGameSession.score} / ${activeGameSession.totalQuestions}`;
    document.getElementById('modal-coins').textContent = `+${activeGameSession.sessionCoins} 🪙`;
    document.getElementById('modal-bonus').textContent = `+${perfectBonus} 🪙`;
}

document.getElementById('modal-menu-btn').addEventListener('click', () => {
    sound.playClick();
    document.getElementById('result-modal').classList.add('hidden');
    navigateTo('games');
});

document.getElementById('modal-next-btn').addEventListener('click', () => {
    sound.playClick();
    document.getElementById('result-modal').classList.add('hidden');
    startGame(activeGameSession.gameObj.id);
});

// ---------------- 9. TANGALAR, DO'KON, REYTING VA SOVG'ALAR ----------------
function addCoins(amount) {
    userState.coins += amount;
    userState.totalCoinsEarned += amount;
    document.getElementById('header-coins').textContent = userState.coins;
    saveUser();
}

window.buyBonus = function(type, cost) {
    sound.playClick();
    if (userState.coins < cost) {
        showToast('Tangalaringiz yetarli emas! Ko‘proq o‘yin o‘ynang 🪙', 'error');
        return;
    }
    userState.coins -= cost;
    sound.playCoin();

    if (type === 'extraHeart') {
        userState.bonuses.extraHeart++;
        showToast('Qo‘shimcha jon (+1 ❤️) sotib olindi!', 'success');
    } else if (type === 'extraTime') {
        userState.bonuses.extraTime++;
        showToast('Vaqt sekinlatgich (+15s ⏳) faollashtirildi!', 'success');
    } else if (type === 'crownAvatar') {
        userState.avatar = '👑';
        showToast('Qirollik Toji avatari o‘rnatildi! 👑', 'success');
    }

    saveUser();
    updateAllUI();
};

function getSortedLeaderboard() {
    const allPlayers = [
        ...BOT_PLAYERS,
        {
            username: userState.username,
            ageGroup: userState.ageGroup,
            level: userState.level,
            coins: userState.coins,
            avatar: userState.avatar,
            isCurrentUser: true
        }
    ];
    return allPlayers.sort((a, b) => b.coins - a.coins).slice(0, 10);
}

function renderLeaderboard() {
    const top10 = getSortedLeaderboard();
    const tbody = document.getElementById('leaderboard-body');

    tbody.innerHTML = top10.map((p, index) => {
        const rank = index + 1;
        let rankDisplay = `<b>#${rank}</b>`;
        if (rank === 1) rankDisplay = '<span class="medal-badge">🥇</span>';
        if (rank === 2) rankDisplay = '<span class="medal-badge">🥈</span>';
        if (rank === 3) rankDisplay = '<span class="medal-badge">🥉</span>';

        return `
            <tr class="${p.isCurrentUser ? 'current-user-row' : ''}">
                <td>${rankDisplay}</td>
                <td>${p.avatar} ${p.username} ${p.isCurrentUser ? '(Siz)' : ''}</td>
                <td>${p.ageGroup} yosh</td>
                <td>Level ${p.level}</td>
                <td><b class="gold-text">${p.coins} 🪙</b></td>
            </tr>
        `;
    }).join('');
}

function renderProfilePage() {
    document.getElementById('profile-big-avatar').textContent = userState.avatar;
    document.getElementById('profile-username').textContent = userState.username;
    document.getElementById('profile-level').textContent = userState.level;

    const neededXp = userState.level * 100;
    document.getElementById('profile-xp-text').textContent = `${userState.xp} / ${neededXp}`;
    document.getElementById('profile-xp-fill').style.width = `${(userState.xp / neededXp) * 100}%`;

    document.getElementById('stat-games-played').textContent = userState.gamesPlayed;
    document.getElementById('stat-correct-answers').textContent = userState.correctAnswers;
    document.getElementById('stat-wrong-answers').textContent = userState.wrongAnswers;

    const totalAns = userState.correctAnswers + userState.wrongAnswers;
    const acc = totalAns > 0 ? Math.round((userState.correctAnswers / totalAns) * 100) : 0;
    document.getElementById('stat-accuracy').textContent = `${acc}%`;
    document.getElementById('stat-best-streak').textContent = userState.maxStreak;
    document.getElementById('stat-total-coins').textContent = `${userState.totalCoinsEarned} 🪙`;

    // Achievements
    const achGrid = document.getElementById('achievements-grid');
    achGrid.innerHTML = ACHIEVEMENTS_LIST.map(a => {
        const unlocked = a.check(userState);
        return `
            <div class="ach-card ${unlocked ? 'unlocked' : ''}">
                <div class="ach-icon">${a.icon}</div>
                <div class="ach-info">
                    <h5>${a.title}</h5>
                    <p>${a.desc}</p>
                </div>
            </div>
        `;
    }).join('');

    // Tarix
    const histBody = document.getElementById('history-table-body');
    if (userState.history.length === 0) {
        histBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Hali o‘yinlar o‘ynalmagan</td></tr>';
    } else {
        histBody.innerHTML = userState.history.map(h => `
            <tr>
                <td>${h.gameName}</td>
                <td>Level ${h.level}</td>
                <td>${h.score}</td>
                <td class="gold-text">+${h.coins} 🪙</td>
            </tr>
        `).join('');
    }
}

// Avatar tanlash
document.querySelectorAll('.av-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        sound.playClick();
        userState.avatar = btn.dataset.av.trim();
        saveUser();
        updateAllUI();
        showToast('Avatar yangilandi!', 'success');
    });
});

// Har kungi sovg'a (Daily Reward)
function renderGiftsPage() {
    const todayStr = new Date().toDateString();
    const canClaim = userState.lastDailyClaim !== todayStr;

    const btn = document.getElementById('claim-daily-btn');
    const badge = document.getElementById('gift-badge');

    if (canClaim) {
        btn.disabled = false;
        btn.textContent = 'SOVG‘ANI OLISH ✨';
        document.getElementById('chest-title').textContent = 'Bugungi sovg‘angiz tayyor!';
        badge.classList.remove('hidden');
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.textContent = 'Bugungi sovg‘a olingan ✓';
        document.getElementById('chest-title').textContent = 'Ertaga yana keling!';
        badge.classList.add('hidden');
    }

    const calGrid = document.getElementById('daily-calendar-grid');
    const rewards = [50, 75, 100, 125, 150, 200, 300];
    calGrid.innerHTML = rewards.map((rew, idx) => {
        const claimed = idx < (userState.dailyDaysClaimed % 7);
        return `
            <div class="cal-day ${claimed ? 'claimed' : ''}">
                <div style="font-size:0.85rem;font-weight:700;">${idx + 1}-kun</div>
                <div style="font-size:1.8rem;margin:6px 0;">${claimed ? '✅' : '🎁'}</div>
                <div class="gold-text" style="font-weight:800;">+${rew} 🪙</div>
            </div>
        `;
    }).join('');
}

document.getElementById('claim-daily-btn').addEventListener('click', () => {
    const todayStr = new Date().toDateString();
    if (userState.lastDailyClaim === todayStr) return;

    const rewards = [50, 75, 100, 125, 150, 200, 300];
    const dayIdx = userState.dailyDaysClaimed % 7;
    const prize = rewards[dayIdx];

    userState.lastDailyClaim = todayStr;
    userState.dailyDaysClaimed++;
    addCoins(prize);

    sound.playVictory();
    launchConfetti();
    showToast(`Tabriklaymiz! Kunlik sovg‘a: +${prize} tanga! 🎁`, 'success');
    saveUser();
    updateAllUI();
});

// ---------------- 10. SOZLAMALAR VA EFFEKTLAR ----------------
function renderSettingsPage() {
    document.getElementById('settings-username').value = userState.username;
    document.getElementById('settings-age-select').value = userState.ageGroup;
}

document.getElementById('save-settings-btn').addEventListener('click', () => {
    sound.playClick();
    const newName = document.getElementById('settings-username').value.trim();
    const newAge = document.getElementById('settings-age-select').value;

    if (newName) userState.username = newName;
    userState.ageGroup = newAge;

    saveUser();
    applyAgeTheme(newAge);
    updateAllUI();
    showToast('Sozlamalar muvaffaqiyatli saqlandi! 💾', 'success');
});

document.getElementById('reset-progress-btn').addEventListener('click', () => {
    if (confirm('Haqiqatan ham barcha tangalar va darajalarni nollamoqchimisiz?')) {
        const keepName = userState.username;
        const keepAge = userState.ageGroup;
        userState = { ...JSON.parse(JSON.stringify(DEFAULT_USER)), username: keepName, ageGroup: keepAge };
        saveUser();
        updateAllUI();
        showToast('Barcha natijalar nollandi.', 'info');
    }
});

// Audio boshqaruvi
document.getElementById('toggle-music').addEventListener('change', (e) => {
    sound.musicEnabled = e.target.checked;
    if (sound.musicEnabled) sound.startBackgroundMusic();
    else sound.stopBackgroundMusic();
});

document.getElementById('toggle-sfx').addEventListener('change', (e) => {
    sound.sfxEnabled = e.target.checked;
});

document.getElementById('volume-slider').addEventListener('input', (e) => {
    const val = e.target.value;
    sound.volume = val / 100;
    document.getElementById('volume-val').textContent = `${val}%`;
});

document.getElementById('quick-sound-btn').addEventListener('click', (e) => {
    const isMuted = !sound.musicEnabled && !sound.sfxEnabled;
    sound.musicEnabled = isMuted;
    sound.sfxEnabled = isMuted;
    document.getElementById('toggle-music').checked = isMuted;
    document.getElementById('toggle-sfx').checked = isMuted;
    e.target.textContent = isMuted ? '🔊' : '🔇';
    if (isMuted) sound.startBackgroundMusic();
    else sound.stopBackgroundMusic();
});

// Toast xabarlar
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Uchuvchi tanga animatsiyasi
function spawnFloatingCoin(text) {
    const el = document.createElement('div');
    el.className = 'floating-coin';
    el.textContent = text;
    el.style.left = `${window.innerWidth / 2 - 40}px`;
    el.style.top = `${window.innerHeight / 2}px`;
    document.getElementById('floating-coins-container').appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

// Konfetti va Yulduzchalar animatsiyasi
function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4', '#6A4C93', '#00F5D4'];

    for (let i = 0; i < 120; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 6,
            h: Math.random() * 10 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 4 + 2,
            speedX: Math.random() * 4 - 2,
            rot: Math.random() * 360
        });
    }

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rot += 5;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        frame++;
        if (frame < 160) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    animate();
}