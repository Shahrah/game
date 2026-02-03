/* ============================================
   GAME DATA - Characters, Enemies, Levels, Items
   ============================================ */

const GameData = {

    // ---- Player Characters ----
    characters: [
        {
            id: 'knight',
            name: 'Equation Knight',
            avatar: '\u2694\uFE0F',
            description: 'Balanced fighter',
            baseHp: 120,
            baseDamage: 25,
            defense: 10,
            special: 'Shield Bash',
            specialDesc: 'Blocks next enemy attack',
            unlocked: true
        },
        {
            id: 'mage',
            name: 'Number Mage',
            avatar: '\u{1F9D9}',
            description: 'High damage, low HP',
            baseHp: 90,
            baseDamage: 35,
            defense: 5,
            special: 'Arcane Blast',
            specialDesc: 'Deals double damage',
            unlocked: true
        },
        {
            id: 'ranger',
            name: 'Fraction Ranger',
            avatar: '\u{1F3F9}',
            description: 'Fast attacker',
            baseHp: 100,
            baseDamage: 28,
            defense: 8,
            special: 'Quick Shot',
            specialDesc: 'Extra turn (free question)',
            unlocked: true
        },
        {
            id: 'paladin',
            name: 'Geometry Paladin',
            avatar: '\u{1F6E1}\uFE0F',
            description: 'Tank with healing',
            baseHp: 150,
            baseDamage: 20,
            defense: 15,
            special: 'Holy Light',
            specialDesc: 'Restores 30% HP',
            unlocked: true
        },
        {
            id: 'ninja',
            name: 'Algebra Ninja',
            avatar: '\u{1F977}',
            description: 'Critical hit master',
            baseHp: 85,
            baseDamage: 30,
            defense: 6,
            special: 'Shadow Strike',
            specialDesc: 'Guaranteed critical hit',
            unlocked: false,
            unlockCondition: 'Find all 5 world secrets'
        },
        {
            id: 'dragon',
            name: 'Prime Dragon',
            avatar: '\u{1F432}',
            description: 'Ultimate warrior',
            baseHp: 140,
            baseDamage: 38,
            defense: 12,
            special: 'Dragon Fire',
            specialDesc: 'Burns enemy for 3 turns',
            unlocked: false,
            unlockCondition: 'Complete all levels with 3 stars'
        }
    ],

    // ---- Worlds & Levels ----
    worlds: [
        {
            id: 'number-citadel',
            name: 'The Number Citadel',
            icon: '\u{1F3F0}',
            description: 'Master the basics of arithmetic',
            color: '#3b82f6',
            levels: [
                {
                    id: 1,
                    name: 'Gate Guards',
                    enemy: { name: 'Skeleton Soldier', avatar: '\u{1F480}', hp: 80, damage: 12, defense: 3 },
                    mathTopics: ['addition', 'subtraction'],
                    difficulty: 'easy',
                    questionsToWin: 6,
                    isBoss: false,
                    secretClue: null
                },
                {
                    id: 2,
                    name: 'The Dark Knight',
                    enemy: { name: 'Dark Knight', avatar: '\u{1F5E1}\uFE0F', hp: 110, damage: 18, defense: 5 },
                    mathTopics: ['multiplication', 'division', 'bodmas'],
                    difficulty: 'easy',
                    questionsToWin: 7,
                    isBoss: false,
                    secretClue: 'The first prime number that is even holds a secret...'
                },
                {
                    id: 3,
                    name: 'The Iron Golem',
                    enemy: { name: 'Iron Golem', avatar: '\u{1F916}', hp: 160, damage: 22, defense: 8 },
                    mathTopics: ['bodmas', 'multiplication', 'division'],
                    difficulty: 'medium',
                    questionsToWin: 8,
                    isBoss: true,
                    secretClue: null
                }
            ]
        },
        {
            id: 'fractional-forest',
            name: 'Fractional Forest',
            icon: '\u{1F332}',
            description: 'Navigate fractions, decimals & percentages',
            color: '#10b981',
            levels: [
                {
                    id: 4,
                    name: 'Forest Sprites',
                    enemy: { name: 'Forest Sprite', avatar: '\u{1F9DA}', hp: 100, damage: 15, defense: 4 },
                    mathTopics: ['fractions'],
                    difficulty: 'easy',
                    questionsToWin: 7,
                    isBoss: false,
                    secretClue: null
                },
                {
                    id: 5,
                    name: 'Shadow Wolves',
                    enemy: { name: 'Shadow Wolf', avatar: '\u{1F43A}', hp: 130, damage: 20, defense: 6 },
                    mathTopics: ['decimals', 'percentages'],
                    difficulty: 'medium',
                    questionsToWin: 7,
                    isBoss: false,
                    secretClue: 'What percentage of 200 is 50? That number unlocks power...'
                },
                {
                    id: 6,
                    name: 'The Treant',
                    enemy: { name: 'Ancient Treant', avatar: '\u{1F333}', hp: 200, damage: 24, defense: 10 },
                    mathTopics: ['fractions', 'decimals', 'percentages'],
                    difficulty: 'medium',
                    questionsToWin: 9,
                    isBoss: true,
                    secretClue: null
                }
            ]
        },
        {
            id: 'algebra-abyss',
            name: 'Algebra Abyss',
            icon: '\u{1F300}',
            description: 'Solve equations to survive the depths',
            color: '#8b5cf6',
            levels: [
                {
                    id: 7,
                    name: 'Abyss Wraiths',
                    enemy: { name: 'Abyss Wraith', avatar: '\u{1F47B}', hp: 140, damage: 22, defense: 5 },
                    mathTopics: ['linear_equations'],
                    difficulty: 'medium',
                    questionsToWin: 7,
                    isBoss: false,
                    secretClue: null
                },
                {
                    id: 8,
                    name: 'Dark Mages',
                    enemy: { name: 'Dark Mage', avatar: '\u{1F9D9}\u200D\u2642\uFE0F', hp: 120, damage: 28, defense: 4 },
                    mathTopics: ['linear_equations', 'expressions'],
                    difficulty: 'hard',
                    questionsToWin: 8,
                    isBoss: false,
                    secretClue: 'If 3x + 7 = 22, x reveals a hidden chamber...'
                },
                {
                    id: 9,
                    name: 'The Lich King',
                    enemy: { name: 'Lich King', avatar: '\u{1F451}', hp: 220, damage: 30, defense: 12 },
                    mathTopics: ['quadratics', 'linear_equations'],
                    difficulty: 'hard',
                    questionsToWin: 10,
                    isBoss: true,
                    secretClue: null
                }
            ]
        },
        {
            id: 'geometry-peaks',
            name: 'Geometry Peaks',
            icon: '\u{1F3D4}\uFE0F',
            description: 'Conquer shapes, angles & theorems',
            color: '#06b6d4',
            levels: [
                {
                    id: 10,
                    name: 'Rock Golems',
                    enemy: { name: 'Rock Golem', avatar: '\u{1FAA8}', hp: 180, damage: 25, defense: 12 },
                    mathTopics: ['area_perimeter'],
                    difficulty: 'medium',
                    questionsToWin: 8,
                    isBoss: false,
                    secretClue: null
                },
                {
                    id: 11,
                    name: 'Storm Eagles',
                    enemy: { name: 'Storm Eagle', avatar: '\u{1F985}', hp: 150, damage: 30, defense: 7 },
                    mathTopics: ['angles', 'triangles'],
                    difficulty: 'hard',
                    questionsToWin: 8,
                    isBoss: false,
                    secretClue: 'The angles of a triangle always sum to this number...'
                },
                {
                    id: 12,
                    name: 'The Dragon',
                    enemy: { name: 'Elder Dragon', avatar: '\u{1F409}', hp: 280, damage: 35, defense: 14 },
                    mathTopics: ['pythagoras', 'triangles', 'area_perimeter'],
                    difficulty: 'hard',
                    questionsToWin: 10,
                    isBoss: true,
                    secretClue: null
                }
            ]
        },
        {
            id: 'final-dimension',
            name: 'The Final Dimension',
            icon: '\u{1F30C}',
            description: 'Face the ultimate mathematical challenges',
            color: '#ec4899',
            levels: [
                {
                    id: 13,
                    name: 'Chaos Demons',
                    enemy: { name: 'Chaos Demon', avatar: '\u{1F47F}', hp: 200, damage: 32, defense: 10 },
                    mathTopics: ['statistics', 'probability'],
                    difficulty: 'hard',
                    questionsToWin: 9,
                    isBoss: false,
                    secretClue: null
                },
                {
                    id: 14,
                    name: 'Void Walkers',
                    enemy: { name: 'Void Walker', avatar: '\u{1F47E}', hp: 250, damage: 35, defense: 12 },
                    mathTopics: ['powers', 'roots', 'ratios'],
                    difficulty: 'hard',
                    questionsToWin: 10,
                    isBoss: false,
                    secretClue: 'The square root of 144 is the key to infinite power...'
                },
                {
                    id: 15,
                    name: 'The Dark Overlord',
                    enemy: { name: 'Dark Overlord', avatar: '\u{1F525}', hp: 350, damage: 40, defense: 16 },
                    mathTopics: ['quadratics', 'pythagoras', 'statistics', 'bodmas'],
                    difficulty: 'hard',
                    questionsToWin: 12,
                    isBoss: true,
                    secretClue: null
                }
            ]
        }
    ],

    // ---- Secret Level ----
    secretLevel: {
        id: 'secret',
        name: 'The Hidden Vault',
        enemy: { name: 'Math Guardian', avatar: '\u{1F47C}', hp: 300, damage: 35, defense: 15 },
        mathTopics: ['quadratics', 'pythagoras', 'statistics', 'bodmas', 'fractions', 'percentages'],
        difficulty: 'hard',
        questionsToWin: 10,
        isBoss: true,
        secretClue: null,
        unlockKeys: 3
    },

    // ---- Shop Items ----
    shopItems: [
        {
            id: 'health_potion',
            name: 'Health Potion',
            icon: '\u{1F9EA}',
            description: 'Restores 40 HP during battle',
            price: 50,
            effect: { type: 'heal', value: 40 },
            maxStack: 5
        },
        {
            id: 'super_potion',
            name: 'Super Potion',
            icon: '\u{1F48A}',
            description: 'Restores 80 HP during battle',
            price: 120,
            effect: { type: 'heal', value: 80 },
            maxStack: 3
        },
        {
            id: 'hint_scroll',
            name: 'Hint Scroll',
            icon: '\u{1F4DC}',
            description: 'Reveals a hint for the current question',
            price: 30,
            effect: { type: 'hint' },
            maxStack: 10
        },
        {
            id: 'time_crystal',
            name: 'Time Crystal',
            icon: '\u{1F48E}',
            description: 'Adds 15 extra seconds to the timer',
            price: 40,
            effect: { type: 'time', value: 15 },
            maxStack: 5
        },
        {
            id: 'shield_charm',
            name: 'Shield Charm',
            icon: '\u{1F6E1}\uFE0F',
            description: 'Blocks the next enemy attack',
            price: 80,
            effect: { type: 'shield' },
            maxStack: 3
        },
        {
            id: 'power_gem',
            name: 'Power Gem',
            icon: '\u{1F48E}',
            description: 'Next correct answer deals double damage',
            price: 100,
            effect: { type: 'power', value: 2 },
            maxStack: 3
        },
        {
            id: 'lucky_coin',
            name: 'Lucky Coin',
            icon: '\u{1FA99}',
            description: 'Eliminates one wrong answer option',
            price: 60,
            effect: { type: 'eliminate' },
            maxStack: 5
        }
    ],

    // ---- Achievements ----
    achievements: [
        { id: 'first_blood', name: 'First Blood', description: 'Win your first battle', icon: '\u{1F5E1}\uFE0F' },
        { id: 'perfect_round', name: 'Perfect Round', description: 'Win a battle without taking damage', icon: '\u{1F31F}' },
        { id: 'combo_master', name: 'Combo Master', description: 'Get a 5x combo', icon: '\u{1F525}' },
        { id: 'speed_demon', name: 'Speed Demon', description: 'Answer 5 questions in under 5 seconds each', icon: '\u26A1' },
        { id: 'world1_complete', name: 'Citadel Conqueror', description: 'Complete The Number Citadel', icon: '\u{1F3F0}' },
        { id: 'world2_complete', name: 'Forest Guardian', description: 'Complete Fractional Forest', icon: '\u{1F332}' },
        { id: 'world3_complete', name: 'Abyss Walker', description: 'Complete Algebra Abyss', icon: '\u{1F300}' },
        { id: 'world4_complete', name: 'Peak Climber', description: 'Complete Geometry Peaks', icon: '\u{1F3D4}\uFE0F' },
        { id: 'world5_complete', name: 'Dimension Master', description: 'Complete The Final Dimension', icon: '\u{1F30C}' },
        { id: 'secret_finder', name: 'Secret Finder', description: 'Discover your first secret', icon: '\u{1F510}' },
        { id: 'all_secrets', name: 'Master of Secrets', description: 'Find all world secrets', icon: '\u{1F511}' },
        { id: 'shopaholic', name: 'Shopaholic', description: 'Buy 10 items from the shop', icon: '\u{1F6D2}' },
        { id: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat your first boss', icon: '\u{1F451}' },
        { id: 'all_bosses', name: 'Boss Hunter', description: 'Defeat all bosses', icon: '\u{1F480}' },
        { id: 'math_genius', name: 'Math Genius', description: 'Answer 100 questions correctly', icon: '\u{1F9E0}' },
        { id: 'three_stars', name: 'Star Collector', description: 'Get 3 stars on any level', icon: '\u2B50' },
        { id: 'all_three_stars', name: 'Perfectionist', description: 'Get 3 stars on all levels', icon: '\u{1F3C6}' },
        { id: 'level_10', name: 'Veteran', description: 'Reach player level 10', icon: '\u{1F396}\uFE0F' },
        { id: 'secret_level', name: 'Vault Raider', description: 'Complete the secret level', icon: '\u{1F5DD}\uFE0F' },
        { id: 'game_complete', name: 'Math Champion', description: 'Complete the entire game', icon: '\u{1F3C6}' }
    ],

    // ---- XP & Level Configuration ----
    xpConfig: {
        baseXpPerQuestion: 15,
        correctAnswerXp: 20,
        comboXpBonus: 5, // per combo level
        speedBonusXp: 10, // under 5 seconds
        bossXpMultiplier: 2,
        xpPerLevel: [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000, 6200, 7600, 9200, 11000],
        hpPerLevel: 10,
        damagePerLevel: 3
    },

    // ---- Gold Rewards ----
    goldConfig: {
        baseGoldPerWin: 30,
        goldPerCorrect: 5,
        bossGoldMultiplier: 3,
        perfectBonusGold: 50,
        speedBonusGold: 10
    }
};
