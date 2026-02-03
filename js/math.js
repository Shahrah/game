/* ============================================
   MATH PROBLEM GENERATOR
   Secondary School Level Mathematics
   ============================================ */

const MathEngine = {

    // Generate a problem based on topic and difficulty
    generateProblem(topics, difficulty) {
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const generator = this.generators[topic];
        if (!generator) {
            return this.generators.addition(difficulty);
        }
        return generator.call(this, difficulty);
    },

    // Generate a bonus problem (golden, harder, worth more)
    generateBonusProblem(topics) {
        const problem = this.generateProblem(topics, 'hard');
        problem.isBonus = true;
        problem.bonusReward = 'key';
        return problem;
    },

    // Utility: random integer between min and max (inclusive)
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Utility: shuffle an array
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    // Utility: generate wrong answers close to the correct one
    generateWrongAnswers(correct, count = 3, isInteger = true) {
        const wrong = new Set();
        let attempts = 0;
        while (wrong.size < count && attempts < 50) {
            attempts++;
            let offset;
            if (isInteger) {
                offset = this.randInt(1, Math.max(5, Math.abs(Math.round(correct * 0.3))));
                if (Math.random() > 0.5) offset = -offset;
                const val = correct + offset;
                if (val !== correct) wrong.add(val);
            } else {
                offset = (Math.random() * 2 - 1) * Math.max(1, Math.abs(correct * 0.3));
                const val = Math.round((correct + offset) * 100) / 100;
                if (val !== correct) wrong.add(val);
            }
        }
        // Fill with fallback values if needed
        let fill = 1;
        while (wrong.size < count) {
            if (correct + fill !== correct && !wrong.has(correct + fill)) wrong.add(correct + fill);
            if (wrong.size < count && correct - fill !== correct && !wrong.has(correct - fill)) wrong.add(correct - fill);
            fill++;
        }
        return [...wrong].slice(0, count);
    },

    // Format a problem as multiple choice
    formatAsMultipleChoice(question, correctAnswer, hint, explanation, isInteger = true) {
        const wrongAnswers = this.generateWrongAnswers(correctAnswer, 3, isInteger);
        const options = this.shuffle([correctAnswer, ...wrongAnswers]);
        return {
            question,
            correctAnswer,
            options,
            hint,
            explanation,
            type: 'multiple_choice',
            isBonus: false
        };
    },

    // ---- PROBLEM GENERATORS ----
    generators: {

        // ADDITION
        addition(difficulty) {
            let a, b;
            if (difficulty === 'easy') {
                a = MathEngine.randInt(10, 99);
                b = MathEngine.randInt(10, 99);
            } else if (difficulty === 'medium') {
                a = MathEngine.randInt(100, 999);
                b = MathEngine.randInt(100, 999);
            } else {
                a = MathEngine.randInt(1000, 9999);
                b = MathEngine.randInt(1000, 9999);
            }
            const answer = a + b;
            return MathEngine.formatAsMultipleChoice(
                `${a} + ${b} = ?`,
                answer,
                `Try adding the units first, then the tens...`,
                `${a} + ${b} = ${answer}`
            );
        },

        // SUBTRACTION
        subtraction(difficulty) {
            let a, b;
            if (difficulty === 'easy') {
                a = MathEngine.randInt(20, 99);
                b = MathEngine.randInt(5, a - 1);
            } else if (difficulty === 'medium') {
                a = MathEngine.randInt(200, 999);
                b = MathEngine.randInt(50, a - 1);
            } else {
                a = MathEngine.randInt(1000, 9999);
                b = MathEngine.randInt(100, a - 1);
            }
            const answer = a - b;
            return MathEngine.formatAsMultipleChoice(
                `${a} \u2212 ${b} = ?`,
                answer,
                `Start from the rightmost digit and borrow if needed.`,
                `${a} \u2212 ${b} = ${answer}`
            );
        },

        // MULTIPLICATION
        multiplication(difficulty) {
            let a, b;
            if (difficulty === 'easy') {
                a = MathEngine.randInt(2, 12);
                b = MathEngine.randInt(2, 12);
            } else if (difficulty === 'medium') {
                a = MathEngine.randInt(5, 20);
                b = MathEngine.randInt(3, 15);
            } else {
                a = MathEngine.randInt(12, 50);
                b = MathEngine.randInt(5, 25);
            }
            const answer = a * b;
            return MathEngine.formatAsMultipleChoice(
                `${a} \u00D7 ${b} = ?`,
                answer,
                `Break it down: ${a} \u00D7 ${b} = ${a} \u00D7 ${Math.floor(b / 2)} \u00D7 2 or use partial products.`,
                `${a} \u00D7 ${b} = ${answer}`
            );
        },

        // DIVISION
        division(difficulty) {
            let a, b, answer;
            if (difficulty === 'easy') {
                b = MathEngine.randInt(2, 10);
                answer = MathEngine.randInt(2, 12);
            } else if (difficulty === 'medium') {
                b = MathEngine.randInt(3, 15);
                answer = MathEngine.randInt(5, 25);
            } else {
                b = MathEngine.randInt(5, 25);
                answer = MathEngine.randInt(10, 50);
            }
            a = b * answer;
            return MathEngine.formatAsMultipleChoice(
                `${a} \u00F7 ${b} = ?`,
                answer,
                `Think: what number times ${b} gives ${a}?`,
                `${a} \u00F7 ${b} = ${answer} (because ${answer} \u00D7 ${b} = ${a})`
            );
        },

        // BODMAS / ORDER OF OPERATIONS
        bodmas(difficulty) {
            let question, answer, hint;
            if (difficulty === 'easy') {
                const a = MathEngine.randInt(2, 10);
                const b = MathEngine.randInt(2, 10);
                const c = MathEngine.randInt(1, 10);
                const op = Math.random() > 0.5;
                if (op) {
                    question = `${a} + ${b} \u00D7 ${c} = ?`;
                    answer = a + b * c;
                    hint = `Remember BODMAS: Multiplication comes before Addition.`;
                } else {
                    question = `${a} \u00D7 ${b} + ${c} = ?`;
                    answer = a * b + c;
                    hint = `Do the multiplication first, then add.`;
                }
            } else if (difficulty === 'medium') {
                const a = MathEngine.randInt(2, 8);
                const b = MathEngine.randInt(2, 8);
                const c = MathEngine.randInt(1, 10);
                const d = MathEngine.randInt(1, 8);
                question = `(${a} + ${b}) \u00D7 ${c} \u2212 ${d} = ?`;
                answer = (a + b) * c - d;
                hint = `Brackets first, then multiply, then subtract.`;
            } else {
                const a = MathEngine.randInt(2, 6);
                const b = MathEngine.randInt(2, 6);
                const c = MathEngine.randInt(1, 10);
                const d = MathEngine.randInt(2, 5);
                const e = MathEngine.randInt(1, 5);
                question = `${a} \u00D7 (${b} + ${c}) \u2212 ${d}\u00B2 + ${e} = ?`;
                answer = a * (b + c) - d * d + e;
                hint = `BODMAS: Brackets \u2192 Orders (squares) \u2192 Multiply \u2192 Add/Subtract`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint,
                `Following BODMAS: ${question.replace('= ?', '')} = ${answer}`
            );
        },

        // FRACTIONS
        fractions(difficulty) {
            let question, answer, hint, explanation;
            const type = MathEngine.randInt(0, 2);
            if (difficulty === 'easy' || type === 0) {
                // Add fractions with same denominator
                const d = MathEngine.randInt(3, 10);
                const n1 = MathEngine.randInt(1, d - 2);
                const n2 = MathEngine.randInt(1, d - n1 - 1);
                const ansNum = n1 + n2;
                // Simplify
                const g = MathEngine.gcd(ansNum, d);
                const sn = ansNum / g;
                const sd = d / g;
                question = `${n1}/${d} + ${n2}/${d} = ?`;
                answer = `${sn}/${sd}`;
                if (sd === 1) answer = `${sn}`;
                hint = `Same denominators: just add the numerators!`;
                explanation = `${n1}/${d} + ${n2}/${d} = ${ansNum}/${d} = ${answer}`;
                // For multiple choice with fraction answers
                const options = MathEngine.generateFractionOptions(sn, sd);
                return {
                    question, correctAnswer: answer, options, hint, explanation,
                    type: 'multiple_choice', isBonus: false
                };
            } else if (type === 1) {
                // Add fractions with different denominators
                const d1 = MathEngine.randInt(2, 6);
                let d2 = MathEngine.randInt(2, 6);
                while (d2 === d1) d2 = MathEngine.randInt(2, 6);
                const n1 = MathEngine.randInt(1, d1 - 1);
                const n2 = MathEngine.randInt(1, d2 - 1);
                const commonD = MathEngine.lcm(d1, d2);
                const ansNum = n1 * (commonD / d1) + n2 * (commonD / d2);
                const g = MathEngine.gcd(ansNum, commonD);
                const sn = ansNum / g;
                const sd = commonD / g;
                question = `${n1}/${d1} + ${n2}/${d2} = ?`;
                answer = sd === 1 ? `${sn}` : `${sn}/${sd}`;
                hint = `Find a common denominator: LCM of ${d1} and ${d2} is ${commonD}.`;
                explanation = `${n1}/${d1} + ${n2}/${d2} = ${n1 * (commonD / d1)}/${commonD} + ${n2 * (commonD / d2)}/${commonD} = ${ansNum}/${commonD} = ${answer}`;
                const options = MathEngine.generateFractionOptions(sn, sd);
                return {
                    question, correctAnswer: answer, options, hint, explanation,
                    type: 'multiple_choice', isBonus: false
                };
            } else {
                // Multiply fractions
                const n1 = MathEngine.randInt(1, 5);
                const d1 = MathEngine.randInt(2, 8);
                const n2 = MathEngine.randInt(1, 5);
                const d2 = MathEngine.randInt(2, 8);
                const ansNum = n1 * n2;
                const ansD = d1 * d2;
                const g = MathEngine.gcd(ansNum, ansD);
                const sn = ansNum / g;
                const sd = ansD / g;
                question = `${n1}/${d1} \u00D7 ${n2}/${d2} = ?`;
                answer = sd === 1 ? `${sn}` : `${sn}/${sd}`;
                hint = `Multiply numerators together and denominators together, then simplify.`;
                explanation = `${n1}/${d1} \u00D7 ${n2}/${d2} = ${ansNum}/${ansD} = ${answer}`;
                const options = MathEngine.generateFractionOptions(sn, sd);
                return {
                    question, correctAnswer: answer, options, hint, explanation,
                    type: 'multiple_choice', isBonus: false
                };
            }
        },

        // DECIMALS
        decimals(difficulty) {
            let a, b, answer, question;
            if (difficulty === 'easy') {
                a = Math.round(MathEngine.randInt(10, 90) / 10 * 10) / 10;
                b = Math.round(MathEngine.randInt(10, 90) / 10 * 10) / 10;
                const op = Math.random() > 0.5 ? '+' : '\u2212';
                answer = op === '+' ? Math.round((a + b) * 10) / 10 : Math.round((Math.max(a, b) - Math.min(a, b)) * 10) / 10;
                if (op === '\u2212') { const t = Math.max(a, b); b = Math.min(a, b); a = t; }
                question = `${a} ${op} ${b} = ?`;
            } else {
                a = Math.round(MathEngine.randInt(10, 99) * 10) / 100;
                b = Math.round(MathEngine.randInt(2, 9) * 10) / 10;
                answer = Math.round(a * b * 100) / 100;
                question = `${a} \u00D7 ${b} = ?`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer,
                `Line up the decimal points and work carefully.`,
                `${question.replace('= ?', '')} = ${answer}`,
                false
            );
        },

        // PERCENTAGES
        percentages(difficulty) {
            let question, answer, hint, explanation;
            if (difficulty === 'easy' || difficulty === 'medium') {
                const pcts = [10, 20, 25, 50, 75];
                const pct = pcts[MathEngine.randInt(0, pcts.length - 1)];
                const base = MathEngine.randInt(2, 20) * 10;
                answer = base * pct / 100;
                question = `What is ${pct}% of ${base}?`;
                hint = `${pct}% means ${pct}/100. Multiply: ${base} \u00D7 ${pct}/100.`;
                explanation = `${pct}% of ${base} = ${base} \u00D7 ${pct}/100 = ${answer}`;
            } else {
                const pct = MathEngine.randInt(1, 9) * 5 + MathEngine.randInt(0, 1) * 5;
                const base = MathEngine.randInt(5, 50) * 10;
                answer = base * pct / 100;
                question = `What is ${pct}% of ${base}?`;
                hint = `Convert % to decimal: ${pct}% = ${pct / 100}. Then multiply.`;
                explanation = `${pct}% of ${base} = ${base} \u00D7 ${pct / 100} = ${answer}`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint, explanation
            );
        },

        // LINEAR EQUATIONS
        linear_equations(difficulty) {
            let question, answer, hint, explanation;
            if (difficulty === 'easy' || difficulty === 'medium') {
                // ax + b = c
                const a = MathEngine.randInt(2, 8);
                const x = MathEngine.randInt(1, 15);
                const b = MathEngine.randInt(1, 20);
                const c = a * x + b;
                question = `Solve for x: ${a}x + ${b} = ${c}`;
                answer = x;
                hint = `Subtract ${b} from both sides, then divide by ${a}.`;
                explanation = `${a}x + ${b} = ${c}\n${a}x = ${c} \u2212 ${b} = ${c - b}\nx = ${c - b} \u00F7 ${a} = ${x}`;
            } else {
                // ax + b = cx + d
                const x = MathEngine.randInt(-5, 10);
                const a = MathEngine.randInt(3, 9);
                let cc = MathEngine.randInt(1, a - 1);
                const b = MathEngine.randInt(1, 20);
                const d = a * x + b - cc * x;
                question = `Solve for x: ${a}x + ${b} = ${cc}x + ${d}`;
                answer = x;
                hint = `Get all x terms on one side: (${a} \u2212 ${cc})x = ${d} \u2212 ${b}`;
                explanation = `${a}x + ${b} = ${cc}x + ${d}\n${a - cc}x = ${d - b}\nx = ${(d - b)} \u00F7 ${a - cc} = ${x}`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint, explanation
            );
        },

        // EXPRESSIONS
        expressions(difficulty) {
            // Simplify or evaluate expressions
            const x = MathEngine.randInt(2, 8);
            let question, answer, hint, explanation;
            if (difficulty === 'easy' || difficulty === 'medium') {
                const a = MathEngine.randInt(2, 6);
                const b = MathEngine.randInt(1, 10);
                answer = a * x + b;
                question = `If x = ${x}, find the value of ${a}x + ${b}`;
                hint = `Replace x with ${x}: ${a}(${x}) + ${b}`;
                explanation = `${a}(${x}) + ${b} = ${a * x} + ${b} = ${answer}`;
            } else {
                const a = MathEngine.randInt(2, 5);
                const b = MathEngine.randInt(1, 5);
                const c = MathEngine.randInt(1, 8);
                answer = a * x * x + b * x - c;
                question = `If x = ${x}, find the value of ${a}x\u00B2 + ${b}x \u2212 ${c}`;
                hint = `First find x\u00B2 = ${x * x}, then substitute.`;
                explanation = `${a}(${x})\u00B2 + ${b}(${x}) \u2212 ${c} = ${a * x * x} + ${b * x} \u2212 ${c} = ${answer}`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint, explanation
            );
        },

        // QUADRATICS
        quadratics(difficulty) {
            // Solve x^2 - (r1+r2)x + r1*r2 = 0
            const r1 = MathEngine.randInt(1, 8);
            let r2 = MathEngine.randInt(1, 8);
            while (r2 === r1) r2 = MathEngine.randInt(1, 8);
            const b = -(r1 + r2);
            const c = r1 * r2;
            const bStr = b >= 0 ? `+ ${b}` : `\u2212 ${Math.abs(b)}`;
            const cStr = c >= 0 ? `+ ${c}` : `\u2212 ${Math.abs(c)}`;
            const question = `Solve: x\u00B2 ${bStr}x ${cStr} = 0\nWhat is the LARGER value of x?`;
            const answer = Math.max(r1, r2);
            const hint = `Factor the quadratic: find two numbers that multiply to ${c} and add to ${b}.`;
            const explanation = `x\u00B2 ${bStr}x ${cStr} = (x \u2212 ${r1})(x \u2212 ${r2}) = 0\nx = ${r1} or x = ${r2}\nLarger value: ${answer}`;
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint, explanation
            );
        },

        // AREA & PERIMETER
        area_perimeter(difficulty) {
            const type = MathEngine.randInt(0, 2);
            let question, answer, hint, explanation;
            if (type === 0) {
                // Rectangle
                const l = MathEngine.randInt(3, 15);
                const w = MathEngine.randInt(2, 12);
                if (Math.random() > 0.5) {
                    answer = l * w;
                    question = `A rectangle has length ${l} cm and width ${w} cm.\nWhat is its area?`;
                    hint = `Area of rectangle = length \u00D7 width`;
                    explanation = `Area = ${l} \u00D7 ${w} = ${answer} cm\u00B2`;
                } else {
                    answer = 2 * (l + w);
                    question = `A rectangle has length ${l} cm and width ${w} cm.\nWhat is its perimeter?`;
                    hint = `Perimeter = 2 \u00D7 (length + width)`;
                    explanation = `Perimeter = 2 \u00D7 (${l} + ${w}) = 2 \u00D7 ${l + w} = ${answer} cm`;
                }
            } else if (type === 1) {
                // Triangle area
                const base = MathEngine.randInt(4, 16);
                const height = MathEngine.randInt(3, 12);
                answer = (base * height) / 2;
                question = `A triangle has base ${base} cm and height ${height} cm.\nWhat is its area?`;
                hint = `Area of triangle = \u00BD \u00D7 base \u00D7 height`;
                explanation = `Area = \u00BD \u00D7 ${base} \u00D7 ${height} = ${answer} cm\u00B2`;
            } else {
                // Circle area (round to nearest integer)
                const r = MathEngine.randInt(2, 8);
                answer = Math.round(Math.PI * r * r);
                question = `A circle has radius ${r} cm.\nWhat is its area? (Round to nearest whole number, use \u03C0 \u2248 3.14)`;
                hint = `Area of circle = \u03C0r\u00B2`;
                explanation = `Area = \u03C0 \u00D7 ${r}\u00B2 = \u03C0 \u00D7 ${r * r} \u2248 ${answer} cm\u00B2`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint, explanation
            );
        },

        // ANGLES
        angles(difficulty) {
            const type = MathEngine.randInt(0, 2);
            let question, answer, hint, explanation;
            if (type === 0) {
                // Supplementary angles
                const a = MathEngine.randInt(30, 150);
                answer = 180 - a;
                question = `Two angles are supplementary. One angle is ${a}\u00B0.\nWhat is the other angle?`;
                hint = `Supplementary angles add up to 180\u00B0.`;
                explanation = `180\u00B0 \u2212 ${a}\u00B0 = ${answer}\u00B0`;
            } else if (type === 1) {
                // Angles in a triangle
                const a1 = MathEngine.randInt(30, 80);
                const a2 = MathEngine.randInt(30, 140 - a1);
                answer = 180 - a1 - a2;
                question = `A triangle has angles ${a1}\u00B0 and ${a2}\u00B0.\nWhat is the third angle?`;
                hint = `Angles in a triangle add up to 180\u00B0.`;
                explanation = `180\u00B0 \u2212 ${a1}\u00B0 \u2212 ${a2}\u00B0 = ${answer}\u00B0`;
            } else {
                // Angles on a straight line
                const a1 = MathEngine.randInt(20, 80);
                const a2 = MathEngine.randInt(20, 140 - a1);
                answer = 180 - a1 - a2;
                question = `Three angles on a straight line are ${a1}\u00B0, ${a2}\u00B0 and x\u00B0.\nFind x.`;
                hint = `Angles on a straight line add up to 180\u00B0.`;
                explanation = `x = 180\u00B0 \u2212 ${a1}\u00B0 \u2212 ${a2}\u00B0 = ${answer}\u00B0`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint, explanation
            );
        },

        // TRIANGLES (properties)
        triangles(difficulty) {
            // Isosceles, equilateral properties
            const type = MathEngine.randInt(0, 1);
            let question, answer, hint, explanation;
            if (type === 0) {
                // Isosceles
                const base_angle = MathEngine.randInt(30, 80);
                answer = 180 - 2 * base_angle;
                question = `An isosceles triangle has two base angles of ${base_angle}\u00B0 each.\nWhat is the apex angle?`;
                hint = `In an isosceles triangle, base angles are equal. All angles sum to 180\u00B0.`;
                explanation = `Apex = 180\u00B0 \u2212 2 \u00D7 ${base_angle}\u00B0 = ${answer}\u00B0`;
            } else {
                // Exterior angle theorem
                const a = MathEngine.randInt(30, 70);
                const b = MathEngine.randInt(30, 70);
                answer = a + b;
                question = `A triangle has interior angles ${a}\u00B0 and ${b}\u00B0.\nWhat is the exterior angle adjacent to the third angle?`;
                hint = `An exterior angle equals the sum of the two non-adjacent interior angles.`;
                explanation = `Exterior angle = ${a}\u00B0 + ${b}\u00B0 = ${answer}\u00B0`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint, explanation
            );
        },

        // PYTHAGORAS
        pythagoras(difficulty) {
            // Pythagorean triples
            const triples = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[7,24,25],[9,12,15]];
            const triple = triples[MathEngine.randInt(0, triples.length - 1)];
            const scale = difficulty === 'hard' ? MathEngine.randInt(2, 3) : 1;
            const a = triple[0] * scale;
            const b = triple[1] * scale;
            const c = triple[2] * scale;
            const findWhat = MathEngine.randInt(0, 2);
            let question, answer, hint, explanation;
            if (findWhat === 0) {
                // Find hypotenuse
                question = `A right triangle has legs ${a} cm and ${b} cm.\nFind the hypotenuse.`;
                answer = c;
                hint = `Pythagoras: c\u00B2 = a\u00B2 + b\u00B2`;
                explanation = `c\u00B2 = ${a}\u00B2 + ${b}\u00B2 = ${a * a} + ${b * b} = ${c * c}\nc = \u221A${c * c} = ${c} cm`;
            } else {
                // Find a leg
                question = `A right triangle has hypotenuse ${c} cm and one leg ${a} cm.\nFind the other leg.`;
                answer = b;
                hint = `Pythagoras: b\u00B2 = c\u00B2 \u2212 a\u00B2`;
                explanation = `b\u00B2 = ${c}\u00B2 \u2212 ${a}\u00B2 = ${c * c} \u2212 ${a * a} = ${b * b}\nb = \u221A${b * b} = ${b} cm`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint, explanation
            );
        },

        // STATISTICS
        statistics(difficulty) {
            const type = MathEngine.randInt(0, 2);
            let question, answer, hint, explanation;
            if (type === 0) {
                // Mean
                const count = difficulty === 'hard' ? 7 : 5;
                const nums = [];
                for (let i = 0; i < count; i++) nums.push(MathEngine.randInt(2, 20));
                const sum = nums.reduce((a, b) => a + b, 0);
                answer = Math.round(sum / count * 10) / 10;
                // Ensure integer answers for simplicity
                while (sum % count !== 0) {
                    nums[0] += (count - (sum % count));
                    break;
                }
                const finalSum = nums.reduce((a, b) => a + b, 0);
                answer = finalSum / count;
                question = `Find the mean of: ${nums.join(', ')}`;
                hint = `Mean = sum of all values \u00F7 number of values`;
                explanation = `Mean = (${nums.join(' + ')}) \u00F7 ${count} = ${finalSum} \u00F7 ${count} = ${answer}`;
            } else if (type === 1) {
                // Median
                const count = 5;
                const nums = [];
                for (let i = 0; i < count; i++) nums.push(MathEngine.randInt(1, 30));
                const sorted = [...nums].sort((a, b) => a - b);
                answer = sorted[Math.floor(count / 2)];
                question = `Find the median of: ${nums.join(', ')}`;
                hint = `Sort the numbers first, then find the middle value.`;
                explanation = `Sorted: ${sorted.join(', ')}\nMiddle value = ${answer}`;
            } else {
                // Mode
                const base = MathEngine.randInt(1, 15);
                const modeVal = MathEngine.randInt(1, 20);
                const nums = [modeVal, modeVal, modeVal];
                for (let i = 0; i < 4; i++) {
                    let v = MathEngine.randInt(1, 20);
                    while (v === modeVal) v = MathEngine.randInt(1, 20);
                    nums.push(v);
                }
                const shuffled = MathEngine.shuffle(nums);
                answer = modeVal;
                question = `Find the mode of: ${shuffled.join(', ')}`;
                hint = `The mode is the value that appears most often.`;
                explanation = `${modeVal} appears 3 times (most frequent), so the mode is ${modeVal}`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint, explanation
            );
        },

        // PROBABILITY
        probability(difficulty) {
            const type = MathEngine.randInt(0, 2);
            let question, answer, hint, explanation;
            if (type === 0) {
                // Dice probability
                const target = MathEngine.randInt(1, 6);
                question = `A fair 6-sided die is rolled.\nWhat is the probability of rolling a ${target}?\n(Express as a simplified fraction)`;
                answer = '1/6';
                hint = `Probability = favourable outcomes / total outcomes`;
                explanation = `P(${target}) = 1/6 (one outcome out of six)`;
                const options = MathEngine.shuffle(['1/6', '1/3', '2/6', '1/2']);
                return { question, correctAnswer: answer, options, hint, explanation, type: 'multiple_choice', isBonus: false };
            } else if (type === 1) {
                // Coin probability
                const flips = MathEngine.randInt(2, 3);
                const target = flips === 2 ? 'two heads' : 'three heads';
                const total = Math.pow(2, flips);
                question = `A fair coin is flipped ${flips} times.\nWhat is the probability of getting ${target}?`;
                answer = `1/${total}`;
                hint = `Each flip has 2 outcomes. Total outcomes = 2^${flips} = ${total}`;
                explanation = `P(${target}) = 1/${total} (only one way to get all heads out of ${total} outcomes)`;
                const options = MathEngine.shuffle([`1/${total}`, `1/${total / 2}`, `${flips}/${total}`, `1/2`]);
                return { question, correctAnswer: answer, options, hint, explanation, type: 'multiple_choice', isBonus: false };
            } else {
                // Balls in bag
                const red = MathEngine.randInt(2, 6);
                const blue = MathEngine.randInt(2, 6);
                const green = MathEngine.randInt(1, 4);
                const total = red + blue + green;
                const colors = ['red', 'blue', 'green'];
                const counts = [red, blue, green];
                const pick = MathEngine.randInt(0, 2);
                const g = MathEngine.gcd(counts[pick], total);
                const sn = counts[pick] / g;
                const sd = total / g;
                answer = sd === 1 ? `${sn}` : `${sn}/${sd}`;
                question = `A bag contains ${red} red, ${blue} blue, and ${green} green balls.\nWhat is the probability of picking a ${colors[pick]} ball?`;
                hint = `P = number of ${colors[pick]} balls / total balls`;
                explanation = `P(${colors[pick]}) = ${counts[pick]}/${total} = ${answer}`;
                const options = MathEngine.generateFractionOptions(sn, sd);
                return { question, correctAnswer: answer, options, hint, explanation, type: 'multiple_choice', isBonus: false };
            }
        },

        // POWERS & ROOTS
        powers(difficulty) {
            const type = MathEngine.randInt(0, 2);
            let question, answer, hint, explanation;
            if (type === 0) {
                // Simple power
                const base = MathEngine.randInt(2, 10);
                const exp = MathEngine.randInt(2, difficulty === 'hard' ? 4 : 3);
                answer = Math.pow(base, exp);
                question = `${base}${exp === 2 ? '\u00B2' : exp === 3 ? '\u00B3' : '\u2074'} = ?`;
                hint = `Multiply ${base} by itself ${exp} times.`;
                explanation = `${base}${'\\u00B' + (exp + 0)} = ${Array(exp).fill(base).join(' \u00D7 ')} = ${answer}`;
            } else if (type === 1) {
                // Square root
                const squares = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
                const n = squares[MathEngine.randInt(0, squares.length - 1)];
                answer = Math.sqrt(n);
                question = `\u221A${n} = ?`;
                hint = `What number times itself gives ${n}?`;
                explanation = `\u221A${n} = ${answer} (because ${answer} \u00D7 ${answer} = ${n})`;
            } else {
                // Cube root (easy ones)
                const cubes = [8, 27, 64, 125];
                const n = cubes[MathEngine.randInt(0, cubes.length - 1)];
                answer = Math.round(Math.pow(n, 1 / 3));
                question = `\u00B3\u221A${n} = ?`;
                hint = `What number times itself 3 times gives ${n}?`;
                explanation = `\u00B3\u221A${n} = ${answer} (because ${answer} \u00D7 ${answer} \u00D7 ${answer} = ${n})`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint, explanation
            );
        },

        // ROOTS (alias for powers)
        roots(difficulty) {
            return MathEngine.generators.powers.call(MathEngine, difficulty);
        },

        // RATIOS
        ratios(difficulty) {
            let question, answer, hint, explanation;
            if (difficulty === 'easy' || difficulty === 'medium') {
                const r1 = MathEngine.randInt(1, 5);
                const r2 = MathEngine.randInt(1, 5);
                const total = MathEngine.randInt(3, 10) * (r1 + r2);
                const share1 = total * r1 / (r1 + r2);
                question = `Divide ${total} in the ratio ${r1}:${r2}.\nWhat is the larger share?`;
                answer = Math.max(share1, total - share1);
                hint = `Total parts = ${r1} + ${r2} = ${r1 + r2}. Each part = ${total} \u00F7 ${r1 + r2}.`;
                explanation = `Total parts = ${r1 + r2}\nEach part = ${total} \u00F7 ${r1 + r2} = ${total / (r1 + r2)}\nShares: ${share1} and ${total - share1}\nLarger share = ${answer}`;
            } else {
                const r1 = MathEngine.randInt(2, 5);
                const r2 = MathEngine.randInt(2, 5);
                const r3 = MathEngine.randInt(1, 4);
                const total = MathEngine.randInt(2, 6) * (r1 + r2 + r3);
                const perPart = total / (r1 + r2 + r3);
                answer = Math.max(r1, r2, r3) * perPart;
                question = `Divide ${total} in the ratio ${r1}:${r2}:${r3}.\nWhat is the largest share?`;
                hint = `Total parts = ${r1 + r2 + r3}. Each part = ${total} \u00F7 ${r1 + r2 + r3}.`;
                explanation = `Total parts = ${r1 + r2 + r3}\nEach part = ${perPart}\nLargest ratio is ${Math.max(r1, r2, r3)} \u2192 ${answer}`;
            }
            return MathEngine.formatAsMultipleChoice(
                question, answer, hint, explanation
            );
        }
    },

    // ---- Utility: GCD ----
    gcd(a, b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b) { [a, b] = [b, a % b]; }
        return a;
    },

    // ---- Utility: LCM ----
    lcm(a, b) {
        return Math.abs(a * b) / MathEngine.gcd(a, b);
    },

    // ---- Generate fraction options ----
    generateFractionOptions(sn, sd) {
        const correct = sd === 1 ? `${sn}` : `${sn}/${sd}`;
        const options = new Set([correct]);
        let attempts = 0;
        while (options.size < 4 && attempts < 30) {
            attempts++;
            const dn = sn + MathEngine.randInt(-2, 3);
            const dd = sd + MathEngine.randInt(-1, 2);
            if (dd > 0 && dn > 0) {
                const opt = dd === 1 ? `${dn}` : `${dn}/${dd}`;
                if (opt !== correct) options.add(opt);
            }
        }
        // Fallback options
        if (options.size < 4) {
            options.add(`${sn + 1}/${sd}`);
            options.add(`${sn}/${sd + 1}`);
            options.add(`${sn + 2}/${sd}`);
        }
        return MathEngine.shuffle([...options].slice(0, 4));
    }
};
