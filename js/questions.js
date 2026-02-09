/* ============================================
   EDUCATIONAL QUESTIONS ENGINE
   Math, Physics, Chemistry - High School Level
   ============================================ */

const Questions = {
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    generateWrongAnswers(correct, count = 3, isDecimal = false) {
        const wrong = new Set();
        let attempts = 0;
        while (wrong.size < count && attempts < 60) {
            attempts++;
            let offset;
            if (isDecimal) {
                offset = (Math.random() * 2 - 1) * Math.max(1, Math.abs(correct * 0.35));
                const val = Math.round((correct + offset) * 100) / 100;
                if (val !== correct && val !== 0) wrong.add(val);
            } else {
                offset = this.randInt(1, Math.max(3, Math.abs(Math.round(correct * 0.3))));
                if (Math.random() > 0.5) offset = -offset;
                const val = correct + offset;
                if (val !== correct) wrong.add(val);
            }
        }
        let fill = 1;
        while (wrong.size < count) {
            if (!wrong.has(correct + fill)) wrong.add(correct + fill);
            if (wrong.size < count && !wrong.has(correct - fill)) wrong.add(correct - fill);
            fill++;
        }
        return [...wrong].slice(0, count);
    },

    makeQuestion(question, correct, hint, explanation, category, isDecimal = false) {
        const wrongAnswers = this.generateWrongAnswers(correct, 3, isDecimal);
        const displayCorrect = isDecimal ? Math.round(correct * 100) / 100 : correct;
        const options = this.shuffle([displayCorrect, ...wrongAnswers]);
        return { question, correctAnswer: displayCorrect, options, hint, explanation, category, type: 'multiple_choice', isBonus: false };
    },

    makeTextQuestion(question, correctText, wrongTexts, hint, explanation, category) {
        const options = this.shuffle([correctText, ...wrongTexts.slice(0, 3)]);
        return { question, correctAnswer: correctText, options, hint, explanation, category, type: 'multiple_choice', isBonus: false };
    },

    generate(subject, difficulty, grade) {
        const gen = this.subjects[subject];
        if (!gen) return this.subjects.math.algebra(difficulty, grade);
        const topics = Object.keys(gen);
        const topic = topics[Math.floor(Math.random() * topics.length)];
        return gen[topic].call(this, difficulty, grade);
    },

    generateForBattle(subject, difficulty, grade) {
        const q = this.generate(subject, difficulty, grade);
        return q;
    },

    generateBonus(subject, grade) {
        const q = this.generate(subject, 'hard', grade);
        q.isBonus = true;
        q.bonusReward = 'key';
        return q;
    },

    subjects: {
        math: {
            algebra(diff, grade) {
                const Q = Questions;
                if (grade <= 1) {
                    if (diff === 'easy') {
                        const a = Q.randInt(2, 10);
                        const x = Q.randInt(1, 15);
                        const b = Q.randInt(1, 20);
                        const result = a * x + b;
                        return Q.makeQuestion(
                            `${a}x + ${b} = ${result}، ما قيمة x؟`,
                            x,
                            'انقل الثابت للطرف الآخر ثم اقسم على معامل x',
                            `x = (${result} - ${b}) / ${a} = ${x}`,
                            'جبر'
                        );
                    } else if (diff === 'medium') {
                        const a = Q.randInt(2, 8);
                        const b = Q.randInt(1, 10);
                        const c = Q.randInt(1, 5);
                        const d = Q.randInt(1, 15);
                        const x = Q.randInt(1, 10);
                        const lhs = a * x + b;
                        const rhs = c * x + d;
                        const answer = x;
                        return Q.makeQuestion(
                            `${a}x + ${b} = ${c}x + ${rhs - c*x + c*x}، حيث الناتج = ${lhs}، ما قيمة x؟`,
                            answer,
                            'اجمع حدود x في طرف والأعداد في الطرف الآخر',
                            `x = ${answer}`,
                            'جبر'
                        );
                    } else {
                        const a = Q.randInt(1, 5);
                        const b = Q.randInt(-10, 10);
                        const c = -(a * b);
                        const sum = -(b + (c/a));
                        const x1 = Q.randInt(-5, 5);
                        const x2 = Q.randInt(-5, 5);
                        const A = 1;
                        const B = -(x1 + x2);
                        const C = x1 * x2;
                        return Q.makeQuestion(
                            `x² + (${B})x + (${C}) = 0، ما مجموع الجذرين؟`,
                            x1 + x2,
                            'مجموع الجذرين = -b/a',
                            `الجذران هما ${x1} و ${x2}، مجموعهما = ${x1 + x2}`,
                            'جبر'
                        );
                    }
                } else if (grade === 2) {
                    if (diff === 'easy') {
                        const x1 = Q.randInt(-8, 8);
                        const x2 = Q.randInt(-8, 8);
                        const B = -(x1 + x2);
                        const C = x1 * x2;
                        return Q.makeQuestion(
                            `x² ${B >= 0 ? '+' : ''}${B}x ${C >= 0 ? '+' : ''}${C} = 0، ما حاصل ضرب الجذرين؟`,
                            C,
                            'حاصل ضرب الجذرين = c/a',
                            `الجذران: ${x1}, ${x2}. حاصل ضربهما = ${C}`,
                            'جبر'
                        );
                    } else if (diff === 'medium') {
                        const n = Q.randInt(2, 6);
                        const r = Q.randInt(2, 4);
                        const terms = 4;
                        const sum = n * (Math.pow(r, terms) - 1) / (r - 1);
                        return Q.makeQuestion(
                            `متتالية هندسية حدها الأول ${n} وأساسها ${r}، ما مجموع أول ${terms} حدود؟`,
                            Math.round(sum),
                            'S = a(rⁿ - 1)/(r - 1)',
                            `S = ${n}(${r}^${terms} - 1)/(${r} - 1) = ${Math.round(sum)}`,
                            'متتاليات'
                        );
                    } else {
                        const a = Q.randInt(1, 4);
                        const d = Q.randInt(1, 5);
                        const n = Q.randInt(5, 15);
                        const sum = (n / 2) * (2 * a + (n - 1) * d);
                        return Q.makeQuestion(
                            `متتالية حسابية حدها الأول ${a} وأساسها ${d}، ما مجموع أول ${n} حدود؟`,
                            sum,
                            'S = n/2 × (2a + (n-1)d)',
                            `S = ${n}/2 × (2×${a} + ${n-1}×${d}) = ${sum}`,
                            'متتاليات'
                        );
                    }
                } else {
                    if (diff === 'easy') {
                        const n = Q.randInt(2, 6);
                        const r = Q.randInt(2, 4);
                        const result = Math.pow(n, r);
                        return Q.makeQuestion(
                            `ما قيمة ${n}^${r}؟`,
                            result,
                            `اضرب ${n} في نفسه ${r} مرات`,
                            `${n}^${r} = ${result}`,
                            'أسس ولوغاريتمات'
                        );
                    } else if (diff === 'medium') {
                        const base = Q.randInt(2, 5);
                        const exp = Q.randInt(2, 4);
                        const val = Math.pow(base, exp);
                        return Q.makeQuestion(
                            `log_${base}(${val}) = ?`,
                            exp,
                            'لو_أ(ب) = ج يعني أ^ج = ب',
                            `log_${base}(${val}) = ${exp} لأن ${base}^${exp} = ${val}`,
                            'أسس ولوغاريتمات'
                        );
                    } else {
                        const a = Q.randInt(1, 5);
                        const b = Q.randInt(1, 5);
                        const derivative = a * 2;
                        return Q.makeQuestion(
                            `ما مشتقة الدالة f(x) = ${a}x² + ${b}x عند x = 1؟`,
                            derivative + b,
                            "f'(x) = 2ax + b",
                            `f'(x) = ${2*a}x + ${b}, f'(1) = ${derivative + b}`,
                            'تفاضل'
                        );
                    }
                }
            },

            geometry(diff, grade) {
                const Q = Questions;
                if (diff === 'easy') {
                    const r = Q.randInt(2, 10);
                    const area = Math.round(Math.PI * r * r * 100) / 100;
                    return Q.makeQuestion(
                        `ما مساحة دائرة نصف قطرها ${r} سم؟ (π ≈ 3.14)`,
                        Math.round(3.14 * r * r * 100) / 100,
                        'المساحة = π × نق²',
                        `المساحة = 3.14 × ${r}² = ${Math.round(3.14 * r * r * 100) / 100} سم²`,
                        'هندسة',
                        true
                    );
                } else if (diff === 'medium') {
                    const a = Q.randInt(3, 12);
                    const b = Q.randInt(3, 12);
                    const h = Q.randInt(2, 8);
                    const vol = a * b * h;
                    return Q.makeQuestion(
                        `ما حجم متوازي مستطيلات أبعاده ${a}×${b}×${h} سم؟`,
                        vol,
                        'الحجم = الطول × العرض × الارتفاع',
                        `الحجم = ${a} × ${b} × ${h} = ${vol} سم³`,
                        'هندسة فراغية'
                    );
                } else {
                    const r = Q.randInt(2, 8);
                    const vol = Math.round((4/3) * 3.14 * r * r * r * 100) / 100;
                    return Q.makeQuestion(
                        `ما حجم كرة نصف قطرها ${r} سم؟ (π ≈ 3.14)`,
                        vol,
                        'الحجم = 4/3 × π × نق³',
                        `الحجم = 4/3 × 3.14 × ${r}³ = ${vol} سم³`,
                        'هندسة فراغية',
                        true
                    );
                }
            },

            trigonometry(diff, grade) {
                const Q = Questions;
                const angles = [
                    { deg: 30, sin: 0.5, cos: 0.87, tan: 0.58 },
                    { deg: 45, sin: 0.71, cos: 0.71, tan: 1 },
                    { deg: 60, sin: 0.87, cos: 0.5, tan: 1.73 },
                    { deg: 90, sin: 1, cos: 0, tan: null },
                ];
                if (diff === 'easy') {
                    const angle = angles[Q.randInt(0, 2)];
                    return Q.makeQuestion(
                        `ما قيمة sin(${angle.deg}°)؟`,
                        angle.sin,
                        'تذكر قيم الزوايا الخاصة',
                        `sin(${angle.deg}°) = ${angle.sin}`,
                        'حساب مثلثات',
                        true
                    );
                } else if (diff === 'medium') {
                    const angle = angles[Q.randInt(0, 2)];
                    return Q.makeQuestion(
                        `ما قيمة cos(${angle.deg}°)؟`,
                        angle.cos,
                        'تذكر: cos(30°) = √3/2, cos(45°) = √2/2, cos(60°) = 1/2',
                        `cos(${angle.deg}°) = ${angle.cos}`,
                        'حساب مثلثات',
                        true
                    );
                } else {
                    const a = Q.randInt(3, 15);
                    const angle = angles[Q.randInt(0, 2)];
                    const opp = Math.round(a * angle.sin * 100) / 100;
                    return Q.makeQuestion(
                        `مثلث قائم الزاوية، الوتر = ${a}، الزاوية = ${angle.deg}°، ما طول الضلع المقابل؟`,
                        opp,
                        'الضلع المقابل = الوتر × sin(الزاوية)',
                        `الضلع = ${a} × sin(${angle.deg}°) = ${a} × ${angle.sin} = ${opp}`,
                        'حساب مثلثات',
                        true
                    );
                }
            },

            calculus(diff, grade) {
                const Q = Questions;
                if (diff === 'easy') {
                    const a = Q.randInt(1, 8);
                    const n = Q.randInt(2, 5);
                    const da = a * n;
                    const dn = n - 1;
                    return Q.makeQuestion(
                        `ما مشتقة ${a}x^${n}؟ (المعامل الجديد)`,
                        da,
                        "قاعدة القوة: d/dx(axⁿ) = a·n·xⁿ⁻¹",
                        `d/dx(${a}x^${n}) = ${da}x^${dn}، المعامل = ${da}`,
                        'تفاضل'
                    );
                } else if (diff === 'medium') {
                    const a = Q.randInt(1, 5);
                    const n = Q.randInt(2, 4);
                    const integral_coeff_num = a;
                    const integral_coeff_den = n + 1;
                    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                    const g = gcd(integral_coeff_num, integral_coeff_den);
                    return Q.makeQuestion(
                        `ما تكامل ${a}x^${n} dx؟ (الأس الجديد)`,
                        n + 1,
                        '∫axⁿ dx = a·xⁿ⁺¹/(n+1) + C',
                        `∫${a}x^${n} dx = ${a}x^${n+1}/${n+1} + C، الأس = ${n+1}`,
                        'تكامل'
                    );
                } else {
                    const a = Q.randInt(1, 4);
                    const b = Q.randInt(1, 6);
                    const upper = Q.randInt(1, 5);
                    const val = a * Math.pow(upper, 2) / 2 + b * upper;
                    return Q.makeQuestion(
                        `∫₀^${upper} (${a}x + ${b}) dx = ?`,
                        val,
                        'احسب التكامل ثم عوّض بالحدود',
                        `= [${a}x²/2 + ${b}x]₀^${upper} = ${val}`,
                        'تكامل',
                        true
                    );
                }
            }
        },

        physics: {
            mechanics(diff, grade) {
                const Q = Questions;
                if (diff === 'easy') {
                    const m = Q.randInt(2, 20);
                    const a = Q.randInt(1, 10);
                    const f = m * a;
                    return Q.makeQuestion(
                        `جسم كتلته ${m} كجم وتسارعه ${a} م/ث²، ما القوة المؤثرة عليه؟`,
                        f,
                        'القانون الثاني لنيوتن: F = m × a',
                        `F = ${m} × ${a} = ${f} نيوتن`,
                        'ميكانيكا'
                    );
                } else if (diff === 'medium') {
                    const v0 = Q.randInt(0, 20);
                    const a = Q.randInt(1, 10);
                    const t = Q.randInt(1, 10);
                    const v = v0 + a * t;
                    return Q.makeQuestion(
                        `جسم سرعته الابتدائية ${v0} م/ث وتسارعه ${a} م/ث²، ما سرعته بعد ${t} ثوانٍ؟`,
                        v,
                        'v = v₀ + at',
                        `v = ${v0} + ${a}×${t} = ${v} م/ث`,
                        'ميكانيكا'
                    );
                } else {
                    const m = Q.randInt(1, 10);
                    const h = Q.randInt(2, 20);
                    const pe = m * 10 * h;
                    return Q.makeQuestion(
                        `جسم كتلته ${m} كجم على ارتفاع ${h} م، ما طاقة وضعه؟ (g = 10 م/ث²)`,
                        pe,
                        'طاقة الوضع = m × g × h',
                        `PE = ${m} × 10 × ${h} = ${pe} جول`,
                        'طاقة'
                    );
                }
            },

            electricity(diff, grade) {
                const Q = Questions;
                if (diff === 'easy') {
                    const v = Q.randInt(5, 50) * 2;
                    const r = Q.randInt(2, 20);
                    const i = v / r;
                    return Q.makeQuestion(
                        `دائرة كهربائية فرق جهدها ${v} فولت ومقاومتها ${r} أوم، ما شدة التيار؟`,
                        i,
                        'قانون أوم: I = V / R',
                        `I = ${v} / ${r} = ${i} أمبير`,
                        'كهرباء',
                        true
                    );
                } else if (diff === 'medium') {
                    const i = Q.randInt(1, 10);
                    const r = Q.randInt(2, 20);
                    const p = i * i * r;
                    return Q.makeQuestion(
                        `تيار شدته ${i} أمبير يمر في مقاومة ${r} أوم، ما القدرة الكهربائية؟`,
                        p,
                        'P = I² × R',
                        `P = ${i}² × ${r} = ${p} واط`,
                        'كهرباء'
                    );
                } else {
                    const r1 = Q.randInt(2, 10);
                    const r2 = Q.randInt(2, 10);
                    const r3 = Q.randInt(2, 10);
                    const total = r1 + r2 + r3;
                    return Q.makeQuestion(
                        `ثلاث مقاومات على التوالي: ${r1}Ω, ${r2}Ω, ${r3}Ω. ما المقاومة الكلية؟`,
                        total,
                        'على التوالي: R_total = R₁ + R₂ + R₃',
                        `R = ${r1} + ${r2} + ${r3} = ${total} أوم`,
                        'كهرباء'
                    );
                }
            },

            waves(diff, grade) {
                const Q = Questions;
                if (diff === 'easy') {
                    const f = Q.randInt(2, 20);
                    const wl = Q.randInt(2, 10);
                    const v = f * wl;
                    return Q.makeQuestion(
                        `موجة ترددها ${f} هرتز وطول موجتها ${wl} م، ما سرعتها؟`,
                        v,
                        'v = f × λ',
                        `v = ${f} × ${wl} = ${v} م/ث`,
                        'موجات'
                    );
                } else if (diff === 'medium') {
                    const v = 340;
                    const f = Q.randInt(100, 1000);
                    const wl = Math.round(v / f * 100) / 100;
                    return Q.makeQuestion(
                        `موجة صوتية ترددها ${f} هرتز في الهواء (v = 340 م/ث)، ما طول موجتها؟`,
                        wl,
                        'λ = v / f',
                        `λ = 340 / ${f} = ${wl} م`,
                        'موجات',
                        true
                    );
                } else {
                    const c = 300000000;
                    const choices = [
                        { name: 'الأشعة فوق البنفسجية', range: 'أقصر من الضوء المرئي' },
                        { name: 'الأشعة تحت الحمراء', range: 'أطول من الضوء المرئي' },
                        { name: 'أشعة جاما', range: 'أقصر الموجات الكهرومغناطيسية' },
                    ];
                    const correct = choices[Q.randInt(0, 2)];
                    return Q.makeTextQuestion(
                        `ما هو الوصف الصحيح لـ "${correct.name}"؟`,
                        correct.range,
                        choices.filter(c2 => c2.name !== correct.name).map(c2 => c2.range).concat(['أطول الموجات الكهرومغناطيسية']),
                        'تذكر ترتيب الطيف الكهرومغناطيسي',
                        `${correct.name}: ${correct.range}`,
                        'موجات كهرومغناطيسية'
                    );
                }
            },

            motion(diff, grade) {
                const Q = Questions;
                if (diff === 'easy') {
                    const d = Q.randInt(10, 200);
                    const t = Q.randInt(2, 20);
                    const v = d / t;
                    return Q.makeQuestion(
                        `قطع جسم مسافة ${d} م في ${t} ث، ما سرعته المتوسطة؟`,
                        v,
                        'السرعة = المسافة / الزمن',
                        `v = ${d} / ${t} = ${v} م/ث`,
                        'حركة',
                        true
                    );
                } else if (diff === 'medium') {
                    const v0 = Q.randInt(10, 30);
                    const g = 10;
                    const t = v0 / g;
                    return Q.makeQuestion(
                        `قُذف جسم رأسياً لأعلى بسرعة ${v0} م/ث، بعد كم ثانية يتوقف؟ (g = 10)`,
                        t,
                        'عند أقصى ارتفاع v = 0, t = v₀/g',
                        `t = ${v0} / 10 = ${t} ث`,
                        'حركة',
                        true
                    );
                } else {
                    const v0 = 0;
                    const a = Q.randInt(2, 10);
                    const t = Q.randInt(2, 10);
                    const d = Math.round(0.5 * a * t * t);
                    return Q.makeQuestion(
                        `جسم يبدأ من السكون بتسارع ${a} م/ث²، ما المسافة بعد ${t} ثوانٍ؟`,
                        d,
                        'd = ½ × a × t²',
                        `d = 0.5 × ${a} × ${t}² = ${d} م`,
                        'حركة'
                    );
                }
            }
        },

        chemistry: {
            elements(diff, grade) {
                const Q = Questions;
                const elementData = [
                    { symbol: 'H', name: 'هيدروجين', number: 1, mass: 1 },
                    { symbol: 'He', name: 'هيليوم', number: 2, mass: 4 },
                    { symbol: 'C', name: 'كربون', number: 6, mass: 12 },
                    { symbol: 'N', name: 'نيتروجين', number: 7, mass: 14 },
                    { symbol: 'O', name: 'أكسجين', number: 8, mass: 16 },
                    { symbol: 'Na', name: 'صوديوم', number: 11, mass: 23 },
                    { symbol: 'Mg', name: 'مغنيسيوم', number: 12, mass: 24 },
                    { symbol: 'Al', name: 'ألومنيوم', number: 13, mass: 27 },
                    { symbol: 'Si', name: 'سيليكون', number: 14, mass: 28 },
                    { symbol: 'P', name: 'فسفور', number: 15, mass: 31 },
                    { symbol: 'S', name: 'كبريت', number: 16, mass: 32 },
                    { symbol: 'Cl', name: 'كلور', number: 17, mass: 35.5 },
                    { symbol: 'K', name: 'بوتاسيوم', number: 19, mass: 39 },
                    { symbol: 'Ca', name: 'كالسيوم', number: 20, mass: 40 },
                    { symbol: 'Fe', name: 'حديد', number: 26, mass: 56 },
                    { symbol: 'Cu', name: 'نحاس', number: 29, mass: 64 },
                    { symbol: 'Zn', name: 'خارصين', number: 30, mass: 65 },
                    { symbol: 'Ag', name: 'فضة', number: 47, mass: 108 },
                    { symbol: 'Au', name: 'ذهب', number: 79, mass: 197 },
                ];

                if (diff === 'easy') {
                    const el = elementData[Q.randInt(0, elementData.length - 1)];
                    const others = elementData.filter(e => e.symbol !== el.symbol);
                    const wrongNames = Q.shuffle(others).slice(0, 3).map(e => e.name);
                    return Q.makeTextQuestion(
                        `ما اسم العنصر الذي رمزه "${el.symbol}"؟`,
                        el.name,
                        wrongNames,
                        'ابحث في الجدول الدوري',
                        `${el.symbol} = ${el.name}، العدد الذري = ${el.number}`,
                        'عناصر'
                    );
                } else if (diff === 'medium') {
                    const el = elementData[Q.randInt(0, elementData.length - 1)];
                    return Q.makeQuestion(
                        `ما العدد الذري لعنصر ${el.name} (${el.symbol})؟`,
                        el.number,
                        'العدد الذري = عدد البروتونات',
                        `العدد الذري لـ ${el.name} = ${el.number}`,
                        'عناصر'
                    );
                } else {
                    const el = elementData[Q.randInt(2, elementData.length - 1)];
                    const neutrons = Math.round(el.mass - el.number);
                    return Q.makeQuestion(
                        `عنصر ${el.name} كتلته الذرية ${el.mass} وعدده الذري ${el.number}، كم عدد النيوترونات؟`,
                        neutrons,
                        'عدد النيوترونات = الكتلة الذرية - العدد الذري',
                        `النيوترونات = ${el.mass} - ${el.number} = ${neutrons}`,
                        'بنية الذرة'
                    );
                }
            },

            reactions(diff, grade) {
                const Q = Questions;
                if (diff === 'easy') {
                    const reactions = [
                        { eq: '2H₂ + O₂ → 2H₂O', q: 'ما نوع هذا التفاعل: 2H₂ + O₂ → 2H₂O؟', a: 'تفاعل اتحاد', wrong: ['تفاعل تحلل', 'تفاعل إحلال', 'تفاعل أكسدة واختزال'] },
                        { eq: '2H₂O → 2H₂ + O₂', q: 'ما نوع هذا التفاعل: 2H₂O → 2H₂ + O₂؟', a: 'تفاعل تحلل', wrong: ['تفاعل اتحاد', 'تفاعل إحلال', 'تفاعل ترسيب'] },
                        { eq: 'Zn + CuSO₄ → ZnSO₄ + Cu', q: 'ما نوع هذا التفاعل: Zn + CuSO₄ → ZnSO₄ + Cu؟', a: 'تفاعل إحلال أحادي', wrong: ['تفاعل اتحاد', 'تفاعل تحلل', 'تفاعل إحلال مزدوج'] },
                    ];
                    const r = reactions[Q.randInt(0, reactions.length - 1)];
                    return Q.makeTextQuestion(r.q, r.a, r.wrong, 'انظر لعدد المتفاعلات والنواتج', r.eq + ' = ' + r.a, 'تفاعلات');
                } else if (diff === 'medium') {
                    const h2 = Q.randInt(1, 3) * 2;
                    const o2 = h2 / 2;
                    const h2o = h2;
                    return Q.makeQuestion(
                        `في التفاعل: ${h2}H₂ + ?O₂ → ${h2o}H₂O، ما معامل O₂؟`,
                        o2,
                        'وازن عدد ذرات الأكسجين',
                        `نحتاج ${h2o} ذرة أكسجين، أي ${o2} جزيء O₂`,
                        'موازنة معادلات'
                    );
                } else {
                    const moles = Q.randInt(1, 5);
                    const molarMass = 18;
                    const mass = moles * molarMass;
                    return Q.makeQuestion(
                        `ما كتلة ${moles} مول من الماء H₂O؟ (H=1, O=16)`,
                        mass,
                        'الكتلة = عدد المولات × الكتلة المولية',
                        `الكتلة المولية للماء = 2(1) + 16 = 18 جم/مول، الكتلة = ${moles} × 18 = ${mass} جم`,
                        'حسابات كيميائية'
                    );
                }
            },

            solutions(diff, grade) {
                const Q = Questions;
                if (diff === 'easy') {
                    const phValues = [
                        { name: 'الماء النقي', ph: 7, type: 'متعادل' },
                        { name: 'عصير الليمون', ph: 2, type: 'حمضي' },
                        { name: 'الصابون', ph: 10, type: 'قاعدي' },
                        { name: 'حمض المعدة', ph: 1, type: 'حمضي' },
                        { name: 'الأمونيا', ph: 11, type: 'قاعدي' },
                    ];
                    const item = phValues[Q.randInt(0, phValues.length - 1)];
                    return Q.makeTextQuestion(
                        `${item.name} (pH = ${item.ph})، هل هو حمضي أم قاعدي أم متعادل؟`,
                        item.type,
                        ['حمضي', 'قاعدي', 'متعادل'].filter(t => t !== item.type),
                        'pH < 7 حمضي، pH = 7 متعادل، pH > 7 قاعدي',
                        `pH = ${item.ph} → ${item.type}`,
                        'محاليل'
                    );
                } else if (diff === 'medium') {
                    const solute = Q.randInt(5, 50);
                    const solution = Q.randInt(100, 500);
                    const conc = Math.round((solute / solution) * 100 * 100) / 100;
                    return Q.makeQuestion(
                        `محلول يحتوي ${solute} جم مذاب في ${solution} جم محلول، ما تركيزه المئوي؟`,
                        conc,
                        'التركيز % = (كتلة المذاب / كتلة المحلول) × 100',
                        `التركيز = (${solute}/${solution}) × 100 = ${conc}%`,
                        'محاليل',
                        true
                    );
                } else {
                    const moles = Q.randInt(1, 5);
                    const volume = Q.randInt(1, 5);
                    const molarity = moles / volume;
                    return Q.makeQuestion(
                        `${moles} مول مذاب في ${volume} لتر، ما المولارية؟`,
                        molarity,
                        'المولارية = عدد المولات / الحجم بالليتر',
                        `M = ${moles} / ${volume} = ${molarity} مول/لتر`,
                        'محاليل',
                        true
                    );
                }
            },

            bonds(diff, grade) {
                const Q = Questions;
                if (diff === 'easy') {
                    const bonds = [
                        { q: 'ما نوع الرابطة في جزيء NaCl؟', a: 'رابطة أيونية', wrong: ['رابطة تساهمية', 'رابطة فلزية', 'رابطة هيدروجينية'] },
                        { q: 'ما نوع الرابطة في جزيء H₂O؟', a: 'رابطة تساهمية قطبية', wrong: ['رابطة أيونية', 'رابطة فلزية', 'رابطة تساهمية غير قطبية'] },
                        { q: 'ما نوع الرابطة في الحديد Fe؟', a: 'رابطة فلزية', wrong: ['رابطة أيونية', 'رابطة تساهمية', 'رابطة هيدروجينية'] },
                    ];
                    const b = bonds[Q.randInt(0, bonds.length - 1)];
                    return Q.makeTextQuestion(b.q, b.a, b.wrong, 'فكر في الفرق بين الكهروسالبية', b.a, 'روابط كيميائية');
                } else if (diff === 'medium') {
                    const configs = [
                        { el: 'الصوديوم Na', z: 11, config: '2, 8, 1', valence: 1 },
                        { el: 'الكلور Cl', z: 17, config: '2, 8, 7', valence: 7 },
                        { el: 'الأكسجين O', z: 8, config: '2, 6', valence: 6 },
                        { el: 'النيون Ne', z: 10, config: '2, 8', valence: 8 },
                        { el: 'الكربون C', z: 6, config: '2, 4', valence: 4 },
                    ];
                    const c = configs[Q.randInt(0, configs.length - 1)];
                    return Q.makeQuestion(
                        `كم عدد إلكترونات التكافؤ في ${c.el}؟ (Z = ${c.z})`,
                        c.valence,
                        'إلكترونات التكافؤ في المستوى الأخير',
                        `التوزيع: ${c.config}، إلكترونات التكافؤ = ${c.valence}`,
                        'بنية الذرة'
                    );
                } else {
                    const compounds = [
                        { name: 'H₂SO₄', molar: 98, components: 'H=1×2, S=32, O=16×4' },
                        { name: 'NaOH', molar: 40, components: 'Na=23, O=16, H=1' },
                        { name: 'CaCO₃', molar: 100, components: 'Ca=40, C=12, O=16×3' },
                        { name: 'HCl', molar: 36.5, components: 'H=1, Cl=35.5' },
                    ];
                    const c = compounds[Q.randInt(0, compounds.length - 1)];
                    return Q.makeQuestion(
                        `ما الكتلة المولية لـ ${c.name}؟`,
                        c.molar,
                        'اجمع الكتل الذرية لجميع العناصر',
                        `${c.components} = ${c.molar} جم/مول`,
                        'حسابات كيميائية',
                        true
                    );
                }
            }
        }
    },

    getDifficultyForRegion(regionIndex) {
        if (regionIndex <= 1) return 'easy';
        if (regionIndex <= 3) return 'medium';
        return 'hard';
    },

    getSubjectForWeapon(weaponId) {
        const map = { 0: 'math', 1: 'physics', 2: 'chemistry' };
        return map[weaponId] || 'math';
    }
};
