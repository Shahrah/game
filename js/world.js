/* ============================================
   WORLD DATA - Regions, Cities, NPCs, Enemies
   ============================================ */

const World = {
    regions: [
        {
            id: 'village',
            name: 'قرية البداية',
            desc: 'قرية هادئة حيث تبدأ رحلتك. تعلّم أساسيات القتال هنا.',
            unlocked: true,
            type: 'village',
            color: '#4ecdc4',
            mapPos: { x: 400, y: 400 },
            terrain: { ground: '#5a8f5a', size: 200 },
            difficulty: 'easy',
            subjects: ['math'],
            grade: 1,
            buildings: [
                { type: 'house', x: 20, z: 20, w: 8, h: 6, d: 8, color: '#8B7355' },
                { type: 'house', x: -25, z: 15, w: 10, h: 7, d: 8, color: '#A0522D' },
                { type: 'shop', x: 0, z: -20, w: 12, h: 8, d: 10, color: '#DAA520', label: 'المتجر' },
                { type: 'tower', x: 30, z: -25, w: 6, h: 15, d: 6, color: '#708090' },
                { type: 'house', x: -30, z: -15, w: 8, h: 6, d: 8, color: '#8B7355' },
                { type: 'well', x: 0, z: 0, w: 4, h: 3, d: 4, color: '#696969' },
                { type: 'tree', x: 35, z: 10, w: 2, h: 8, d: 2, color: '#228B22' },
                { type: 'tree', x: -35, z: 25, w: 2, h: 10, d: 2, color: '#228B22' },
                { type: 'tree', x: 40, z: -10, w: 2, h: 7, d: 2, color: '#228B22' },
                { type: 'fence', x: 15, z: 30, w: 20, h: 2, d: 1, color: '#8B4513' },
            ],
            npcs: [
                { id: 'elder', name: 'الشيخ حكيم', type: 'elder', x: 5, z: 5, emoji: '👴',
                  dialog: [
                      'مرحباً أيها المحارب! أنا الشيخ حكيم.',
                      'قريتنا تحتاج بطلاً يحارب الجهل بسلاح العلم.',
                      'استخدم سلاح الرياضيات لهزيمة الأعداء في الغابة.',
                      'اهزم زعيم الغابة لفتح مدينة المعادلات!'
                  ]},
                { id: 'shopkeeper', name: 'التاجر سالم', type: 'shopkeeper', x: 0, z: -15, emoji: '🧔',
                  dialog: [
                      'مرحباً! أنا التاجر سالم.',
                      'أبيع أسلحة علمية وعناصر مساعدة.',
                      'اكسب الذهب من المعارك لشراء أسلحة جديدة!'
                  ]},
                { id: 'trainer', name: 'المدربة نور', type: 'trainer', x: -20, z: 10, emoji: '👩‍🏫',
                  dialog: [
                      'أهلاً! أنا المدربة نور.',
                      'سأعلمك كيف تقاتل بالعلم.',
                      'اقترب من عدو لبدء معركة.',
                      'أجب الأسئلة بشكل صحيح لإلحاق الضرر!',
                      'الإجابات المتتالية الصحيحة تعطيك كومبو مدمّر!'
                  ]}
            ],
            enemies: [
                { id: 'slime1', name: 'وحش الأعداد', level: 1, hp: 60, dmg: 8, xp: 30, gold: 20, x: 40, z: 40, emoji: '👾', isBoss: false },
                { id: 'slime2', name: 'شبح الجمع', level: 1, hp: 50, dmg: 7, xp: 25, gold: 15, x: -40, z: 35, emoji: '👻', isBoss: false },
                { id: 'slime3', name: 'وحش الطرح', level: 2, hp: 70, dmg: 10, xp: 35, gold: 25, x: 45, z: -40, emoji: '🦇', isBoss: false },
                { id: 'boss_village', name: 'تنين الحساب', level: 3, hp: 150, dmg: 15, xp: 100, gold: 80, x: -45, z: -40, emoji: '🐉', isBoss: true,
                  unlocks: 'forest' }
            ],
            chests: [
                { id: 'chest1', x: 25, z: -5, gold: 30, item: 'health_potion' },
            ]
        },
        {
            id: 'forest',
            name: 'غابة المعادلات',
            desc: 'غابة كثيفة مليئة بوحوش الجبر. حل المعادلات للنجاة!',
            unlocked: false,
            type: 'forest',
            color: '#228B22',
            mapPos: { x: 250, y: 300 },
            terrain: { ground: '#3d6b3d', size: 250 },
            difficulty: 'easy',
            subjects: ['math'],
            grade: 1,
            buildings: [
                { type: 'tree', x: 20, z: 20, w: 3, h: 12, d: 3, color: '#1a5c1a' },
                { type: 'tree', x: -15, z: 30, w: 3, h: 14, d: 3, color: '#2d8b2d' },
                { type: 'tree', x: 35, z: -10, w: 4, h: 16, d: 4, color: '#1a5c1a' },
                { type: 'tree', x: -30, z: -20, w: 3, h: 11, d: 3, color: '#2d8b2d' },
                { type: 'tree', x: 10, z: -35, w: 3, h: 13, d: 3, color: '#1a5c1a' },
                { type: 'tree', x: -40, z: 10, w: 4, h: 15, d: 4, color: '#2d8b2d' },
                { type: 'tree', x: 45, z: 30, w: 3, h: 10, d: 3, color: '#1a5c1a' },
                { type: 'tree', x: -10, z: -45, w: 3, h: 12, d: 3, color: '#2d8b2d' },
                { type: 'rock', x: 25, z: -25, w: 5, h: 3, d: 4, color: '#808080' },
                { type: 'rock', x: -20, z: 40, w: 6, h: 4, d: 5, color: '#696969' },
                { type: 'cabin', x: -5, z: -5, w: 8, h: 5, d: 6, color: '#8B4513' },
            ],
            npcs: [
                { id: 'hermit', name: 'الناسك عمر', type: 'hermit', x: -5, z: -2, emoji: '🧙',
                  dialog: [
                      'أهلاً يا بطل! أنا أعيش في هذه الغابة.',
                      'الوحوش هنا تتغذى على الجهل بالمعادلات.',
                      'اهزم زعيم الغابة لفتح الطريق إلى مدينة الفيزياء!'
                  ]}
            ],
            enemies: [
                { id: 'wolf1', name: 'ذئب المتغيرات', level: 3, hp: 80, dmg: 12, xp: 40, gold: 30, x: 30, z: 30, emoji: '🐺', isBoss: false },
                { id: 'wolf2', name: 'أفعى المعادلات', level: 3, hp: 90, dmg: 13, xp: 45, gold: 35, x: -35, z: 25, emoji: '🐍', isBoss: false },
                { id: 'wolf3', name: 'عنكبوت الأسس', level: 4, hp: 100, dmg: 15, xp: 50, gold: 40, x: 40, z: -30, emoji: '🕷️', isBoss: false },
                { id: 'wolf4', name: 'خفاش الجذور', level: 4, hp: 95, dmg: 14, xp: 48, gold: 38, x: -30, z: -35, emoji: '🦇', isBoss: false },
                { id: 'boss_forest', name: 'عملاق الجبر', level: 5, hp: 200, dmg: 20, xp: 150, gold: 120, x: 0, z: 45, emoji: '👹', isBoss: true,
                  unlocks: 'physics_city' }
            ],
            chests: [
                { id: 'chest2', x: -30, z: 0, gold: 50, item: 'hint_scroll' },
                { id: 'chest3', x: 35, z: -20, gold: 40, item: 'health_potion' },
            ]
        },
        {
            id: 'physics_city',
            name: 'مدينة الفيزياء',
            desc: 'مدينة متطورة حيث تتعلم قوانين الفيزياء. يُفتح سلاح الفيزياء!',
            unlocked: false,
            type: 'city',
            color: '#ff6b6b',
            mapPos: { x: 150, y: 200 },
            terrain: { ground: '#4a4a5a', size: 300 },
            difficulty: 'medium',
            subjects: ['math', 'physics'],
            grade: 2,
            unlocksWeapon: 1,
            buildings: [
                { type: 'building', x: 25, z: 25, w: 15, h: 20, d: 12, color: '#4a6fa5' },
                { type: 'building', x: -25, z: 20, w: 12, h: 25, d: 10, color: '#5a7fb5' },
                { type: 'lab', x: 0, z: -25, w: 18, h: 12, d: 15, color: '#c0c0c0', label: 'مختبر الفيزياء' },
                { type: 'building', x: 35, z: -15, w: 10, h: 18, d: 10, color: '#4a6fa5' },
                { type: 'building', x: -35, z: -10, w: 14, h: 22, d: 11, color: '#5a7fb5' },
                { type: 'shop', x: 30, z: 0, w: 10, h: 8, d: 8, color: '#DAA520', label: 'المتجر' },
                { type: 'monument', x: 0, z: 0, w: 4, h: 10, d: 4, color: '#FFD700' },
                { type: 'lamp', x: 15, z: 10, w: 1, h: 6, d: 1, color: '#FFD700' },
                { type: 'lamp', x: -15, z: 10, w: 1, h: 6, d: 1, color: '#FFD700' },
            ],
            npcs: [
                { id: 'professor', name: 'البروفيسور فاطمة', type: 'professor', x: 0, z: -20, emoji: '👩‍🔬',
                  dialog: [
                      'مرحباً في مدينة الفيزياء!',
                      'هنا ستتعلم قوانين نيوتن والحركة والقوى.',
                      'لقد فتحتَ سلاح الفيزياء! استخدمه ضد الأعداء.',
                      'اهزم زعيم المدينة لفتح كهف الكيمياء!'
                  ]},
                { id: 'engineer', name: 'المهندس خالد', type: 'engineer', x: 25, z: 0, emoji: '👨‍🔧',
                  dialog: [
                      'أنا المهندس خالد. أبني أشياء باستخدام الفيزياء!',
                      'القوة = الكتلة × التسارع. تذكر هذا دائماً!'
                  ]}
            ],
            enemies: [
                { id: 'robot1', name: 'روبوت نيوتن', level: 5, hp: 120, dmg: 18, xp: 60, gold: 45, x: 40, z: 40, emoji: '🤖', isBoss: false },
                { id: 'robot2', name: 'حارس الجاذبية', level: 6, hp: 140, dmg: 20, xp: 70, gold: 50, x: -40, z: 35, emoji: '⚡', isBoss: false },
                { id: 'robot3', name: 'وحش الكهرباء', level: 6, hp: 130, dmg: 22, xp: 65, gold: 48, x: 45, z: -35, emoji: '🔋', isBoss: false },
                { id: 'robot4', name: 'شبح الموجات', level: 7, hp: 150, dmg: 23, xp: 75, gold: 55, x: -45, z: -30, emoji: '📡', isBoss: false },
                { id: 'boss_physics', name: 'سيد القوى', level: 8, hp: 280, dmg: 28, xp: 200, gold: 180, x: 0, z: -50, emoji: '⚙️', isBoss: true,
                  unlocks: 'chemistry_cave' }
            ],
            chests: [
                { id: 'chest4', x: -30, z: -30, gold: 70, item: 'shield_charm' },
                { id: 'chest5', x: 35, z: 30, gold: 60, item: 'super_potion' },
            ]
        },
        {
            id: 'chemistry_cave',
            name: 'كهف الكيمياء',
            desc: 'كهف غامض مليء بالتفاعلات الكيميائية. يُفتح سلاح الكيمياء!',
            unlocked: false,
            type: 'cave',
            color: '#a78bfa',
            mapPos: { x: 300, y: 120 },
            terrain: { ground: '#3a2d4f', size: 250 },
            difficulty: 'medium',
            subjects: ['math', 'physics', 'chemistry'],
            grade: 2,
            unlocksWeapon: 2,
            buildings: [
                { type: 'stalagmite', x: 15, z: 20, w: 3, h: 8, d: 3, color: '#6b5b7b' },
                { type: 'stalagmite', x: -20, z: 15, w: 4, h: 10, d: 4, color: '#7b6b8b' },
                { type: 'stalagmite', x: 30, z: -15, w: 3, h: 7, d: 3, color: '#6b5b7b' },
                { type: 'stalagmite', x: -10, z: -30, w: 5, h: 12, d: 5, color: '#7b6b8b' },
                { type: 'crystal', x: 20, z: -20, w: 2, h: 5, d: 2, color: '#e040fb' },
                { type: 'crystal', x: -25, z: 25, w: 2, h: 6, d: 2, color: '#7c4dff' },
                { type: 'pool', x: 0, z: 0, w: 10, h: 1, d: 10, color: '#00e676' },
                { type: 'lab', x: -30, z: -5, w: 10, h: 7, d: 8, color: '#5a5a6a', label: 'مختبر الكيمياء' },
            ],
            npcs: [
                { id: 'alchemist', name: 'الكيميائي جابر', type: 'alchemist', x: -28, z: -2, emoji: '🧪',
                  dialog: [
                      'أهلاً! أنا الكيميائي جابر.',
                      'فتحتَ سلاح الكيمياء! العناصر والتفاعلات قوتك الجديدة.',
                      'تعلّم الجدول الدوري لتصبح أقوى!',
                      'اهزم زعيم الكهف للوصول إلى قلعة العلوم!'
                  ]}
            ],
            enemies: [
                { id: 'golem1', name: 'غولم الحديد', level: 7, hp: 160, dmg: 22, xp: 80, gold: 60, x: 35, z: 35, emoji: '🗿', isBoss: false },
                { id: 'golem2', name: 'شبح الأحماض', level: 8, hp: 170, dmg: 25, xp: 85, gold: 65, x: -35, z: 30, emoji: '☠️', isBoss: false },
                { id: 'golem3', name: 'وحش التفاعلات', level: 8, hp: 180, dmg: 24, xp: 90, gold: 70, x: 40, z: -35, emoji: '💀', isBoss: false },
                { id: 'golem4', name: 'تنين العناصر', level: 9, hp: 190, dmg: 26, xp: 95, gold: 75, x: -40, z: -35, emoji: '🔥', isBoss: false },
                { id: 'boss_cave', name: 'ملك المحاليل', level: 10, hp: 350, dmg: 32, xp: 250, gold: 220, x: 0, z: -45, emoji: '🧫', isBoss: true,
                  unlocks: 'science_castle' }
            ],
            chests: [
                { id: 'chest6', x: 25, z: -10, gold: 90, item: 'power_gem' },
                { id: 'chest7', x: -20, z: -25, gold: 80, item: 'super_potion' },
            ]
        },
        {
            id: 'science_castle',
            name: 'قلعة العلوم',
            desc: 'القلعة النهائية! اجمع كل معارفك لهزيمة سيد الجهل.',
            unlocked: false,
            type: 'castle',
            color: '#ffd166',
            mapPos: { x: 500, y: 150 },
            terrain: { ground: '#5a4a3a', size: 300 },
            difficulty: 'hard',
            subjects: ['math', 'physics', 'chemistry'],
            grade: 3,
            buildings: [
                { type: 'castle_wall', x: 0, z: 45, w: 80, h: 15, d: 3, color: '#808080' },
                { type: 'castle_wall', x: 0, z: -45, w: 80, h: 15, d: 3, color: '#808080' },
                { type: 'castle_wall', x: 45, z: 0, w: 3, h: 15, d: 80, color: '#808080' },
                { type: 'castle_wall', x: -45, z: 0, w: 3, h: 15, d: 80, color: '#808080' },
                { type: 'tower', x: 42, z: 42, w: 8, h: 25, d: 8, color: '#696969' },
                { type: 'tower', x: -42, z: 42, w: 8, h: 25, d: 8, color: '#696969' },
                { type: 'tower', x: 42, z: -42, w: 8, h: 25, d: 8, color: '#696969' },
                { type: 'tower', x: -42, z: -42, w: 8, h: 25, d: 8, color: '#696969' },
                { type: 'throne', x: 0, z: -30, w: 12, h: 15, d: 10, color: '#4a0e4e' },
                { type: 'banner', x: 10, z: 0, w: 1, h: 10, d: 1, color: '#ff0000' },
                { type: 'banner', x: -10, z: 0, w: 1, h: 10, d: 1, color: '#0000ff' },
                { type: 'shop', x: -30, z: 30, w: 10, h: 8, d: 8, color: '#DAA520', label: 'المتجر الملكي' },
            ],
            npcs: [
                { id: 'king', name: 'الملك العالم', type: 'king', x: 0, z: 20, emoji: '👑',
                  dialog: [
                      'أهلاً أيها البطل! وصلت أخيراً إلى قلعة العلوم.',
                      'سيد الجهل يختبئ في قاعة العرش.',
                      'ستحتاج كل أسلحتك العلمية لهزيمته.',
                      'الرياضيات والفيزياء والكيمياء معاً!',
                      'اذهب وحرر مملكتنا من الجهل!'
                  ]},
                { id: 'sage', name: 'الحكيمة زينب', type: 'sage', x: -28, z: 28, emoji: '🧓',
                  dialog: [
                      'أنا الحكيمة زينب. عشت مئة عام في هذه القلعة.',
                      'أقوى سلاح هو المعرفة.',
                      'اجمع بين الرياضيات والفيزياء والكيمياء!'
                  ]}
            ],
            enemies: [
                { id: 'knight1', name: 'فارس المعادلات', level: 10, hp: 220, dmg: 30, xp: 120, gold: 90, x: 30, z: 30, emoji: '⚔️', isBoss: false },
                { id: 'knight2', name: 'حارس القوانين', level: 11, hp: 240, dmg: 32, xp: 130, gold: 95, x: -30, z: 25, emoji: '🛡️', isBoss: false },
                { id: 'knight3', name: 'ساحر العناصر', level: 11, hp: 230, dmg: 35, xp: 125, gold: 92, x: 35, z: -25, emoji: '🔮', isBoss: false },
                { id: 'knight4', name: 'قائد الظلام', level: 12, hp: 260, dmg: 35, xp: 140, gold: 100, x: -35, z: -25, emoji: '👿', isBoss: false },
                { id: 'boss_castle', name: 'سيد الجهل', level: 15, hp: 500, dmg: 40, xp: 500, gold: 500, x: 0, z: -30, emoji: '👹', isBoss: true,
                  unlocks: 'victory' }
            ],
            chests: [
                { id: 'chest8', x: 30, z: -35, gold: 120, item: 'power_gem' },
                { id: 'chest9', x: -30, z: -35, gold: 100, item: 'super_potion' },
                { id: 'chest10', x: 0, z: 35, gold: 150, item: 'shield_charm' },
            ]
        }
    ],

    weapons: [
        {
            id: 0,
            name: 'سلاح الرياضيات',
            icon: '📐',
            subject: 'math',
            desc: 'جبر، هندسة، حساب مثلثات، تفاضل وتكامل',
            color: '#4ecdc4',
            unlocked: true,
            damage: 25,
            topics: ['جبر', 'هندسة', 'حساب مثلثات', 'تفاضل']
        },
        {
            id: 1,
            name: 'سلاح الفيزياء',
            icon: '⚛️',
            subject: 'physics',
            desc: 'ميكانيكا، كهرباء، موجات، حركة',
            color: '#ff6b6b',
            unlocked: false,
            damage: 30,
            topics: ['ميكانيكا', 'كهرباء', 'موجات', 'حركة']
        },
        {
            id: 2,
            name: 'سلاح الكيمياء',
            icon: '🧪',
            subject: 'chemistry',
            desc: 'عناصر، تفاعلات، محاليل، روابط',
            color: '#a78bfa',
            unlocked: false,
            damage: 35,
            topics: ['عناصر', 'تفاعلات', 'محاليل', 'روابط']
        }
    ],

    characters: [
        { id: 'warrior', name: 'المحارب', desc: 'متوازن القوة والدفاع', emoji: '⚔️', hp: 120, dmg: 25, def: 10, color: '#ff6b35' },
        { id: 'mage', name: 'العالِم', desc: 'ضرر عالي، دفاع منخفض', emoji: '🔬', hp: 90, dmg: 35, def: 5, color: '#a78bfa' },
        { id: 'tank', name: 'الحصن', desc: 'دفاع عالي، صبور', emoji: '🛡️', hp: 150, dmg: 20, def: 15, color: '#4ecdc4' },
        { id: 'ranger', name: 'المستكشف', desc: 'سريع ومرن', emoji: '🏹', hp: 100, dmg: 28, def: 8, color: '#ffd166' },
    ],

    shopItems: [
        { id: 'health_potion', name: 'جرعة صحة', icon: '❤️', desc: 'تستعيد 40 صحة', price: 50, effect: { type: 'heal', value: 40 }, max: 10, tab: 'items' },
        { id: 'super_potion', name: 'جرعة خارقة', icon: '💖', desc: 'تستعيد 80 صحة', price: 120, effect: { type: 'heal', value: 80 }, max: 5, tab: 'items' },
        { id: 'hint_scroll', name: 'لفافة تلميح', icon: '💡', desc: 'تكشف تلميحاً', price: 30, effect: { type: 'hint' }, max: 15, tab: 'items' },
        { id: 'shield_charm', name: 'تعويذة درع', icon: '🛡️', desc: 'تصد الهجوم القادم', price: 80, effect: { type: 'shield' }, max: 5, tab: 'items' },
        { id: 'power_gem', name: 'جوهرة القوة', icon: '💎', desc: 'الضربة القادمة مضاعفة', price: 100, effect: { type: 'power', value: 2 }, max: 5, tab: 'items' },
        { id: 'time_gem', name: 'جوهرة الوقت', icon: '⏰', desc: '+15 ثانية للمؤقت', price: 60, effect: { type: 'time', value: 15 }, max: 5, tab: 'items' },
        { id: 'math_upgrade', name: 'ترقية الرياضيات', icon: '📐⬆', desc: '+5 ضرر لسلاح الرياضيات', price: 200, effect: { type: 'weapon_upgrade', weapon: 0, value: 5 }, max: 3, tab: 'upgrades' },
        { id: 'physics_upgrade', name: 'ترقية الفيزياء', icon: '⚛️⬆', desc: '+5 ضرر لسلاح الفيزياء', price: 250, effect: { type: 'weapon_upgrade', weapon: 1, value: 5 }, max: 3, tab: 'upgrades' },
        { id: 'chemistry_upgrade', name: 'ترقية الكيمياء', icon: '🧪⬆', desc: '+5 ضرر لسلاح الكيمياء', price: 300, effect: { type: 'weapon_upgrade', weapon: 2, value: 5 }, max: 3, tab: 'upgrades' },
        { id: 'hp_upgrade', name: 'ترقية الصحة', icon: '❤️⬆', desc: '+20 صحة قصوى', price: 150, effect: { type: 'hp_upgrade', value: 20 }, max: 5, tab: 'upgrades' },
    ],

    loadingTips: [
        'هل تعلم؟ قوة الجاذبية على الأرض = 9.8 م/ث²',
        'هل تعلم؟ سرعة الضوء = 300,000 كم/ث',
        'هل تعلم؟ الماء يتكون من ذرتي هيدروجين وذرة أكسجين',
        'هل تعلم؟ مجموع زوايا المثلث = 180°',
        'هل تعلم؟ العدد π ≈ 3.14159',
        'هل تعلم؟ الذهب عدده الذري 79',
        'هل تعلم؟ القانون الثاني لنيوتن: F = ma',
        'هل تعلم؟ pH الماء النقي = 7',
        'هل تعلم؟ مساحة الدائرة = π × نق²',
        'هل تعلم؟ قانون أوم: V = IR',
        'هل تعلم؟ الإلكترون سالب الشحنة',
        'هل تعلم؟ حجم الكرة = 4/3 × π × نق³',
    ],

    getRegion(id) {
        return this.regions.find(r => r.id === id);
    },

    getWeapon(id) {
        return this.weapons.find(w => w.id === id);
    },

    getRandomTip() {
        return this.loadingTips[Math.floor(Math.random() * this.loadingTips.length)];
    }
};
